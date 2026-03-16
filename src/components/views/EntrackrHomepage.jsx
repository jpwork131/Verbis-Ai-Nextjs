"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu, Search, Calendar, ChevronRight,
  Facebook, Twitter, Linkedin, Instagram,
  Play, Mail, Send
} from 'lucide-react';
import {
  getFeaturedPosts,
  getLatestPosts,
  getSocialStats,
  subscribeToNewsletter,
  getEditorsPicks,
  getActiveBanner
} from '@/services/magazine';
import { getArticlesByCategory, searchArticles } from '@/services/articles';
import ArticleCard, { getCategoryColor } from '@/components/magazine/EntrackrCard';
import EditorPickSection from '@/components/magazine/EditorPickSection';
import toast from 'react-hot-toast';
import Footer from '@/components/ui/Footer';
import MainNavbar from '@/components/ui/MainNavbar';

// --- Sub-components (Internal to this view) ---

const SectionHeader = ({ title }) => (
  <div className="flex items-center mb-6">
    <h2 className="font-display text-[22px] font-bold text-[var(--color-text-primary)]">
      {title}
    </h2>
    <div className="flex-1 h-[2px] bg-[var(--color-accent)] ml-[12px] self-center"></div>
  </div>
);

export const metadata = {
  title: 'StartEJ | Startup News & Tech Intelligence',
  description: 'AI-powered news, funding alerts, and ecosystem insights from StartEJ.com.',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const SnippetCard = ({ article }) => {
  const cat = article.category?.name || article.category_slug || "News";
  const catColor = getCategoryColor(cat);
  const articleLink = `/${article.category?.slug || article.category_slug || 'news'}/${article.slug}`;

  return (
    <Link href={articleLink} className="flex gap-3 pb-[12px] border-b border-[var(--color-border)] last:border-0 group cursor-pointer mt-3">
      <div className="w-[80px] h-[80px] flex-shrink-0 rounded-[6px] overflow-hidden relative">
        <img
          src={article.banner_image || article.bannerImage || 'https://via.placeholder.com/80x80'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute top-1 right-1 w-4 h-4 bg-white/80 rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <span
          className="inline-block px-1.5 py-[1px] rounded-[3px] text-[9px] font-[700] uppercase tracking-wide mb-1 w-fit"
          style={{ backgroundColor: article.categoryColor || catColor.bg, color: catColor.text }}
        >
          {cat}
        </span>
        <h4 className="font-body text-[13px] font-[600] text-[var(--color-text-primary)] leading-tight mb-1 group-hover:text-[var(--color-accent)] transition-colors">
          {article.title}
        </h4>
        <div className="text-[11px] text-[var(--color-text-muted)] font-body">
          By {article.author || article.source?.name || 'Editorial'} · {formatDate(article.published_at || article.publishedAt || article.created_at)}
        </div>
      </div>
    </Link>
  );
};

// --- Main Homepage View ---

export default function EntrackrHomepage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [editorPicks, setEditorPicks] = useState([]);
  const [fintrackrArticles, setFintrackrArticles] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [reportsArticles, setReportsArticles] = useState([]);
  const [startupTrendsArticles, setStartupTrendsArticles] = useState([]);
  const [founderStoriesArticles, setFounderStoriesArticles] = useState([]);
  const [womenEntArticles, setWomenEntArticles] = useState([]);
  const [ipoMarketsArticles, setIpoMarketsArticles] = useState([]);
  const [indianMarketArticles, setIndianMarketArticles] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [socialStats, setSocialStats] = useState([]);
  const [activeBanner, setActiveBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchWithFallback = async (p, fallback = { articles: [] }) => {
          try {
            return await p;
          } catch (e) {
            console.error("Fetch failed:", e);
            return fallback;
          }
        };

        const [
          featured,
          womenEnt,
          ipoArt,
          financeArt,
          reportsArt,
          futureWork,
          trendsArt,
          ecosystemArt,
          stats,
          banner,
          latest,
          indianMarketArt
        ] = await Promise.all([
          fetchWithFallback(getFeaturedPosts(8)),
          fetchWithFallback(getArticlesByCategory('women-entrepreneurs', 1, 10)),
          fetchWithFallback(getArticlesByCategory('ipo-markets', 1, 10)),
          fetchWithFallback(getArticlesByCategory('finance', 1, 10)),
          fetchWithFallback(getArticlesByCategory('industry-reports', 1, 10)),
          fetchWithFallback(getArticlesByCategory('future-of-work', 1, 2)),
          fetchWithFallback(getArticlesByCategory('startup-trends', 1, 10)),
          fetchWithFallback(getArticlesByCategory('startup-ecosystem', 1, 10)),
          fetchWithFallback(getSocialStats(), []),
          fetchWithFallback(getActiveBanner(), null),
          fetchWithFallback(getLatestPosts(10), []),
          fetchWithFallback(getArticlesByCategory('indian-market-news', 1, 5))
        ]);

        const usedIds = new Set();
        const filterUnique = (list, count) => {
          const unique = [];
          for (const item of (list || [])) {
            if (!usedIds.has(item.id)) {
              unique.push(item);
              usedIds.add(item.id);
            }
            if (unique.length >= count) break;
          }
          return unique;
        };

        // 1. Featured Articles
        const finalFeatured = filterUnique(featured, 5);

        // 2. Editor's Pick
        const pickCategories = [
          { data: womenEnt?.articles || [], name: 'women-entrepreneurs' },
          { data: ipoArt?.articles || [], name: 'ipo-markets' },
          { data: financeArt?.articles || [], name: 'finance' },
          { data: reportsArt?.articles || [], name: 'industry-reports' }
        ];

        const finalPicks = [];
        pickCategories.forEach(cat => {
          const item = cat.data.find(a => !usedIds.has(a.id));
          if (item) {
            finalPicks.push(item);
            usedIds.add(item.id);
          } else if (cat.data.length > 0) {
            finalPicks.push(cat.data[0]);
          }
        });

        if (finalPicks.length < 4) {
          const combinedPicksSource = [
            ...(womenEnt?.articles || []),
            ...(ipoArt?.articles || []),
            ...(financeArt?.articles || []),
            ...(reportsArt?.articles || [])
          ];
          const extras = filterUnique(combinedPicksSource, 4 - finalPicks.length);
          finalPicks.push(...extras);
        }

        // 3. Specific Sections
        const finalEcosystem = filterUnique(ecosystemArt?.articles, 5);
        const finalFinance = filterUnique(financeArt?.articles, 5);
        const finalReports = filterUnique(reportsArt?.articles, 5);
        const finalTrends = filterUnique(trendsArt?.articles, 4);
        const finalWomen = filterUnique(womenEnt?.articles, 4);
        const finalIpo = filterUnique(ipoArt?.articles, 4);
        const finalSnippets = filterUnique(latest, 10);

        setFeaturedArticles(finalFeatured);
        setEditorPicks(finalPicks);
        setNewsArticles(finalEcosystem);
        setFintrackrArticles(finalFinance);
        setReportsArticles(finalReports);
        setStartupTrendsArticles(finalTrends);
        setWomenEntArticles(finalWomen);
        setIpoMarketsArticles(finalIpo);
        setIndianMarketArticles(indianMarketArt?.articles || []);
        setSnippets(finalSnippets.length > 0 ? finalSnippets : (latest || []).slice(0, 5));
        setSocialStats(stats || []);
        setActiveBanner(banner);
      } catch (err) {
        console.error("Critical error in fetchData:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await searchArticles(query, 1, 6);
        setSearchResults(res.articles || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        toast.success(res.message);
        setEmail('');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Newsletter error:", err);
      toast.error("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">

      <MainNavbar />

      {/* 3. Promotional Banner */}
      <div className="max-w-[1200px] mx-auto mt-4 px-4 text-decoration-none">
        <Link href={activeBanner?.cta_link || "#"} className="block w-full h-[80px] rounded-lg bg-gradient-to-r from-[#1E293B] to-[var(--color-accent)] flex items-center justify-between px-8 text-white overflow-hidden relative">
          <div className="flex items-center gap-4 z-10">
            <div className="w-[50px] h-[50px] bg-white/20 rounded-full flex items-center justify-center">
              <Play className="fill-white" size={20} />
            </div>
            <div>
              <div className="text-[12px] font-bold opacity-80 uppercase tracking-wider">{activeBanner?.subtitle || "Startup Pitch"}</div>
              <div className="font-display text-[18px] font-bold">{activeBanner?.title || "The Next Big Thing"}</div>
            </div>
          </div>
          <div className="hidden lg:block h-full py-4 z-10">
            <div className="font-display text-[24px] font-bold opacity-30">StartEJ</div>
          </div>
          {activeBanner?.image_url && (
            <div className="absolute right-0 top-0 w-[400px] h-full opacity-30 grayscale pointer-events-none">
              <img src={activeBanner.image_url} className="w-full h-full object-cover" />
            </div>
          )}
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-[300px] h-full bg-white/5 skew-x-[30deg] translate-x-20"></div>
        </Link>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left/Main Content (75%) */}
          <div className="flex-1 lg:w-[75%]">

            {/* Editor's Pick Section */}
            <EditorPickSection articles={editorPicks} socialStats={socialStats} loading={loading} />

            {/* 7. Finance Section */}
            <section className="mb-12">
              <SectionHeader title="Finance" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {fintrackrArticles.slice(0, 2).map(article => (
                  <ArticleCard
                    key={article.id}
                    image={article.banner_image || article.bannerImage}
                    category={article.category || "General"}
                    categoryColor={article.categoryColor}
                    headline={article.title}
                    author={article.author?.name || article.source?.name || "Editor"}
                    date={formatDate(article.published_at || article.created_at)}
                    size="medium"
                    slug={`/${article.category_slug || 'news'}/${article.slug}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px] mt-8">
                {fintrackrArticles.slice(2, 5).map(article => (
                  <ArticleCard
                    key={article.id}
                    image={article.banner_image || article.bannerImage}
                    category={article.category || "Finance"}
                    categoryColor={article.categoryColor}
                    headline={article.title}
                    author={article.author?.name || article.source?.name || "Editor"}
                    date={formatDate(article.published_at || article.created_at)}
                    size="small"
                    slug={`/finance/${article.slug}`}
                  />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/finance" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                  View All
                </Link>
              </div>
            </section>

            {/* 8. Startup Ecosystem Section */}
            <section className="mb-12">
              <SectionHeader title="Startup Ecosystem" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {newsArticles.slice(0, 2).map((article, idx) => (
                  <Link href={`/startup-ecosystem/${article.slug}`} key={article.id} className="relative group overflow-hidden rounded-lg aspect-[16/9] cursor-pointer">
                    <img
                      src={article.banner_image || article.bannerImage || 'https://via.placeholder.com/600x400'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                      {(() => { const c = getCategoryColor('startup-ecosystem'); return (<span className="text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded w-fit mb-2" style={{ backgroundColor: c.bg }}>Ecosystem</span>); })()}
                      <h3 className="font-display text-[20px] font-bold leading-tight group-hover:text-[var(--color-accent)] transition-colors">{article.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px] mt-8">
                {newsArticles.slice(2, 5).map(article => (
                  <ArticleCard
                    key={article.id}
                    image={article.banner_image || article.bannerImage}
                    category={article.category || "Ecosystem"}
                    categoryColor={article.categoryColor}
                    headline={article.title}
                    author={article.author?.name || article.source?.name || "Editorial"}
                    date={formatDate(article.published_at || article.created_at)}
                    size="medium"
                    slug={`/startup-ecosystem/${article.slug}`}
                  />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/startup-ecosystem" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                  View All
                </Link>
              </div>
            </section>

            {/* 9. Industry Report Section */}
            <section className="mb-12">
              <SectionHeader title="Industry Reports" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {reportsArticles.slice(0, 2).map(article => (
                  <Link href={`/reports/${article.slug}`} key={article.id} className="group cursor-pointer">
                    <div className="relative aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-8">
                      <div className="absolute inset-0 opacity-40">
                        <img src={article.banner_image || article.bannerImage || 'https://via.placeholder.com/600x400'} className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10 text-center border-4 border-[var(--color-accent)] p-4 w-full h-full flex flex-col items-center justify-center">
                        <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Quarterly Report</div>
                        <h4 className="text-white font-display text-[18px] font-bold uppercase leading-tight">{article.title}</h4>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-display text-[18px] font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)]">{article.title}</h3>
                      <div className="text-[12px] text-[var(--color-text-muted)] mt-2 font-body">
                        By {article.author?.name || article.source?.name || 'Editorial'} · {formatDate(article.published_at || article.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px] mt-8">
                {reportsArticles.slice(2, 5).map(article => (
                  <ArticleCard
                    key={article.id}
                    image={article.banner_image || article.bannerImage}
                    category={article.category || "Reports"}
                    categoryColor={article.categoryColor}
                    headline={article.title}
                    author={article.author?.name || article.source?.name || "Editorial"}
                    date={formatDate(article.published_at || article.created_at)}
                    size="medium"
                    slug={`/industry-reports/${article.slug}`}
                  />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/industry-reports" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                  View All
                </Link>
              </div>
            </section>

            {/* 10. Colorful Category Sections */}
            <div className="space-y-12">
              {/* Startup Trends */}
              {startupTrendsArticles.length > 0 && (
                <section>
                  <div className="flex items-center mb-6">
                    <h2 className="font-display text-[22px] font-bold text-[#F43F5E] uppercase tracking-wider">Startup Trends</h2>
                    <div className="flex-1 h-[3px] bg-gradient-to-r from-[#F43F5E] to-transparent ml-[15px]"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
                    {startupTrendsArticles.map(article => (
                      <ArticleCard
                        key={article.id}
                        image={article.banner_image || article.bannerImage}
                        category={article.category || "Trends"}
                        categoryColor={article.categoryColor}
                        headline={article.title}
                        author={article.author?.name || article.source?.name || "StartEJ"}
                        date={formatDate(article.published_at || article.created_at)}
                        size="small"
                        slug={`/startup-trends/${article.slug}`}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link href="/startup-trends" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                      View All
                    </Link>
                  </div>
                </section>
              )}

              {/* Founder Stories */}
              {founderStoriesArticles.length > 0 && (
                <section>
                  <div className="flex items-center mb-6">
                    <h2 className="font-display text-[22px] font-bold text-[#F59E0B] uppercase tracking-wider">Founder Stories</h2>
                    <div className="flex-1 h-[3px] bg-gradient-to-r from-[#F59E0B] to-transparent ml-[15px]"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
                    {founderStoriesArticles.map(article => (
                      <ArticleCard
                        key={article.id}
                        image={article.banner_image || article.bannerImage}
                        category={article.category || "Founders"}
                        categoryColor={article.categoryColor}
                        headline={article.title}
                        author={article.author?.name || article.source?.name || "StartEJ"}
                        date={formatDate(article.published_at || article.created_at)}
                        size="small"
                        slug={`/founder-stories/${article.slug}`}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link href="/founder-stories" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                      View All
                    </Link>
                  </div>
                </section>
              )}

              {/* Women Entrepreneurs */}
              {womenEntArticles.length > 0 && (
                <section>
                  <div className="flex items-center mb-6">
                    <h2 className="font-display text-[22px] font-bold text-[#EC4899] uppercase tracking-wider">Women</h2>
                    <div className="flex-1 h-[3px] bg-gradient-to-r from-[#EC4899] to-transparent ml-[15px]"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
                    {womenEntArticles.map(article => (
                      <ArticleCard
                        key={article.id}
                        image={article.banner_image || article.bannerImage}
                        category={article.category || "Women"}
                        categoryColor={article.categoryColor}
                        headline={article.title}
                        author={article.author?.name || article.source?.name || "StartEJ"}
                        date={formatDate(article.published_at || article.created_at)}
                        size="small"
                        slug={`/${article.category_slug || 'news'}/${article.slug}`}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link href="/women-entrepreneurs" className="view-all-btn px-6 py-2 rounded font-body text-[13px] font-[600] border border-[var(--color-border)] hover:bg-slate-50 transition-colors">
                      View All
                    </Link>
                  </div>
                </section>
              )}
            </div>

          </div>

          {/* Right Sidebar (Snippets Panel) (25%) */}
          <aside className="lg:w-[25%]">
            <div className="sticky top-[70px]">
              <div className="mb-4">
                <h3 className="font-display text-[18px] font-bold border-b-2 border-[var(--color-accent)] pb-1 inline-block uppercase tracking-wider">
                  Latest Bytes
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-[80px] bg-slate-200 animate-pulse rounded-lg"></div>)
                ) : (
                  snippets.map(article => (
                    <SnippetCard key={article.id} article={article} />
                  ))
                )}
              </div>

              <div className="mb-4 mt-10">
                <h3 className="font-display text-[18px] font-bold border-b-2 border-[#8B5CF6] pb-1 inline-block uppercase tracking-wider">
                  IPO & Markets
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  [1, 2].map(i => <div key={i} className="h-[80px] bg-slate-200 animate-pulse rounded-lg"></div>)
                ) : (
                  ipoMarketsArticles.slice(0, 4).map(article => (
                    <SnippetCard key={article.id} article={article} />
                  ))
                )}
              </div>

              <div className="mb-4 mt-10">
                <h3 className="font-display text-[18px] font-bold border-b-2 border-[#10B981] pb-1 inline-block uppercase tracking-wider">
                  Indian Market News
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  [1, 2].map(i => <div key={i} className="h-[80px] bg-slate-200 animate-pulse rounded-lg"></div>)
                ) : (
                  indianMarketArticles.map(article => (
                    <SnippetCard key={article.id} article={article} />
                  ))
                )}
              </div>

              <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-[var(--color-border)]">
                <h4 className="font-display text-[16px] font-bold mb-4">Follow Us</h4>
                <div className="flex flex-wrap gap-2">
                  {socialStats.length > 0 ? (
                    socialStats.map((stat, i) => {
                      const platform = stat.platform?.toLowerCase();
                      const PLATFORM_ICONS = {
                        facebook: { icon: Facebook, color: '#1877F2' },
                        twitter: {
                          icon: () => (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                            </svg>
                          ), color: '#000000'
                        },
                        x: {
                          icon: () => (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                            </svg>
                          ), color: '#000000'
                        },
                        linkedin: { icon: Linkedin, color: '#0A66C2' },
                        instagram: { icon: Instagram, color: '#E1306C' },
                        youtube: { icon: Play, color: '#FF0000' },
                        telegram: { icon: Send, color: '#0088cc' },
                        mail: { icon: Mail, color: '#EA4335' }
                      };
                      const config = PLATFORM_ICONS[platform] || { icon: Send, color: 'var(--color-accent)' };
                      const Icon = config.icon;
                      return (
                        <a
                          key={i}
                          href={stat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-[40px] h-[40px] rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] transition-all cursor-pointer hover:text-white hover:scale-110 shadow-sm"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.color}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <Icon size={18} />
                        </a>
                      );
                    })
                  ) : (
                    [
                      { icon: Facebook, color: '#1877F2' },
                      {
                        icon: () => (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                          </svg>
                        ), color: '#000000'
                      },
                      { icon: Linkedin, color: '#0A66C2' },
                      { icon: Instagram, color: '#E1306C' }
                    ].map(({ icon: Icon, color }, i) => (
                      <div
                        key={i}
                        className="w-[40px] h-[40px] rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] transition-all cursor-pointer hover:text-white hover:scale-110 shadow-sm"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = color}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <Icon size={18} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />

    </div>
  );
}
