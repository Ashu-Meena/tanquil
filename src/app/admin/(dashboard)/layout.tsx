import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AntiInspect } from "@/components/admin/AntiInspect";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tranquil Admin Panel",
  description: "Secure management for Tranquil store",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('is_admin, role').eq('id', user.id).single();

  if (!profile || (!profile.is_admin && profile.role !== 'super_admin')) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ivory flex">
      <AntiInspect />
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden md:pl-64 w-full">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
