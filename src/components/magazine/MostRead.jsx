"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";
import { getMostReadPosts } from '@/services/magazine';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MostRead() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMostReadPosts(5).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <section className="bg-slate-50 py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <TrendingUp size={20} className="text-red-600" />
          <h2 className="text-2xl font-serif font-black text-slate-900">Most Read</h2>
        </div>

        {/* Horizontal Scroll Row */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
          {loading ? (
            <div className="flex gap-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 h-80 bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex gap-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  className="flex-shrink-0 w-64"
                >
                  <Link
                    href={`/${post.category?.slug || 'news'}/${post.slug}`}
                    className="group block relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Large Rank Number */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-5xl font-black text-white/20 leading-none select-none">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="overflow-hidden h-44">
                      <img
                        src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white mb-2 transition-colors duration-200"
                        style={{ backgroundColor: post.category?.color || '#2563EB' }}
                      >
                        {post.category?.name || 'News'}
                      </span>
                      <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-3 relative">
                        {post.title}
                        <span className="block h-0.5 bg-slate-900 w-0 group-hover:w-full transition-all duration-300 mt-1" />
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-3">
                        <Clock size={11} />
                        <span>{formatDate(post.created_at)}</span>
                        {post.view_count && (
                          <>
                            <span className="opacity-30">·</span>
                            <span>{(post.view_count / 1000).toFixed(1)}k views</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
