import type { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import PsrLogo from "@/components/PsrLogo";
import AppSidebarNav from "@/components/AppSidebarNav";
import { Globe, Lock, ShieldCheck } from "lucide-react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-900">
      {/* Modern Light Smart Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/90 bg-white shadow-2xs lg:flex">
        {/* Logo & Domain Indicator */}
        <div className="border-b border-slate-100 p-4">
          <PsrLogo variant="header" size="md" />

          {/* Domain Status Tag */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span className="font-mono font-bold">psr.bd</span>
            </div>
            <span className="rounded bg-emerald-200/60 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              অফিসিয়াল
            </span>
          </div>
        </div>

        {/* Dynamic Nav with Active Route Highlighting */}
        <div className="mt-3 flex-1 overflow-y-auto">
          <AppSidebarNav />
        </div>

        {/* User Session & Logout */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                {session?.name ? session.name.charAt(0) : "ব"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {session?.name ?? "আইনজীবী"}
                </p>
                <p className="truncate text-[10px] text-slate-500">{session?.email}</p>
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        {/* Mobile Header (Modern Light Glass) */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur shadow-2xs lg:hidden">
          <PsrLogo variant="compact" size="sm" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              psr.bd
            </span>
            <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
