"use client";
import MainNavbar from "@/components/ui/MainNavbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default function TermsOfUse() {
  const lastUpdated = "March 16, 2026";

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">
      <MainNavbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text-primary)]">
          Terms of <span className="text-[var(--color-accent)]">Use</span>
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-12">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none text-[var(--color-text-primary)] opacity-90 font-body leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using StartEJ, you agree to be bound by these Terms of Use and all 
              applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on StartEJ's 
              website for personal, non-commercial transitory viewing only. This is the grant 
              of a license, not a transfer of title.
            </p>
            <p>Under this license, you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose or public display.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p>
              The materials on StartEJ's website are provided on an 'as is' basis. StartEJ makes 
              no warranties, expressed or implied, and hereby disclaims and negates all other 
              warranties including, without limitation, implied warranties or conditions of 
              merchantability, fitness for a particular purpose, or non-infringement of 
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
            <p>
              In no event shall StartEJ or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business 
              interruption) arising out of the use or inability to use the materials on 
              StartEJ's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Revisions and Errata</h2>
            <p>
              The materials appearing on StartEJ's website could include technical, typographical, 
              or photographic errors. StartEJ does not warrant that any of the materials on its 
              website are accurate, complete, or current. We may make changes to the materials 
              at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the 
              laws and you irrevocably submit to the exclusive jurisdiction of the courts 
              in that State or location.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
