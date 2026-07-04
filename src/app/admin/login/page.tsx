"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Success! Middleware will now allow access
        router.push("/admin");
        router.refresh(); // Ensure we get fresh data
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="bg-white border border-[#EFEFEF] shadow-lg p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-[#C7A17A]" />
        </div>
        <h1 className="font-serif text-3xl text-[#111111] mb-2">Admin Secure Access</h1>
        <p className="text-[#666666] text-sm mb-8">This area is protected. Please enter the master password.</p>
        
        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin Password"
              disabled={loading}
              className="w-full border border-[#EFEFEF] px-4 py-3 pr-12 focus:outline-none focus:border-[#C7A17A] text-sm disabled:opacity-50 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-3 uppercase tracking-widest text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : null}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
