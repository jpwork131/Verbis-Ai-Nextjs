"use client";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useState } from "react";
import { subscribeToNewsletter } from "@/services/magazine";
import { toast } from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        toast.success(res.message);
        setEmail("");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-card-bg pt-16 pb-8 text-text-primary mt-20 border-t border-border-primary">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Col 1 - Brand */}
          <div>
            <div className="font-display text-[28px] font-extrabold tracking-tighter mb-6">
              <span className="text-accent">StartEJ</span>
            </div>
            <p className="text-text-primary/60 text-[13px] font-sans leading-relaxed max-w-[280px]">
              Connecting the Indian startup ecosystem through data-driven news and real-time market intelligence.
            </p>
          </div>

          {/* Col 2 - Newsletter */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent mb-6">
              INTELLECTUAL FEED
            </h4>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ecosystem.ai" 
                className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent transition-all"
                required
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-accent text-white px-6 py-3 rounded-xl text-[12px] font-bold w-full md:w-auto hover:bg-accent/80 transition-all transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Joining..." : "Join the Network"}
              </button>
            </form>
          </div>

          {/* Col 3 - Social icons */}
          <div className="md:text-right">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent mb-6">CONNECT</h4>
            <div className="flex md:justify-end gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <div key={i} className="w-11 h-11 rounded-xl border border-border-primary flex items-center justify-center text-text-primary hover:bg-accent hover:text-white hover:-translate-y-1 transition-all cursor-pointer">
                  <Icon size={20} />
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-border-primary pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-text-primary/40 font-bold tracking-widest">
            <span className="text-text-primary">LEGAL</span>
            {['About Us', 'Terms Of Use', 'Privacy Policy', 'Disclaimer', 'Contact Us'].map((link) => (
              <Link key={link} href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-text-primary transition-colors">{link.toUpperCase()}</Link>
            ))}
          </div>
          <div className="text-[11px] text-text-primary/30 font-bold tracking-widest">
            © 2026 StartEJ Intelligence Media.
          </div>
        </div>
      </div>
    </footer>
  );
}
