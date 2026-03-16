"use client";
import MainNavbar from "@/components/ui/MainNavbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default function PrivacyPolicy() {
  const lastUpdated = "March 16, 2026";

  return (
    <div className="entrackr-theme min-h-screen bg-[var(--color-bg)]">
      <MainNavbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text-primary)]">
          Privacy <span className="text-[var(--color-accent)]">Policy</span>
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-12">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none text-[var(--color-text-primary)] opacity-90 font-body leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p>
              At StartEJ, we are committed to protecting your privacy. This Privacy Policy explains how 
              we collect, use, and safeguard your personal information when you visit our website 
              and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p>We may collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Information you provide:</strong> When you subscribe to our newsletter, create an account, or contact us.</li>
              <li><strong>Automated collection:</strong> We use cookies and similar technologies to collect information about your browsing behavior and device.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p>Your information helps us to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personalize your experience and deliver relevant content.</li>
              <li>Improve our website and services based on user feedback.</li>
              <li>Send periodic emails regarding our latest news and updates.</li>
              <li>Maintain the security of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal 
              information. However, no method of transmission over the internet is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information 
              to outside parties except for trusted third parties who assist us in operating our 
              website, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights regarding your personal data, 
              including the right to access, correct, or delete the information we hold about you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, you may contact us at 
              <strong> privacy@startej.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
