"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBusinessPosts } from "../../api/magazine";

export default function BusinessSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    getBusinessPosts(4).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-14">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-8 bg-red-600 rounded-full" />
        <h2 className="text-2xl font-serif font-black text-slate-900">Business & Tech</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {posts.map((post, i) => {
            const isHovered = hoveredId === post.id;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/${post.category?.slug || 'news'}/${post.slug}`}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group block"
                >
                  {/* Image with border-radius morph: square → circle */}
                  <div
                    className="relative overflow-hidden mb-4 shadow-lg"
                    style={{
                      aspectRatio: '1',
                      borderRadius: isHovered ? '50%' : '16px',
                      transition: 'border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                      boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  >
                    <img
                      src={post.banner_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 group-hover:to-black/40 transition-colors" />
                  </div>

                  {/* Category Badge */}
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-2 transition-all duration-200 group-hover:bg-blue-600"
                    style={{
                      backgroundColor: isHovered ? '#2563EB' : (post.category?.color || '#2563EB'),
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {post.category?.name || 'Business'}
                  </span>

                  {/* Title */}
                  <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1">{formatDate(post.created_at)}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
