"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, Clock } from "lucide-react";
import { getTravelPosts } from "../../api/magazine";

export default function TravelSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTravelPosts(6).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <MapPin size={20} className="text-red-600" />
            <h2 className="text-2xl font-serif font-black text-slate-900">Travel & World</h2>
          </div>
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            See All <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/${post.category?.slug || 'news'}/${post.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="overflow-hidden h-48">
                    <img
                      src={post.banner_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3"
                      style={{ backgroundColor: post.category?.color || '#2563EB' }}
                    >
                      {post.category?.name || 'Travel'}
                    </span>
                    <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 mb-2 relative">
                      {post.title}
                      <span className="block h-0.5 bg-slate-900 w-0 group-hover:w-full transition-all duration-300 mt-1" />
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Clock size={11} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
