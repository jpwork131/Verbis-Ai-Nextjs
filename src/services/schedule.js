import { supabase } from '../lib/supabase';
import { getApiKey } from "./apiKeys";
import { brandAndUploadArticleImage } from "./brandArticleImage";
import { createArticleAI } from "./articles";
import { emitLog } from '../utils/logger';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Standard GNews top-headlines categories.
const GNEWS_TOPICS = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
];

const fetchFromGNews = async ({ categoryOrQuery, max, token }) => {
  const normalized = (categoryOrQuery || "general").toString().toLowerCase();
  const useHeadlines = GNEWS_TOPICS.includes(normalized);

  const base = useHeadlines
    ? "https://gnews.io/api/v4/top-headlines"
    : "https://gnews.io/api/v4/search";

  const params = new URLSearchParams();
  params.set("token", token);
  params.set("lang", "en");
  
  // GNews free plan max is 10. We fetch more candidates than needed 
  // to ensure we have enough non-duplicate options.
  const fetchCount = Math.min(10, Math.max(5, max || 5));
  params.set("max", String(fetchCount));

  if (useHeadlines) {
    params.set("category", normalized);
  } else {
    // Sanitize category for GNews q parameter
    // Replace '&' with 'AND' to broaden search and avoid syntax errors
    let rawQ = (categoryOrQuery || "AI").replace(/&/g, "AND").replace(/[\"\']/g, "").trim();
    
    // STRATEGY: Instead of quoting the whole phrase (which is fragile with GNews and tricky to encode),
    // we use 'AND' between words. GNews handles this much more reliably without syntax errors.
    const searchTerms = rawQ.split(/\s+/).join(" AND ");
    params.set("q", searchTerms); 
    params.set("sortBy", "publishedAt");
  }

  const url = `${base}?${params.toString()}`;
  emitLog(`[Ingestion] Fetching GNews: ${useHeadlines ? "headlines" : "search"} mode (count: ${fetchCount})`);
  const res = await fetch(url);
  const data = await res.json();
  
  if (data?.errors) {
    emitLog(`[Ingestion] GNews API Error: ${JSON.stringify(data.errors)}`, true);
    return [];
  }
  
  return data?.articles || [];
};

export const getActiveSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;

    // Map snake_case to camelCase
    return data.map(d => ({
      _id: d.id, // Emulate mongo id format inside React
      category: d.category,
      articlesPerDay: d.articles_per_day,
      daysRemaining: d.days_remaining,
      countToday: d.count_today || 0,
      lastRun: d.last_run,
      status: d.status,
      createdAt: d.created_at
    }));
  } catch (error) {
    console.error("Error fetching active schedules:", error);
    return [];
  }
};

export const getAllSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(d => ({
      _id: d.id,
      category: d.category,
      articlesPerDay: d.articles_per_day,
      daysRemaining: d.days_remaining,
      countToday: d.count_today || 0,
      lastRun: d.last_run,
      status: d.status,
      createdAt: d.created_at
    }));
  } catch (error) {
    console.error("Error fetching all schedules:", error);
    return [];
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const dbInsert = {
      category: scheduleData.category,
      articles_per_day: scheduleData.articlesPerDay,
      days_remaining: scheduleData.daysRemaining,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('schedules')
      .insert([dbInsert])
      .select()
      .single();

    if (error) throw error;

    emitLog(`[Schedule] Created new injection schedule for: ${data.category}`);

    // Bootstrap: Immediately generate news for this schedule upon creation!
    try {
      emitLog(`[Schedule] Bootstrap ingestion: Generating initial articles now...`);

      // Run ingestion but focus on this new schedule only.
      // Do not wait for it to finish because we want the UI modal to close instantly.
      runIngestionForActiveSchedules({ onlyScheduleId: data.id, force: true });
    } catch (bootstrapErr) {
      emitLog(`[Schedule] Bootstrap ingestion failed: ${bootstrapErr.message}`, true);
    }

    return {
      _id: data.id,
      category: data.category,
      articlesPerDay: data.articles_per_day,
      daysRemaining: data.days_remaining,
      countToday: data.count_today,
      status: data.status
    };
  } catch (error) {
    const message = error.message || "Failed to create schedule";
    emitLog(`[Schedule] Error: ${message}`, true);
    throw new Error(message);
  }
};

export const deleteSchedule = async (id) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};

// Run ingestion for all active schedules based on their quotas.
let ingestionRunInFlight = false;
export const runIngestionForActiveSchedules = async (opts = {}) => {
  const { onlyScheduleId, force = false } = opts || {};

  if (ingestionRunInFlight && !force) {
    emitLog("[Ingestion] Skipping: previous run still in-flight.");
    return { success: false, reason: "in_flight" };
  }

  ingestionRunInFlight = true;
  console.log("[ingestion] Starting ingestion run on page load / schedule action");

  const [gnewsKey] = await Promise.all([
    getApiKey("gnews"),
  ]);

  if (!gnewsKey) {
    emitLog("[Ingestion] GNews API key missing; aborting GNews fetch.", true);
    ingestionRunInFlight = false;
    return { success: false, reason: "missing_gnews_key" };
  }

  try {
    const { data: schedules, error: schedErr } = await supabase
      .from("schedules")
      .select("*")
      .eq("status", "active")
      .gt("days_remaining", 0);

    if (schedErr) throw schedErr;
    emitLog(`[Ingestion] Found ${schedules.length} active pipelines.`);

    if (!schedules || schedules.length === 0) {
      emitLog("[Ingestion] No active pipelines require articles at this time.");
      return { success: true, processedCount: 0, articles: [] };
    }

    let totalSaved = 0;
    const processedArticles = [];

    const todayIsoDate = new Date().toISOString().slice(0, 10);

    const targetSchedules = onlyScheduleId
      ? schedules.filter((s) => s.id === onlyScheduleId)
      : schedules;

    if (onlyScheduleId && targetSchedules.length === 0) {
      emitLog(`[Ingestion] No matching schedule found for ID offset.`);
      return { success: true, processedCount: 0, articles: [] };
    }

    // SYSTEM OVERLOAD PROTECTION: Batching
    // We only process a maximum of X articles per schedule per run.
    // Since this runs every 15 mins (96x a day), 2 per run = 192 articles/day per schedule.
    const MAX_ARTICLES_PER_PULSE_PER_SCHEDULE = 2;
    
    // Calculate total needed articles for logs
    let totalNeededToday = 0;
    targetSchedules.forEach(s => {
      const isSameDay = s.last_run && new Date(s.last_run).toISOString().slice(0, 10) === todayIsoDate;
      const countToday = isSameDay ? (s.count_today || 0) : 0;
      totalNeededToday += Math.max(0, s.articles_per_day - countToday);
    });

    emitLog(`[Ingestion] CALCULATION: ${targetSchedules.length} pipelines need ${totalNeededToday} articles total today.`);
    emitLog(`[Ingestion] STRATEGY: Processing up to ${MAX_ARTICLES_PER_PULSE_PER_SCHEDULE} articles per pipeline in this pulse.`);

    for (const rule of targetSchedules) {
      const lastRunDate =
        rule.last_run ? new Date(rule.last_run).toISOString().slice(0, 10) : null;
      const isSameDay = lastRunDate === todayIsoDate;

      // If it's a new day, reset the daily counter; otherwise respect existing count_today
      const baseCountToday = isSameDay ? (rule.count_today || 0) : 0;
      let countToday = baseCountToday;
      let articlesRemaining = rule.articles_per_day - countToday;

      // If we've already hit today's quota for this schedule, skip generating more
      if (articlesRemaining <= 0) {
        emitLog(`[Ingestion] Pipeline '${rule.category}': Daily quota hit. Skipping.`);
        continue;
      } 
      
      const batchSize = Math.min(articlesRemaining, MAX_ARTICLES_PER_PULSE_PER_SCHEDULE);
      emitLog(`[Ingestion] Pipeline '${rule.category}': ${articlesRemaining} remaining today. Attempting batch of ${batchSize}.`);

      const category = (rule.category || "").trim();

      // 1. Fetch raw news from GNews
      const articles = await fetchFromGNews({
        categoryOrQuery: category,
        max: 10, // Always fetch 10 candidates to improve non-duplicate chances
        token: gnewsKey,
      });

      emitLog(`[Ingestion] GNews returned ${articles.length} candidates for "${category}"`);

      if (!articles || articles.length === 0) {
        emitLog(`[Ingestion] No articles fetched for "${category}"`, true);
        continue;
      }

      let savedForRule = 0;

      // Ensure category exists in categories table and get its real slug (respecting FK)
      let resolvedCategorySlug = null;
      try {
        const { data: existingCat } = await supabase
          .from("categories")
          .select("id, name, slug")
          .or(`name.ilike.${category},slug.eq.${slugify(category)}`)
          .maybeSingle();

        if (existingCat) {
          resolvedCategorySlug = existingCat.slug;
          console.log("[ingestion] Using existing category mapping:", existingCat.slug);
        } else {
          const newSlug = slugify(category || "general");
          const { data: createdCat, error: catInsertErr } = await supabase
            .from("categories")
            .insert([
              {
                name: category,
                slug: newSlug,
                is_active: true
              }
            ])
            .select()
            .single();

          if (catInsertErr) {
            console.error("[ingestion] Failed to auto-create category for rule", rule, catInsertErr);
            // Fallback to "general" if we can't create it
            resolvedCategorySlug = 'general';
          } else {
            resolvedCategorySlug = createdCat.slug;
            emitLog(`[Ingestion] Registered new category grouping: ${createdCat.name} (${createdCat.slug})`);
          }
        }
      } catch (catErr) {
        emitLog(`[Ingestion] Category resolution error for "${category}": ${catErr.message}`, true);
        resolvedCategorySlug = 'general';
      }

      for (const news of articles) {
        if (savedForRule >= batchSize) break;

        // Dedup by URL
        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("url", news.url)
          .maybeSingle();

        if (existing) {
          emitLog(`[Ingestion] Skipping duplicate: ${news.title.substring(0, 30)}...`);
          continue;
        }

        try {
          emitLog(`[Ingestion] Reserving quota for article in "${category}" pipeline...`);
          // HARD CAP: atomically reserve 1 quota slot in DB before spending key quota.
          const { data: quotaRows, error: quotaErr } = await supabase.rpc(
            "try_consume_schedule_quota",
            { p_schedule_id: rule.id }
          );

          if (quotaErr) {
            emitLog(`[Ingestion] Quota RPC error. Halting rule constraint.`, true);
            break;
          }

          const quota = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
          if (!quota?.consumed) {
            emitLog(`[Ingestion] 🛑 Schedule out of tokens. (${quota?.count_today}/${quota?.articles_per_day})`);
            break;
          }

          emitLog(`[Ingestion] ✅ Quota confirmed (${quota?.count_today}/${quota?.articles_per_day}). Launching AI Synthesis...`);

          // Call the centralized createArticleAI function
          const { article } = await createArticleAI({
            title: news.title,
            content: news.content || news.description,
            url: news.url,
            sourceName: news.source?.name,
            sourceUrl: news.url,
            category: category,
            categorySlug: resolvedCategorySlug,
            bannerImage: news.image
          });

          if (article) {
            processedArticles.push(article);
            savedForRule += 1;
            totalSaved += 1;
            emitLog(`[Ingestion] Successfully deployed AI article block: ${article.id}`);
          }
        } catch (err) {
          emitLog(`[Ingestion] Error forming block "${news.title}": ${err.message}`, true);
          // Refund the quota since the article was not saved to the DB
          await supabase.rpc("refund_schedule_quota", { p_schedule_id: rule.id });
          emitLog(`[Ingestion] Refunded 1 quota token due to failure.`);
        }
      }
    }

    emitLog(`[Ingestion] Pipeline sweep complete. Generated ${totalSaved} premium articles.`);
    return { success: true, processedCount: totalSaved, articles: processedArticles };
  } catch (error) {
    emitLog(`[Ingestion] Critical pipeline failure: ${error.message}`, true);
    return { success: false, error: error.message };
  } finally {
    ingestionRunInFlight = false;
  }
};

/**
 * Initializes the background scheduled generation system.
 * Keeps the feeds constantly refreshed based on active logic rules.
 */
export function startIngestionWorker() {
  emitLog("[System] Initializing Background Engine Worker...");
  
  // Every 15 minutes, check if new day quotas need fulfilling.
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  setInterval(() => {
    emitLog(`[System] Executing 15-minute scheduled ingestion pulse...`);
    runIngestionForActiveSchedules({ force: false });
  }, FIFTEEN_MINUTES);
}