"use client";
import Link from "next/link";
import { Calendar, Facebook, Twitter, Youtube, Instagram, Send } from "lucide-react";
import { getCategoryColor } from "./EntrackrCard";

// ── Social follow card ───────────────────────────────────────────────
const socialPlatforms = [
  {
    name: "Facebook",
    icon: Facebook,
    count: "23k",
    label: "Likes",
    color: "#1877F2",
    bg: "rgba(24, 119, 242, 0.1)",
  },
  {
    name: "X",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
      </svg>
    ),
    count: "56k",
    label: "Followers",
    color: "#000000",
    bg: "rgba(0, 0, 0, 0.1)",
  },
  {
    name: "Youtube",
    icon: Youtube,
    count: "56k",
    label: "Subscribe",
    color: "#FF0000",
    bg: "rgba(255, 0, 0, 0.1)",
  },
  {
    name: "Spotify",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="#1DB954"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
    count: "14k",
    label: "Followers",
    color: "#1DB954",
    bg: "rgba(29, 185, 84, 0.1)",
  },
  {
    name: "Instagram",
    icon: Instagram,
    count: "5m",
    label: "Followers",
    color: "#E1306C",
    bg: "rgba(225, 48, 108, 0.1)",
  },
  {
    name: "Pinterest",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="#E60023"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
    count: "59k",
    label: "Followers",
    color: "#E60023",
    bg: "rgba(230, 0, 35, 0.1)",
  },
];

function SocialCard({ platform }) {
  const Icon = platform.icon || Send;
  return (
    <a
      href={platform.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer hover:shadow-lg transition-all duration-300 group no-underline bg-card-bg border border-border-primary"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = platform.color;
        e.currentTarget.querySelectorAll('.social-text').forEach(el => el.style.color = 'white');
        e.currentTarget.querySelector('.social-icon-bg').style.backgroundColor = 'rgba(255,255,255,0.2)';
        e.currentTarget.querySelector('.social-icon').style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.querySelectorAll('.social-text').forEach(el => el.style.color = '');
        e.currentTarget.querySelector('.social-icon-bg').style.backgroundColor = '';
        e.currentTarget.querySelector('.social-icon').style.color = platform.color;
      }}
    >
      <div
        className="social-icon-bg w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 bg-bg-primary/10"
      >
        <Icon className="social-icon transition-colors duration-300" size={18} style={{ color: platform.color }} />
      </div>
      <div className="min-w-0">
        <div className="social-text social-name font-bold text-[13px] text-text-primary truncate capitalize transition-colors duration-300">{platform.name}</div>
        <div className="social-text social-count text-[11px] text-text-primary/40 transition-colors duration-300">
          {platform.follower_count ? `${(platform.follower_count / 1000).toFixed(1)}k` : platform.count} {platform.label || 'Followers'}
        </div>
      </div>
    </a>
  );
}

// ── Mini article card (smaller grid items) ───────────────────────────
function MiniArticleCard({ article }) {
  if (!article) return null;
  const cat = article.category?.name || article.category_slug || "News";
  const catColor = getCategoryColor(cat);
  const slug = `/${article.category_slug || "news"}/${article.slug}`;
  const imgSrc =
    article.banner_image || "https://via.placeholder.com/400x240?text=News";

  return (
    <Link href={slug} className="group block">
      <div className="relative overflow-hidden rounded-xl aspect-[16/10]">
        <img
          src={imgSrc}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="mt-3">
        <span
          className="inline-block px-2.5 py-[3px] rounded text-[10px] font-[700] uppercase tracking-wide mb-2"
          style={{ backgroundColor: article.categoryColor || catColor.bg, color: catColor.text }}
        >
          {cat}
        </span>
        <h4 className="font-bold text-[14px] text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-text-primary/40 mt-1.5">
          <span>
            by{" "}
            <strong className="text-text-primary/70">
              {article.author?.name || "Editorial"}
            </strong>
          </span>
          <span>–</span>
          <span>
            {(() => {
              const d = new Date(article.published_at || article.created_at);
              if (isNaN(d.getTime())) return "Recently";
              return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            })()}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main exported component ──────────────────────────────────────────
export default function EditorPickSection({ articles = [], socialStats = [], loading = false }) {
  const hero = articles[0];
  const grid = articles.slice(1, 4);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <h2 className="font-display text-[22px] font-bold text-text-primary mr-3 whitespace-nowrap">
            Editor's Pick
          </h2>
          <div className="flex-1 border-t-2 border-dashed border-border-primary" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">
            <div className="h-[320px] bg-card-bg animate-pulse rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[180px] bg-card-bg animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[280px] space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[54px] bg-card-bg animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!hero) return null;

  const heroCat = hero.category?.name || hero.category_slug || "Featured";
  const heroCatColor = getCategoryColor(heroCat);
  const heroSlug = `/${hero.category_slug || "news"}/${hero.slug}`;

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center mb-6">
        <h2 className="font-display text-[22px] font-bold text-text-primary mr-3 whitespace-nowrap">
          Editor's Pick
        </h2>
        <div className="flex-1 border-t-2 border-dashed border-border-primary" />
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* ── Left: articles (hero + 3 grid) ── */}
        <div className="flex-1 min-w-0">
          {/* Hero article */}
          <Link
            href={heroSlug}
            className="group block sm:relative sm:overflow-hidden sm:aspect-[16/9] mb-8 cursor-pointer rounded-2xl sm:border sm:border-border-primary"
          >
            {/* Image Wrapper */}
            <div className="relative overflow-hidden rounded-2xl aspect-[16/9] sm:absolute sm:inset-0 sm:aspect-auto sm:rounded-none">
              <img
                src={
                  hero.banner_image ||
                  "https://via.placeholder.com/800x450?text=Editor%27s+Pick"
                }
                alt={hero.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>

            {/* Content card (Below on mobile, Overlapping on Desktop) */}
            <div className="relative sm:absolute sm:bottom-6 sm:right-6 mt-4 sm:mt-0 bg-card-bg sm:bg-card-bg/95 backdrop-blur-sm rounded-2xl sm:rounded-lg shadow-xl sm:shadow-2xl p-6 sm:p-4 w-full sm:w-auto sm:max-w-[42%] border border-border-primary/50 transition-all duration-300 z-10">
              <span
                className="inline-block px-2.5 py-[3px] rounded text-[10px] font-[700] uppercase tracking-wide mb-3 sm:mb-2"
                style={{ backgroundColor: hero.categoryColor || heroCatColor.bg, color: heroCatColor.text }}
              >
                {heroCat}
              </span>
              <h3 className="font-bold text-[18px] sm:text-[16px] text-text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors mb-3 sm:mb-2">
                {hero.title}
              </h3>
              {hero.summary && (
                <p className="text-[13px] sm:text-[12px] text-text-primary/60 line-clamp-2 mb-4 sm:mb-3">
                  {hero.summary}
                </p>
              )}
              <div className="flex items-center gap-2 text-[11px] text-text-primary/40">
                <span>
                  by{" "}
                  <strong className="text-accent">
                    {hero.author?.name || "Editorial"}
                  </strong>
                </span>
                <span>–</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {(() => {
                    const d = new Date(hero.published_at || hero.created_at);
                    if (isNaN(d.getTime())) return "Recently";
                    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                  })()}
                </span>
              </div>
            </div>
          </Link>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {grid.map((article) => (
              <MiniArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* ── Right: Follow Us + Author sidebar ── */}
        <div className="w-full xl:w-[280px] flex-shrink-0">
          {/* Follow Us */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <h3 className="font-display text-[18px] font-bold text-text-primary mr-3 whitespace-nowrap">
                Follow Us
              </h3>
              <div className="flex-1 border-t-2 border-dashed border-border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {socialStats.length > 0 ? (
                socialStats.slice(0, 6).map((stat) => {
                  const platformConfig = [
                    { name: 'facebook', icon: Facebook, color: '#1877F2', bg: 'rgba(24, 119, 242, 0.1)', label: 'Likes' },
                    { name: 'twitter', icon: socialPlatforms[1].icon, color: '#000000', bg: 'rgba(0, 0, 0, 0.1)', label: 'Followers' },
                    { name: 'x', icon: socialPlatforms[1].icon, color: '#000000', bg: 'rgba(0, 0, 0, 0.1)', label: 'Followers' },
                    { name: 'youtube', icon: Youtube, color: '#FF0000', bg: 'rgba(255, 0, 0, 0.1)', label: 'Subscribe' },
                    { name: 'instagram', icon: Instagram, color: '#E1306C', bg: 'rgba(225, 48, 108, 0.1)', label: 'Followers' },
                    { name: 'pinterest', icon: socialPlatforms[5].icon, color: '#E60023', bg: 'rgba(230, 0, 35, 0.1)', label: 'Followers' },
                  ].find(p => p.name === stat.platform.toLowerCase()) || { name: stat.platform, icon: Send, color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)', label: 'Followers' };

                  return (
                    <SocialCard 
                      key={stat.id} 
                      platform={{
                        ...platformConfig,
                        follower_count: stat.follower_count,
                        url: stat.url
                      }} 
                    />
                  );
                })
              ) : (
                socialPlatforms.map((p) => (
                  <SocialCard key={p.name} platform={p} />
                ))
              )}
            </div>
          </div>

          {/* Author / About Me card */}
          <div className="bg-card-bg rounded-2xl p-6 text-center border border-border-primary shadow-sm hover:shadow-md transition-all duration-300">
            <div
              className="w-[72px] h-[72px] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg"
              style={{
                background: "linear-gradient(135deg, #F59E0B 60%, #EF4444 100%)",
              }}
            >
              <span>✍️</span>
            </div>
            <h4 className="font-bold text-[17px] text-text-primary mb-2">
              About StartEJ
            </h4>
            <p className="text-[12px] text-text-primary/60 leading-relaxed mb-4">
              Curating the best in startup news, funding rounds, and tech
              innovation — powered by AI.{" "}
              <span className="text-accent font-semibold">
                Stay ahead of the curve.
              </span>
            </p>
            <Link
              href="/about"
              className="inline-block px-6 py-2 rounded-full text-[13px] font-bold text-white transition-all hover:brightness-110 hover:scale-105 shadow-md shadow-accent/20"
              style={{
                background:
                  "linear-gradient(90deg, #2563EB 0%, var(--color-accent) 100%)",
              }}
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
