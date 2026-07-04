import Link from "next/link";

export const metadata = { title: "Terms & Conditions | Tranquil", description: "Tranquil terms and conditions of use." };

export default function TermsPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4"><Link href="/" className="hover:text-[#C7A17A]">Home</Link> / Terms</p>
        <h1 className="font-serif text-5xl text-[#111111] mb-4">Terms & Conditions</h1>
        <p className="text-[#666666] mb-12">Last updated: July 2025</p>
        <div className="space-y-8 text-[#555555] leading-relaxed">
          {[
            { title: "Use of Website", body: "By accessing tranquil.co.in, you agree to these terms. You may not use our site for unlawful purposes or to infringe on the rights of others." },
            { title: "Orders & Payments", body: "All orders are subject to acceptance and availability. We reserve the right to cancel any order due to pricing errors, fraud, or stock unavailability. UPI payments are verified manually and orders are processed only after successful verification." },
            { title: "Pricing", body: "All prices are in Indian Rupees (₹) and include applicable GST. We reserve the right to modify prices at any time without prior notice." },
            { title: "Intellectual Property", body: "All content on this website including text, images, logos, and designs are the intellectual property of Tranquil and may not be reproduced without written permission." },
            { title: "Governing Law", body: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Mumbai, Maharashtra." },
          ].map(section => (
            <div key={section.title}>
              <h2 className="font-serif text-2xl text-[#111111] mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
