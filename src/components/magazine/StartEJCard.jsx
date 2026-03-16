"use client";
import Link from 'next/link';
import { Calendar, ArrowUpRight } from 'lucide-react';

export default function StartEJCard({ 
  image, 
  category, 
  headline, 
  author, 
  date, 
  size = "medium",
  slug = "#"
}) {
  const sizeClasses = {
    large: {
      imgHeight: 'h-[260px]',
      titleSize: 'text-[24px]',
    },
    medium: {
      imgHeight: 'h-[180px]',
      titleSize: 'text-[18px]',
    },
    small: {
      imgHeight: 'h-[140px]',
      titleSize: 'text-[15px]',
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="startej-card group relative bg-white border border-slate-100 p-4 rounded-3xl transition-all duration-300 hover:shadow-xl hover:border-[var(--color-accent-light)]">
      <Link href={slug} className="block">
        <div className={`w-full ${currentSize.imgHeight} overflow-hidden rounded-2xl relative mb-4`}>
          <img 
            src={image || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
             <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[var(--color-accent)] text-[10px] font-black uppercase tracking-wider shadow-sm border border-slate-100">
               {category}
             </span>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-accent)] p-2 rounded-full text-white">
             <ArrowUpRight size={14} />
          </div>
        </div>
        
        <div>
          <h3 className={`font-display ${currentSize.titleSize} font-bold text-slate-900 leading-[1.3] line-clamp-2 transition-colors group-hover:text-[var(--color-accent)] mb-3`}>
            {headline}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="text-slate-600">By {author || 'Editorial'}</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} className="opacity-50" />
              {date}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
