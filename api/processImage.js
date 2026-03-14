// processImage.js
import { uploadToCloudinary, generateWatermarkedUrl } from './cloudinaryService.js';

export async function watermarkArticleImage(imageUrl) {
    try {
        // 1. Upload the remote image to Cloudinary (Watermark done via Cloudinary Preset/settings)
        const { public_id, cloudName } = await uploadToCloudinary(imageUrl);
        const watermarkedUrl = await generateWatermarkedUrl(cloudName, public_id);

        // 3. Return both values as expected
        return { public_id, watermarkedUrl };
    } catch (error) {
        console.error(`Error processing image ${imageUrl}:`, error.message);
        throw error;
    }
}
