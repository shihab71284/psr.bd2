"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  DollarSign,
  Info,
  Percent,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ViralTaxTool() {
  const [currentIncome, setCurrentIncome] = useState<string>("1200000");
  const [prevIncome, setPrevIncome] = useState<string>("1000000");
  const [taxpayerGender, setTaxpayerGender] = useState<"general" | "female_senior">("general");
  const [sameSource, setSameSource] = useState<boolean>(true);
  const [hasLargeCashLoan, setHasLargeCashLoan] = useState<boolean>(false);
  const [hasBooksOfAccounts, setHasBooksOfAccounts] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const evaluation = useMemo(() => {
    const cur = Math.max(0, Number(currentIncome) || 0);
    const prev = Math.max(0, Number(prevIncome) || 0);

    // Section 104: 15% Growth Shield rule
    let growthPercent = 0;
    if (prev > 0) {
      growthPercent = ((cur - prev) / prev) * 100;
    } else if (cur > 0) {
      growthPercent = 100;
    }

    const isShieldEligible = growthPercent >= 15 && sameSource && prev > 0;

    // Tax calculation estimate based on Income Tax Act 2023 slabs
    const exemptionLimit = taxpayerGender === "female_senior" ? 400000 : 350000;
    let taxable = Math.max(0, cur - exemptionLimit);
    let estimatedTax = 0;

    if (taxable > 0) {
      const slab1 = Math.min(taxable, 100000); // 5% on next 1L
      estimatedTax += slab1 * 0.05;
      taxable -= slab1;
    }
    if (taxable > 0) {
      const slab2 = Math.min(taxable, 400000); // 10% on next 4L
      estimatedTax += slab2 * 0.1;
      taxable -= slab2;
    }
    if (taxable > 0) {
      const slab3 = Math.min(taxable, 500000); // 15% on next 5L
      estimatedTax += slab3 * 0.15;
      taxable -= slab3;
    }
    if (taxable > 0) {
      const slab4 = Math.min(taxable, 500000); // 20% on next 5L
      estimatedTax += slab4 * 0.2;
      taxable -= slab4;
    }
    if (taxable > 0) {
      estimatedTax += taxable * 0.25; // 25% on remainder
    }

    // Minimum tax
    if (cur > exemptionLimit && estimatedTax < 5000) {
      estimatedTax = 5000;
    }

    // Potential Exposure penalty for non-bank loan > 5 lakh (Section 104/272)
    let loanPenaltyExposure = 0;
    if (hasLargeCashLoan) {
      loanPenaltyExposure = 500000 * 0.25; // estimated 25% tax + penalty
    }

    // Compliance Risk Score (0 - 100)
    let riskScore = 15; // baseline
    if (!isShieldEligible) riskScore += 35;
    if (hasLargeCashLoan) riskScore += 30;
    if (!hasBooksOfAccounts) riskScore += 20;
    riskScore = Math.min(100, riskScore);

    return {
      cur,
      prev,
      growthPercent: Number(growthPercent.toFixed(1)),
      isShieldEligible,
      exemptionLimit,
      estimatedTax: Math.round(estimatedTax),
      loanPenaltyExposure,
      riskScore,
    };
  }, [currentIncome, prevIncome, taxpayerGender, sameSource, hasLargeCashLoan, hasBooksOfAccounts]);

  const fmt = (num: number) => "৳" + num.toLocaleString("en-IN");

  const getShareText = () => {
    const shieldStatus = evaluation.isShieldEligible
      ? "🛡️ ধারা ১০৪ এর ১৫% আয় বৃদ্ধি অডিট শিল্ড প্রাপ্ত!"
      : "⚠️ রিটার্নে অতিরিক্ত অডিট স্ক্রুটিনির ঝুঁকি রয়েছে।";

    return `আমি psr.bd প্ল্যাটফর্মে আমার আয়কর অডিট ঝুঁকি পরীক্ষা করেছি:\n📊 আয় প্রবৃদ্ধি: ${evaluation.growthPercent}%\n${shieldStatus}\n💰 আনুমানিক প্রদেয় কর: ${fmt(evaluation.estimatedTax)}\n\nআপনিও বিনামূল্যে আপনার কর ও অডিট রিস্ক চেক করুন: ${typeof window !== "undefined" ? window.location.origin : "https://psr.bd"}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://psr.bd");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(getShareText())}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://psr.bd");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="viral-tool" className="py-14 sm:py-20 bg-slate-50/60 border-y border-slate-200/80 text-slate-900 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>psr.bd · সবার জন্য সম্পূর্ণ বিনামূল্যে উন্মুক্ত</span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            ইনস্ট্যান্ট আয়কর অডিট ঝুঁকি ও প্রবৃদ্ধি শিল্ড সিমুলেটর
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            আয়কর আইন ২০২৩ এর ধারা ১০৪ অনুসারে আপনার প্রস্তাবিত রিটার্ন কি এনবিআরের অডিট সিলেকশন থেকে আইনিভাবে সুরক্ষিত? 
            তাৎক্ষণিকভাবে যাচাই করুন এবং রিপোর্টটি সহকর্মী ও বন্ধুদের সাথে শেয়ার করুন।
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Input Controls (Left Column, 6 cols) - Modern Light Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              আপনার আয়ের তথ্য প্রদান করুন
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  পূর্ববর্তী করবর্ষের মোট আয় (টাকায়)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    value={prevIncome}
                    onChange={(e) => setPrevIncome(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2 pl-8 pr-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="১০,০০,০০০"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  চলতি করবর্ষের প্রস্তাবিত মোট আয় (টাকায়)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    value={currentIncome}
                    onChange={(e) => setCurrentIncome(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2 pl-8 pr-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="১২,০০,০০০"
                  />
                </div>
              </div>
            </div>

            {/* Category / Gender toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                করদাতার করমুক্ত সীমা ক্যাটাগরি
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTaxpayerGender("general")}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition-all ${
                    taxpayerGender === "general"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  সাধারণ ব্যক্তি (করমুক্ত ৳৩,৫০,০০০)
                </button>
                <button
                  type="button"
                  onClick={() => setTaxpayerGender("female_senior")}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition-all ${
                    taxpayerGender === "female_senior"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  নারী বা ৬৫+ প্রবীণ (করমুক্ত ৳৪,০০,০০০)
                </button>
              </div>
            </div>

            {/* Compliance checklist toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
                <span className="font-medium text-slate-800">
                  আয়ের উৎস কি পূর্বের বছরের মতোই বিদ্যমান আছে?
                </span>
                <input
                  type="checkbox"
                  checked={sameSource}
                  onChange={(e) => setSameSource(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
                <span className="font-medium text-slate-800">
                  ব্যাংক হিসাব ছাড়া ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক নগদ ঋণ আছে?
                </span>
                <input
                  type="checkbox"
                  checked={hasLargeCashLoan}
                  onChange={(e) => setHasLargeCashLoan(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
                <span className="font-medium text-slate-800">
                  ধারা ১৬৬ অনুসারে আয়-ব্যয়ের হিসাব খাতা ও ভাউচার সংরক্ষিত আছে?
                </span>
                <input
                  type="checkbox"
                  checked={hasBooksOfAccounts}
                  onChange={(e) => setHasBooksOfAccounts(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Real-time Dynamic Result Card (Right Column, 6 cols) - Modern Smart Light */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 p-6 shadow-xs lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  স্বয়ংক্রিয় আইনি মূল্যায়ন ফলাফল
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-900">
                  আইন ২০২৩ ধারা ১০৪
                </span>
              </div>

              {/* Status Banner */}
              <div
                className={`mt-4 rounded-xl p-4 border flex items-start gap-3.5 shadow-2xs ${
                  evaluation.isShieldEligible
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : "border-amber-300 bg-amber-50 text-amber-950"
                }`}
              >
                {evaluation.isShieldEligible ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {evaluation.isShieldEligible
                      ? "ধারা ১০৪ স্বনির্ধারণী অডিট শিল্ড প্রাপ্ত (Shielded)"
                      : "অডিট সতর্কতা: অতিরিক্ত যাচাই-বাছাইয়ের সম্ভাবনা"}
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {evaluation.isShieldEligible
                      ? `আপনার আয় পূর্বের বছরের তুলনায় ${evaluation.growthPercent}% বৃদ্ধি পেয়েছে (≥১৫% শর্ত পূরণ)। এনবিআর ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে সাধারণ অডিট স্ক্রুটিনি থেকে আপনি সুরক্ষিত!`
                      : `আপনার প্রবৃদ্ধি ${evaluation.growthPercent}%। ধারা ১০৪ অনুসারে ন্যূনতম ১৫% বৃদ্ধি না থাকলে ফাইলটি র্যান্ডম অডিটে পড়ার ঝুঁকি থাকে।`}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Percent className="h-3 w-3 text-emerald-600" />
                    আয় প্রবৃদ্ধি হার
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {evaluation.growthPercent > 0 ? `+${evaluation.growthPercent}%` : `${evaluation.growthPercent}%`}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-emerald-600" />
                    আনুমানিক প্রদেয় কর
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-emerald-700 font-mono">
                    {fmt(evaluation.estimatedTax)}
                  </p>
                </div>
              </div>

              {/* Exposure flags if any */}
              {evaluation.loanPenaltyExposure > 0 && (
                <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 flex items-center gap-2 shadow-2xs">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>
                    ব্যাংক প্রমাণক ছাড়া ৫ লাখের বেশি ঋণে সম্ভাব্য এক্সপোজার:{" "}
                    <strong>{fmt(evaluation.loanPenaltyExposure)}</strong> (ধারা ১০৪/২৭২)
                  </span>
                </div>
              )}
            </div>

            {/* Viral Social Share Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  এই ফলাফল সোশ্যাল মিডিয়ায় প্রচার করুন:
                </span>
                {copied && (
                  <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                    ✓ ক্লিপবোর্ডে কপি হয়েছে!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 px-2 text-xs font-bold text-white shadow-2xs transition-colors"
                >
                  হোয়াটসঅ্যাপ
                </button>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2 px-2 text-xs font-bold text-white shadow-2xs transition-colors"
                >
                  ফেসবুক
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="flex items-center justify-center gap-1 rounded-xl bg-sky-700 hover:bg-sky-800 py-2 px-2 text-xs font-bold text-white shadow-2xs transition-colors"
                >
                  লিংকডইন
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 px-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  কপি
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-600">পুরো রিটার্ন ও চেম্বার পরিচালনা করতে চান?</span>
                <Link
                  href="/dashboard"
                  className="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1"
                >
                  ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
