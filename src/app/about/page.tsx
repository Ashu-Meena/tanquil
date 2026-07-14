import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Our Story | Tranquil",
  description: "Tranquil was founded by a Gen Z girl who was tired of boring prints and outdated designs. Modern clothes for Gen Z girls and modern women who want to stand out.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero — full-width dark banner */}
      <div className="bg-rich-black pt-40 pb-20 text-center px-6">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-400">About</span>
        </p>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-sm p-6 w-40 h-40 flex items-center justify-center shadow-2xl">
            <Image
              src="/logo.jpg"
              alt="Tranquil Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="font-serif text-5xl lg:text-6xl text-white mb-4">Our Story</h1>
        <p className="text-neutral-400 text-sm uppercase tracking-[0.3em]">The outfit plug you didn&apos;t know you needed</p>
      </div>

      {/* Story body */}
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl py-20">

        {/* Opening hook */}
        <p className="font-serif text-3xl lg:text-4xl text-rich-black leading-snug mb-12 text-center">
          Hey girl, welcome to your<br />
          <span className="text-gold">dream wardrobe.</span>
        </p>

        <div className="space-y-7 text-warm-gray leading-relaxed text-lg">
          <p>
            Tranquil was founded by a <strong className="text-rich-black">Gen Z girl</strong> who was tired of seeing the same old boring prints and outdated designs everywhere. We realized that finding clothes that actually match the Pinterest boards in our heads shouldn&apos;t be so hard. So, we decided to make them ourselves.
          </p>
          <p>
            At Tranquil, we design <strong className="text-rich-black">modern clothes for Gen Z girls and modern women</strong> who want to stand out, not blend in. We create the exact pieces you&apos;ve been searching for — from the ultimate aesthetic beachwear and dream birthday dresses to the perfect outfits for dinner dates, brunch runs, and girl&apos;s day outings — and yes, even your mom&apos;s chic kitty parties!
          </p>
          <p>
            <strong className="text-rich-black">No boring prints. No recycled designs.</strong> Just unique, freshly designed pieces that actually belong in a modern wardrobe.
          </p>
          <p>
            We know what you want to wear before you even know it. Consider us your official <span className="italic text-gold font-medium">outfit plug</span>.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-16">
          <div className="flex-1 h-px bg-border-light" />
          <span className="text-gold text-xl font-serif">âœ¦</span>
          <div className="flex-1 h-px bg-border-light" />
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
          {[
            { icon: "âœ¦", title: "Unique Designs", body: "No boring prints. Every piece is freshly designed — you won't find it anywhere else." },
            { icon: "âœ¦", title: "Made for You", body: "From beachwear to birthday looks to brunch fits — we've got every occasion covered." },
            { icon: "âœ¦", title: "Gen Z Energy", body: "Founded by a Gen Z girl, designed for the girls who set the trends, not follow them." },
          ].map((v) => (
            <div key={v.title} className="p-6 border border-border-light rounded-sm hover:border-gold transition-colors group">
              <span className="text-gold text-2xl block mb-3">{v.icon}</span>
              <h3 className="font-serif text-lg text-rich-black mb-2">{v.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-ivory border border-border-light p-10">
          <p className="font-serif text-2xl text-rich-black mb-2">Ready to upgrade your wardrobe?</p>
          <p className="text-neutral-400 text-sm mb-6">Shop the latest drops — new styles added regularly.</p>
          <Link
            href="/collections/all"
            className="inline-block bg-rich-black hover:bg-gold text-white px-10 py-4 uppercase tracking-widest text-xs font-medium transition-colors"
          >
            Shop Now
          </Link>
        </div>

        {/* Attribution */}
        <div className="mt-12 text-center text-sm text-neutral-400">
          This website was designed and developed by <a href="https://samvix-technologies.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-rich-black transition-colors">Samvix Technologies</a>.
        </div>
      </div>
    </div>
  );
}
