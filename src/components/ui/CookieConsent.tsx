"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or denied
    const consent = localStorage.getItem("tranquil_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("tranquil_cookie_consent", accepted ? "granted" : "denied");
    setShow(false);
    
    // If accepted, trigger a custom event so AnalyticsWrapper can respond immediately
    if (accepted) {
      window.dispatchEvent(new Event("cookie_consent_granted"));
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[400px] bg-white border border-border-light shadow-2xl z-[100] p-6 rounded-sm">
      <button 
        onClick={() => setShow(false)}
        className="absolute top-4 right-4 text-neutral-400 hover:text-rich-black transition-colors"
        aria-label="Close cookie banner"
      >
        <X className="w-4 h-4" />
      </button>
      <h3 className="font-serif text-lg mb-2 text-rich-black">We value your privacy</h3>
      <p className="text-sm text-neutral-500 mb-4">
        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => handleConsent(true)}
          className="flex-1 bg-rich-black hover:bg-gold text-white py-2 text-xs uppercase tracking-widest font-medium transition-colors"
        >
          Accept All
        </button>
        <button 
          onClick={() => handleConsent(false)}
          className="flex-1 bg-white border border-border-light hover:border-rich-black text-rich-black py-2 text-xs uppercase tracking-widest font-medium transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
