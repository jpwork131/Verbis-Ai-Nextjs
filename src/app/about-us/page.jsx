"use client";
import Link from "next/link";
import MainNavbar from "@/components/ui/MainNavbar";
import Footer from "@/components/ui/Footer";

export default function AboutUs() {
  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">
      <MainNavbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 text-[var(--color-text-primary)]">
          About <span className="text-[var(--color-accent)]">StartEJ</span>
        </h1>
        
        <div className="prose prose-lg max-w-none text-[var(--color-text-primary)] opacity-90 font-body leading-relaxed space-y-6">
          <p>
            Welcome to <strong>StartEJ</strong>, your premier destination for the latest in startup news, 
            technology trends, and entrepreneurial intelligence. In a world where innovation moves at 
            the speed of light, we are dedicated to providing you with the clarity and insights 
            needed to navigate the ever-evolving business landscape.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p>
            Our mission is to empower the next generation of founders and innovators by delivering 
            high-quality, data-driven journalism and real-time market updates. We believe that 
            information is the ultimate fuel for growth, and we are committed to being the most 
            reliable source for the Indian and global startup ecosystem.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">What We Cover</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Funding & IPOs:</strong> Real-time alerts and in-depth analysis of investment rounds and public offerings.</li>
            <li><strong>Ecosystem Trends:</strong> Deep dives into the cultural and technological shifts defining the startup world.</li>
            <li><strong>Founder Stories:</strong> Unfiltered conversations with the builders who are shaping our future.</li>
            <li><strong>Policy & Regulation:</strong> Insights into the legal frameworks affecting businesses today.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Why StartEJ?</h2>
          <p>
            At StartEJ, we don't just report the news; we connect the dots. Our team of experienced 
            journalists and analysts work tirelessly to go beyond the headlines, providing context, 
            nuance, and a perspective that you won't find anywhere else.
          </p>

          <div className="mt-20 p-8 bg-slate-50 rounded-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold mb-4">Work With Us</h3>
            <p>
              Are you interested in collaborating or sharing your story? We are always looking for 
              fresh perspectives and groundbreaking updates from the community.
            </p>
            <Link 
              href="/contact-us" 
              className="inline-block mt-4 text-[var(--color-accent)] font-bold hover:underline"
            >
              Contact our newsroom →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
