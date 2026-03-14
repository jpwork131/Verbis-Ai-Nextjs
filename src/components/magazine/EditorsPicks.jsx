"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User, Facebook, Twitter, Youtube, Send, ChevronRight, Mail } from "lucide-react";
import { getEditorsPicks, getSocialStats, subscribeToNewsletter } from "../../api/magazine";
import toast from "react-hot-toast";

function PostCard({ post, index }) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
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
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3 transition-all duration-200 hover:bg-blue-600"
            style={{ backgroundColor: post.category?.color || '#2563EB' }}
          >
            {post.category?.name || 'News'}
          </span>

          <h3 className="text-slate-900 font-bold text-base leading-snug mb-3 line-clamp-2 relative">
            {post.title}
            <span className="block h-0.5 bg-slate-900 w-0 group-hover:w-full transition-all duration-300 mt-1" />
          </h3>

          <div className="flex items-center gap-3 text-slate-400 text-xs">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={10} className="text-slate-500" />
              </div>
            )}
            <span className="font-medium text-slate-600">{post.author?.name || 'Editorial'}</span>
            <span className="opacity-30">·</span>
            <Clock size={11} />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const SOCIAL_CONFIG = {
  facebook: { icon: Facebook, color: '#1877F2', label: 'Facebook' },
  twitter: { icon: Twitter, color: '#000000', label: 'X / Twitter' },
  youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube' },
  pinterest: {
    icon: ({ size, className }) => (
      <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
    color: '#E60023',
    label: 'Pinterest'
  },
};

function formatFollowers(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function SocialButton({ stat }) {
  const config = SOCIAL_CONFIG[stat.platform] || {};
  const Icon = config.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={stat.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100 transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: hovered ? config.color : '#ffffff',
        color: hovered ? '#ffffff' : '#334155',
        borderColor: hovered ? config.color : '#f1f5f9',
      }}
    >
      {Icon && <Icon size={18} className="flex-shrink-0" />}
      <div className="flex-1">
        <div className="text-[11px] font-black uppercase tracking-wider">{config.label || stat.platform}</div>
        <div className="text-xs opacity-70">{formatFollowers(stat.follower_count)} Followers</div>
      </div>
      <ChevronRight size={14} className="opacity-40" />
    </a>
  );
}

export default function EditorsPicks() {
  const [posts, setPosts] = useState([]);
  const [socialStats, setSocialStats] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    Promise.all([getEditorsPicks(6), getSocialStats()]).then(([picks, stats]) => {
      setPosts(picks);
      setSocialStats(stats);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    const result = await subscribeToNewsletter(email);
    setSubscribing(false);
    if (result.success) {
      toast.success(result.message);
      setEmail('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Editor's Pick</h2>
        </div>
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          See All <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Posts Grid — 6 cards in 3 cols */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Follow Us */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Follow Us</h3>
            <div className="space-y-3">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-200 animate-pulse rounded-lg" />)
              ) : (
                socialStats.map(stat => (
                  <SocialButton key={stat.id} stat={stat} />
                ))
              )}
            </div>
          </div>

          {/* Newsletter Subscribe */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Mail size={18} />
            </div>
            <h3 className="font-black text-base mb-1">Subscribe</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Get top stories delivered to your inbox daily.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe Now'}
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
