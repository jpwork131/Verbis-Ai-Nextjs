"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { getVideos } from '@/services/magazine';

export default function VideoSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos(3).then((data) => {
      setVideos(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="relative py-20 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1600&q=80"
          alt="bg"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-red-500 text-[11px] font-black uppercase tracking-widest mb-4">
            Video Content
          </span>
          <h2 className="font-serif font-black text-white text-4xl md:text-6xl mb-4 tracking-tight">
            What to Watch
          </h2>
          <p className="text-slate-400 text-base mb-12 max-w-xl mx-auto">
            Explore our latest video features, deep dives, and tech breakdowns.
          </p>
        </motion.div>

        {/* Big Play Button (pulsing) */}
        <motion.div
          className="flex items-center justify-center mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            {/* Pulsing rings */}
            <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25" />
            <span className="absolute -inset-4 rounded-full border border-red-600/30 animate-pulse" />
            <span className="absolute -inset-8 rounded-full border border-red-600/15 animate-pulse" style={{ animationDelay: '0.5s' }} />

            <button className="relative z-10 w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 transition-all duration-300 hover:scale-110 group">
              <Play size={30} className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
            </button>
          </div>
        </motion.div>

        {/* Video Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <motion.a
                key={video.id}
                href={video.url || '#'}
                className="group relative rounded-xl overflow-hidden h-48 block cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail_url || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />

                {/* Play Icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={18} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Clock size={9} />
                  {video.duration || '—'}
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-white text-sm font-bold line-clamp-2 text-left">{video.title}</h4>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
