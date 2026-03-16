"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

type NewsItem = {
  title: string;
  description: string;
  imageUrl: string;
  pubDate: string;
};

export default function MarketNewsWidget() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketNews() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, summary, banner_image, published_at, category_slug')
          .in('category_slug', ['ipo-markets', 'finance', 'funding'])
          .order('published_at', { ascending: false })
          .limit(7);

        if (error) throw error;

        setNewsItems(
          (data || []).map((item: any) => ({
            title: item.title || 'Market Update',
            description: item.summary || '',
            imageUrl:
              item.banner_image ||
              'https://images.unsplash.com/photo-1611974715853-2b8ef959d028?q=80&w=200&auto=format&fit=crop',
            pubDate: item.published_at || '',
          }))
        );
      } catch (error) {
        console.error('Error fetching market news:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMarketNews();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-16 h-12 bg-slate-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-3/4" />
              <div className="h-2 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!newsItems || newsItems.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 font-sans">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[var(--color-accent,#2563EB)] rounded-full" />
          <h3 className="font-display text-[17px] font-bold text-slate-800 tracking-tight">
            Market News
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Live
            </span>
          </div>
          <span className="text-slate-400 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
            ▲
          </span>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
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
      )}
    </div>
  );
}
