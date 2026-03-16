"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter as useNavigate } from 'next/navigation';
import { getMe } from "@/services/auth";
import { saveArticle } from "@/services/articles";
import { Mail, Calendar, Heart, Trash2, Check, X, Bookmark, Hash, ArrowUpRight } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("saved");
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate.push("/login", { replace: true });
      return;
    }
    const loadProfile = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [navigate]);

  // Ensure management mode closes if user switches tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsManageMode(false);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === user.savedArticles.length) setSelectedIds([]);
    else setSelectedIds(user.savedArticles.map(a => a._id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently remove ${selectedIds.length} items from your library?`)) return;
    try {
      await Promise.all(selectedIds.map(id => saveArticle(id)));
      setUser(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(a => !selectedIds.includes(a._id))
      }));
      setSelectedIds([]);
      setIsManageMode(false);
    } catch (err) { console.error(err); }
  };

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center font-serif italic text-text-primary/40 uppercase tracking-[0.3em] text-xs bg-bg-primary">Establishing Connection...</div>;

  const currentArticles = activeTab === "saved" ? user?.savedArticles : user?.likedArticles;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent selection:text-white transition-colors duration-500">
      {/* 1. EDITORIAL HEADER */}
      <header className="border-b-4 border-text-primary bg-card-bg/30">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 flex flex-col md:flex-row gap-16 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="h-40 w-40 bg-text-primary text-bg-primary flex items-center justify-center text-7xl font-serif italic shrink-0 shadow-2xl z-10 box-content border-8 border-border-primary/20">
            {user.name?.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-4 text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-6">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Verified {user.role} Member
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
              {user.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-text-primary/40">
              <span className="flex items-center gap-2 text-text-primary font-black"><Mail size={14} className="text-accent" /> {user.email}</span>
              <span className="flex items-center gap-2 italic">Intelligence feed active since {new Date(user.createdAt).getFullYear()}</span>
            </div>
          </div>

          {/* MANAGEMENT TOGGLE */}
          <div className="shrink-0 flex flex-col gap-4 w-full md:w-auto z-10">
            {activeTab === "saved" && user.savedArticles?.length > 0 && (
              <button
                onClick={() => { setIsManageMode(!isManageMode); setSelectedIds([]); }}
                className={`px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] border-2 transition-all duration-300 ${isManageMode ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-transparent border-text-primary hover:bg-text-primary hover:text-bg-primary'
                  }`}
              >
                {isManageMode ? "Terminate Curation" : "Curate Library"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. STICKY NAV BAR */}
      <div className="sticky top-24 z-40 bg-bg-primary/90 backdrop-blur-xl border-b border-border-primary">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-20">
          <div className="flex gap-12">
            {[
              { id: "saved", label: "Intelligence Library", icon: Bookmark, count: user.savedArticles?.length },
              { id: "liked", label: "Impact Feed", icon: Heart, count: user.likedArticles?.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 h-20 border-b-2 transition-all text-[11px] font-black uppercase tracking-[0.3em] ${activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-text-primary/40 hover:text-text-primary"
                  }`}
              >
                <tab.icon size={16} /> {tab.label} <span className="ml-1 text-[9px] opacity-40">({tab.count || 0})</span>
              </button>
            ))}
          </div>

          {/* BULK ACTIONS */}
          {isManageMode && activeTab === "saved" && (
            <div className="flex items-center gap-8 animate-in fade-in slide-in-from-right-8">
              <button onClick={handleSelectAll} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 hover:text-text-primary transition-colors">
                {selectedIds.length === user.savedArticles.length ? "De-Select All" : "Select Entire Archive"}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-3 bg-text-primary text-bg-primary px-6 py-3 disabled:opacity-10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-black/10"
              >
                <Trash2 size={14} /> Purge ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. THE ARCHIVE GRID */}
      <main className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="grid gap-x-12 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {currentArticles?.map((article) => {
            const isSelected = selectedIds.includes(article._id);
            return (
              <div
                key={article._id}
                className={`group relative flex flex-col transition-all duration-500 ${isManageMode ? 'cursor-pointer' : ''}`}
                onClick={() => isManageMode && toggleSelect(article._id)}
              >
                {/* Selection Overlay */}
                {isManageMode && (
                  <div className={`absolute top-4 left-4 z-30 h-10 w-10 border-2 flex items-center justify-center transition-all duration-300 shadow-2xl ${isSelected ? "bg-accent border-accent text-white" : "bg-bg-primary/90 border-border-primary"
                    }`}>
                    {isSelected && <Check size={20} strokeWidth={4} />}
                  </div>
                )}

                <div className={`space-y-6 transition-all duration-700 ${isManageMode && !isSelected ? "opacity-20 scale-[0.98] grayscale" : "opacity-100"}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-card-bg">
                    <img
                      src={article.bannerImage}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    {!isManageMode && (
                      <div className="absolute inset-0 bg-text-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                         <div className="bg-bg-primary p-4 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                           <ArrowUpRight size={24} className="text-text-primary" />
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                        {article.category}
                      </span>
                      <div className="h-[1px] flex-1 bg-border-primary" />
                      <span className="text-[10px] font-bold text-text-primary/20 uppercase">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl font-black leading-tight group-hover:text-accent transition-colors duration-300">
                      {isManageMode ? article.title : (
                        <Link href={`/${article.categorySlug}/${article.slug}`}>
                          {article.title}
                        </Link>
                      )}
                    </h3>

                    <p className="text-[13px] text-text-primary/60 line-clamp-3 leading-relaxed font-medium">
                      {article.summary}
                    </p>

                    <div className="pt-4 flex items-center gap-3">
                      <div className="w-5 h-[1px] bg-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-primary/40">
                        {article.source?.name || article.source || "Editorial Team"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentArticles?.length === 0 && (
          <div className="py-60 text-center border-t-2 border-border-primary">
            <p className="font-serif italic text-text-primary/20 text-4xl tracking-tighter">No intelligence records found.</p>
            <Link href="/" className="inline-block mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-accent hover:text-text-primary transition-colors">
              Access Feed
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}