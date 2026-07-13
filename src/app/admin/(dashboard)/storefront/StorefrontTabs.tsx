"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StorefrontTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Homepage CMS", href: "/admin/storefront/homepage" },
  ];

  return (
    <div className="border-b border-border-light mb-6 flex gap-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              isActive 
                ? "border-rich-black text-rich-black" 
                : "border-transparent text-neutral-400 hover:text-neutral-500"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
