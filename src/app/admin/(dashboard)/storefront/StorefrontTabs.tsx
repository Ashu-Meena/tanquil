"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StorefrontTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Homepage CMS", href: "/admin/storefront/homepage" },
    { name: "Custom Pages", href: "/admin/storefront/pages" },
  ];

  return (
    <div className="border-b border-[#EFEFEF] mb-6 flex gap-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              isActive 
                ? "border-[#111111] text-[#111111]" 
                : "border-transparent text-[#999999] hover:text-[#666666]"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
