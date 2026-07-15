"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-6">
      <div className="max-w-md w-full bg-white p-12 text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        
        <h1 className="font-serif text-3xl tracking-widest text-rich-black uppercase mb-4">
          Unexpected Interruption
        </h1>
        
        <p className="text-neutral-500 mb-8 leading-relaxed">
          We apologize, but something went wrong while loading this page. Our team has been notified of this issue.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => reset()}
            className="w-full bg-rich-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-300"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full border border-rich-black text-rich-black py-4 text-xs tracking-[0.2em] uppercase hover:bg-rich-black hover:text-white transition-colors duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
