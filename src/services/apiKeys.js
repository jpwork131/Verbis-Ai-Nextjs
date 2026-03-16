import { supabase } from '@/lib/supabase';

const mapRow = (row) => ({
  _id: row.id,
  id: row.id,
  provider: row.provider,
  key: row.api_key,
  active: row.active,
  totalQuota: row.total_quota || 0,
  usedQuota: row.used_quota || 0,
  status: row.status || (row.active ? 'Active' : 'Inactive'),
  lastUsedAt: row.last_used_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Removed local caching because we need fresh real-time quota data for rotation
export async function getApiKey(provider) {
  const keys = await getAllActiveApiKeys(provider);
  if (keys.length > 0) {
    const keyData = keys[0];
    // Async update usage without blocking
    supabase.from("api_keys").update({ 
      used_quota: (keyData.used_quota || 0) + 1,
      last_used_at: new Date().toISOString()
    }).eq("id", keyData.id).then();
    
    return keyData.api_key;
  }
  return null;
}

export async function getAllActiveApiKeys(provider) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("provider", provider)
    .eq("active", true)
    .order("last_used_at", { ascending: true, nullsFirst: true });

  if (error) {
    console.error(`Error fetching keys for ${provider}:`, error);
    return [];
  }

  return (data || []).filter(row => {
    const total = row.total_quota || 0;
    const used = row.used_quota || 0;
    if (total > 0 && used >= total) {
      if (row.status !== 'Quota Exceeded') {
        supabase.from("api_keys").update({ 
          status: 'Quota Exceeded', 
          active: false 
        }).eq("id", row.id).then();
      }
      return false;
    }
    return true;
  });
}

export function invalidateApiKeysCache() {
  // Deprecated caching function, kept for backward compatibility if called elsewhere
}

export const apiKeysApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRow);
  },

  create: async (payload) => {
    const dbInsert = {
      provider: payload.provider,
      api_key: payload.key,
      active: payload.active !== false,
      total_quota: payload.totalQuota ? Number(payload.totalQuota) : 0,
      used_quota: payload.usedQuota ? Number(payload.usedQuota) : 0,
      status: payload.active !== false ? 'Active' : 'Inactive',
    };

    const { data, error } = await supabase
      .from("api_keys")
      .insert([dbInsert])
      .select()
      .single();

    if (error) throw error;
    return mapRow(data);
  },

  update: async (id, payload) => {
    const dbUpdate = {
      provider: payload.provider,
      active: payload.active !== false,
      status: payload.active !== false ? 'Active' : 'Inactive',
    };

    if (payload.totalQuota !== undefined) dbUpdate.total_quota = Number(payload.totalQuota);
    if (payload.usedQuota !== undefined) dbUpdate.used_quota = Number(payload.usedQuota);

    // Only overwrite stored key if explicitly provided
    if (payload.key) dbUpdate.api_key = payload.key;

    const { data, error } = await supabase
      .from("api_keys")
      .update(dbUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRow(data);
  },

  remove: async (id) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  setActive: async (id, active) => {
    const { data, error } = await supabase
      .from("api_keys")
      .update({ active: !!active, status: active ? 'Active' : 'Inactive' })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRow(data);
  },
};

export async function checkLiveUsage(keyRow) {
  if (keyRow.provider === 'openrouter') {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { "Authorization": `Bearer ${keyRow.key}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch OpenRouter usage");
      
      const usage = data.data?.usage || data.usage || {};
      return {
        provider: "OpenRouter",
        requests: usage.total_requests || 0,
        tokens: usage.total_tokens || 0,
        cost: usage.total_cost || usage * 1 || 0 // Sometimes OpenRouter returns usage as a float (cost)
      };
    } catch (err) {
      console.error(err);
      return { error: err.message };
    }
  } else if (keyRow.provider === 'gnews') {
    return {
      provider: "GNews",
      daily_limit: keyRow.totalQuota || 100,
      used_today: keyRow.usedQuota || 0,
      remaining: Math.max(0, (keyRow.totalQuota || 100) - (keyRow.usedQuota || 0))
    };
  } else if (keyRow.provider === 'groq') {
    return {
      provider: "Groq",
      status: "Online",
      model: "llama-3.3-70b-versatile",
      local_usage: keyRow.usedQuota || 0
    };
  }
  return { error: "Live usage check not supported for this provider." };
}

