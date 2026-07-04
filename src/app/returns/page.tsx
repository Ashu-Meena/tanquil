import Link from "next/link";

export const metadata = { title: "Returns & Exchanges | Tranquil", description: "Tranquil return and exchange policy." };

export default function ReturnsPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4"><Link href="/" className="hover:text-[#C7A17A]">Home</Link> / Returns</p>
        <h1 className="font-serif text-5xl text-[#111111] mb-4">Returns & Exchanges</h1>
        <p className="text-[#666666] mb-12 text-lg">Your satisfaction is our priority. If something isn&apos;t right, we&apos;re here to make it right.</p>
        <div className="space-y-10 text-[#555555] leading-relaxed">
          {[
            { title: "Return Window", body: "Items can be returned within 7 days of delivery. The item must be unworn, unwashed, with all original tags attached and in its original packaging." },
            { title: "How to Initiate a Return", body: "Email us at returns@tranquil.co.in with your order number and reason for return. Our team will arrange a pickup at no extra cost." },
            { title: "Refund Processing", body: "Once we receive and inspect the item, refunds are processed within 5–7 business days to the original payment method." },
            { title: "Exchanges", body: "If you need a different size or color, we offer one free exchange per order. Subject to availability." },
            { title: "Non-Returnable Items", body: "Sale items, custom-made pieces, and items marked as Final Sale are not eligible for return or exchange." },
          ].map(section => (
            <div key={section.title} className="bg-white border border-[#EFEFEF] p-6">
              <h2 className="font-serif text-xl text-[#111111] mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
