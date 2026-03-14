import { supabase } from "../supabase";

const DEFAULT_BUCKET =
  (import.meta?.env?.VITE_ARTICLE_IMAGES_BUCKET || "article-images").toString();

const safeSlug = (slug) =>
  (slug || "article")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 120) || "article";

const coverDraw = (ctx, img, targetW, targetH) => {
  const { width: w, height: h } = img;
  const scale = Math.max(targetW / w, targetH / h);
  const drawW = w * scale;
  const drawH = h * scale;
  const dx = (targetW - drawW) / 2;
  const dy = (targetH - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
};

const toWeservUrl = (url) => {
  // Weserv expects a URL without protocol in most cases.
  const cleaned = url.replace(/^https?:\/\//i, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleaned)}`;
};

const fetchWithFallback = async (url) => {
  // First try direct fetch (works if the source allows CORS)
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return res;
  } catch {
    // ignore and try proxy
  }

  // Fallback: CORS-friendly proxy fetch
  const proxyUrl = toWeservUrl(url);
  const res2 = await fetch(proxyUrl, { cache: "no-store" });
  if (!res2.ok) throw new Error(`Failed to fetch image (proxy): ${res2.status}`);
  return res2;
};

const fetchImageBitmap = async (url) => {
  const res = await fetchWithFallback(url);
  const blob = await res.blob();
  return await createImageBitmap(blob);
};

const canvasToJpegBlob = (canvas, quality = 0.85) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality,
    );
  });

export async function brandAndUploadArticleImage({
  imageUrl,
  slug,
  bucket = DEFAULT_BUCKET,
}) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  // Note: This can fail if the source host blocks fetch entirely.
  // We try a proxy fallback to improve reliability without server-side code.
  const targetW = 1200;
  const targetH = 675;

  const s = safeSlug(slug);

  const { data: settings } = await supabase
    .from("settings")
    .select("logo")
    .eq("id", "model_config")
    .maybeSingle();

  const logoUrl = settings?.logo;

  const base = await fetchImageBitmap(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  coverDraw(ctx, base, targetW, targetH);

  if (logoUrl && typeof logoUrl === "string") {
    try {
      const logo = await fetchImageBitmap(logoUrl);
      const logoTargetW = 180;
      const scale = logoTargetW / logo.width;
      const logoW = logoTargetW;
      const logoH = Math.max(1, Math.round(logo.height * scale));

      const pad = 24;
      const x = Math.max(0, targetW - logoW - pad);
      const y = Math.max(0, targetH - logoH - pad);

      ctx.globalAlpha = 0.92;
      ctx.drawImage(logo, x, y, logoW, logoH);
      ctx.globalAlpha = 1;
    } catch {
      // ignore logo failures; still upload resized base image
    }
  }

  const outBlob = await canvasToJpegBlob(canvas, 0.85);

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
  const folder = "articles";
  const public_id = `${s}-banner`;
  const overwrite = true;

  // Cloudinary expects parameters needed for signature to be ordered alphabetically
  const params = [
    `folder=${folder}`,
    `overwrite=${overwrite}`,
    `public_id=${public_id}`,
    `timestamp=${timestamp}`
  ].sort().join('&');

  const signatureString = `${params}${apiSecret}`;
  const msgUint8 = new TextEncoder().encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const formData = new FormData();
  formData.append("file", outBlob);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", public_id);
  formData.append("overwrite", overwrite);

  const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const uploadData = await resCloud.json();

  if (!resCloud.ok) {
    throw new Error(
      `Cloudinary upload failed: ${uploadData.error?.message || resCloud.statusText}`
    );
  }

  return { secureUrl: uploadData.secure_url, publicId: uploadData.public_id };
}

