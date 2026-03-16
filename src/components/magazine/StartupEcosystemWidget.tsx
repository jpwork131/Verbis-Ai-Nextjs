import CollapsibleWidget from './CollapsibleWidget';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getRelativeTime(dateString: string) {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds)) return 'recently';
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'recently';
  }
}

async function fetchStartupNews() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, source_name, published_at, category_slug')
      .eq('category_slug', 'startup-pulse')
      .order('published_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    
    return (data || []).map(item => ({
      title: item.title || 'Startup Update',
      source: item.source_name || 'StartEJ Ecosystem',
      pubDate: item.published_at || '',
    }));
  } catch (error) {
    console.error("Error fetching startup news from Supabase:", error);
    return [];
  }
}

export default async function StartupEcosystemWidget() {
  const newsItems = await fetchStartupNews();

  if (!newsItems || newsItems.length === 0) return null;

  return (
    <CollapsibleWidget
      title="Indian Startup News"
      className="max-w-[360px]"
      headerClassName="bg-white border-b border-slate-100"
      headerIcon={<span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
      badge={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Feed</span>}
      footer={
        <div className="text-center group cursor-default">
          <span className="text-[11px] font-bold text-slate-400">
            Real-time Ecosystem Updates
          </span>
        </div>
      }
    >
      <div className="p-2 space-y-1">
        {newsItems.map((item, index) => (
          <div 
            key={index}
            className="p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default group"
          >
            <h4 className="text-[13px] font-semibold text-slate-800 leading-snug mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 truncate max-w-[150px]">
                {item.source}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {getRelativeTime(item.pubDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleWidget>
  );
}
