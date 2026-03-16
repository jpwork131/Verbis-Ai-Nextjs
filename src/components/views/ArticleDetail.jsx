"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from 'next/link';
import { useRouter as useNavigate, useParams } from 'next/navigation';
import { 
  Globe, 
  Calendar, 
  Sparkles, 
  ChevronLeft, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Play,
  X,
  MessageCircle,
  Mail,
  Send,
  Menu,
  Search
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getArticlesByCategory, getArticleBySlug, searchArticles } from '@/services/articles';
import { subscribeToNewsletter, getActiveBanner } from "@/services/magazine";
import { toast } from "react-hot-toast";

import GithubSlugger from 'github-slugger';
import { getUserInteractions } from "@/services/auth";
import ArticleActions from "@/components/ui/ArticleActions";
import CommentBox from "@/components/ui/CommentBox";
import Footer from "@/components/ui/Footer";
import MainNavbar from "@/components/ui/MainNavbar";

export default function ArticleDetail() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  
  // Core States
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [activeBanner, setActiveBanner] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [ipoMarketsArticles, setIpoMarketsArticles] = useState([]);
  const [indianMarketArticles, setIndianMarketArticles] = useState([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SnippetCard = ({ article }) => {
    const cat = article.category?.name || article.category_slug || "News";
    const articleLink = `/${article.category?.slug || article.category_slug || 'news'}/${article.slug}`;

    return (
      <Link href={articleLink} className="flex gap-3 pb-[12px] border-b border-[var(--color-border)] last:border-0 group cursor-pointer mt-3">
        <div className="w-[80px] h-[80px] flex-shrink-0 rounded-[6px] overflow-hidden relative">
          <img
            src={article.banner_image || article.bannerImage || 'https://via.placeholder.com/80x80'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h4 className="font-body text-[13px] font-[600] text-[var(--color-text-primary)] leading-tight mb-1 group-hover:text-[var(--color-accent)] transition-colors">
            {article.title}
          </h4>
          <div className="text-[11px] text-[var(--color-text-muted)] font-body">
            {formatDate(article.published_at || article.publishedAt || article.created_at)}
          </div>
        </div>
      </Link>
    );
  };

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

  // Reading Progress Logic
  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setScrollProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress);

    // Fetch Sidebar and Banner Data
    const fetchSidebarData = async () => {
      try {
        const [banner, latest, ipo, indianMarket] = await Promise.all([
          getActiveBanner(),
          getArticlesByCategory('startup-ecosystem', 1, 5),
          getArticlesByCategory('ipo-markets', 1, 5),
          getArticlesByCategory('indian-market-news', 1, 5)
        ]);
        setActiveBanner(banner);
        setSnippets(latest.articles || []);
        setIpoMarketsArticles(ipo.articles || []);
        setIndianMarketArticles(indianMarket.articles || []);
      } catch (e) {
        console.warn("Sidebar data fetch failed");
      }
    };
    fetchSidebarData();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const handleUpdateArticle = (updated) => {
    if (!updated || !updated._id) return;
    const updatedId = updated._id.toString();
    if (article?._id?.toString() === updatedId) {
      setArticle(prev => ({ ...prev, ...updated }));
    }
    setRelatedArticles(prev => 
      prev.map(art => art._id.toString() === updatedId ? { ...art, ...updated } : art)
    );
  };

  useEffect(() => {
    const fetchFullData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const res = await getArticleBySlug(category, slug);
        const mainArticle = res.data;

        if (!mainArticle) throw new Error("Article not found");

        let interactions = { likedArticleIds: [], savedArticleIds: [] };
        if (token) {
          try {
            interactions = await getUserInteractions();
          } catch (e) {
            console.warn("Guest mode active");
          }
        }

        if (mainArticle?.categorySlug) {
          const relatedRes = await getArticlesByCategory(mainArticle.categorySlug, 1, 6);
          const relatedData = relatedRes.articles || [];
          
          setRelatedArticles(
            relatedData
              .filter((a) => a.slug !== slug)
              .map(art => ({
                ...art,
                isLiked: interactions.likedArticleIds?.some(id => id.toString() === art._id.toString()),
                isSaved: interactions.savedArticleIds?.some(id => id.toString() === art._id.toString())
              }))
              .slice(0, 4)
          );
        }

        const hydratedMain = {
          ...mainArticle,
          isLiked: interactions.likedArticleIds?.some(id => id.toString() === mainArticle._id.toString()),
          isSaved: interactions.savedArticleIds?.some(id => id.toString() === mainArticle._id.toString())
        };

        setArticle(hydratedMain);
        if (hydratedMain?.title) document.title = `${hydratedMain.title} | StartEJ`;

      } catch (err) {
        console.error("Failed to load article data", err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchFullData();
    return () => { if (typeof document !== 'undefined') document.title = "AI NEWS"; };
  }, [category, slug]);

  const { headings, contentHtml } = useMemo(() => {
    if (!article?.aiContent) return { headings: [], contentHtml: "" };

    const rawContent = typeof article.aiContent === 'string' 
      ? article.aiContent.replace(/\\n/g, '\n') 
      : JSON.stringify(article.aiContent);

    const slugger = new GithubSlugger();
    const tocSlugger = new GithubSlugger();
    
    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }) => {
      const id = slugger.slug(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    const lines = rawContent.split('\n');
    const tocHeadings = lines
      .filter(line => line.startsWith('## '))
      .map(line => {
        const text = line.replace('## ', '').trim();
        return { text, id: tocSlugger.slug(text) };
      });

    const html = DOMPurify.sanitize(marked.parse(rawContent, { renderer, async: false }));

    return { headings: tocHeadings, contentHtml: html };
  }, [article?.aiContent]);

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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-primary text-text-primary/40 animate-pulse italic">Reading story...</div>;
  if (!article) return <div className="flex min-h-screen items-center justify-center bg-bg-primary text-text-primary">Story not found.</div>;

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)] text-text-primary transition-colors duration-300">
      <MainNavbar />

      {/* 3. Promotional Banner (Optional as on Homepage) */}
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
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-[300px] h-full bg-white/5 skew-x-[30deg] translate-x-20"></div>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-[64px] left-0 w-full h-1 z-[60] pointer-events-none">
        <div 
          className="h-full bg-[var(--color-accent)] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 lg:w-[75%]">

            {/* Metadata */}
            <div className="mb-8">
              <span 
                className="text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded shadow-sm"
                style={{ backgroundColor: article.categoryColor || 'var(--color-accent)' }}
              >
                {article.category?.replace(/-/g, ' ') || 'News'}
              </span>
              <h1 className="mt-4 text-3xl md:text-5xl font-display font-bold leading-tight text-text-primary tracking-tight">
                {article.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-6 pt-6 border-t border-border-primary px-2 sm:px-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">SE</div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-text-primary">StartEJ News Team</span>
                    <div className="flex items-center gap-2 text-[11px] text-text-primary/40 font-medium">
                      <Globe className="w-3 h-3" /> {article.source?.name || 'Editorial'} 
                      <span>•</span>
                      <Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                <div className="sm:ml-auto flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-border-primary/50">
                  <div className="flex items-center gap-3">
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <Twitter size={14} fill="currentColor" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <Facebook size={14} fill="currentColor" />
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle size={14} fill="currentColor" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <Linkedin size={14} fill="currentColor" />
                    </a>
                  </div>
                  <ArticleActions article={article} onUpdate={handleUpdateArticle} />
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <figure className="mb-10 group overflow-hidden sm:rounded-xl -mx-4 sm:mx-0">
              <img
                src={article.bannerImage}
                alt={article.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {article.imageCaption && (
                <figcaption className="mt-4 text-[12px] italic text-text-primary/50 text-center border-l-2 border-border-primary pl-4 py-1 mx-4 sm:mx-0">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>

            {/* AI Summary Box */}
            {article.summary && (
              <div className="mb-12 bg-bg-primary/50 border border-border-primary p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={60} className="text-accent" />
                </div>
                <div className="mb-4 flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Insight Brief</span>
                </div>
                <p className="font-display text-xl leading-relaxed text-text-primary font-medium italic">
                  "{article.summary}"
                </p>
              </div>
            )}

            {/* Table of Contents (Mobile Only) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-12 p-6 bg-bg-primary/50 rounded-xl border border-border-primary">
                <h4 className="text-[12px] font-bold text-text-primary uppercase tracking-widest mb-4">Contents</h4>
                <nav className="flex flex-col gap-2">
                  {headings.map((heading) => (
                    <a key={heading.id} href={`#${heading.id}`} className="text-[13px] text-text-primary/60 font-medium hover:text-accent">
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Content Body */}
            <article className="max-w-none">
              {contentHtml ? (
                <div 
                  className="blog-content prose prose-slate dark:prose-invert prose-lg max-w-none 
                    prose-p:text-text-primary/80 prose-p:leading-[1.8] prose-p:mb-8 prose-p:font-sans 
                    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-text-primary 
                    prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border-primary
                    prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                    prose-strong:text-text-primary prose-strong:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-bg-primary/30 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:italic prose-blockquote:rounded-r-lg
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8
                    prose-li:text-text-primary/70 prose-li:mb-2 prose-li:leading-relaxed
                    prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                    selection:bg-accent/20 selection:text-accent"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-border-primary rounded-xl">
                  <p className="text-text-primary/30 italic text-lg font-sans">
                    Deep analysis is being synthesized...
                  </p>
                </div>
              )}
            </article>

            {/* Community Section */}
            <div className="mt-16 pt-16 border-t border-border-primary">
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">
                  Startup Intelligence Forum
                </h3>
                <p className="text-[12px] text-text-primary/60 font-bold uppercase tracking-widest mt-2 px-3 py-1 bg-card-bg rounded-full inline-block">
                  {article.comments?.length || 0} Responses
                </p>
              </div>
              
              <CommentBox
                articleId={article._id}
                comments={article.comments || []}
                onNewComment={(updatedComments) => {
                  handleUpdateArticle({
                    ...article,
                    comments: updatedComments,
                  });
                }}
              />
            </div>

            {/* Recommended Reads */}
            {relatedArticles.length > 0 && (
              <section className="mt-24 pt-16 border-t border-border-primary">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
                    Related Ecosystem News
                  </h2>
                  <div className="h-px flex-1 bg-border-primary mx-6 hidden md:block"></div>
                  <Link href={`/${category}`} className="text-[11px] font-black uppercase tracking-widest text-accent hover:underline">
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedArticles.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate.push(`/${item.categorySlug || 'news'}/${item.slug}`)}
                      className="group cursor-pointer bg-card-bg/30 rounded-xl p-4 border border-transparent hover:border-border-primary hover:bg-card-bg transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
                        <img 
                          src={item.bannerImage} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
                          alt={item.title}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span 
                          className="text-[10px] font-black uppercase tracking-widest"
                          style={{ color: item.categoryColor || 'var(--color-accent)' }}
                        >
                          {item.category?.replace(/-/g, ' ')}
                        </span>
                        <h3 className="text-[16px] font-bold leading-tight text-text-primary group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[12px] text-text-primary/60 line-clamp-2 leading-relaxed">
                          {item.summary || "Latest ecosystem updates from the startup world."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[25%] text-text-primary">
            <div className="sticky top-[100px] space-y-10">
              
              {/* Table of Contents (Desktop Only) */}
              {headings.length > 0 && (
                <div className="hidden lg:block bg-card-bg p-6 rounded-xl border border-border-primary shadow-sm">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text-primary/40 mb-6 flex items-center gap-2">
                    <div className="h-px w-4 bg-accent" /> Inside this story
                  </h3>
                  <nav className="flex flex-col gap-1 border-l border-border-primary ml-1">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="group py-2 pl-4 text-[12px] font-bold text-text-primary/50 hover:text-accent hover:border-l-2 hover:border-accent -ml-[1.5px] transition-all"
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}
              
              {/* Latest Bytes */}
              <div>
                <div className="mb-4">
                  <h3 className="font-display text-[18px] font-bold border-b-2 border-[var(--color-accent)] pb-1 inline-block uppercase tracking-wider">
                    Latest Bytes
                  </h3>
                </div>
                <div className="space-y-4">
                  {snippets.map(item => (
                    <SnippetCard key={item._id} article={item} />
                  ))}
                </div>
              </div>

              {/* IPO & Markets */}
              <div>
                <div className="mb-4">
                  <h3 className="font-display text-[18px] font-bold border-b-2 border-[#8B5CF6] pb-1 inline-block uppercase tracking-wider">
                    IPO & Markets
                  </h3>
                </div>
                <div className="space-y-4">
                  {ipoMarketsArticles.map(item => (
                    <SnippetCard key={item._id} article={item} />
                  ))}
                </div>
              </div>

              {/* Indian Market News */}
              <div>
                <div className="mb-4">
                  <h3 className="font-display text-[18px] font-bold border-b-2 border-[#10B981] pb-1 inline-block uppercase tracking-wider">
                    Indian Market News
                  </h3>
                </div>
                <div className="space-y-4">
                  {indianMarketArticles.map(item => (
                    <SnippetCard key={item._id} article={item} />
                  ))}
                </div>
              </div>


              
              {/* Follow Us (Same as Homepage) */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-[var(--color-border)]">
                <h4 className="font-display text-[16px] font-bold mb-4">Follow Us</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { Icon: Facebook, color: '#1877F2' },
                    { Icon: Twitter, color: '#1DA1F2' },
                    { Icon: Linkedin, color: '#0A66C2' },
                    { Icon: Instagram, color: '#E1306C' }
                  ].map(({ Icon, color }, i) => (
                    <div
                      key={i}
                      className="w-[40px] h-[40px] rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] transition-all cursor-pointer hover:text-white hover:scale-110 shadow-sm"
                      style={{ transition: 'all 0.3s' }}
                    >
                      <Icon size={18} />
                    </div>
                  ))}
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