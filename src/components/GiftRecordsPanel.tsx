"use client";

import { useMemo, useState } from "react";
import { createGiftRecord, deleteGiftRecord } from "@/app/actions";
import { calculateGiftTax } from "@/lib/taxEngine";

export type GiftRecord = {
  id: number;
  donorClientId: string;
  recipientName: string;
  relationship: string;
  giftDescription: string | null;
  fairMarketValue: string;
  giftTaxPayable: string;
  createdAt?: Date | string | null;
};

const RELATIONSHIPS = [
  { value: "spouse", label: "স্ত্রী / স্বামী (সম্পূর্ণ করমুক্ত)", exempt: true },
  { value: "child", label: "পুত্র / কন্যা (সম্পূর্ণ করমুক্ত)", exempt: true },
  { value: "parent", label: "পিতা / মাতা (সম্পূর্ণ করমুক্ত)", exempt: true },
  { value: "sibling", label: "ভাই / বোন", exempt: false },
  { value: "other", label: "অন্যান্য ব্যক্তি বা তৃতীয় পক্ষ", exempt: false },
];

export default function GiftRecordsPanel({
  donorClientId,
  giftRecords,
}: {
  donorClientId: string;
  giftRecords: GiftRecord[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [val, setVal] = useState<number>(100000);
  const [rel, setRel] = useState<string>("other");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live preview calculation
  const liveCalc = useMemo(() => {
    return calculateGiftTax(val, rel);
  }, [val, rel]);

  const totalGiftValue = giftRecords.reduce((acc, g) => acc + (Number(g.fairMarketValue) || 0), 0);
  const totalTaxPayable = giftRecords.reduce((acc, g) => acc + (Number(g.giftTaxPayable) || 0), 0);

  const addAction = createGiftRecord.bind(null, donorClientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">দানকর ট্র্যাকিং ও হিসাবায়ন (দানকর আইন, ১৯৯০)</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              ধারা ৪ ও ১৬৩৯ সংবিধি
            </span>
          </div>
          <p className="text-xs text-slate-500">
            রক্তের নিকটাত্মীয়দের (স্ত্রী/স্বামী, পিতামাতা, সন্তান) দান সম্পূর্ণ করমুক্ত। অন্যান্য দানের ক্ষেত্রে প্রগতিশীল হারে কর প্রযোজ্য।
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
        >
          {showAddForm ? "ফর্ম বন্ধ করুন" : "+ নতুন দান রেকর্ড যুক্ত করুন"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">মোট দান রেকর্ড</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{giftRecords.length} টি</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">প্রদত্ত দানের মোট বাজারমূল্য</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">৳{totalGiftValue.toLocaleString("en-US")}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-rose-800">মোট প্রদেয় দানকর (Gift Tax)</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">৳{totalTaxPayable.toLocaleString("en-US")}</p>
        </div>
      </div>

      {/* Add Gift Record Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-950">নতুন দানের বিবরণ ও স্বয়ংক্রিয় দানকর হিসাব</h3>
            <span className="text-xs text-slate-500">দানকর আইন ১৯৯০ এর ১ম তফসিল মোতাবেক</span>
          </div>

          <form
            action={async (formData) => {
              setIsSubmitting(true);
              try {
                await addAction(formData);
                setShowAddForm(false);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">গ্রহীতার নাম *</span>
                <input
                  name="recipientName"
                  required
                  placeholder="যেমন: তানিয়া আহমেদ"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">গ্রহীতার সাথে সম্পর্ক *</span>
                <select
                  name="relationship"
                  value={rel}
                  onChange={(e) => setRel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">দানের ন্যায্য বাজারমূল্য (৳) *</span>
                <input
                  name="fairMarketValue"
                  type="number"
                  step="0.01"
                  required
                  value={val}
                  onChange={(e) => setVal(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">দানের বিবরণ / সম্পত্তির তথ্য</span>
              <input
                name="giftDescription"
                placeholder="যেমন: সঞ্চয়পত্র হস্তান্তর, স্বর্ণালংকার, নগদ অর্থ অথবা জমি"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </label>

            {/* Real-time statutory preview box */}
            <div className="rounded-xl border border-emerald-300/80 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-600">স্বয়ংক্রিয় দানকর ফলাফল প্রিভিউ:</span>
                <span className="text-xs font-medium text-emerald-800">{liveCalc.legalRef}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-500">মোট মূল্য:</span>
                  <p className="font-semibold text-slate-800">৳{liveCalc.fairMarketValue.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <span className="text-slate-500">অব্যাহতি প্রাপ্ত অংশ:</span>
                  <p className="font-semibold text-emerald-700">৳{liveCalc.exemptionAmount.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <span className="text-slate-500">করযোগ্য দানের পরিমাণ:</span>
                  <p className="font-semibold text-slate-800">৳{liveCalc.taxableGiftValue.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <span className="text-slate-500">প্রদেয় দানকর (Gift Tax):</span>
                  <p className="text-sm font-bold text-rose-700">৳{liveCalc.giftTaxPayable.toLocaleString("en-US")}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 italic">{liveCalc.note}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-700 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "রেকর্ড সংরক্ষণ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">গ্রহীতার নাম</th>
                <th className="px-4 py-3">সম্পর্ক</th>
                <th className="px-4 py-3">সম্পত্তির বিবরণ</th>
                <th className="px-4 py-3 text-right">বাজারমূল্য (৳)</th>
                <th className="px-4 py-3 text-right">প্রদেয় দানকর (৳)</th>
                <th className="px-4 py-3 text-center">কর অব্যাহতি অবস্থা</th>
                <th className="px-4 py-3 text-center">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {giftRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    কোনো দানকর রেকর্ড এখনো নথিভুক্ত করা হয়নি।
                  </td>
                </tr>
              ) : (
                giftRecords.map((gift) => {
                  const isZeroTax = Number(gift.giftTaxPayable || 0) === 0;
                  const relLabel = RELATIONSHIPS.find((r) => r.value === gift.relationship)?.label ?? gift.relationship;

                  return (
                    <tr key={gift.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-900">{gift.recipientName}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{relLabel}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{gift.giftDescription || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ৳{Number(gift.fairMarketValue || 0).toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700">
                        ৳{Number(gift.giftTaxPayable || 0).toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isZeroTax ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            করমুক্ত (Exempt)
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            করযোগ্য (Taxable)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <form
                          action={async () => {
                            if (confirm("আপনি কি এই দান রেকর্ডটি মুছে ফেলতে নিশ্চিত?")) {
                              await deleteGiftRecord(gift.id, donorClientId);
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="মুছে ফেলুন"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
