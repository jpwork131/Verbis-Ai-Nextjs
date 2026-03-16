"use client";
import { useState } from "react";
import { loginUser } from "@/services/auth";
import Link from 'next/link';
import { useRouter as useNavigate } from 'next/navigation';
import { useHomeState } from "@/contexts/HomeStateContext";
import { ChevronLeft, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useHomeState();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(form);
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("user", JSON.stringify(user)); // Store full user for persistence

      setUser(user);

      if (user.role === "admin") {
        navigate.push("/admin");
      } else {
        navigate.push("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6 transition-colors duration-300 relative overflow-hidden">
      {/* Editorial Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" />
      
      {/* Back Button */}
      <Link href="/" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 hover:text-accent transition-all z-10">
        <ChevronLeft size={14} /> Back to Newsfeed
      </Link>

      <div className="w-full max-w-sm z-10">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-text-primary text-bg-primary mb-6 shadow-xl shadow-accent/10">
            <Lock size={20} />
          </div>
          <h2 className="font-serif text-5xl font-black tracking-tighter text-text-primary italic">
            Reader <span className="text-accent">Auth</span>
          </h2>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40">
            Premium Editorial Access
          </p>
        </div>

        <div className="bg-card-bg border border-border-primary p-8 shadow-2xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-[11px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-primary/60 ml-0.5">
                Editorial ID (Email)
              </label>
              <input
                type="email"
                name="email"
                placeholder="editor@startej.com"
                className="w-full p-4 bg-bg-primary border border-border-primary focus:border-accent outline-none transition-all font-sans text-sm text-text-primary placeholder:text-text-primary/20"
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-primary/60 ml-0.5">
                Access Protocol (Password)
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full p-4 bg-bg-primary border border-border-primary focus:border-accent outline-none transition-all font-sans text-sm text-text-primary placeholder:text-text-primary/20"
                onChange={handleChange}
                required
              />
            </div>

            <button className="w-full bg-text-primary text-bg-primary py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:text-white transition-all duration-500 group relative overflow-hidden">
              <span className="relative z-10">Initialize Session</span>
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-primary text-center">
            <p className="text-[11px] font-bold text-text-primary/40 uppercase tracking-widest">
              Not yet registered?{" "}
              <Link href="/register" className="text-accent hover:text-text-primary transition-colors underline underline-offset-4 decoration-accent/30 font-black ml-1">
                Join our network
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-4 text-text-primary/20">
          <div className="h-[1px] w-8 bg-current" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">StartEJ Intel v3.5</span>
          <div className="h-[1px] w-8 bg-current" />
        </div>
      </div>
    </div>
  );
}