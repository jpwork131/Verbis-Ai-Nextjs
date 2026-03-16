"use client";
import { useState } from "react";
import MainNavbar from "@/components/ui/MainNavbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          data: formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <MainNavbar />
      
      <main className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="text-[var(--color-accent)]">Touch</span>
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Have a story to share or a question about our services? Our team is always ready to 
            connect with the ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Us</h3>
                <p className="text-[var(--color-text-muted)] text-sm">newsroom@startej.com</p>
                <p className="text-[var(--color-text-muted)] text-sm">contact@startej.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Call Us</h3>
                <p className="text-[var(--color-text-muted)] text-sm">+91 (800) 123-4567</p>
                <p className="text-[var(--color-text-muted)] text-sm">Mon-Fri, 9am - 6pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Our Location</h3>
                <p className="text-[var(--color-text-muted)] text-sm">Tech Intelligence Hub, MG Road</p>
                <p className="text-[var(--color-text-muted)] text-sm">Bangalore, KA 560001, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-slate-50 p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">FullName</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email Address</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Subject</label>
                <input 
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Collaboratoin Inquiry"
                  className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Your Message</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="5"
                  placeholder="How can we help you?"
                  className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all resize-none"
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="bg-[var(--color-accent)] text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-[var(--color-accent-dark)] transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-accent)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>Sending... <Loader2 size={16} className="animate-spin" /></>
                ) : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
