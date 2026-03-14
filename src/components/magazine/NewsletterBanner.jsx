"use client";
import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { subscribeToNewsletter } from "../../api/magazine";
import toast from "react-hot-toast";

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

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
    <section className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left: Logo + Text */}
          <div className="flex-1 text-white text-center md:text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-white" />
              </div>
              <span className="font-serif font-black text-2xl tracking-tight">Verbis AI</span>
            </div>
            <h2 className="font-serif font-black text-3xl md:text-4xl text-white mb-3 leading-tight">
              Stay Ahead of the Curve.
            </h2>
            <p className="text-slate-400 text-base max-w-md">
              Join 50,000+ readers. Get AI-curated news, analysis, and tech stories delivered to your inbox daily.
            </p>
          </div>

          {/* Right: Email Input */}
          <div className="flex-1 w-full max-w-lg">
            <form onSubmit={handleSubmit} className="flex gap-0 bg-white rounded-xl overflow-hidden shadow-2xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-6 py-4 text-slate-900 text-sm focus:outline-none bg-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative overflow-hidden px-8 py-4 bg-red-600 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-60 flex-shrink-0 group"
              >
                {/* Sweep animation */}
                <span
                  className="absolute inset-0 bg-red-700 transition-all duration-300"
                  style={{
                    width: hovered ? '100%' : '0%',
                    left: 0,
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Sending...' : 'Subscribe'}
                  <Send size={14} />
                </span>
              </button>
            </form>
            <p className="text-slate-500 text-xs mt-3 text-center md:text-left">
              No spam. Unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
