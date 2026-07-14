"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-border-light text-center">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="font-serif text-2xl text-rich-black mb-4">
              Something went wrong
            </h2>
            
            <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
              We apologize for the inconvenience. An unexpected error has occurred on our servers. Our technical team has been notified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-2.5 bg-rich-black text-white text-sm font-medium hover:bg-gold transition-colors rounded-sm"
              >
                Try again
              </button>
              <Link 
                href="/"
                className="px-6 py-2.5 bg-white border border-border-light text-rich-black text-sm font-medium hover:bg-ivory transition-colors rounded-sm"
              >
                Return to home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
