"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBreakingNewsPosts } from '@/services/magazine';

export default function BreakingNewsTicker() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBreakingNewsPosts(8).then(setPosts);
  }, []);

  if (!posts.length) return null;

  // Double the posts for seamless loop
  const doubled = [...posts, ...posts];

  return (
    <div className="bg-slate-950 text-white flex items-center overflow-hidden h-10 select-none" style={{ borderBottom: '2px solid #DC2626' }}>
      {/* Breaking Label */}
      <div className="flex-shrink-0 bg-red-600 h-full flex items-center px-4 z-10">
        <span className="text-[11px] font-black uppercase tracking-widest text-white whitespace-nowrap">
          🔴 breaking
        </span>
      </div>

      {/* Scrolling Headlines */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex gap-0 whitespace-nowrap"
          style={{
            animation: 'marquee 40s linear infinite',
            width: 'max-content',
          }}
        >
          {doubled.map((post, idx) => (
            <Link
              key={`${post.id}-${idx}`}
              href={`/${post.category?.slug || 'news'}/${post.slug}`}
              className="inline-flex items-center gap-3 px-8 text-[12px] font-medium text-slate-200 hover:text-white transition-colors group"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: post.category?.color || '#DC2626' }}
              />
              <span className="group-hover:text-red-400 transition-colors">
                {post.title}
              </span>
              <span className="text-slate-600 mx-2">|</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
