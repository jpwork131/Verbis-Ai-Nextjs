"use client";
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleWidgetProps {
  title: string;
  children: React.ReactNode;
  headerIcon?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function CollapsibleWidget({ 
  title, 
  children, 
  headerIcon, 
  badge, 
  footer,
  className = "",
  headerClassName = ""
}: CollapsibleWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`w-full overflow-hidden bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 font-sans ${className}`}>
      {/* Header - Always Visible & Clickable to toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          {headerIcon}
          <h3 className="font-display text-[17px] font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {badge}
          <motion.div 
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="text-slate-400"
          >
            <ChevronUp size={18} />
          </motion.div>
        </div>
      </div>

      {/* Collapsible Content using Framer Motion */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.04, 0.62, 0.23, 0.98],
              opacity: { duration: 0.4 }
            }}
            className="overflow-hidden"
          >
            {children}
            {footer && (
              <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30">
                {footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
