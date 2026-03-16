import ArticleDetail from '@/components/views/ArticleDetail';
import { supabase } from '@/lib/supabase';
import MarketNewsWidget from '@/components/magazine/MarketNewsWidget';
import StartupEcosystemWidget from '@/components/magazine/StartupEcosystemWidget';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!slug) return {};

  try {
    const [articleRes, keysRes] = await Promise.all([
      supabase.from('articles').select('*').eq('slug', slug).single(),
      supabase.from('api_keys').select('api_key').eq('provider', 'cloudinary_cloud_name').single()
    ]);

    const article = articleRes.data;
    const cloudName = keysRes.data?.api_key || 'dquvwun4o';

    if (article) {
      let imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/fallback-banner.jpg`;
      if (article.cloudinary_public_id && cloudName) {
        imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${article.cloudinary_public_id}.jpg`;
      } else if (article.banner_image) {
        imageUrl = article.banner_image;
      }

      let summary = article.summary || '';
      if (!summary && article.ai_content) {
        summary = article.ai_content.replace(/[#*\`_\[\]()]/g, '').substring(0, 160).trim() + '...';
      }

      let keywords = '';
      if (Array.isArray(article.seo_keywords)) {
        keywords = article.seo_keywords.join(', ');
      } else if (typeof article.seo_keywords === 'string') {
        try {
          const parsed = JSON.parse(article.seo_keywords);
          keywords = Array.isArray(parsed) ? parsed.join(', ') : article.seo_keywords;
        } catch (e) {
          keywords = article.seo_keywords;
        }
      }

      const title = article.title ? article.title.replace(/"/g, '&quot;') : '';

      return {
        title,
        description: summary,
        keywords: keywords,
        openGraph: {
          title,
          description: summary,
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${article.category}/${slug}`,
          siteName: 'StartEJ News',
          images: [
            {
              url: imageUrl,
            },
          ],
          type: 'article',
          publishedTime: article.published_at || '',
          section: article.category || ''
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description: summary,
          images: [imageUrl],
        },
      };
    }
  } catch (err) {
    console.error('Local SEO generation error:', err);
  }

  return {};
}

export default function Page() {
  return (
    <ArticleDetail />
  );
}