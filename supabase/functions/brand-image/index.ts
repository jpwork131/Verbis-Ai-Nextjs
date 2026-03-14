import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { v2 as cloudinary } from "npm:cloudinary@1.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileStr, slug } = await req.json();

    if (!fileStr) {
      throw new Error("Missing file data");
    }

    // Configure cloudinary with environment variables from Supabase project
    cloudinary.config({
      cloud_name: Deno.env.get("CLOUDINARY_CLOUD_NAME"),
      api_key: Deno.env.get("CLOUDINARY_API_KEY"),
      api_secret: Deno.env.get("CLOUDINARY_API_SECRET"),
    });

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${fileStr}`, {
      folder: "articles",
      public_id: `${slug}-banner`,
      overwrite: true,
      resource_type: "image",
    });

    return new Response(JSON.stringify({ url: result.secure_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error from cloudinary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
