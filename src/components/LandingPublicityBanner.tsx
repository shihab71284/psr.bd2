"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { subscribeNewsletter } from "@/app/actions";

export default function LandingPublicityBanner() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);

    startTransition(async () => {
      await subscribeNewsletter(formData);
      setSubscribed(true);
    });
  };

  const handleCopyReferral = () => {
    const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=lawyer` : "https://btcp.tax.bd";
    navigator.clipboard.writeText(
      `বাংলাদেশের আধুনিক আয়কর আইন ২০২৩ ও অডিট শিল্ড প্ল্যাটফর্ম BTCP ব্যবহার করুন:\n${link}`
    );
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Promotion & Viral Growth Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          {/* Left Block: Free Lead Magnet (Download Audit Checklist) (7 cols) */}
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-teal-50/30 p-8 lg:col-span-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ফ্রি ডিজিটাল রিসোর্স</span>
              </div>

              <h3 className="mt-4 text-2xl font-black text-slate-900 leading-snug">
                ২০২৬-২০২৭ করবর্ষের পূর্ণাঙ্গ অডিট চেকলিস্ট ও এসআরও গাইডলাইন
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                ধারা ১০৪ এর সেলফ-অ্যাসেসমেন্ট অডিট শিল্ড, ধারা ১৬৬ হিসাব খাতার তালিকা এবং এনবিআরের সর্বশেষ অডিট সিলেকশন ক্রাইটেরিয়ার সারসংক্ষেপ সংগ্রহ করুন।
              </p>

              {subscribed ? (
                <div className="mt-6 rounded-2xl border border-emerald-300 bg-white p-5 text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-bold text-sm">অভিনন্দন! আপনার অনুরোধ গৃহীত হয়েছে।</h4>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">
                    আমাদের নিয়মিত আয়কর আপডেট ও অডিট বুলেটিন আপনার ইমেইলে পৌঁছে দেওয়া হবে।
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert("অডিট চেকলিস্ট পিডিএফ প্রস্তুত হচ্ছে...")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      চেকলিস্ট ডাউনলোড করুন (PDF)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার নাম..."
                      className="rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="আপনার ইমেইল ঠিকানা..."
                      className="rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {isPending ? "সংরক্ষণ করা হচ্ছে..." : "বিনামূল্যে চেকলিস্ট পেতে সাবস্ক্রাইব করুন"}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>🔒 কোনো স্প্যাম পাঠানো হবে না। ১০০% তথ্য নিরাপদ।</span>
              <span className="font-semibold text-emerald-800">৫,০০০+ ডাউনলোড</span>
            </div>
          </div>

          {/* Right Block: Viral Referral & Chamber Promotion (5 cols) */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white lg:col-span-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <Users className="h-3.5 w-3.5" />
                <span>আইনজীবী ও সহকর্মী নেটওয়ার্ক</span>
              </div>

              <h3 className="mt-4 text-2xl font-black text-white leading-snug">
                প্ল্যাটফর্মটি সহকর্মীদের সাথে শেয়ার করে প্রচার বাড়ান
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                আপনার ট্যাক্স বার অ্যাসোসিয়েশন, চেম্বারের সহকর্মী ও ক্লায়েন্টদের মাঝে বিটিসিপি পরিচয় করিয়ে দিন। 
                স্বচ্ছ হিসাব ও অডিট মুক্ত বাংলাদেশ গড়তে অবদান রাখুন।
              </p>

              {/* Share box */}
              <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-slate-300 font-semibold mb-2">
                  আপনার রেফারেল লিঙ্ক:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/?ref=lawyer` : "https://btcp.tax.bd"}
                    className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-mono text-emerald-300 border border-white/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                  >
                    {copiedReferral ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        কপি!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        কপি
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/lawyers"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                নিবন্ধিত আইনজীবীদের তালিকা দেখুন <ArrowRight className="h-3 w-3" />
              </Link>
              <span className="text-[11px] text-slate-400">বার কাউন্সিল অনুমোদিত</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
