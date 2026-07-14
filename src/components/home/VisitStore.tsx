export default function VisitStore() {
  return (
    <section className="bg-rich-black text-white py-10 lg:py-14">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-7">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gold mb-2">Come Find Us</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-white">Visit Our Store</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-2xl">
          {/* Left â€” Map */}
          <div className="relative w-full h-[220px] lg:h-auto lg:min-h-[260px]">
            <iframe
              title="Tranquil Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.4!2d73.8567!3d18.6298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDM3JzQ3LjMiTiA3M8KwNTEnMjQuMSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=Kanwarram+Park,+Sant,+Last+Bungalow+3rd+lane,+opp.+Sukhwani+citi,+Vaibhav+Nagar,+Pimpri+Colony,+Pune,+Maharashtra+411017"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Right â€” Store Info */}
          <div className="bg-[#1A1A1A] p-6 lg:p-8 flex flex-col justify-center gap-5">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="mt-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7A17A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Address</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Kanwarram Park, Sant, Last Bungalow 3rd Lane,<br />
                  Opp. Sukhwani Citi, Near Royal World School,<br />
                  Phase 2, Vaibhav Nagar, Pimpri Colony,<br />
                  Pune, Maharashtra â€“ 411017
                </p>
                <a
                  href="https://share.google/ZjCsuVrExC932t0MS"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold hover:text-white transition-colors mt-3 border-b border-gold hover:border-white pb-0.5"
                >
                  Get Directions
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
                </a>
              </div>
            </div>

            <div className="border-t border-[#2A2A2A]" />

            {/* Hours */}
            <div className="flex items-start gap-4">
              <div className="mt-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7A17A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Hours</p>
                <p className="text-neutral-400 text-sm">10:00 AM â€“ 9:00 PM</p>
                <p className="text-neutral-400 text-xs mt-1 uppercase tracking-widest">Open All Days</p>
              </div>
            </div>

            <div className="border-t border-[#2A2A2A]" />

            {/* Contact */}
            <div className="flex items-start gap-4">
              <div className="mt-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7A17A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.36 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Call / WhatsApp</p>
                <a href="tel:+919226120292" className="text-neutral-400 text-sm hover:text-white transition-colors">+91 92261 20292</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
