import { supabase } from "../supabase";

const makeSafeObjectName = (prefix, file) => {
  const raw = file?.name || "upload";
  const safe = raw.replace(/[^\w.\-]+/g, "_");
  return `${prefix}/${Date.now()}-${safe}`;
};

export const assetApi = {
  getAssets: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('site_title, contact_email, contact_phone, logo, fallback_banner_url')
      .eq('id', 'model_config')
      .single();

    if (error) throw error;

    // Map Postgres snake_case back to camelCase for the UI components
    return {
      siteTitle: data.site_title,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      logo: data.logo,
      fallbackBannerUrl: data.fallback_banner_url
    };
  },

  updateAssets: async (frontendData, files = {}) => {
    // Store brand assets directly in Cloudinary and persist the public URLs in settings.

    const updates = { ...frontendData };

    const uploadToCloudinary = async (file, folder) => {
      // Fetch Cloudinary credentials from Supabase api_keys
      const { data: keysData, error: keysError } = await supabase
        .from("api_keys")
        .select("provider, api_key")
        .in("provider", ["cloudinary", "cloudinary_cloud_name", "cloudinary_secret"])
        .eq("active", true);

      if (keysError) {
        throw new Error(`Failed to fetch Cloudinary keys from database: ${keysError.message}`);
      }

      const keysMap = {};
      (keysData || []).forEach(k => {
        keysMap[k.provider] = k.api_key;
      });

      const cloudName = keysMap["cloudinary_cloud_name"];
      const apiKey = keysMap["cloudinary"];
      const apiSecret = keysMap["cloudinary_secret"];

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary configuration missing in database api_keys table. Ensure 'cloudinary', 'cloudinary_cloud_name', and 'cloudinary_secret' are set and active.");
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const params = [
        `folder=${folder}`,
        `timestamp=${timestamp}`
      ].sort().join('&');

      const signatureString = `${params}${apiSecret}`;
      const msgUint8 = new TextEncoder().encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${data.error?.message}`);
      }

      return data.secure_url;
    };

    // Upload logo file if provided
    if (files.logo) {
      try {
        updates.logo = await uploadToCloudinary(files.logo, "verbis_branding");
      } catch (err) {
        throw new Error(`Logo upload failed: ${err.message}`);
      }
    }

    // Upload fallback banner file if provided
    if (files.fallbackBanner) {
      try {
        updates.fallbackBannerUrl = await uploadToCloudinary(files.fallbackBanner, "verbis_branding");
      } catch (err) {
        throw new Error(`Banner upload failed: ${err.message}`);
      }
    }

    // Convert to snake_case for DB
    const dbUpdate = {
      site_title: updates.siteTitle,
      contact_email: updates.contactEmail,
      contact_phone: updates.contactPhone,
      logo: updates.logo,
      fallback_banner_url: updates.fallbackBannerUrl || updates.fallbackBanner // Handle backwards compat naming
    };

    const { data, error } = await supabase
      .from('settings')
      .update(dbUpdate)
      .eq('id', 'model_config')
      .select()
      .single();

    if (error) throw error;

    return {
      assets: {
        siteTitle: data.site_title,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        logo: data.logo,
        fallbackBannerUrl: data.fallback_banner_url
      }
    };
  }
};