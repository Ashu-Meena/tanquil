"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Admin login error:", authError);
      setError("Authentication failed. Please check your credentials.");
      setLoading(false);
      return;
    }

    // After login, router.refresh() triggers middleware to check if user is admin
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md bg-white p-6 md:p-8 border border-border-light shadow-sm rounded-sm">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 bg-rich-black text-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-rich-black tracking-widest uppercase">Tranquil Admin</h1>
          <p className="text-neutral-500 text-sm mt-2">Sign in to access the control panel</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-sm text-sm mb-6 border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rich-black mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border-light p-3 text-sm rounded-sm focus:outline-none focus:border-gold transition-colors"
              placeholder="admin@tranquil.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-rich-black mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border-light p-3 text-sm rounded-sm focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-rich-black hover:bg-gold text-white py-3.5 uppercase tracking-widest text-sm font-medium transition-colors rounded-sm disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
