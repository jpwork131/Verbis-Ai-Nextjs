import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION
 * Edit these values if needed
 */
const SITE_URL = 'https://verbis-ai-supabase.vercel.app'; // Updated to your Vercel URL
const ITEMS_PER_SITEMAP = 50000;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const ENV_PATH = path.resolve(process.cwd(), '.env');

// Simple .env parser to avoid extra dependencies like dotenv
const getEnv = () => {
    try {
        if (!fs.existsSync(ENV_PATH)) return {};
        const content = fs.readFileSync(ENV_PATH, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                env[match[1]] = value;
            }
        });
        return env;
    } catch (err) {
        console.error('Error reading .env file:', err);
        return {};
    }
};

const env = getEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing Supabase URL or Key in .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
        }
        return c;
    });
};

const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

async function generate() {
    console.log('--- Starting Sitemap Generation ---');

    // 1. Fetch Data
    console.log('Fetching articles, categories, and tags...');
    
    // Fetch Articles
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('slug, category_slug, updated_at, published_at, seo_keywords')
        .order('published_at', { ascending: false });

    if (artError) {
        console.error('Error fetching articles:', artError);
        process.exit(1);
    }

    // Fetch Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true);

    if (catError) {
        console.error('Error fetching categories:', catError);
    }

    // Extract Unique Tags
    const tags = new Set();
    articles.forEach(art => {
        if (art.seo_keywords && Array.isArray(art.seo_keywords)) {
            art.seo_keywords.forEach(tag => tags.add(tag.trim()));
        }
    });

    const urls = [];

    // Add Homepage
    urls.push({
        loc: `${SITE_URL}/`,
        lastmod: formatDate(new Date()),
        changefreq: 'daily',
        priority: '1.0'
    });

    // Add Categories
    if (categories) {
        categories.forEach(cat => {
            urls.push({
                loc: `${SITE_URL}/category/${cat.slug}`,
                lastmod: formatDate(cat.updated_at || new Date()),
                changefreq: 'weekly',
                priority: '0.7'
            });
        });
    }

    // Add Tags
    tags.forEach(tag => {
        if (!tag) return;
        const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        urls.push({
            loc: `${SITE_URL}/tag/${tagSlug}`,
            lastmod: formatDate(new Date()),
            changefreq: 'weekly',
            priority: '0.6'
        });
    });

    // Add Articles
    articles.forEach(art => {
        // Preferred route: /category-slug/article-slug
        const cat = art.category_slug || 'news';
        urls.push({
            loc: `${SITE_URL}/${cat}/${art.slug}`,
            lastmod: formatDate(art.updated_at || art.published_at || new Date()),
            changefreq: 'daily',
            priority: '0.8'
        });
    });

    console.log(`Total URLs collected: ${urls.length}`);

    // 2. Write Sitemaps
    if (urls.length <= ITEMS_PER_SITEMAP) {
        // Single sitemap file
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
        
        fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
        console.log('Successfully generated sitemap.xml');
    } else {
        // Multiple sitemap files + Index
        const chunks = [];
        for (let i = 0; i < urls.length; i += ITEMS_PER_SITEMAP) {
            chunks.push(urls.slice(i, i + ITEMS_PER_SITEMAP));
        }

        chunks.forEach((chunk, index) => {
            const fileName = `sitemap-${index + 1}.xml`;
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
            fs.writeFileSync(path.join(PUBLIC_DIR, fileName), xml);
            console.log(`Generated ${fileName}`);
        });

        // Sitemap Index
        const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, index) => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${index + 1}.xml</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;
        
        fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), indexXml);
        console.log('Successfully generated sitemap index in sitemap.xml');
    }

    console.log('--- Generation Complete ---');
}

generate().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
