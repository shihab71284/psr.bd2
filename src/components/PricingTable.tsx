"use client";

import { useState } from "react";
import Link from "next/link";
import { BillingCycle, PLANS, formatBdt, getPrice } from "@/lib/plans";

export default function PricingTable() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const proPrice = getPrice("pro", cycle);
  const free = PLANS.free;
  const pro = PLANS.pro;

  return (
    <div>
      {/* মাসিক / বার্ষিক টগল */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(
            [
              { cycle: "monthly" as BillingCycle, label: "মাসিক" },
              { cycle: "yearly" as BillingCycle, label: "বার্ষিক" },
            ] as const
          ).map(({ cycle: c, label }) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                cycle === c ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
              {c === "yearly" && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${cycle === "yearly" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                  ২ মাস ফ্রি
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">ফ্রি</h2>
          <p className="mt-1 text-sm text-slate-500">ছোট চেম্বার ও শুরু করার জন্য</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {formatBdt(0)}
            <span className="text-base font-medium text-slate-400"> / চিরকাল ফ্রি</span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
            {free.featuresBn.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="mt-7 block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            ফ্রি ব্যবহার শুরু করুন
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-3xl border-2 border-emerald-600 bg-white p-7 shadow-lg">
          <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow">
            প্রস্তাবিত
          </span>
          <h2 className="text-lg font-bold text-slate-900">প্রো — প্রতি চেম্বার</h2>
          <p className="mt-1 text-sm text-slate-500">সক্রিয় প্র্যাকটিসের জন্য সবকিছু আনলিমিটেড</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {formatBdt(proPrice.amountBdt)}
            <span className="text-base font-medium text-slate-400">
              {" "}
              / {cycle === "monthly" ? "মাস" : "বছর"}
            </span>
          </p>
          {cycle === "yearly" && (
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              বার্ষিক নিলে মাসে কার্যকর {formatBdt(1250)} — ২ মাসের দাম বাঁচে
            </p>
          )}
          <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
            {pro.featuresBn.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/subscription/checkout?plan=pro&cycle=${cycle}`}
            className="mt-7 block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white shadow transition hover:bg-emerald-800"
          >
            Pro নিন — {proPrice.labelBn}
          </Link>
          <p className="mt-3 text-center text-xs text-slate-400">
            বিকাশ · নগদ · বাংলা QR · ব্যাংক কার্ড / ইন্টারনেট ব্যাংকিং
          </p>
        </div>
      </div>

      {/* তুলনা — Free বনাম Pro */}
      <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-6 py-4 text-lg font-bold text-slate-900">ফ্রি বনাম Pro — তুলনা</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">ফিচার</th>
                <th className="px-5 py-3">ফ্রি</th>
                <th className="px-5 py-3">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { f: "ল্যান্ডিং সিমুলেটর, ১০ ক্যালকুলেটর, ব্লগ ও নলেজ বেস", free: "✓", pro: "✓" },
                { f: "ক্লায়েন্ট", free: `প্রথম ${free.maxClients} জন`, pro: "আনলিমিটেড" },
                { f: "রিটার্ন", free: `প্রথম ${free.maxReturns}টি (ড্রাফট)`, pro: "আনলিমিটেড" },
                { f: "অডিট-ঝুঁকি স্কোরিং ও §104 শিল্ড", free: "বেসিক দেখা", pro: "পূর্ণ স্কোরিং + তুলনা" },
                { f: "Bulk Quick-Fix (এক ক্লিকে সহজ সমাধান)", free: "—", pro: "✓" },
                { f: "প্রতি-ক্লায়েন্ট ডেডলাইন + অ্যালার্ট", free: "সাধারণ ডেডলাইন", pro: "✓ অটো-সিড সহ" },
                { f: "মাল্টি-ইউজার চেম্বার", free: "—", pro: "✓" },
                { f: "ক্লায়েন্ট পোর্টাল / PSR শেয়ার লিংক", free: "—", pro: "✓" },
                { f: "PDF এক্সপোর্ট (রিটার্ন + অডিট রিপোর্ট)", free: "—", pro: "✓" },
              ].map((row) => (
                <tr key={row.f}>
                  <td className="px-5 py-3 font-medium text-slate-800">{row.f}</td>
                  <td className="px-5 py-3 text-slate-600">{row.free}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-800">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
