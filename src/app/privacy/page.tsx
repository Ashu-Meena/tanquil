import Link from "next/link";

export const metadata = { title: "Privacy Policy | Tranquil", description: "How Tranquil collects and uses your data." };

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4"><Link href="/" className="hover:text-gold">Home</Link> / Privacy</p>
        <h1 className="font-serif text-5xl text-rich-black mb-4">Privacy Policy</h1>
        <p className="text-neutral-500 mb-12">Last updated: July 2025</p>
        <div className="space-y-8 text-[#555555] leading-relaxed prose prose-sm max-w-none">
          <section>
            <h2 className="font-serif text-2xl text-rich-black mb-3">Information We Collect</h2>
            <p>When you place an order or create an account on Tranquil, we collect your name, email address, phone number, and shipping address. We also collect payment-related information (UTR/transaction ID) for UPI verification — we do not store full card details.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-rich-black mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To send order confirmation and shipping updates</li>
              <li>To improve our website and services</li>
              <li>To send promotional emails (with your consent only)</li>
            </ul>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-rich-black mb-3">Data Security</h2>
            <p>Your data is stored securely using Supabase infrastructure with row-level security policies. We never sell or share your personal data with third parties for marketing purposes.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-rich-black mb-3">Contact</h2>
            <p>For privacy concerns, write to us at <a href="mailto:privacy@tranquil.co.in" className="text-gold hover:underline">privacy@tranquil.co.in</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
