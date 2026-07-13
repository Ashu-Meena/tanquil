"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function AnalyticsWrapper({ gaId }: { gaId: string }) {
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

  return <GoogleAnalytics gaId={gaId} />;
}
