import Link from "next/link";

export const metadata = {
  title: "Exchange Policy | Tranquil",
  description: "Tranquil exchange policy â€” no returns, exchange only within 72 hours of delivery.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-ivory min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
          <Link href="/" className="hover:text-gold">Home</Link> / Exchange Policy
        </p>
        <h1 className="font-serif text-5xl text-rich-black mb-4">Exchange Policy</h1>
        <p className="text-neutral-500 mb-12 text-lg">
          We do not accept returns or cancellations. However, we offer exchanges â€” please read the policy below carefully before placing your order.
        </p>

        {/* Important notice banner */}
        <div className="bg-[#FFF8E7] border border-[#F2D08E] text-[#B07B18] p-5 rounded-sm mb-10 text-sm leading-relaxed">
          <strong className="block mb-1 uppercase tracking-wider text-xs">Please Note</strong>
          All sales are final. We do <strong>not</strong> offer returns or refunds. Exchanges are the only option and are subject to the conditions listed below.
        </div>

        <div className="space-y-6 text-warm-gray leading-relaxed">
          {[
            {
              title: "No Returns",
              body: "We do not accept returns under any circumstances. Please review your order carefully â€” size, color, and quantity â€” before placing it.",
            },
            {
              title: "No Cancellations",
              body: "Orders cannot be cancelled once placed. Please ensure all details are correct at the time of ordering.",
            },
            {
              title: "Exchange Available",
              body: "Exchanges are available for a different size of the same product, subject to stock availability. To request an exchange, contact us via WhatsApp at +91 92261 20292 within 72 hours of receiving your order.",
            },
            {
              title: "Exchange Conditions",
              body: "Items must be unworn, unwashed, with all original tags attached and in the original packaging. Items showing signs of use, washing, or damage will not be accepted for exchange.",
            },
            {
              title: "How to Request an Exchange",
              body: "WhatsApp us at +91 92261 20292 with your order number, a photo of the item received, and the size you need. Our team will guide you through the next steps.",
            },
            {
              title: "Shipping for Exchanges",
              body: "The customer is responsible for shipping the item back to us. Once we receive and inspect the item, the exchanged product will be dispatched within 3â€“5 business days.",
            },
          ].map((section) => (
            <div key={section.title} className="bg-white border border-border-light p-6">
              <h2 className="font-serif text-xl text-rich-black mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border-light pt-8 text-center">
          <p className="text-neutral-500 text-sm mb-4">Have a question about your order?</p>
          <a
            href="https://wa.me/919226120292"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-rich-black hover:bg-gold text-white px-8 py-3 uppercase tracking-widest text-xs font-medium transition-colors"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}
