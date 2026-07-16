import { ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { headers } from "next/headers";
import StorefrontTabs from "./StorefrontTabs";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="font-serif text-3xl text-rich-black mb-1">Storefront</h1>
        <p className="text-neutral-500 text-sm">Manage your homepage layout and static pages</p>
      </div>

      <StorefrontTabs />

      <div>
        {children}
      </div>
    </div>
  );
}
