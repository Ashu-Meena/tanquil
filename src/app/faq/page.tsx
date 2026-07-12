import Link from "next/link";

export const metadata = {
  title: "FAQ | Tranquil",
  description: "Frequently asked questions about Tranquil — shipping, exchanges, payments, and more.",
};

const faqs = [
  {
    q: "What sizes do you offer?",
    a: "We offer sizes XS through XL. Please refer to our size guide on each product page for exact measurements.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 5–7 business days. Once dispatched, you will receive a tracking link via WhatsApp.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "No, we do not offer COD. All orders must be paid via UPI before dispatch.",
  },
  {
    q: "Do you accept returns?",
    a: "No — we do not accept returns or offer refunds under any circumstances. All sales are final. Please review your order carefully before placing it.",
  },
  {
    q: "Can I cancel my order?",
    a: "No — orders cannot be cancelled once placed. Please ensure all details (size, color, quantity) are correct before completing your purchase.",
  },
  {
    q: "Do you offer exchanges?",
    a: "Yes, we offer size exchanges for the same product, subject to availability. You must contact us via WhatsApp at +91 92261 20292 within 72 hours of receiving your order. Items must be unworn, unwashed, and in original packaging with all tags attached.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you'll receive a tracking link via WhatsApp.",
  },
  {
    q: "Are the products as shown in photos?",
    a: "We try our best to represent colors accurately, but slight variations may occur due to screen calibration.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship across India only. International shipping is coming soon — stay tuned!",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4">
          <Link href="/" className="hover:text-[#C7A17A]">Home</Link> / FAQ
        </p>
        <h1 className="font-serif text-5xl text-[#111111] mb-12">Frequently Asked Questions</h1>
        <div className="space-y-0 divide-y divide-[#EFEFEF]">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-6 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-[#111111] list-none select-none hover:text-[#C7A17A] transition-colors">
                {faq.q}
                <span className="text-[#C7A17A] text-xl group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="mt-4 text-[#666666] leading-relaxed text-sm">{faq.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-16 bg-[#FAF8F5] border border-[#EFEFEF] p-8 text-center">
          <p className="text-[#111111] mb-4">Still have questions? We&apos;re here to help.</p>
          <Link
            href="/contact"
            className="inline-block bg-[#111111] hover:bg-[#C7A17A] text-white px-8 py-3 uppercase tracking-widest text-xs font-medium transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
