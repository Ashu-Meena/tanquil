import Link from "next/link";

export const metadata = {
  title: "Contact Us | Tranquil",
  description: "Visit The Tranquil Store in Pimpri-Chinchwad, Pune. Business hours 10am–9pm, all days open. Call or WhatsApp: +91 92261 20292.",
};

const CONTACT_DETAILS = [
  {
    label: "Address",
    value: "Kanwarram Park, Sant, Last Bungalow 3rd Lane, Opp. Sukhwani Citi, Near Royal World School, Phase 2, Vaibhav Nagar, Pimpri Colony, Pune – 411017",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    link: "https://share.google/ZjCsuVrExC932t0MS",
    linkLabel: "Get Directions →",
  },
  {
    label: "Business Hours",
    value: "10:00 AM – 9:00 PM",
    sub: "Open All Days · No Holidays",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: "Call & WhatsApp",
    value: "+91 92261 20292",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.36 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    link: "https://wa.me/919226120292",
    linkLabel: "Chat on WhatsApp →",
  },
  {
    label: "Email",
    value: "thetranquilstor@gmail.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    link: "mailto:thetranquilstor@gmail.com",
    linkLabel: "Send Email →",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-ivory min-h-screen pt-32 pb-0">
      {/* Hero */}
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl mb-16">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link> / Contact
        </p>
        <h1 className="font-serif text-5xl lg:text-6xl text-rich-black mb-4">Get In Touch</h1>
        <p className="text-neutral-500 text-lg max-w-xl">
          Come visit us, WhatsApp us, or drop an email — we&apos;re here for styling advice, order queries, and everything in between.
        </p>
      </div>

      {/* Two-column: info + form */}
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left — Contact Details */}
          <div className="space-y-8">
            {CONTACT_DETAILS.map((item) => (
              <div key={item.label} className="flex items-start gap-5">
                <div className="mt-0.5 text-gold shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">{item.label}</p>
                  <p className="text-rich-black font-medium text-sm leading-relaxed">{item.value}</p>
                  {item.sub && <p className="text-neutral-400 text-xs mt-0.5">{item.sub}</p>}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[10px] uppercase tracking-widest text-gold hover:text-rich-black transition-colors mt-2 border-b border-gold hover:border-rich-black pb-0.5"
                    >
                      {item.linkLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right — Contact Form */}
          <form className="bg-white border border-border-light p-8 lg:p-10 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.03)]">
            <h2 className="font-serif text-2xl text-rich-black mb-2">Send a Message</h2>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Your Name</label>
              <input type="text" className="w-full bg-transparent border-b border-border-light py-3 text-sm focus:outline-none focus:border-rich-black transition-colors placeholder-[#BBBBBB]" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Email</label>
              <input type="email" className="w-full bg-transparent border-b border-border-light py-3 text-sm focus:outline-none focus:border-rich-black transition-colors placeholder-[#BBBBBB]" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Phone / WhatsApp</label>
              <input type="tel" className="w-full bg-transparent border-b border-border-light py-3 text-sm focus:outline-none focus:border-rich-black transition-colors placeholder-[#BBBBBB]" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-transparent border-b border-border-light py-3 text-sm focus:outline-none focus:border-rich-black transition-colors resize-none placeholder-[#BBBBBB]" placeholder="How can we help you?" />
            </div>
            <button type="submit" className="w-full bg-rich-black hover:bg-gold text-white py-4 uppercase tracking-widest text-xs font-medium transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Full-width Map */}
      <div className="w-full h-[420px] lg:h-[500px] relative">
        <iframe
          title="The Tranquil Store — Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.4!2d73.8567!3d18.6298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDM3JzQ3LjMiTiA3M8KwNTEnMjQuMSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=Kanwarram+Park,+Vaibhav+Nagar,+Pimpri+Colony,+Pune,+Maharashtra+411017"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
        {/* Overlay badge */}
        <a
          href="https://share.google/ZjCsuVrExC932t0MS"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-6 left-6 bg-white shadow-lg px-5 py-3 flex items-center gap-3 hover:shadow-xl transition-shadow group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C7A17A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-rich-black font-medium group-hover:text-gold transition-colors">Open in Google Maps</span>
        </a>
      </div>
    </div>
  );
}
