"use client";
import { useState } from "react";
import { Send, BookOpen } from "lucide-react";
import { subscribeToNewsletter } from "../../api/magazine";
import toast from "react-hot-toast";

export default function BlogStoriesCTA() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const result = await subscribeToNewsletter(email);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      setEmail('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <section className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 border-y border-orange-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
              <BookOpen size={12} />
              Newsletter
            </div>
            <h2 className="font-serif font-black text-4xl md:text-5xl text-slate-900 leading-tight mb-4">
              Get the best blog stories into your reader!
            </h2>
            <p className="text-slate-500 text-base mb-8 max-w-md">
              Handpicked by our editors. The most insightful, in-depth stories delivered straight to you.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-red-400 bg-white transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-60 flex items-center gap-2 whitespace-nowrap shadow-lg shadow-red-200"
              >
                {loading ? 'Subscribing...' : 'Subscribe Now'}
                <Send size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Illustration */}
          <div className="flex-shrink-0 hidden md:block">
            <div className="relative w-72 h-72">
              {/* Decorative stacked cards illustration */}
              <div className="absolute bottom-0 left-6 w-52 h-64 bg-white rounded-2xl shadow-xl rotate-[-8deg] border border-orange-100">
                <div className="h-32 bg-gradient-to-br from-red-400 to-orange-400 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-52 h-64 bg-white rounded-2xl shadow-xl rotate-[5deg] border border-orange-100">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-52 h-64 bg-white rounded-2xl shadow-2xl border border-orange-100 z-10">
                <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-2xl flex items-center justify-center">
                  <BookOpen size={40} className="text-white/60" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-slate-800 rounded w-3/4" />
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
