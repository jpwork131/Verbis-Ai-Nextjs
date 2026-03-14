import { supabase } from '../supabase.js';

// Helper: given a list of articles with category_slug, join category data




async function joinCategories(articles) {
  if (!articles || articles.length === 0) return [];

  const slugs = [...new Set(articles.map(a => a.category_slug).filter(Boolean))];
  let catMap = {};

  if (slugs.length) {
    const { data: cats } = await supabase
      .from('categories')
      .select('slug, name, color')
      .in('slug', slugs);
    if (cats) {
      cats.forEach(c => { catMap[c.slug] = c; });
    }
  }

  return articles.map(a => ({
    ...a,
    category: catMap[a.category_slug] || { name: a.category_slug || 'News', slug: a.category_slug || 'news', color: '#2563EB' },
    // Normalize field names
    banner_image: a.banner_image || null,
    excerpt: a.summary || a.excerpt || null,
    view_count: a.views || a.view_count || 0,
  }));
}

/**
 * Fetches the latest posts for the breaking news ticker
 */
export async function getBreakingNewsPosts(limit = 8) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, category_slug, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[magazine] getBreakingNewsPosts error:', error);
    return [];
  }
  return joinCategories(data || []);
}

/**
 * Fetches featured posts for the Hero carousel
 */
export async function getFeaturedPosts(limit = 5) {
  let { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    // Fallback: use latest posts
    const { data: fallback } = await supabase
      .from('articles')
      .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
      .order('created_at', { ascending: false })
      .limit(limit);
    data = fallback || [];
  }

  return joinCategories(data);
}

/**
 * Fetches editor's picks posts
 */
export async function getEditorsPicks(limit = 6) {
  let { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
    .eq('is_editors_pick', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    const { data: fallback } = await supabase
      .from('articles')
      .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
      .order('created_at', { ascending: false })
      .range(5, 5 + limit - 1);
    data = fallback || [];
  }

  return joinCategories(data);
}

/**
 * Fetches most-read posts
 */
export async function getMostReadPosts(limit = 5) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, views, view_count, category_slug')
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[magazine] getMostReadPosts error:', error);
    return [];
  }
  return joinCategories(data || []);
}

/**
 * Fetches latest posts
 */
export async function getLatestPosts(limit = 5, offset = 0) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[magazine] getLatestPosts error:', error);
    return [];
  }
  return joinCategories(data || []);
}

/**
 * Fetches travel category posts
 */
export async function getTravelPosts(limit = 6) {
  // Try with travel-related category slugs
  const travelSlugs = ['travel', 'world', 'lifestyle', 'culture'];
  
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
    .in('category_slug', travelSlugs)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    // Fallback: different offset slice
    const { data: fallback } = await supabase
      .from('articles')
      .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
      .order('created_at', { ascending: false })
      .range(20, 20 + limit - 1);
    return joinCategories(fallback || []);
  }

  return joinCategories(data);
}

/**
 * Fetches business category posts
 */
export async function getBusinessPosts(limit = 4) {
  const bizSlugs = ['business', 'technology', 'tech', 'finance', 'economy', 'ai', 'future-of-work'];

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
    .in('category_slug', bizSlugs)
    .order('views', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    const { data: fallback } = await supabase
      .from('articles')
      .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug')
      .order('views', { ascending: false })
      .range(10, 10 + limit - 1);
    return joinCategories(fallback || []);
  }

  return joinCategories(data);
}

/**
 * Fetches recent posts with count for pagination
 */
export async function getRecentPosts(limit = 6, offset = 0) {
  const { data, error, count } = await supabase
    .from('articles')
    .select('id, title, slug, banner_image, summary, excerpt, created_at, category_slug', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[magazine] getRecentPosts error:', error);
    return { posts: [], total: 0 };
  }

  const posts = await joinCategories(data || []);
  return { posts, total: count || 0 };
}

/**
 * Fetches social stats
 */
export async function getSocialStats() {
  const { data, error } = await supabase
    .from('social_stats')
    .select('*')
    .order('follower_count', { ascending: false });

  if (error) {
    console.error('[magazine] getSocialStats error:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetches active banner
 */
export async function getActiveBanner() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error) {
    console.error('[magazine] getActiveBanner error:', error);
    return null;
  }
  return data;
}

/**
 * Fetches videos
 */
export async function getVideos(limit = 3) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[magazine] getVideos error:', error);
    return [];
  }
  return data || [];
}

/**
 * Subscribe email to newsletter
 */
export async function subscribeToNewsletter(email) {
  const { error } = await supabase
    .from('subscribers')
    .insert({ email });

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'Already subscribed!' };
    }
    return { success: false, message: error.message };
  }
  return { success: true, message: 'Successfully subscribed!' };
}
