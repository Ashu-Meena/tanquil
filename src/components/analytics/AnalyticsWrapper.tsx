"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

export default function AnalyticsWrapper({ gaId, gtmId, nonce }: { gaId?: string, gtmId?: string, nonce?: string }) {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Check initial state
    const consent = localStorage.getItem("tranquil_cookie_consent");
    if (consent === "granted") {
      setConsentGranted(true);
    }

    // Listen for consent changes
    const handleConsentGranted = () => {
      setConsentGranted(true);
    };

    window.addEventListener("cookie_consent_granted", handleConsentGranted);
    return () => window.removeEventListener("cookie_consent_granted", handleConsentGranted);
  }, []);

  if (!consentGranted) return null;

  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} nonce={nonce} />}
      {gtmId && <GoogleTagManager gtmId={gtmId} nonce={nonce} />}
    </>
  );
}
