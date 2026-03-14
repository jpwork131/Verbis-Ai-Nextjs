"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from 'next/link';
import { useRouter as useNavigate, useParams } from 'next/navigation';
import { 
  Globe, 
  Calendar, 
  Sparkles, 
  ChevronLeft, 
  Share2, 
  Menu, 
  Search, 
  User, 
  Bell, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Play
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getArticleBySlug, getArticlesByCategory, trackArticleView } from "../api/articles";
import { subscribeToNewsletter } from "../api/magazine";
import { toast } from "react-hot-toast";

import GithubSlugger from 'github-slugger';
import { getUserInteractions } from "../api/auth";
import ArticleActions from "../components/ui/ArticleActions";
import CommentBox from "../components/ui/CommentBox";

export default function ArticleDetail({ marketNewsWidget, startupWidget }) {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [email, setEmail] = useState('');

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
        if (hydratedMain?.title) document.title = `${hydratedMain.title} | VERBIS AI`;

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

  useEffect(() => {
    const incrementView = async () => {
      try {
        await trackArticleView(slug);
      } catch (err) {
        console.error("Analytics error:", err);
      }
    };

    if (slug) incrementView();
  }, [slug]);

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

  if (loading) return <div className="flex min-h-screen items-center justify-center font-serif text-slate-400 animate-pulse italic">Reading story...</div>;
  if (!article) return <div className="flex min-h-screen items-center justify-center font-serif text-slate-900">Story not found.</div>;

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">
      
      {/* 1. Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full h-[56px] bg-[var(--color-nav-bg)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu className="w-[20px] text-[var(--color-text-primary)] cursor-pointer" />
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="font-display text-[24px] font-bold tracking-tight">
            <span className="text-[var(--color-accent)]">Verbis</span>
            <span className="text-black">AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center px-3 py-1 bg-white border border-[var(--color-border)] rounded-full w-[200px]">
            <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-[13px] ml-2 w-full"
            />
          </div>
          <button className="hidden sm:block px-4 py-1.5 bg-[var(--color-accent)] text-white text-[13px] font-[600] rounded hover:scale-[1.03] transition-transform">
            Subscribe
          </button>
          <button className="hidden sm:block px-4 py-1.5 border border-[var(--color-accent)] text-[var(--color-accent)] text-[13px] font-[600] rounded hover:bg-[var(--color-accent-light)] transition-colors">
            Login
          </button>
        </div>
      </nav>

      {/* 2. Category Navigation Strip */}
      <div className="w-full h-[40px] bg-[var(--color-accent)] flex items-center justify-center overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-6 px-6 max-w-[1200px]">
          {['STARTUPS', 'FUNDING', 'TECH', 'UNICORNS', 'AI', 'REPORTS', 'EXCLUSIVE'].map((item, idx) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase().replace(' \u25BE', '')}`}
              className={`text-white text-[13px] font-[600] tracking-[0.05em] h-full flex items-center border-b-2 border-transparent hover:border-white transition-all`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-[56px] left-0 w-full h-1 z-[60] pointer-events-none">
        <div 
          className="h-full bg-[var(--color-accent)] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 lg:w-[75%] bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6 md:p-10">
            
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Link href="/" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[var(--color-accent)] transition-colors">
                <ChevronLeft size={14} /> Back to Ecosystem
              </Link>
            </div>

            {/* Metadata */}
            <div className="mb-8">
              <span className="bg-[var(--color-accent)] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded shadow-sm">
                {article.category?.replace(/-/g, ' ') || 'News'}
              </span>
              <h1 className="mt-4 text-3xl md:text-5xl font-display font-bold leading-tight text-slate-900 tracking-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-slate-100">VA</div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-slate-900">Verbis AI News Team</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Globe className="w-3 h-3" /> {article.source?.name || 'Editorial'} 
                    <span>•</span>
                    <Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <ArticleActions article={article} onUpdate={handleUpdateArticle} />
                  <button className="p-2 text-slate-400 hover:text-[var(--color-accent)] transition-colors"><Share2 size={18}/></button>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <figure className="mb-10 group overflow-hidden rounded-xl">
              <img
                src={article.bannerImage}
                alt={article.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {article.imageCaption && (
                <figcaption className="mt-4 text-[12px] italic text-slate-500 text-center border-l-2 border-slate-200 pl-4 py-1">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>

            {/* AI Summary Box */}
            {article.summary && (
              <div className="mb-12 bg-slate-50 border border-slate-100 p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={60} className="text-[var(--color-accent)]" />
                </div>
                <div className="mb-4 flex items-center gap-2 text-[var(--color-accent)]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Insight Brief</span>
                </div>
                <p className="font-display text-xl leading-relaxed text-slate-800 font-medium italic">
                  "{article.summary}"
                </p>
              </div>
            )}

            {/* Table of Contents (Mobile Only) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest mb-4">Contents</h4>
                <nav className="flex flex-col gap-2">
                  {headings.map((heading) => (
                    <a key={heading.id} href={`#${heading.id}`} className="text-[13px] text-slate-600 font-medium hover:text-[var(--color-accent)]">
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
                  className="blog-content prose prose-slate prose-lg max-w-none 
                    prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-8 prose-p:font-sans 
                    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 
                    prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                    prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent)] prose-blockquote:bg-slate-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:italic prose-blockquote:rounded-r-lg
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8
                    prose-li:text-slate-700 prose-li:mb-2 prose-li:leading-relaxed
                    prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
                    selection:bg-[var(--color-accent-light)] selection:text-[var(--color-accent)]"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 italic text-lg font-sans">
                    Deep analysis is being synthesized...
                  </p>
                </div>
              )}
            </article>

            {/* Community Section */}
            <div className="mt-16 pt-16 border-t border-slate-100">
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                  Startup Intelligence Forum
                </h3>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-3 py-1 bg-slate-50 rounded-full inline-block">
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
              <section className="mt-24 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                    Related Ecosystem News
                  </h2>
                  <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block"></div>
                  <Link href={`/${category}`} className="text-[11px] font-black uppercase tracking-widest text-[var(--color-accent)] hover:underline">
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedArticles.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate.push(`/${item.categorySlug}/${item.slug}`)}
                      className="group cursor-pointer bg-slate-50/50 rounded-xl p-4 border border-transparent hover:border-slate-100 hover:bg-white transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
                        <img 
                          src={item.bannerImage} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
                          alt={item.title}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-widest">
                          {item.category?.replace(/-/g, ' ')}
                        </span>
                        <h3 className="text-[16px] font-bold leading-tight text-slate-900 group-hover:text-[var(--color-accent)] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
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
          <aside className="lg:w-[25%]">
            <div className="sticky top-[70px] space-y-10">
              
              {/* Table of Contents (Desktop Only) */}
              {headings.length > 0 && (
                <div className="hidden lg:block bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <div className="h-px w-4 bg-[var(--color-accent)]" /> Inside this story
                  </h3>
                  <nav className="flex flex-col gap-1 border-l border-slate-100 ml-1">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="group py-2 pl-4 text-[12px] font-bold text-slate-500 hover:text-[var(--color-accent)] hover:border-l-2 hover:border-[var(--color-accent)] -ml-[1.5px] transition-all"
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Market News Widget Slot */}
              {marketNewsWidget && (
                <div>
                  {marketNewsWidget}
                </div>
              )}

              {/* Startup Ecosystem Widget Slot */}
              {startupWidget && (
                <div>
                  {startupWidget}
                </div>
              )}
              
              {/* Social Connect */}
              <div className="bg-slate-900 p-8 rounded-2xl text-white relative group overflow-hidden shadow-xl">
                <Globe className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                <div className="relative z-10">
                  <h4 className="text-xl font-display font-bold mb-4">Ecosystem Alerts</h4>
                  <p className="text-slate-400 text-[13px] mb-6 leading-relaxed">Never miss a funding round or pivot. Join 50k+ startup professionals.</p>
                  <button className="w-full bg-[var(--color-accent)] text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-lg">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--color-footer-bg)] pt-16 pb-8 text-white mt-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            <div>
              <div className="font-display text-[26px] font-bold tracking-tight mb-6">
                <span className="text-[var(--color-accent)]">Verbis</span>
                <span className="text-white">AI</span>
              </div>
              <p className="text-slate-400 text-[13px] font-sans leading-relaxed max-w-[280px]">
                Connecting the Indian startup ecosystem through data-driven news and real-time market intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-accent)] mb-6">
                INTELLECTUAL FEED
              </h4>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ecosystem.ai" 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  required
                />
                <button 
                  type="submit"
                  className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-xl text-[12px] font-bold w-full md:w-auto hover:bg-[var(--color-accent-dark)] transition-all transform active:scale-[0.98]"
                >
                  Join the Network
                </button>
              </form>
            </div>

            <div className="md:text-right">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-accent)] mb-6">CONNECT</h4>
              <div className="flex md:justify-end gap-3">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <div key={i} className="w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-white hover:bg-[var(--color-accent)] hover:-translate-y-1 transition-all cursor-pointer">
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500 font-bold tracking-widest">
              <span className="text-white">LEGAL</span>
              {['Terms', 'Privacy', 'Disclaimer', 'Contact'].map((link) => (
                <Link key={link} href={`/${link.toLowerCase()}`} className="hover:text-white transition-colors">{link.toUpperCase()}</Link>
              ))}
            </div>
            <div className="text-[11px] text-slate-600 font-bold tracking-widest">
              © 2026 VERBIS AI ECOSYSTEM MEDIA.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}