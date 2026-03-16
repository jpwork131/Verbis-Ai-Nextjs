"use client";
import MainNavbar from "@/components/ui/MainNavbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default function Disclaimer() {
  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">
      <MainNavbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 text-[var(--color-text-primary)]">
          Legal <span className="text-[var(--color-accent)]">Disclaimer</span>
        </h1>
        
        <div className="prose prose-lg max-w-none text-[var(--color-text-primary)] opacity-90 font-body leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">No Investment Advice</h2>
            <p>
              The information provided on StartEJ is for general informational purposes only. 
              The content is not intended to be a substitute for professional investment, 
              financial, or legal advice. Always seek the advice of your qualified financial 
              provider with any questions you may have regarding investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Accuracy of Information</h2>
            <p>
              While we strive to provide accurate and up-to-date information, StartEJ makes no 
              respresentations or warranties of any kind, express or implied, about the 
              completeness, accuracy, reliability, suitability, or availability with respect 
              to the website or the information, products, or related graphics contained on 
              the website for any purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">External Links</h2>
            <p>
              Through this website, you are able to link to other websites which are not under 
              the control of StartEJ. We have no control over the nature, content, and availability 
              of those sites. The inclusion of any links does not necessarily imply a 
              recommendation or endorse the views expressed within them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p>
              In no event will StartEJ be liable for any loss or damage including without 
              limitation, indirect or consequential loss or damage, or any loss or damage 
              whatsoever arising from loss of data or profits arising out of, or in connection 
              with, the use of this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Content Ownership</h2>
            <p>
              All trademarks, brands, and logos mentioned on the site are property of their 
              respective owners. StartEJ does not claim ownership of the startup logos used 
              for representative purposes.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
