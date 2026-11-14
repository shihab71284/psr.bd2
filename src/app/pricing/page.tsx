import type { Metadata } from "next";
import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import PricingTable from "@/components/PricingTable";

export const metadata: Metadata = {
  title: "মূল্য — BTCP | Bangladesh Tax Compliance Platform",
  description: "psr.bd-র ফ্রি ও Pro প্ল্যানের মূল্য — প্রতি চেম্বারে মাসিক ৳১,৫০০ বা বার্ষিক ৳১৫,০০০। বিকাশ, নগদ, বাংলা QR ও ব্যাংক মাধ্যমে পেমেন্ট।",
};

export const dynamic = "force-dynamic";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <LandingHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">আপনার চেম্বারের জন্য সঠিক প্ল্যান বেছে নিন</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
            ফ্রি প্ল্যানে শুরু করুন — প্রথম ৫ জন ক্লায়েন্ট ও ৫টি রিটার্ন সম্পূর্ণ বিনামূল্যে।
            প্র্যাকটিস বড় হলে Pro-তে আপগ্রেড করুন, সবকিছু আনলিমিটেড।
          </p>
          <p className="mt-3 text-xs text-slate-400">
            পেমেন্ট: বিকাশ · নগদ · বাংলা QR · ব্যাংক কার্ড / ইন্টারনেট ব্যাংকিং — মেয়াদ শেষে ম্যানুয়াল নবায়ন (রিমাইন্ডার পাঠানো হবে)।
          </p>
        </div>
        <PricingTable />
      </main>
      <LandingFooter />
    </div>
  );
}
