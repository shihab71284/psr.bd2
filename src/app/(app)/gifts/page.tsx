import Link from "next/link";
import { listAllGiftRecords } from "@/lib/queries";
import { GIFT_TAX_SLABS } from "@/lib/taxEngine";

export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  const records = await listAllGiftRecords();

  const totalValue = records.reduce((acc, r) => acc + (Number(r.fairMarketValue) || 0), 0);
  const totalTax = records.reduce((acc, r) => acc + (Number(r.giftTaxPayable) || 0), 0);
  const exemptCount = records.filter((r) => Number(r.giftTaxPayable || 0) === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">দানকর ব্যবস্থাপনা (দানকর আইন, ১৯৯০)</h1>
          <p className="mt-1 text-sm text-slate-500">
            ক্লায়েন্টদের প্রদত্ত দানের রেকর্ড, রক্তের সম্পর্কের কর অব্যাহতি এবং ১ম তফসিল অনুযায়ী প্রযোজ্য দানকর ট্র্যাকিং।
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">মোট দানকর রেকর্ড</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{records.length}</p>
          <p className="mt-1 text-xs text-slate-500">বিভিন্ন ক্লায়েন্টের ফাইল থেকে সংগৃহীত</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">সম্পত্তির মোট বাজারমূল্য</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">৳{totalValue.toLocaleString("en-US")}</p>
          <p className="mt-1 text-xs text-slate-500">ন্যায্য বাজারমূল্যের ভিত্তিতে মূল্যায়িত</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <p className="text-xs font-medium text-rose-800">মোট প্রদেয় দানকর</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">৳{totalTax.toLocaleString("en-US")}</p>
          <p className="mt-1 text-xs text-rose-600">আইন অনুযায়ী সরকারি কোষাগারে প্রদেয়</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-800">করমুক্ত দান (Exempt Gifts)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{exemptCount}</p>
          <p className="mt-1 text-xs text-emerald-600">ধারা ৪ অনুযায়ী রক্তের সম্পর্কের ক্ষেত্রে সম্পূর্ণ করমুক্ত</p>
        </div>
      </div>

      {/* Statutory Guidelines Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-600">
          দানকর আইন, ১৯৯০ এর প্রধান বিধান ও করের স্লাব (১ম তফসিল)
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-emerald-950 text-sm">কর অব্যাহতিপ্রাপ্ত দান (ধারা ৪):</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>স্ত্রী, স্বামী, পুত্র, কন্যা, পিতা ও মাতাকে প্রদত্ত যে কোনো পরিমাণ দান সম্পূর্ণ করমুক্ত।</li>
              <li>সরকার, স্থানীয় কর্তৃপক্ষ বা সরকার অনুমোদিত দাতব্য সংস্থাকে প্রদত্ত দান।</li>
              <li>উইল বা উত্তরাধিকার সূত্রে প্রাপ্ত সম্পত্তি।</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-900 text-sm mb-2">অন্যান্য ক্ষেত্রে প্রগতিশীল কর স্লাব:</p>
            <div className="space-y-1">
              {GIFT_TAX_SLABS.map((s, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span>{s.descBn}</span>
                  <span className="font-bold text-slate-800">{s.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">সকল ক্লায়েন্টের দানকরের তালিকা</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">দাতা ক্লায়েন্ট</th>
                <th className="px-4 py-3">গ্রহীতার নাম</th>
                <th className="px-4 py-3">সম্পর্ক</th>
                <th className="px-4 py-3">দানকৃত সম্পত্তি</th>
                <th className="px-4 py-3 text-right">বাজারমূল্য (৳)</th>
                <th className="px-4 py-3 text-right">প্রদেয় দানকর (৳)</th>
                <th className="px-4 py-3 text-center">স্থিতি</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    কোনো দানকর রেকর্ড পাওয়া যায়নি। ক্লায়েন্ট প্রোফাইল থেকে নতুন দান যুক্ত করা যাবে।
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isZero = Number(r.giftTaxPayable || 0) === 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/clients/${r.donorClientId}?tab=gifts`} className="hover:text-emerald-700 hover:underline">
                          <div>{r.donorClientName}</div>
                          <div className="text-xs text-slate-400">{r.donorClientCode}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.recipientName}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {r.relationship === "spouse"
                          ? "স্ত্রী / স্বামী"
                          : r.relationship === "child"
                          ? "পুত্র / কন্যা"
                          : r.relationship === "parent"
                          ? "পিতা / মাতা"
                          : r.relationship === "sibling"
                          ? "ভাই / বোন"
                          : "অন্যান্য"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.giftDescription || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ৳{Number(r.fairMarketValue || 0).toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700">
                        ৳{Number(r.giftTaxPayable || 0).toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isZero ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            করমুক্ত
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            করযোগ্য
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/clients/${r.donorClientId}?tab=gifts`}
                          className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          ফাইলে যান →
                        </Link>
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
