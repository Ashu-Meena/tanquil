import Link from "next/link";

export const metadata = { title: "About Us | Tranquil", description: "The story behind Tranquil luxury fashion." };

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4"><Link href="/" className="hover:text-[#C7A17A]">Home</Link> / About</p>
        <h1 className="font-serif text-5xl text-[#111111] mb-10">Our Story</h1>
        <div className="space-y-6 text-[#555555] leading-relaxed text-lg">
          <p>Tranquil was born out of a simple belief: <strong className="text-[#111111]">every woman deserves to feel extraordinary</strong>. Founded in 2023 in Mumbai, we design luxury fashion pieces that blend couture-inspired craftsmanship with modern silhouettes.</p>
          <p>Each piece in our collection is thoughtfully designed, constructed from the finest fabrics sourced from Surat, Varanasi, and international mills. We collaborate with master artisans who bring intricate embellishments and handcrafted details to life.</p>
          <p>Our mission is to make statement luxury fashion accessible to the modern Indian woman — for every evening, every celebration, and every moment that deserves a little extra magic.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#EFEFEF] pt-16">
          {[{ num: "2023", label: "Founded" }, { num: "1,200+", label: "Happy Customers" }, { num: "100%", label: "Handcrafted" }].map(stat => (
            <div key={stat.num} className="text-center">
              <p className="font-serif text-4xl text-[#C7A17A] mb-2">{stat.num}</p>
              <p className="text-sm uppercase tracking-widest text-[#666666]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
