import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import StorefrontTabs from "./StorefrontTabs";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="font-serif text-3xl text-[#111111] mb-1">Storefront</h1>
        <p className="text-[#666666] text-sm">Manage your homepage layout and static pages</p>
      </div>

      <StorefrontTabs />

      <div>
        {children}
      </div>
    </div>
  );
}
