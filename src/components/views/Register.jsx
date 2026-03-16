"use client";
import { useState } from "react";
import { registerUser } from "@/services/auth";
import Link from 'next/link';
import { useRouter as useNavigate } from 'next/navigation';
import { ChevronLeft, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate.push("/login");
    } catch (err) {
      setError("Account creation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6 transition-colors duration-300 relative overflow-hidden">
      {/* Editorial Background Accents */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -ml-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -mr-40 -mb-40 pointer-events-none" />

      {/* Navigation Link */}
      <Link href="/login" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 hover:text-accent transition-all z-10">
        <ChevronLeft size={14} /> Back to Authorization
      </Link>

      <div className="w-full max-w-sm z-10">
        {/* Editorial Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-text-primary text-bg-primary mb-6 shadow-xl shadow-accent/10">
            <UserPlus size={20} />
          </div>
          <h2 className="font-serif text-5xl font-black tracking-tighter text-text-primary italic">
            Join the <span className="text-accent">Network</span>
          </h2>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40">
            Start Your Intellectual Journey
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
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full p-4 bg-bg-primary border border-border-primary focus:border-accent outline-none transition-all font-sans text-sm text-text-primary placeholder:text-text-primary/20"
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-primary/60 ml-0.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                className="w-full p-4 bg-bg-primary border border-border-primary focus:border-accent outline-none transition-all font-sans text-sm text-text-primary placeholder:text-text-primary/20"
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-primary/60 ml-0.5">
                Password
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
              <span className="relative z-10">Establish Account</span>
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center px-4">
          <p className="text-[9px] text-text-primary/30 uppercase tracking-widest leading-relaxed">
            By establishing an account, you agree to our 
            <span className="text-text-primary/60 font-bold mx-1">Protocols of Intelligence</span> 
            and 
            <span className="text-text-primary/60 font-bold mx-1">Privacy Mandates</span>.
          </p>
        </div>
      </div>
    </div>
  );
}