"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User, ChevronDown } from "lucide-react";
import { getRecentPosts } from '@/services/magazine';

export default function RecentPostsGrid() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 6;

  useEffect(() => {
    getRecentPosts(LIMIT, 0).then(({ posts: data, total }) => {
      setPosts(data);
      setHasMore(data.length < total);
      setOffset(LIMIT);
      setLoading(false);
    });
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const { posts: more, total } = await getRecentPosts(LIMIT, offset);
    setPosts((prev) => [...prev, ...more]);
    setOffset((p) => p + LIMIT);
    setHasMore(offset + LIMIT < total);
    setLoadingMore(false);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-14">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-8 bg-red-600 rounded-full" />
        <h2 className="text-2xl font-serif font-black text-slate-900">Recent Posts</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.08, duration: 0.5 }}
              >
                <Link
                  href={`/${post.category?.slug || 'news'}/${post.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="overflow-hidden h-48">
                    <img
                      src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3 transition-colors duration-200 group-hover:bg-blue-600"
                      style={{ backgroundColor: post.category?.color || '#2563EB' }}
                    >
                      {post.category?.name || 'News'}
                    </span>
                    <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 mb-3 relative">
                      {post.title}
                      <span className="block h-0.5 bg-slate-900 w-0 group-hover:w-full transition-all duration-300 mt-1" />
                    </h3>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                          <User size={9} className="text-slate-500" />
                        </div>
                      )}
                      <span className="text-slate-500 font-medium">{post.author?.name || 'Editorial'}</span>
                      <span className="opacity-30">·</span>
                      <Clock size={10} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all duration-300 disabled:opacity-60 shadow-lg hover:shadow-red-200"
              >
                {loadingMore ? 'Loading...' : 'Load More Stories'}
                <ChevronDown
                  size={16}
                  className={`transition-transform group-hover:translate-y-1 ${loadingMore ? 'animate-bounce' : ''}`}
                />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
