"use client";
import Link from 'next/link';
import { Calendar } from 'lucide-react';

// Colorful category badge colors — deterministic by category name
const CATEGORY_COLORS = {
  'startups':     { bg: '#6366F1', text: '#ffffff' }, // Indigo
  'funding':      { bg: '#F59E0B', text: '#ffffff' }, // Amber
  'tech':         { bg: '#06B6D4', text: '#ffffff' }, // Cyan
  'technology':   { bg: '#06B6D4', text: '#ffffff' },
  'unicorns':     { bg: '#A21CAF', text: '#ffffff' }, // Fuchsia Darker
  'ai':           { bg: '#10B981', text: '#ffffff' }, // Emerald
  'reports':      { bg: '#78716C', text: '#ffffff' }, // Stone
  'industry-reports': { bg: '#78716C', text: '#ffffff' },
  'exclusive':    { bg: '#EF4444', text: '#ffffff' }, // Red
  'fintrackr':    { bg: '#F97316', text: '#ffffff' }, 
  'news':         { bg: '#3B82F6', text: '#ffffff' }, // Blue
  'business':     { bg: '#7C3AED', text: '#ffffff' }, // Violet
  'finance':      { bg: '#F97316', text: '#ffffff' }, // Orange (Fintrackr style)
  'women':               { bg: '#EC4899', text: '#ffffff' }, // Pink (Only Women)
  'women-entrepreneurs': { bg: '#EC4899', text: '#ffffff' },
  'women-entrepreneur':  { bg: '#EC4899', text: '#ffffff' },
  'ipo-markets':   { bg: '#8B5CF6', text: '#ffffff' }, // Purple
  'ipo-&-markets': { bg: '#8B5CF6', text: '#ffffff' },
  'ipo':           { bg: '#8B5CF6', text: '#ffffff' },
  'startup-trends': { bg: '#BE123C', text: '#ffffff' }, // Crimson/Rose Dark
  'trends':         { bg: '#BE123C', text: '#ffffff' },
  'founder-stories': { bg: '#F59E0B', text: '#ffffff' }, // Orange
  'founders':        { bg: '#F59E0B', text: '#ffffff' },
  'ecosystem':         { bg: '#14B8A6', text: '#ffffff' }, // Teal
  'startup-ecosystem': { bg: '#14B8A6', text: '#ffffff' }, // Teal
  'future-of-work': { bg: '#EA580C', text: '#ffffff' }, // Deep Orange
};

export function getCategoryColor(category, overrideColor = null) {
  if (overrideColor) return { bg: overrideColor, text: '#ffffff' };
  if (!category) return { bg: '#2563EB', text: '#ffffff' };
  
  const key = category.toLowerCase().replace(/\s+/g, '-');
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key];
  
  // Fallback to stable hash color
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  const palette = ['#8B5CF6','#F59E0B','#06B6D4','#EC4899','#10B981','#EF4444','#F97316','#3B82F6','#6366F1','#A855F7'];
  return { bg: palette[Math.abs(hash) % palette.length], text: '#ffffff' };
}

export default function ArticleCard({ 
  image, 
  category, 
  categoryColor, 
  headline, 
  author, 
  date, 
  size = "medium",
  slug = "#"
}) {
  const sizeClasses = {
    large: {
      imgHeight: 'h-[220px]',
      titleSize: 'text-[20px]',
    },
    medium: {
      imgHeight: 'h-[160px]',
      titleSize: 'text-[16px]',
    },
    small: {
      imgHeight: 'h-[120px]',
      titleSize: 'text-[13px]',
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;
  const c = getCategoryColor(category, categoryColor);

  return (
    <div className="article-card group bg-card-bg rounded-lg overflow-hidden cursor-pointer transition-colors duration-300">
      <Link href={slug} className="flex flex-row sm:flex-col gap-4 sm:gap-0">
        <div className={`w-[120px] h-[90px] sm:w-full ${currentSize.imgHeight} flex-shrink-0 overflow-hidden rounded-[8px]`}>
          <img 
            src={image || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            loading="lazy"
          />
        </div>
        <div className="mt-0 sm:mt-3 flex-1 min-w-0 pr-2 pb-2 sm:pr-0 sm:pb-0">
          {category && (
            <span
              className="inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-[700] uppercase tracking-wide mb-1 sm:mb-2 shadow-sm"
              style={{ backgroundColor: c.bg, color: c.text }}
            >
              {category}
            </span>
          )}
          <h3 className={`font-display ${currentSize.titleSize} font-[700] text-text-primary leading-[1.3] sm:leading-[1.35] line-clamp-2 transition-colors group-hover:text-accent mb-1 sm:mb-2`}>
            {headline}
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[12px] text-text-primary/60">
            <span className="font-[500] whitespace-nowrap truncate max-w-[80px] sm:max-w-none">By {author || 'Editorial'}</span>
            <span className="flex items-center gap-1 text-text-primary/40">
              <Calendar size={10} className="sm:w-3 sm:h-3" />
              {date}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
