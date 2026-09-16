"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Globe, Lock, Menu, PenTool, ShieldCheck, X } from "lucide-react";
import PsrLogo from "@/components/PsrLogo";

interface LandingHeaderProps {
  onWritePostClick?: () => void;
}

export default function LandingHeader({ onWritePostClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWriteClick = () => {
    setMobileMenuOpen(false);
    if (onWritePostClick) {
      onWritePostClick();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-blog-writer"));
      scrollToSection("blog-section");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo with psr.bd */}
        <div className="flex items-center gap-3 sm:gap-4">
          <PsrLogo variant="header" size="md" />

          {/* Smart Domain Verification Pill */}
          <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-2xs">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span className="font-mono text-emerald-950 font-bold">psr.bd</span>
            <span className="text-[10px] text-emerald-700">· অফিসিয়াল প্ল্যাটফর্ম</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => scrollToSection("blog-section")}
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-700"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            কমিউনিটি ব্লগ
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("viral-tool")}
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-700"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ফ্রি অডিট চেকার
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="transition-colors hover:text-emerald-700"
          >
            আইনি ফিচার
          </button>
          <Link href="/lawyers" className="transition-colors hover:text-emerald-700">
            আইনজীবী প্যানেল
          </Link>
          <Link href="/calculators" className="transition-colors hover:text-emerald-700">
            ট্যাক্স ক্যালকুলেটর
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={handleWriteClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 hover:border-emerald-600/50"
          >
            <PenTool className="h-3.5 w-3.5 text-emerald-700" />
            ব্লগ লিখুন
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/40"
          >
            আইনজীবী পোর্টাল
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="মেনু খুলুন"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              https://psr.bd
            </span>
            <span className="text-[11px] text-slate-500">বাংলাদেশ ট্যাক্স কমপ্লায়েন্স</span>
          </div>
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => scrollToSection("blog-section")}
              className="flex items-center gap-2 text-left py-1 text-slate-700 hover:text-emerald-700"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              কমিউনিটি ব্লগ (ডেভেলপার ও ক্লায়েন্ট)
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("viral-tool")}
              className="flex items-center gap-2 text-left py-1 text-slate-700 hover:text-emerald-700"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ফ্রি অডিট ঝুঁকি চেকার
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-left py-1 text-slate-700 hover:text-emerald-700"
            >
              আইনি ফিচার ও নিয়মাবলী
            </button>
            <Link
              href="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 hover:text-emerald-700"
            >
              আইনজীবী প্যানেল
            </Link>
            <Link
              href="/calculators"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 hover:text-emerald-700"
            >
              ট্যাক্স ক্যালকুলেটর
            </Link>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleWriteClick}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800"
              >
                <PenTool className="h-4 w-4" />
                ব্লগ লিখুন (ডেভেলপার ও ক্লায়েন্ট)
              </button>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                আইনজীবী পোর্টাল ড্যাশবোর্ড
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
