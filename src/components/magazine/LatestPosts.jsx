"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, User } from "lucide-react";
import { getLatestPosts } from "../../api/magazine";

export default function LatestPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestPosts(5).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const [main, ...sideItems] = posts;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-serif font-black text-slate-900">Latest Posts</h2>
        </div>
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          See All <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 h-[500px] bg-slate-100 animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Large Featured Post */}
          {main && (
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href={`/${main.category?.slug || 'news'}/${main.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="overflow-hidden h-72 md:h-96">
                  <img
                    src={main.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80'}
                    alt={main.title}
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4"
                    style={{ backgroundColor: main.category?.color || '#2563EB' }}
                  >
                    {main.category?.name || 'News'}
                  </span>
                  <h2 className="text-slate-900 font-serif font-bold text-2xl md:text-3xl leading-snug mb-3 relative group">
                    {main.title}
                    <span className="block h-0.5 bg-red-500 w-0 group-hover:w-full transition-all duration-300 mt-2" />
                  </h2>
                  {main.excerpt && (
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">{main.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    {main.author?.avatar_url ? (
                      <img src={main.author.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={12} className="text-slate-500" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-600">{main.author?.name || 'Editorial'}</span>
                    <span className="opacity-30">·</span>
                    <Clock size={11} />
                    <span>{formatDate(main.created_at)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right: Stack of smaller posts + Posty card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sideItems.slice(0, 4).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link
                  href={`/${post.category?.slug || 'news'}/${post.slug}`}
                  className="group flex gap-4 bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover min-h-[90px] group-hover:scale-[1.08] transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 py-3 pr-4 flex flex-col justify-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white mb-2 self-start"
                      style={{ backgroundColor: post.category?.color || '#2563EB' }}
                    >
                      {post.category?.name || 'News'}
                    </span>
                    <h4 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 relative">
                      {post.title}
                      <span className="block h-0.5 bg-slate-900 w-0 group-hover:w-full transition-all duration-300 mt-1" />
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-1">{formatDate(post.created_at)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Posty Brand Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-red-600 rounded-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-red-500 opacity-50" />
              <div className="absolute -right-2 -top-4 w-20 h-20 rounded-full bg-red-700 opacity-30" />
              <div className="relative z-10">
                <div className="font-black text-2xl font-serif mb-2">Verbis AI</div>
                <p className="text-red-100 text-xs mb-5 leading-relaxed">
                  The smartest way to stay informed. AI-curated news, every day.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Start Reading
                  <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
