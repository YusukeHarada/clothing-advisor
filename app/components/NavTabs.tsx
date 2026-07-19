"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "今日の服装" },
  { href: "/changeover", label: "衣替え" },
  { href: "/settings", label: "設定" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-black/10 dark:border-white/10">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              isActive
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-black/60 dark:text-white/60"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
