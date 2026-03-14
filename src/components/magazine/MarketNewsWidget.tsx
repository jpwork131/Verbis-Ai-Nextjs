import CollapsibleWidget from './CollapsibleWidget';
import { supabase } from '../../supabase';

// FORCE LATEST: Disable Next.js caching for this segment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Helper to calculate relative time from a date string
 */
function getRelativeTime(dateString: string) {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds)) return 'recently';
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'recently';
  }
}

/**
 * Fetches latest market news from Supabase
 */
async function fetchMarketNews() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, summary, banner_image, published_at, category_slug')
      .eq('category_slug', 'money-and-tech')
      .order('published_at', { ascending: false })
      .limit(7);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      title: item.title || 'Market Update',
      description: item.summary || '',
      imageUrl: item.banner_image || 'https://images.unsplash.com/photo-1611974715853-2b8ef959d028?q=80&w=200&auto=format&fit=crop',
      pubDate: item.published_at || '',
    }));
  } catch (error) {
    console.error("Error fetching market news from Supabase:", error);
    return [];
  }
}

/**
 * MarketNewsWidget Component
 */
export default async function MarketNewsWidget() {
  const newsItems = await fetchMarketNews();

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <CollapsibleWidget
      title="Market News"
      className="max-w-[360px] min-w-[320px]"
      headerClassName="bg-white border-b border-slate-50"
      headerIcon={<div className="w-1.5 h-6 bg-[var(--color-accent,#2563EB)] rounded-full"></div>}
      badge={
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
        </div>
      }
    >
      <div className="divide-y divide-slate-50">
        {newsItems.map((item, index) => (
          <div 
            key={index} 
            className="px-5 py-4 bg-white hover:bg-slate-50/80 transition-all duration-200 group cursor-default"
          >
            <div className="flex gap-4">
              <div className="w-[80px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/50">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-sans text-[13.5px] font-bold text-slate-900 leading-[1.3] mb-1 group-hover:text-[var(--color-accent,#2563EB)] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-500 leading-normal mb-2 font-medium line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                    Update
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium whitespace-nowrap">
                    {getRelativeTime(item.pubDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleWidget>
  );
}
