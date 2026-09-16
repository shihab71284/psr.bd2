"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "মূল পাতা ও ব্লগ", icon: "🌐" },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: "🏠" },
  { href: "/clients", label: "ক্লায়েন্ট ব্যবস্থাপনা", icon: "👥" },
  { href: "/gifts", label: "দানকর ট্র্যাকিং (আইন ১৯৯০)", icon: "🎁" },
  { href: "/lawyers", label: "আইনজীবী প্যানেল", icon: "⚖️" },
  { href: "/calculators", label: "ক্যালকুলেটর", icon: "🧮" },
  { href: "/deadlines", label: "সময়সীমা ক্যালেন্ডার", icon: "📅" },
  { href: "/knowledge-base", label: "জ্ঞানভান্ডার", icon: "📚" },
];

export default function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
              isActive
                ? "bg-emerald-50/90 text-emerald-900 border border-emerald-200/80 shadow-2xs font-bold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base leading-none transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>

            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
