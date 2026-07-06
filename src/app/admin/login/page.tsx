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
      setError(authError.message);
      setLoading(false);
      return;
    }

    // After login, router.refresh() triggers middleware to check if user is admin
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 border border-[#EFEFEF] shadow-sm rounded-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#111111] text-[#C7A17A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-3xl text-[#111111] tracking-widest uppercase">Tranquil Admin</h1>
          <p className="text-[#666666] text-sm mt-2">Sign in to access the control panel</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#EFEFEF] p-3 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A] transition-colors"
              placeholder="admin@tranquil.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#EFEFEF] p-3 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#C7A17A] text-white py-3.5 uppercase tracking-widest text-sm font-medium transition-colors rounded-sm disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
