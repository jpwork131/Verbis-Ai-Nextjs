import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xuoeucsdqnowjwvglvul.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1b2V1Y3NkcW5vd2p3dmdsdnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTgzMjYsImV4cCI6MjA4NzQzNDMyNn0.bNgZXpcxlITNuwj4nDdqCnUaEScJuod7XJociKpmq8g';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { slug } = req.query;

  let protocol = req.headers['x-forwarded-proto'] || 'https';
  let host = req.headers.host || 'verbis-ai-supabase.vercel.app';
  let baseUrl = `${protocol}://${host}`;

  try {
    // Fetch the actual index.html from our Vercel static deployment
    // We append a query param to avoid fetching from this exact endpoint if rewrites misbehave
    const response = await fetch(`${baseUrl}/?_seo=1`);
    if (!response.ok) {
        throw new Error(`Failed to fetch index.html: ${response.status}`);
    }
    let html = await response.text();

    if (slug) {
      // Parallel requests for faster response
      const [articleRes, keysRes] = await Promise.all([
        supabase.from('articles').select('*').eq('slug', slug).single(),
        supabase.from('api_keys').select('api_key').eq('provider', 'cloudinary_cloud_name').single()
      ]);

      const article = articleRes.data;
      const cloudName = keysRes.data?.api_key || 'dquvwun4o'; 

      if (article) {
        let imageUrl = `${baseUrl}/fallback-banner.jpg`; 
        if (article.cloudinary_public_id && cloudName) {
           imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${article.cloudinary_public_id}.jpg`;
        } else if (article.banner_image) {
           imageUrl = article.banner_image;
        }

        let summary = article.summary || '';
        if (!summary && article.ai_content) {
          summary = article.ai_content.replace(/[#*`_\[\]()]/g, '').substring(0, 160).trim() + '...';
        }

        let keywords = '';
        if (Array.isArray(article.seo_keywords)) {
          keywords = article.seo_keywords.join(', ');
        } else if (typeof article.seo_keywords === 'string') {
          try {
            const parsed = JSON.parse(article.seo_keywords);
            keywords = Array.isArray(parsed) ? parsed.join(', ') : article.seo_keywords;
          } catch(e) {
            keywords = article.seo_keywords;
          }
        }

        const title = article.title ? article.title.replace(/"/g, '&quot;') : '';
        const desc = summary.replace(/"/g, '&quot;');
        const kw = keywords.replace(/"/g, '&quot;');
        const url = `${baseUrl}/article/${slug}`;

        html = html.replace(/__META_TITLE__/g, title)
                   .replace(/__META_DESCRIPTION__/g, desc)
                   .replace(/__META_KEYWORDS__/g, kw)
                   .replace(/__META_IMAGE__/g, imageUrl)
                   .replace(/__META_URL__/g, url);

        const extraTags = `
    <meta property="article:published_time" content="${article.published_at || ''}" />
    <meta property="article:section" content="${article.category || ''}" />
    <meta property="og:site_name" content="VERBIS AI News" />
        `.trim();
        html = html.replace('</head>', `${extraTags}\n</head>`);
      }
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('SEO Generation error:', error);
    // Even if it fails, try to send back standard html by redirecting to root
    res.redirect('/');
  }
}
