import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BDTax ও Taxmate বনাম PSR.BD (BTCP) | আয়কর আইন ২০২৩ ও পিএসআর তুলনা",
  description:
    "BDTax এবং Taxmate-এর সাথে PSR.BD (BTCP)-এর তুলনা: আয়কর আইন ২০২৩ অনুযায়ী ধারা ২৬৪ পিএসআর (৪৩টি বাধ্যতামূলক সেবা), ধারা ১০৪ অডিট শিল্ড সিমুলেটর এবং চট্টগ্রাম কর আইনজীবী চেম্বার সহায়তা।",
  alternates: {
    canonical: "/compare/bdtax-taxmate-alternative",
  },
  openGraph: {
    title: "BDTax ও Taxmate বনাম PSR.BD (BTCP) | আয়কর আইন ২০২৩ প্ল্যাটফর্ম",
    description:
      "সাধারণ বেতন রিটার্নের বাইরে ধারা ২৬৪ পিএসআর, ধারা ১০৪ অডিট শিল্ড ও ধারা ১৬৬ কমপ্লায়েন্সের জন্য কেন PSR.BD সেরা বিকল্প—দেখুন বিস্তারিত তুলনা।",
    url: "https://psr.bd/compare/bdtax-taxmate-alternative",
  },
};

const COMPARISON_ROWS = [
  {
    feature: "ধারা ২৬৪ পিএসআর (৪৩টি বাধ্যতামূলক সেবা) ও ভেরিফিকেশন গাইড",
    psr: "✓ পূর্ণাঙ্গ গাইড ও ক্লায়েন্ট ট্র্যাকার",
    others: "✗ শুধুমাত্র সাধারণ রিটার্ন ফাইলিং",
  },
  {
    feature: "ধারা ১০৪ অডিট শিল্ড সিমুলেটর (১৫% আয় বৃদ্ধি যাচাই)",
    psr: "✓ ফ্রি ইনস্ট্যান্ট সিমুলেটর",
    others: "✗ কোনো অডিট শিল্ড টুল নেই",
  },
  {
    feature: "ধারা ১৬৬ হিসাব খাতা ও ৫ লক্ষ টাকা ক্যাশ লোন অডিট সতর্কতা",
    psr: "✓ ডেডিকেটেড কমপ্লায়েন্স চেকার",
    others: "✗ নেই",
  },
  {
    feature: "আয়কর আইন ২০২৩ ভিত্তিক ফ্রি ট্যাক্স ক্যালকুলেটর",
    psr: "✓ রিয়েল-টাইম ও লগইন ছাড়াই ফ্রি",
    others: "সাইন-আপ / পেইড প্ল্যান প্রয়োজন",
  },
  {
    feature: "সরাসরি কর আইনজীবী ও চট্টগ্রাম চেম্বার সাপোর্ট",
    psr: "✓ আলকরণ, চট্টগ্রাম চেম্বার সহায়তা",
    others: "অনলাইন সাপোর্ট টিকিট নির্ভর",
  },
];

export default function BdtaxTaxmateComparisonPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-slate-900">
      <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
        <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          Bangladesh Tax Platform Comparison ২০২৬
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          BDTax ও Taxmate বনাম PSR.BD (BTCP) — আয়কর আইন ২০২৩ কমপ্লায়েন্সে কোনটি সেরা?
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          BDTax বা Taxmate মূলত সাধারণ বেতনভোগীদের ই-রিটার্ন ফাইলিংয়ে সহায়তা করে। কিন্তু
          ব্যবসায়ী, কর আইনজীবী এবং জমি রেজিস্ট্রেশন, ট্রেড লাইসেন্স বা ব্যাংক লোনের জন্য
          <strong> ধারা ২৬৪ পিএসআর (PSR)</strong> ও <strong>ধারা ১০৪ অডিট শিল্ড</strong>{" "}
          যাচাই করতে চাইলে PSR.BD আপনাকে দেয় পূর্ণাঙ্গ আইনি ও ডিজিটাল সমাধান।
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-900 text-white">
              <th className="p-4 font-semibold">সেবা ও কমপ্লায়েন্স ফিচার</th>
              <th className="p-4 font-semibold text-emerald-300">PSR.BD (BTCP)</th>
              <th className="p-4 font-semibold text-slate-300">BDTax / Taxmate</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-slate-100 last:border-none">
                <td className="p-4 font-medium text-slate-900">{row.feature}</td>
                <td className="p-4 font-semibold text-emerald-700">{row.psr}</td>
                <td className="p-4 text-slate-600">{row.others}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/calculators"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          ফ্রি ট্যাক্স ক্যালকুলেটর ব্যবহার করুন →
        </Link>
        <Link
          href="/knowledge-base"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          ধারা ২৬৪, ১০৪ ও ১৬৬ গাইড পড়ুন
        </Link>
        <Link
          href="/lawyers"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          কর আইনজীবী যোগাযোগ
        </Link>
      </div>
    </main>
  );
}
