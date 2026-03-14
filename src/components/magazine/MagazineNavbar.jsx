"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sun, Moon, Menu, X, User, Bell, ChevronRight } from "lucide-react";
import { useBranding } from "../../context/BrandingContext";
import { logoutUser } from "../../api/auth";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/#categories" },
  { label: "Most Read", href: "/#most-read" },
  { label: "Latest", href: "/#latest" },
  { label: "Videos", href: "/#videos" },
  { label: "Contact", href: "/#newsletter" },
];

const SOCIAL_LINKS = [
  { href: "#", label: "fb", color: "#1877F2", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { href: "#", label: "tw", color: "#000000", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
  { href: "#", label: "yt", color: "#FF0000", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  )},
  { href: "#", label: "pin", color: "#E60023", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
  )},
  { href: "#", label: "in", color: "#0A66C2", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  )},
];

export default function MagazineNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { branding } = useBranding();
  const router = useRouter();

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  const isLoggedIn = !!user;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      {/* ── TOP UTILITY BAR ── */}
      <div className="hidden md:block border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-10 flex items-center justify-between">
          {/* Social icons */}
          <div className="flex items-center gap-1">
            {SOCIAL_LINKS.map(({ href, label, color, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: color }}
              >
                <Icon />
              </a>
            ))}
          </div>

          {/* Center: Date */}
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/#newsletter"
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full transition-colors"
            >
              Subscribe
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-500 transition-colors"
                title="Sign out"
              >
                <User size={14} />
              </button>
            ) : (
              <Link href="/login" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center text-slate-500 transition-colors">
                <User size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAV BAR ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            {branding.logo ? (
              <img src={branding.logo} className="h-8 w-auto object-contain" alt="logo" />
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bell size={14} className="text-white" />
                </div>
                <span className="font-serif font-black text-xl text-slate-900 tracking-tight">
                  {branding.siteTitle || "Verbis AI"}
                </span>
              </div>
            )}
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 text-[12px] font-semibold text-slate-600 hover:text-blue-600 rounded-lg transition-colors whitespace-nowrap uppercase tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Search */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Search size={18} />
            </button>
            {/* Mobile: User */}
            <Link href="/login" className="md:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded-lg transition-colors">
              <User size={18} />
            </Link>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-[1400px] mx-auto flex gap-3">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles, topics, categories..."
                autoFocus
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white md:hidden">
            <nav className="flex flex-col py-2 max-w-[1400px] mx-auto">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-50"
                >
                  {label}
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>
              ))}
              {/* Mobile social + subscribe */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex gap-2">
                  {SOCIAL_LINKS.map(({ href, label, color, icon: Icon }) => (
                    <a key={label} href={href} className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                      <Icon />
                    </a>
                  ))}
                </div>
                <Link
                  href="/#newsletter"
                  onClick={() => setMobileOpen(false)}
                  className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
                >
                  Subscribe
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
