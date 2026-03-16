"use client";
import { useEffect, useState, useRef } from "react";
import { getActiveBanner } from '@/services/magazine';

export default function SponsoredBanner() {
  const [banner, setBanner] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const bannerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    getActiveBanner().then(setBanner);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!bannerRef.current) return;
      const rect = bannerRef.current.getBoundingClientRect();
      const offset = -rect.top * 0.3;
      setScrollY(offset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!banner) {
    return (
      <div className="w-full h-64 bg-slate-200 animate-pulse my-10" />
    );
  }

  return (
    <section
      ref={bannerRef}
      className="relative w-full overflow-hidden my-12"
      style={{ minHeight: '320px' }}
    >
      {/* Parallax Background */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          transform: `translateY(${scrollY}px) scale(1.1)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <img
          src={banner.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80'}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20 flex items-center">
        <div className="max-w-xl">
          <span className="inline-block bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Sponsored
          </span>
          <h2 className="text-white font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              {banner.subtitle}
            </p>
          )}
          <a
            href={banner.cta_link || '#'}
            className="group inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-black uppercase tracking-widest text-sm transition-all duration-300 rounded-sm shadow-lg hover:shadow-red-500/30 hover:scale-105"
          >
            {banner.cta_text || 'Learn More'}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
