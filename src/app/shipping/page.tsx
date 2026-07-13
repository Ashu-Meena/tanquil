import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | Tranquil",
  description: "Tranquil shipping and delivery information.",
};

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
          <Link href="/" className="hover:text-gold">Home</Link> / Shipping
        </p>
        <h1 className="font-serif text-5xl text-rich-black mb-12">Shipping Policy</h1>
        <div className="space-y-10 text-[#555555] leading-relaxed">
          {[
            {
              title: "Prepaid Orders Only",
              body: "We accept UPI payments only. All orders are prepaid — Cash on Delivery (COD) is not available. Orders are processed only after payment is verified.",
            },
            {
              title: "Free Shipping",
              body: "Enjoy complimentary standard shipping on all prepaid orders above ₹10,000. For orders below this threshold, a flat shipping fee of ₹500 applies.",
            },
            {
              title: "Standard Delivery (5–7 Business Days)",
              body: "We ship via trusted courier partners across India. Once dispatched, you will receive a tracking ID via WhatsApp.",
            },
            {
              title: "Order Processing",
              body: "After payment verification, orders are typically processed within 24–48 hours on business days (Monday–Sunday, 10 AM–9 PM).",
            },
            {
              title: "No Returns or Cancellations",
              body: "All sales are final. We do not accept returns, refunds, or order cancellations. Exchanges are available — see our Exchange Policy for details.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-serif text-2xl text-rich-black mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
