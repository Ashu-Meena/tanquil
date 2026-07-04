import Link from "next/link";

export const metadata = { title: "Shipping Policy | Tranquil", description: "Tranquil shipping and delivery information." };

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4"><Link href="/" className="hover:text-[#C7A17A]">Home</Link> / Shipping</p>
        <h1 className="font-serif text-5xl text-[#111111] mb-12">Shipping Policy</h1>
        <div className="space-y-10 text-[#555555] leading-relaxed">
          {[
            { title: "Free Shipping", body: "Enjoy complimentary standard shipping on all prepaid orders above ₹10,000. For orders below this threshold, a flat shipping fee of ₹500 applies." },
            { title: "Standard Delivery (5–7 Business Days)", body: "We ship via trusted courier partners across India. Once dispatched, you will receive a tracking ID via email and WhatsApp." },
            { title: "Express Delivery (2–3 Business Days)", body: "Express delivery is available at checkout for a fee of ₹199. Available in major metro cities." },
            { title: "COD (Cash on Delivery)", body: "COD is available across India. An additional COD charge of ₹60 applies on orders below ₹2,000. For orders above ₹2,000, COD is free." },
            { title: "Order Processing", body: "After payment verification, orders are typically processed within 24–48 hours on business days (Monday–Saturday)." },
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
