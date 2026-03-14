import { supabase } from '../src/supabase.js';
import { watermarkArticleImage } from './processImage.js';
import { emitLog } from '../src/utils/logger';

// Batch limit to prevent API overload
const BATCH_SIZE = 20;

export async function runWatermarkJob() {
    emitLog(`[${new Date().toISOString()}] Starting watermark job...`);


    try {
        // 1. Scan articles, finding images that are not yet processed
        // Only process rows where: cloudinary_public_id IS NULL
        const { data: articles, error: fetchError } = await supabase
            .from('articles')
            .select('id, banner_image, cloudinary_public_id, title')
            .is('cloudinary_public_id', null)
            .not('banner_image', 'is', null) // We must have an external URL to process
            .limit(BATCH_SIZE);

        if (fetchError) {
            emitLog(`[Watermark] Error fetching articles: ${fetchError.message}`, true);
            return;
        }

        if (!articles || articles.length === 0) {
            emitLog("[Watermark] No unprocessed articles found. Job completed.");
            return;
        }

        emitLog(`[Watermark] Found ${articles.length} unprocessed articles. Processing...`);

        let processedCount = 0;

        for (const article of articles) {
            const { id, banner_image, title } = article;

            // Skip invalid external URLs (e.g. relative paths, bad strings)
            if (!banner_image || !banner_image.startsWith("http")) {
                emitLog(`[Watermark] Article "${title}" has invalid external URL. Skipping.`, true);
                continue;
            }

            try {
                emitLog(`[Watermark] Processing: "${title}"...`);
                // 2 & 3: Upload and watermark
                const { public_id, watermarkedUrl } = await watermarkArticleImage(banner_image);

                // 4: Update the article
                // Set banner_image to the watermarked Cloudinary URL
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({
                        cloudinary_public_id: public_id,
                        banner_image: watermarkedUrl // Must become watermarked Cloudinary URL everywhere
                    })
                    .eq('id', id);

                if (updateError) {
                    emitLog(`[Watermark] Failed to update article "${title}" in DB: ${updateError.message}`, true);
                } else {
                    emitLog(`[Watermark] ✅ Successfully processed: "${title}"`);
                    processedCount++;
                }
            } catch (err) {
                // Errors are logged and caught. If processing fails, skip the article.
                emitLog(`[Watermark] Failed to process article "${title}". Error: ${err.message}`, true);
            }
        }

        emitLog(`[Watermark] Task batch finished. Successfully uploaded ${processedCount} out of ${articles.length} articles.`);

        if (articles.length === BATCH_SIZE) {
            emitLog("[Watermark] More unprocessed articles identified in backlog. Fetching next batch...");
            // recursively continue processing to clear the entire backlog instantly
            await runWatermarkJob();
        } else {
            emitLog("[Watermark] All historical articles successfully uploaded to Cloudinary. Job completed.");
            emitLog("SYNC_COMPLETE");
        }

    } catch (globalError) {
        emitLog(`[Watermark] Unexpected error running watermark job: ${globalError.message}`, true);
    }
}

// Background Scheduler
export function startWorker() {
    emitLog("[Watermark] Initializing Watermark Worker Job...");

    // Run immediately on start
    runWatermarkJob();

    // Schedule every 30 minutes
    const THIRTY_MINUTES = 30 * 60 * 1000;
    setInterval(() => runWatermarkJob(), THIRTY_MINUTES);
}
