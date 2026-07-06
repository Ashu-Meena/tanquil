import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tranquil Admin Panel",
  description: "Secure management for Tranquil store",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
