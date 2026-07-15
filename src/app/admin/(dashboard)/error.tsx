"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Admin Dashboard Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center bg-ivory p-6 min-h-[400px]">
      <div className="max-w-md w-full bg-white p-8 shadow-sm flex flex-col items-center text-center border border-border-light rounded-md">
        <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        
        <h2 className="font-serif text-xl text-rich-black mb-2">
          Dashboard Widget Error
        </h2>
        
        <p className="text-sm text-neutral-500 mb-6">
          This section of the dashboard encountered an unexpected error and could not be loaded.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-rich-black text-white px-6 py-2.5 text-xs tracking-wider uppercase hover:bg-gold transition-colors duration-300 rounded-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload Widget
        </button>
      </div>
    </div>
  );
}
