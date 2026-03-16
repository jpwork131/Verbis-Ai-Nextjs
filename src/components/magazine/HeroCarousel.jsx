"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, Eye, Clock } from "lucide-react";
import { getFeaturedPosts, getLatestPosts } from '@/services/magazine';

function SkeletonRow() {
  return (
    <div className="flex gap-6">
      {[1,2,3].map(i=><div key={i} className="flex-1 h-20 bg-slate-100 animate-pulse rounded"/>)}
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Mini Article Strip ─────────────────────────────────────────────────────
function MiniArticleStrip({ posts }) {
  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {posts.slice(0,3).map((post, i) => (
            <Link
              key={post.id || i}
              href={`/${post.category?.slug || 'news'}/${post.slug}`}
              className="group flex items-center gap-4 py-4 px-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-16 h-14 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=70'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="inline-block text-[9px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded mb-1"
                  style={{ backgroundColor: post.category?.color || '#2563EB' }}
                >
                  {post.category?.name || 'News'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Left Column: 2 stacked mini-cards ──────────────────────────────────────
function LeftArticles({ posts }) {
  return (
    <div className="flex flex-col gap-5">
      {posts.slice(0,2).map((post, i) => (
        <Link
          key={post.id || i}
          href={`/${post.category?.slug || 'news'}/${post.slug}`}
          className="group block"
        >
          <div className="overflow-hidden rounded-xl mb-3 h-44">
            <img
              src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
            />
          </div>
          <span
            className="inline-block text-[9px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded mb-2"
            style={{ backgroundColor: post.category?.color || '#2563EB' }}
          >
            {post.category?.name || 'News'}
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors relative">
            {post.title}
            <span className="block h-0.5 bg-blue-600 w-0 group-hover:w-full transition-all duration-300 mt-1"/>
          </h3>
        </Link>
      ))}
    </div>
  );
}

// ── Center: Main Carousel ───────────────────────────────────────────────────
function CenterCarousel({ posts }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (posts.length < 2) return;
    timerRef.current = setInterval(() => setCurrent(p => (p+1) % posts.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [posts.length]);

  const go = (dir) => {
    clearInterval(timerRef.current);
    setCurrent(p => (p + dir + posts.length) % posts.length);
  };

  if (!posts.length) return <div className="h-[460px] bg-slate-200 animate-pulse rounded-2xl"/>;
  const post = posts[current];

  return (
    <div className="relative rounded-2xl overflow-hidden h-[460px] group shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={post.id + current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"/>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-7">
            <span
              className="inline-block px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-white mb-3"
              style={{ backgroundColor: post.category?.color || '#2563EB' }}
            >
              {post.category?.name || 'News'}
            </span>
            <h2 className="text-white font-serif font-bold text-2xl md:text-3xl leading-tight mb-4 line-clamp-3">
              {post.title}
            </h2>
            <div className="flex items-center gap-4 text-white/70 text-xs">
              <span>by <span className="font-semibold text-white">Editorial</span></span>
              <span className="opacity-40">—</span>
              <span className="flex items-center gap-1"><Clock size={11}/>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
      >
        <ChevronLeft size={16} className="text-slate-800"/>
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
      >
        <ChevronRight size={16} className="text-slate-800"/>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
        {posts.map((_,i) => (
          <button
            key={i}
            onClick={() => { clearInterval(timerRef.current); setCurrent(i); }}
            className={`rounded-full transition-all duration-300 ${i===current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Right Column: Trending / Latest tabs ───────────────────────────────────
function RightSidebar({ trending, latest }) {
  const [tab, setTab] = useState('trending');
  const items = tab === 'trending' ? trending : latest;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        {[['trending', 'Trending News'], ['latest', 'Latest News']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
              tab === key
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {items.slice(0,6).map((post, i) => (
          <Link
            key={post.id || i}
            href={`/${post.category?.slug || 'news'}/${post.slug}`}
            className="group flex gap-3 items-start"
          >
            <div className="w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=70'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="inline-block text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded mb-1"
                style={{ backgroundColor: post.category?.color || '#2563EB' }}
              >
                {post.category?.name || 'News'}
              </span>
              <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">{formatDate(post.created_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
export default function HeroCarousel() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedPosts(8), getLatestPosts(12, 5)]).then(([feat, lat]) => {
      setFeatured(feat);
      setLatest(lat);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-4">
        <SkeletonRow/>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="h-[460px] bg-slate-100 animate-pulse rounded-2xl"/>
          <div className="lg:col-span-2 h-[460px] bg-slate-100 animate-pulse rounded-2xl"/>
          <div className="h-[460px] bg-slate-100 animate-pulse rounded-2xl"/>
        </div>
      </div>
    );
  }

  const leftPosts = featured.slice(0, 2);
  const centerPosts = featured.slice(0, 5);
  const trendingPosts = featured.slice(0, 6);

  return (
    <>
      {/* Mini article strip above the hero */}
      <MiniArticleStrip posts={latest.slice(0, 3)} />

      {/* 3-column hero layout */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* LEFT — 2 stacked mini articles */}
          <div className="hidden lg:block">
            <LeftArticles posts={featured.slice(2, 4)} />
          </div>

          {/* CENTER — Large carousel */}
          <div className="lg:col-span-2">
            <CenterCarousel posts={centerPosts} />
          </div>

          {/* RIGHT — Trending / Latest tabs */}
          <div className="hidden lg:block h-[460px]">
            <RightSidebar trending={trendingPosts} latest={latest.slice(0, 6)} />
          </div>
        </div>
      </div>
    </>
  );
}
