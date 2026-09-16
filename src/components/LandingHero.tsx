"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, FileText, Lock, PenTool, Shield, Sparkles, TrendingUp } from "lucide-react";

interface LandingHeroProps {
  onWriteBlogClick?: () => void;
}

export default function LandingHero({ onWriteBlogClick }: LandingHeroProps) {
  const scrollToBlog = () => {
    if (onWriteBlogClick) {
      onWriteBlogClick();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-blog-writer"));
      const elem = document.getElementById("blog-section");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTool = () => {
    const elem = document.getElementById("viral-tool");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/50 pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background soft grid accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Regulatory live pill with psr.bd */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-900 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono font-bold text-emerald-950 bg-white/90 px-2 py-0.5 rounded border border-emerald-300">
              psr.bd
            </span>
            <span>আয়কর আইন ২০২৩ ও অডিট নির্দেশিকা ২০২৫-২০২৬ কমপ্লায়েন্ট</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.18]">
            বাংলাদেশের প্রথম{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              স্মার্ট ট্যাক্স অডিট ও পিএসআর
            </span>{" "}
            কমপ্লায়েন্স প্ল্যাটফর্ম
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-base text-slate-600 sm:text-lg leading-relaxed">
            কর আইনজীবী, ডেটা বিশেষজ্ঞ, প্রযুক্তি আর্কিটেক্ট ও সাধারণ করদাতাদের সমন্বিত হাব। 
            ধারা ২৬৪ এর পিএসআর (Proof of Submission of Return) প্রস্তুতি, ধারা ১০৪ এর ১৫% আয় বৃদ্ধি অডিট শিল্ড ও ধারা ১৬৬ হিসাব খাতা অডিট ট্র্যাকিং — সব এক ডোমেইনে: <strong className="font-mono text-emerald-800">psr.bd</strong>
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={scrollToBlog}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-[0.99]"
            >
              <PenTool className="h-4 w-4" />
              লাউঞ্জিং পেজেই ব্লগ লিখুন
            </button>

            <button
              type="button"
              onClick={scrollToTool}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              ফ্রি অডিট ঝুঁকি চেকার
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              আইনজীবী ড্যাশবোর্ড
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ধারা ১০৪ স্বনির্ধারণী সুরক্ষা
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" />
              দানকর আইন ১৯৯০ ভেরিফায়েড
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              সম্পূর্ণ গোপনীয় ও নিরাপদ
            </span>
          </div>
        </div>

        {/* 4 Feature highlight blocks */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ধারা ১০৪ অডিট শিল্ড</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              পূর্ববর্তী বছরের তুলনায় ১৫% বা তদূর্ধ্ব আয় বৃদ্ধি পেলে এনবিআর অডিট সিলেকশন থেকে স্বয়ংক্রিয় আইনি সুরক্ষা।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/70 text-indigo-700">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ধারা ১৬৬ হিসাব ও ভাউচার</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              বাধ্যতামূলক হিসাব খাতার ঘাটতি ও ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক নগদ ঋণের ঝুঁকি শনাক্তকরণ।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/70 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">দানকর ট্র্যাকিং (১৯৯০)</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              রক্তের সম্পর্কের আত্মীয়দের অব্যাহতি ও অন্যান্য প্রাপকদের ৫%, ১০%, ১৫%, ২০% প্রগ্রেসিভ স্ল্যাব ক্যালকুলেশন।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100/70 text-sky-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">মুক্ত ব্লগ ও জ্ঞানভান্ডার</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              ডেভেলপার আর্কিটেকচার নোট এবং ক্লায়েন্টদের বাস্তব সাফল্যের অভিজ্ঞতা সরাসরি লাউঞ্জিং পেজে প্রকাশ ও সোশ্যাল শেয়ার।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
