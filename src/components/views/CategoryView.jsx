"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ArrowLeft, Facebook, Twitter, Linkedin, Instagram, X } from 'lucide-react';
import { getArticlesByCategory, searchArticles } from '@/services/articles';
import { getSocialStats, subscribeToNewsletter } from '@/services/magazine';
import categoryApi from '@/services/categories';
import ArticleCard from '@/components/magazine/EntrackrCard';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/ui/MainNavbar';

export default function CategoryView({ categorySlug }) {
  const [articles, setArticles] = useState([]);
  const [dbCategory, setDbCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socialStats, setSocialStats] = useState([]);
  const [email, setEmail] = useState('');
  
  // Category Configuration
  const categoryMeta = {
    'finance': {
      title: 'FINANCE',
      subtitle: 'Tracking the Numbers that Move the Market',
      desc: 'Deep dives into funding rounds, venture capital trends, and the financial health of the startup ecosystem. Our finance reports provide the most trustworthy source of investment information.',
      color: '#F97316'
    },
    'startup-ecosystem': {
      title: 'ECOSYSTEM',
      subtitle: 'Building the Future Together',
      desc: 'Mapping the progress of India\'s tech startup ecosystem. From incubators to government policies, we bring you insights into the infrastructure supporting innovation.',
      color: '#14B8A6'
    },
    'startup-trends': {
      title: 'TRENDS',
      subtitle: 'What\'s Next in Technology & Business',
      desc: 'Analyzing shifts in consumer behavior and technology adoption. Stay ahead of the curve with our expert analysis on the emerging trends defining the next decade.',
      color: '#BE123C'
    },
    'founder-stories': {
      title: 'FOUNDERS',
      subtitle: 'Behind the Scenes of Innovation',
      desc: 'Exclusive interviews and journeys of the people building tomorrow. Real stories of grit, failure, and success from the heartbeat of the startup world.',
      color: '#F59E0B'
    },
    'women-entrepreneurs': {
      title: 'WOMEN',
      subtitle: 'Empowering the Female Leaders of Tech',
      desc: 'Celebrating and documenting the impact of women in business and technology. From rising stars to industry veterans, we cover the trail-blazers.',
      color: '#EC4899'
    },
    'industry-reports': {
      title: 'REPORTS',
      subtitle: 'Detailed Analysis of Indian Startup Ecosystem',
      desc: 'Entrackr reports assist you to interpret the trends in Indian tech startup ecosystem. Be it fundings or investments, industry deep down, ESOPs trends, Entrackr reports are the most trustworthy source of information.',
      color: '#78716C'
    },
    'ipo-markets': {
      title: 'IPO & MARKETS',
      subtitle: 'The Public Face of Tech',
      desc: 'Your guide to public offerings, stock performance, and the transition of startups to the stock market. Analysis of quarterly results and market sentiment.',
      color: '#8B5CF6'
    },
    'startups': {
      title: 'STARTUPS',
      subtitle: 'The Daily Pulse of Innovation',
      desc: 'Breaking news and updates from the competitive world of startups. From new launches to pivot stories, we cover every move in the ecosystem.',
      color: '#6366F1'
    }
  };

  const meta = categoryMeta[categorySlug] || {
    title: categorySlug.toUpperCase(),
    subtitle: 'Latest Updates & Analysis',
    desc: 'Stay updated with the latest stories and news from this category.',
    color: '#3B82F6'
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, stats, catDetail] = await Promise.all([
          getArticlesByCategory(categorySlug, 1, 15),
          getSocialStats(),
          categoryApi.getBySlug(categorySlug)
        ]);
        setArticles(artRes.articles || []);
        setSocialStats(stats);
        setDbCategory(catDetail);
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categorySlug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    const res = await subscribeToNewsletter(email);
    if (res.success) {
      toast.success(res.message);
      setEmail('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="entrackr-theme min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
      <MainNavbar />

      {/* Hero Banner Section */}
      <div className="w-full h-[320px] relative overflow-hidden flex items-center justify-center pt-8" 
           style={{ background: `linear-gradient(135deg, ${dbCategory?.badgeColor || meta.color}dd, ${dbCategory?.badgeColor || meta.color})` }}>
        
        {/* Abstract Background Design */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-white rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-100px] left-[10%] w-[250px] h-[250px] bg-black rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 w-full text-center relative z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="font-display text-[72px] md:text-[86px] font-black text-white uppercase tracking-tighter leading-none mb-2 drop-shadow-sm">
            {meta.title}
          </h1>
          <div className="w-[120px] h-[4px] bg-white mx-auto mb-4 scale-x-110 opacity-60"></div>
          <p className="text-white text-[16px] md:text-[18px] font-display font-medium uppercase tracking-[0.15em] opacity-90 drop-shadow-md">
            ——— {meta.subtitle} ———
          </p>
        </div>
      </div>

      {/* Description Overlap Box */}
      <div className="max-w-[900px] mx-auto px-6 relative z-20 mt-[-40px]">
        <div className="bg-card-bg p-8 md:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border-primary text-center">
          <p className="text-text-primary/70 text-[15px] md:text-[16px] leading-relaxed font-body italic">
            "{meta.desc}"
          </p>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[16/10] bg-card-bg animate-pulse rounded-xl"></div>
                  <div className="h-4 bg-card-bg animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-card-bg animate-pulse rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {articles.map(article => (
                <ArticleCard
                  key={article.id}
                  image={article.banner_image || article.bannerImage}
                  category={article.category?.name || article.category || meta.title}
                  categoryColor={article.categoryColor}
                  headline={article.title}
                  author={article.author?.name || article.source?.name || "StartEJ"}
                  date={formatDate(article.published_at || article.created_at)}
                  size="small"
                  slug={`/${categorySlug}/${article.slug}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card-bg rounded-3xl border border-border-primary shadow-sm">
              <div className="text-5xl mb-6 grayscale opacity-30">📰</div>
              <h3 className="text-2xl font-bold text-text-primary">No articles found in {meta.title}</h3>
              <p className="text-text-primary/40 mt-2 max-w-[400px] mx-auto">We're currently gathering the latest updates for this section. Please check back shortly.</p>
              <Link href="/" className="inline-block mt-8 px-8 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
                Return to Homepage
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-card-bg py-16 text-text-primary border-t border-border-primary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <Link href="/" className="font-display text-[28px] font-extrabold tracking-tighter">
              <span className="text-accent">StartEJ</span>
            </Link>
            <div className="flex gap-4">
               {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full border border-border-primary flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all cursor-pointer">
                  <Icon size={20} />
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-[12px] text-text-primary/40 border-t border-border-primary pt-8 font-bold tracking-widest uppercase">
            <p>© 2026 StartEJ Intelligence Media. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
