import { supabase } from '../src/supabase.js';
export async function getCloudinaryKeys() {
    const { data, error } = await supabase
        .from("api_keys")
        .select("provider, api_key")
        .in("provider", ["cloudinary", "cloudinary_cloud_name", "cloudinary_secret"])
        .eq("active", true);

    if (error) {
        throw new Error(`Failed to fetch Cloudinary keys from database: ${error.message}`);
    }

    const keysMap = {};
    (data || []).forEach(k => {
        keysMap[k.provider] = k.api_key;
    });

    return {
        cloudName: keysMap["cloudinary_cloud_name"],
        apiKey: keysMap["cloudinary"],
        apiSecret: keysMap["cloudinary_secret"]
    };
}

const toWeservUrl = (url) => {
    const cleaned = url.replace(/^https?:\/\//i, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleaned)}`;
};

const fetchImageBlob = async (url) => {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return await res.blob();
    } catch (e) { }

    const proxyUrl = toWeservUrl(url);
    const res2 = await fetch(proxyUrl, { cache: "no-store" });
    if (!res2.ok) throw new Error(`Failed to fetch image proxy: ${res2.status}`);
    return await res2.blob();
};

export async function uploadToCloudinary(imageUrl) {
    const keys = await getCloudinaryKeys();
    const { cloudName, apiKey, apiSecret } = keys;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary keys in database api_keys table.");
    }

    const folder = "news";
    const timestamp = Math.floor(Date.now() / 1000);

    // Create signature using Web Crypto API to work in the frontend browser
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const msgUint8 = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    let filePayload = imageUrl;
    if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
        try {
            filePayload = await fetchImageBlob(imageUrl);
        } catch (e) {
            console.warn("Local fetch failed, falling back to Cloudinary remote fetch.", e);
        }
    }

    const formData = new FormData();
    formData.append("file", filePayload);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${data.error?.message || JSON.stringify(data)}`);
    }

    return {
        public_id: data.public_id,
        secure_url: data.secure_url,
        cloudName
    };
}

export async function generateWatermarkedUrl(cloudName, publicId) {
    let watermarkStr = '';
    try {
        const { data } = await supabase.from('settings').select('logo').eq('id', 'model_config').single();
        if (data && data.logo) {
            const match = /\/upload\/(?:v\d+\/)?([^\.]+)/.exec(data.logo);
            if (match) {
                const layerId = match[1].replace(/\//g, ':');
                // Set watermark layer on bottom right, scaled relative to 10% of the base image
                watermarkStr = `l_${layerId}/c_scale,w_0.10,fl_relative,o_90/fl_layer_apply,g_south_east,x_20,y_50/`;
            }
        }
    } catch (e) {
        console.warn("Could not fetch brand layer, skipping watermark explicitly:", e);
    }

    // Final URL with automatic format optimization, automatic compression, and bottom-right logo placement
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${watermarkStr}${publicId}`;
}
