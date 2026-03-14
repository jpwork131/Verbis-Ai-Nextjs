import { supabase } from '../supabase';
import { getApiKey } from './apiKeys';
import { brandAndUploadArticleImage } from "./brandArticleImage";
import { emitLog } from '../utils/logger';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const fetchGNewsSafely = async (categoryOrQuery, limit, token) => {
  const GNEWS_TOPICS = ["general", "world", "nation", "business", "technology", "entertainment", "sports", "science", "health"];
  const normalized = (categoryOrQuery || "general").toString().toLowerCase();
  const useHeadlines = GNEWS_TOPICS.includes(normalized);
  
  const base = useHeadlines ? "https://gnews.io/api/v4/top-headlines" : "https://gnews.io/api/v4/search";
  const params = new URLSearchParams();
  params.set("token", token);
  params.set("lang", "en");
  params.set("max", String(Math.max(1, limit || 1)));
  
  if (useHeadlines) {
    params.set("category", normalized);
  } else {
    // Sanitize category for GNews q parameter
    let rawQ = (categoryOrQuery || "AI").replace(/&/g, "AND").replace(/[\"\']/g, "").trim();
    const searchTerms = rawQ.split(/\s+/).join(" AND ");
    params.set("q", searchTerms);
    params.set("sortBy", "publishedAt");
  }
  
  const res = await fetch(`${base}?${params.toString()}`);
  return await res.json();
};

// --- ADMIN & MANAGEMENT ---

export const createArticleAI = async (articleData) => {
  let { title, content, url, sourceName, sourceUrl, category, categorySlug: providedCategorySlug, bannerImage } = articleData || {};

  emitLog(`[AI GEN] Starting ingestion for: "${title || category}"`);

  const { data: config } = await supabase.from('settings').select('active_text_provider').eq('id', 'model_config').single();
  const provider = config?.active_text_provider || 'openrouter';

  const [openrouterKey, gnewsKey, geminiKey] = await Promise.all([
    getApiKey("openrouter"),
    getApiKey("gnews"),
    getApiKey("google_gemini")
  ]);

  // Optional: if no content/title provided, fall back to GNews based on category
  if ((!content || !title) && category && gnewsKey) {
    emitLog(`[AI GEN] Fetching raw news from GNews for category/query: ${category}`);
    const gnewsData = await fetchGNewsSafely(category, 1, gnewsKey);
    const first = gnewsData?.articles?.[0];
    if (first) {
      title = title || first.title;
      content = content || first.content || first.description;
      url = url || first.url;
      sourceName = sourceName || first.source?.name || 'GNews';
      sourceUrl = sourceUrl || first.url;
      bannerImage = first.image;
      emitLog(`[AI GEN] Found article: "${title}"`);
    } else {
      emitLog(`[AI GEN] No articles found in GNews for category: ${category}`, true);
    }
  }

  if (!content && !title) {
    throw new Error("No content or title provided for AI synthesis.");
  }

  let parsed = {
    title: title || "Raw Article",
    rewrittenContent: content || "Raw content.",
    summary: (content || title || "").substring(0, 150) + "...",
    seoKeywords: ["news", category || "general"]
  };
  let modelUsed = "none (disabled)";

  if (provider === 'disabled') {
    emitLog(`[AI GEN] AI completely disabled. Using raw input data bypass.`);
  } else {
    emitLog(`[AI GEN] Requesting Rewrite. Engine: ${provider.toUpperCase()}...`);

    const systemPrompt = `You are a Senior Investigative Journalist and Editor-in-Chief at a world-class technology publication. 
Your task is to transform raw news data into a comprehensive, high-premium feature article.

WRITING GUIDELINES:
- STYLE: Authoritative, investigative, and intellectually stimulating. Avoid generic AI fluff.
- STRUCTURE: Use H2 and H3 headers, bullet points for key takeaways, and a "The Bottom Line" conclusion.
- LENGTH: Detailed and sprawling. Aim for 800-1200 words.
- DEPTH: Discuss broader implications, future trends, and industry impact.

OUTPUT REQUIREMENTS:
1. "title": A powerful, SEO-optimized, click-worthy headline.
2. "rewrittenContent": The full article in Markdown format.
3. "summary": A 4-5 line compelling abstract for social media sharing.
4. "seoKeywords": Exactly 5 relevant, high-traffic keywords.

STRICT FORMATTING: 
- Output ONLY valid JSON.
JSON STRUCTURE:
{
  "title": "string",
  "rewrittenContent": "string",
  "summary": "string",
  "seoKeywords": ["key1", "key2", "key3", "key4", "key5"]
}`;

    if (provider === 'google_gemini') {
      if (!geminiKey) throw new Error("Missing Google Gemini API key.");
      modelUsed = "google/gemini-2.0-flash (direct)";

      const llmRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\nRaw News Data: \n" + (content || title) }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        })
      });

      if (!llmRes.ok) {
        const errText = await llmRes.text();
        emitLog(`[AI GEN] Google Gemini Error: ${errText}`, true);
        throw new Error(`Google Gemini failed: ${errText}`);
      }

      const llmData = await llmRes.json();
      parsed = JSON.parse(llmData.candidates[0].content.parts[0].text);
    } else {
      // Default to openrouter
      if (!openrouterKey) throw new Error("Missing OpenRouter API key.");
      modelUsed = "openrouter/google/gemini-2.0-flash-001";

      const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Raw News Data: ${content || title}` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!llmRes.ok) {
        const errText = await llmRes.text();
        emitLog(`[AI GEN] OpenRouter Error: ${errText}`, true);
        throw new Error(`OpenRouter failed: ${errText}`);
      }

      const llmData = await llmRes.json();
      parsed = JSON.parse(llmData.choices[0].message.content);
    }
    
    emitLog(`[AI GEN] Rewrite Complete (${provider}). Target Title: "${parsed.title}"`);
  }

  const dbCategory = category || 'general';
  const categorySlug = providedCategorySlug || slugify(dbCategory);

  // Ensure category exists to prevent foreign key constraint errors
  const { data: existingCat, error: catFetchError } = await supabase
    .from('categories')
    .select('id, slug')
    .or(`slug.eq.${categorySlug},name.ilike.${dbCategory}`)
    .maybeSingle();

  let finalCategorySlug = categorySlug;
  if (existingCat) {
    finalCategorySlug = existingCat.slug;
  } else {
    // Attempt to create it if it doesn't exist
    const { data: newCat, error: catInsertError } = await supabase
      .from('categories')
      .insert([{
        name: dbCategory,
        slug: categorySlug,
        is_active: true
      }])
      .select('slug')
      .single();
    
    if (catInsertError) {
      emitLog(`[AI GEN] Warning: Could not find or create category "${dbCategory}". Foreign key failure imminent.`, true);
      // If we can't create it and it doesn't exist, we might as well fail now with a clear error
      const { data: generalCat } = await supabase.from('categories').select('slug').eq('slug', 'general').maybeSingle();
      if (generalCat) {
        emitLog(`[AI GEN] Falling back to "general" category to prevent constraint violation.`);
        finalCategorySlug = 'general';
      } else {
        throw new Error(`Category resolution failed and no "general" fallback found. ${catInsertError.message}`);
      }
    } else {
      finalCategorySlug = newCat.slug;
      emitLog(`[AI GEN] Created missing category: ${dbCategory}`);
    }
  }

  const generatedSlug = slugify(parsed.title || title);

  let cloudinaryPublicId = null;
  let finalBannerImage = bannerImage;

  // Brand the banner (logo on lower-right) in the browser and upload to Supabase Storage.
  if (finalBannerImage && generatedSlug) {
    emitLog(`[AI GEN] Branding and uploading image to Cloudinary...`);
    try {
      const uploadResp = await brandAndUploadArticleImage({
        imageUrl: finalBannerImage,
        slug: generatedSlug,
        bucket: "article-images",
      });
      if (uploadResp && uploadResp.secureUrl) {
        finalBannerImage = uploadResp.secureUrl;
        cloudinaryPublicId = uploadResp.publicId;
        emitLog(`[AI GEN] Image uploaded successfully!`);
      }
    } catch (e) {
      emitLog(`[AI GEN] Branding upload failed (${e.message}); using original banner image.`, true);
      // finalBannerImage remains the original image URL
    }
  }

  emitLog(`[AI GEN] Storing article in database...`);
  const { data, error } = await supabase
    .from('articles')
    .insert([{
      title: parsed.title,
      ai_content: parsed.rewrittenContent,
      summary: parsed.summary,
      seo_keywords: parsed.seoKeywords,
      url: url || `https://fallback.com/${Date.now()}`,
      source_name: sourceName || "AI Generated",
      source_url: sourceUrl || `https://fallback.com/${Date.now()}`,
      category: dbCategory,
      category_slug: finalCategorySlug,
      slug: generatedSlug,
      model_used: modelUsed,
      banner_image: finalBannerImage || null,
      cloudinary_public_id: cloudinaryPublicId || null,
      published_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    emitLog(`[AI GEN] Database insertion failed: ${error.message}`, true);
    throw error;
  }
  
  emitLog(`[AI GEN] SUCCESS! Article stored. ID: ${data.id}`);
  return { article: data };
};

/**
 * Instantly generate multiple articles for a specific category.
 * @param {string} category The category name to fetch for.
 * @param {number} limit Number of articles to attempt.
 */
export const instantGenerateArticles = async (category, limit = 3) => {
  emitLog(`--- [INSTANT GEN START] Category: ${category}, Target Limit: ${limit} ---`);
  const gnewsKey = await getApiKey("gnews");
  if (!gnewsKey) throw new Error("GNews API Key missing.");

  emitLog(`[INSTANT GEN] Fetching top ${limit} headlines for "${category}"...`);
  const gnewsData = await fetchGNewsSafely(category, limit, gnewsKey);
  const articles = gnewsData?.articles || [];

  if (articles.length === 0) {
    emitLog(`[INSTANT GEN] No articles found for "${category}".`, true);
    return [];
  }

  emitLog(`[INSTANT GEN] Found ${articles.length} candidates. Processing sequentially...`);
  
  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const news = articles[i];
    emitLog(`[INSTANT GEN] Processing ${i + 1}/${articles.length}: "${news.title}"`);
    try {
      const { article } = await createArticleAI({
        title: news.title,
        content: news.content || news.description,
        url: news.url,
        sourceName: news.source?.name,
        sourceUrl: news.url,
        category: category,
        bannerImage: news.image
      });
      results.push(article);
    } catch (err) {
      emitLog(`[INSTANT GEN] Failed processing article ${i + 1}: ${err.message}`, true);
    }
  }

  emitLog(`--- [INSTANT GEN FINISHED] Successfully created ${results.length} active articles! ---`);
  return results;
};


export const updateArticle = async (id, articleData, token) => {
  const { data, error } = await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { article: data };
};

export const deleteArticle = async (id, token) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

// --- PUBLIC FEEDS ---

const mapArticle = (row) => {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
    bannerImage: row.banner_image || row.bannerImage,
    publishedAt: row.published_at ?? row.publishedAt,
    categorySlug: row.category_slug ?? row.categorySlug,
    aiContent: row.ai_content || row.aiContent || row.content || row.description || "",
    seoKeywords: row.seo_keywords || row.seoKeywords || [],
    source: row.source || (row.source_name ? { name: row.source_name } : undefined),
  };
};

export const getArticles = async (page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  const mapped = (data || []).map(mapArticle);

  return {
    articles: mapped,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };
};

export const getArticlesByCategory = async (categorySlug, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('category_slug', categorySlug)
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  const mapped = (data || []).map(mapArticle);

  return {
    articles: mapped,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };
};

export const getArticleBySlug = async (category, slug) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return { data: mapArticle(data) }; // Axios returned an object with 'data' property
};

export const getArticleById = async (id) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return { data: mapArticle(data) };
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(cat => ({
    _id: cat.id,
    name: cat.name,
    slug: cat.slug,
    searchQuery: cat.search_query,
    isActive: cat.is_active,
    order: cat.order
  }));
};

// --- SEARCH & INTERACTIONS ---

export const searchArticles = async (query, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .ilike('title', `%${query}%`) // simple ilike search
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  const mapped = (data || []).map(mapArticle);

  return {
    articles: mapped,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  };
};

export const likeArticle = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  // Check if liked
  const { data: liked, error: fetchErr } = await supabase
    .from('liked_articles')
    .select('*')
    .eq('user_id', user.id)
    .eq('article_id', id);

  if (fetchErr) throw fetchErr;

  if (liked && liked.length > 0) {
    // unlike
    await supabase.from('liked_articles').delete().eq('user_id', user.id).eq('article_id', id);
    // decrement like count
    const { data: artObj } = await supabase.from('articles').select('likes_count').eq('id', id).single();
    await supabase.from('articles').update({ likes_count: (artObj.likes_count || 0) - 1 }).eq('id', id);
    return { status: 200, data: { status: 'unliked' } };
  } else {
    // like
    await supabase.from('liked_articles').insert([{ user_id: user.id, article_id: id }]);
    const { data: artObj } = await supabase.from('articles').select('likes_count').eq('id', id).single();
    await supabase.from('articles').update({ likes_count: (artObj.likes_count || 0) + 1 }).eq('id', id);
    return { status: 200, data: { status: 'liked' } };
  }
};

export const commentArticle = async (id, text, parentId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: userData } = await supabase.from('users').select('name').eq('id', user.id).single();

  const { data, error } = await supabase
    .from('comments')
    .insert([
      { article_id: id, user_id: user.id, user_name: userData.name || 'User', comment: text, parent_id: parentId }
    ])
    .select()
    .single();

  if (error) throw error;
  return { data };
};

export const likeComment = async (articleId, commentId) => {
  // simplify for now or implement similarly to likeArticle
  return { data: { success: true } };
};

export const deleteComment = async (articleId, commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
  return { data: { success: true } };
};

export const saveArticle = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: saved, error: fetchErr } = await supabase
    .from('saved_articles')
    .select('*')
    .eq('user_id', user.id)
    .eq('article_id', id);

  if (fetchErr) throw fetchErr;

  if (saved && saved.length > 0) {
    await supabase.from('saved_articles').delete().eq('user_id', user.id).eq('article_id', id);
    return { data: { status: 'unsaved' } };
  } else {
    await supabase.from('saved_articles').insert([{ user_id: user.id, article_id: id }]);
    return { data: { status: 'saved' } };
  }
};

export const trackArticleView = async (slug) => {
  const { data: article } = await supabase.from('articles').select('views').eq('slug', slug).single();
  if (article) {
    const { data } = await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('slug', slug);
    return { data };
  }
  return { data: null };
};

// Convenience helper: ingest a top headline for a category using the same pipeline
// (GNews -> OpenRouter rewrite -> Supabase insert). Returns the created article row.
export const ingestTopHeadlinesByCategory = async (category = 'general') => {
  const { article } = await createArticleAI({ category });
  return article;
};

// --- SILENT FIXERS ---
export const fixMissingCloudinaryImages = async () => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, slug, banner_image, cloudinary_public_id')
      .is('cloudinary_public_id', null)
      .not('banner_image', 'is', null);

    if (error || !articles || articles.length === 0) return;

    for (const article of articles) {
      if (article.banner_image.includes('res.cloudinary.com')) continue;
      try {
        emitLog(`[IMAGE FIX] Attempting upload for ${article.slug}...`);
        const uploadResp = await brandAndUploadArticleImage({
          imageUrl: article.banner_image,
          slug: article.slug || `article-${article.id}`,
        });
        if (uploadResp && uploadResp.secureUrl) {
          await supabase
            .from('articles')
            .update({
              banner_image: uploadResp.secureUrl,
              cloudinary_public_id: uploadResp.publicId
            })
            .eq('id', article.id);
          emitLog(`[IMAGE FIX] Success for ${article.slug}`);
        }
      } catch (e) {
        emitLog(`[IMAGE FIX] Failed for ${article.slug}: ${e.message}`, true);
      }
    }
  } catch (err) {
    emitLog(`[IMAGE FIX] Process error: ${err.message}`, true);
  }
};