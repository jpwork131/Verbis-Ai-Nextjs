"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { searchArticles } from "@/services/articles";

export default function MainNavbar() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = [
    { name: 'FINANCE', slug: 'finance' },
    { name: 'ECOSYSTEM', slug: 'startup-ecosystem' },
    { name: 'TRENDS', slug: 'startup-trends' },
    { name: 'FOUNDERS', slug: 'founder-stories' },
    { name: 'WOMEN', slug: 'women-entrepreneurs' },
    { name: 'REPORTS', slug: 'industry-reports' },
    { name: 'IPO', slug: 'ipo-markets' }
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full h-[64px] bg-white border-b border-slate-100 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Menu className="w-5 h-5 text-slate-600 cursor-pointer hover:text-black md:hidden" />
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="font-display text-[28px] font-extrabold tracking-tighter">
            <span className="text-[var(--color-accent)]">StartEJ</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block group">
            <div className="flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl w-[240px] transition-all focus-within:w-[300px] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                className="bg-transparent border-none outline-none text-[13px] ml-2 w-full font-body"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowDropdown(true)}
              />
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-[400px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
                  <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-black transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-8 text-center text-slate-400">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <span className="text-xs font-medium">Searching for "{searchQuery}"...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {searchResults.map(art => (
                        <Link
                          key={art.id}
                          href={`/${art.category_slug}/${art.slug}`}
                          className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group"
                          onClick={() => setShowDropdown(false)}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={art.bannerImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: (art.categoryColor || '#000000') + '20', color: art.categoryColor }}>{art.category_slug}</span>
                              <span className="text-[10px] text-slate-400 font-medium">· {formatDate(art.publishedAt)}</span>
                            </div>
                            <h5 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{art.title}</h5>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <div className="text-2xl mb-2">🔍</div>
                      <span className="text-xs font-medium">No articles found matching "{searchQuery}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="hidden sm:block px-5 py-2 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-black/5">
            Subscribe
          </button>

          {user ? (
            <div className="relative group">
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-600" />
                )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
                <div className="w-[240px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-50">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item">
                      <User className="w-4 h-4 text-slate-400 group-hover/item:text-blue-600" />
                      <span className="text-[13px] font-bold text-slate-700 group-hover/item:text-blue-600">My Profile</span>
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link href="/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover/item:text-blue-600" />
                        <span className="text-[13px] font-bold text-slate-700 group-hover/item:text-blue-600">Admin Panel</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group/item text-left"
                    >
                      <LogOut className="w-4 h-4 text-slate-400 group-hover/item:text-red-600" />
                      <span className="text-[13px] font-bold text-slate-700 group-hover/item:text-red-600">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block px-5 py-2 border border-slate-200 text-slate-900 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Category Navigation Strip */}
      <div className="w-full h-[40px] bg-[var(--color-accent)] flex items-center justify-center overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-6 px-6 max-w-[1200px]">
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className={`text-white text-[13px] font-[600] tracking-[0.05em] h-full flex items-center border-b-2 border-transparent hover:border-white transition-all`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
