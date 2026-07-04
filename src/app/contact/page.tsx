import Link from "next/link";

export const metadata = { title: "Contact Us | Tranquil", description: "Get in touch with the Tranquil team." };

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4"><Link href="/" className="hover:text-[#C7A17A]">Home</Link> / Contact</p>
        <h1 className="font-serif text-5xl text-[#111111] mb-4">Get In Touch</h1>
        <p className="text-[#666666] mb-12 text-lg">We&apos;d love to hear from you. Reach out for styling advice, order queries, or general enquiries.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {[
              { label: "Email", value: "hello@tranquil.co.in" },
              { label: "WhatsApp", value: "+91 98765 43210" },
              { label: "Business Hours", value: "Mon–Sat, 10am–7pm IST" },
              { label: "Instagram", value: "@tranquil.co.in" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-widest text-[#666666] mb-1">{item.label}</p>
                <p className="text-[#111111] font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <form className="bg-white border border-[#EFEFEF] p-8 space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Your Name</label>
              <input type="text" className="w-full border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Email</label>
              <input type="email" className="w-full border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Message</label>
              <textarea rows={4} className="w-full border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
