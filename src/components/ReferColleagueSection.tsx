"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Gift,
  Share2,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface ReferColleagueSectionProps {
  lawyerName?: string;
  userId?: string;
}

export default function ReferColleagueSection({
  lawyerName = "বিজ্ঞ আইনজীবী",
  userId = "u-demo-1",
}: ReferColleagueSectionProps) {
  // Generate a clean, unique and memorable referral code based on the user
  const derivedCode = (() => {
    // Generate deterministic 4 digits from userId
    let hash = 0;
    const str = userId + (lawyerName || "lawyer");
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const suffix = Math.abs(hash % 9000) + 1000;
    return `PSR-BD-${suffix}`;
  })();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/login?ref=${derivedCode}`
      : `https://psr.bd/login?ref=${derivedCode}`;

  const shareText = `আসসালামু আলাইকুম, আমি psr.bd প্ল্যাটফর্মে আইটি-১১ রিটার্ন, পিএসআর ভেরিফিকেশন ও অডিট রিস্ক স্ক্যানিং পরিচালনা করছি। আমার রেফারেল কোড "${derivedCode}" ব্যবহার করে সাইন-আপ করলে প্রথম ৩ মাস ২০% ডিসকাউন্ট এবং ফ্রি অডিট রিস্ক চেকার এক্সেস পাবেন: ${referralLink}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(derivedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted in iframe
      const input = document.createElement("input");
      input.value = derivedCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      "BTCP প্ল্যাটফর্মে কর আইনজীবী হিসেবে যোগদানের আমন্ত্রণ"
    );
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="refer-colleague-section"
      aria-label="সহকর্মী আইনজীবীকে রেফার করুন"
      className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-6 shadow-sm transition hover:shadow"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Header & Details */}
        <div className="max-w-xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Gift className="h-3.5 w-3.5 text-emerald-700" />
            <span>রেফারেল প্রোগ্রাম · Refer a Colleague</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            সহকর্মী আইনজীবীকে আমন্ত্রণ জানান ও বোনাস ক্রেডিট পান
          </h2>

          <p className="text-sm leading-relaxed text-slate-600">
            বিজ্ঞ {lawyerName}, আপনার সহকর্মী কর আইনজীবী বা আইটিপিদের psr.bd প্ল্যাটফর্মে যুক্ত করুন। প্রতিটি সফল নিবন্ধনে আপনি পাবেন{" "}
            <span className="font-semibold text-emerald-700">১ মাসের ফ্রি অডিট ক্রেডিট</span> এবং{" "}
            <span className="font-semibold text-emerald-700">৫টি অতিরিক্ত ক্লায়েন্ট ফাইল স্লট</span>।
          </p>
        </div>

        {/* Right column: Unique Referral Code & Copy Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              আপনার অনন্য রেফারেল কোড
            </span>
            <div
              id="referral-code-display-box"
              className="inline-flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-emerald-500/70 bg-white px-4 py-2.5 shadow-sm"
            >
              <code className="font-mono text-lg font-extrabold tracking-wider text-emerald-800">
                {derivedCode}
              </code>
              <button
                id="btn-copy-referral-code"
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                title="রেফারেল কোড কপি করুন"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-200" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>কপি কোড</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons: Copy Link & Share */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              id="btn-copy-referral-link"
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">লিংক কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>রেফারেল লিংক কপি</span>
                </>
              )}
            </button>

            <button
              id="btn-share-whatsapp"
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
              title="হোয়াটসঅ্যাপে শেয়ার করুন"
            >
              <span>হোয়াটসঅ্যাপ</span>
              <ArrowRight className="h-3 w-3" />
            </button>

            <button
              id="btn-share-email"
              type="button"
              onClick={handleEmailShare}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="ইমেইলে আমন্ত্রণ পাঠান"
            >
              <span>ইমেইল</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rewards & Incentives Cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 pt-5 border-t border-emerald-100/80 sm:grid-cols-3">
        <div
          id="referral-perk-1"
          className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-3.5 shadow-xs"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">১ মাসের কমপ্লায়েন্স বোনাস</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-normal">
              প্রতি সফল নিবন্ধনে সম্পূর্ণ বিনামূল্যে আনলিমিটেড অডিট রিস্ক স্ক্যান।
            </p>
          </div>
        </div>

        <div
          id="referral-perk-2"
          className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-3.5 shadow-xs"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">+৫টি অতিরিক্ত ক্লায়েন্ট ফাইল</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-normal">
              আপনার প্র্যাকটিস এক্সপ্যানশনের জন্য বাড়তি ফাইল ডাটাবেজ ক্যাপাসিটি।
            </p>
          </div>
        </div>

        <div
          id="referral-perk-3"
          className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-3.5 shadow-xs"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">সহকর্মীর জন্য ২০% ডিসকাউন্ট</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-normal">
              আমন্ত্রিত আইনজীবী পাবেন বার কাউন্সিল স্পেশাল কোটায় ৩ মাসের ছাড়।
            </p>
          </div>
        </div>
      </div>

      {/* Mini Referral Performance Tracker */}
      <div
        id="referral-performance-tracker"
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900/5 px-4 py-2.5 text-xs text-slate-600"
      >
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-800">আপনার রেফারেল অগ্রগতি:</span>
          <span>আমন্ত্রিত: <strong className="text-slate-900">২ জন</strong></span>
          <span className="text-slate-300">|</span>
          <span>সক্রিয়: <strong className="text-emerald-700">১ জন</strong></span>
          <span className="text-slate-300">|</span>
          <span>অর্জিত বোনাস: <strong className="text-emerald-700">১ মাস সক্রিয়</strong></span>
        </div>
        <div className="text-[11px] text-slate-500">
          কোডটি নিবন্ধনের সময় বা সাবস্ক্রিপশন পেইজে রিডিম করা যাবে
        </div>
      </div>
    </section>
  );
}
