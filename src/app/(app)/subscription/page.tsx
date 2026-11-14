import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getChamberPlan, getLatestSubscriptionForUser, listPaymentsForUser } from "@/lib/subscription";
import { formatBdt, formatDateBn, FREE_MAX_CLIENTS, FREE_MAX_RETURNS } from "@/lib/plans";
import { methodLabel } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const session = await getSession();
  const chamber = await getChamberPlan();
  const latest = session ? await getLatestSubscriptionForUser(session.userId) : null;
  const payments = session ? await listPaymentsForUser(session.userId, 10) : [];

  const usageClients = chamber.isPro ? "আনলিমিটেড" : `${chamber.clientCount} / ${FREE_MAX_CLIENTS}`;
  const usageReturns = chamber.isPro ? "আনলিমিটেড" : `${chamber.returnCount} / ${FREE_MAX_RETURNS}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">সাবস্ক্রিপশন</h1>
        <p className="mt-1 text-sm text-slate-500">আপনার চেম্বারের প্ল্যান, মেয়াদ ও পেমেন্টের হিসাব।</p>
      </div>

      {/* বর্তমান প্ল্যান */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">বর্তমান প্ল্যান</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {chamber.isPro ? "Pro" : "ফ্রি"}
              {chamber.isGrandfathered && (
                <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  আগের সক্রিয় সাবস্ক্রিপশন
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {chamber.isPro
                ? chamber.currentPeriodEnd
                  ? `মেয়াদ ${formatDateBn(chamber.currentPeriodEnd)} পর্যন্ত — মেয়াদ শেষের আগে নবায়ন করুন।`
                  : "মেয়াদ সীমাহীন (আগের সক্রিয় সাবস্ক্রিপশন)।"
                : "Pro-তে আপগ্রেড করলে আনলিমিটেড ক্লায়েন্ট ও রিটার্ন, Bulk Quick-Fix, PDF এক্সপোর্টসহ সব ফিচার খুলে যাবে।"}
            </p>
          </div>
          {!chamber.isPro && (
            <Link
              href="/pricing"
              className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-800"
            >
              Pro-তে আপগ্রেড করুন
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">ক্লায়েন্ট ব্যবহার</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{usageClients}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">রিটার্ন ব্যবহার</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{usageReturns}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">সর্বশেষ পেমেন্ট</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {latest ? `${formatBdt(latest.amountBdt)} (${latest.billingCycle === "yearly" ? "বার্ষিক" : "মাসিক"})` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* পেমেন্ট ইতিহাস */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-900">পেমেন্ট ইতিহাস</h2>
        {payments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            এখনো কোনো পেমেন্ট হয়নি। Pro নিতে <Link href="/pricing" className="font-semibold text-emerald-700 hover:underline">মূল্য দেখুন</Link>।
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">তারিখ</th>
                <th className="px-5 py-3">মাধ্যম</th>
                <th className="px-5 py-3">ট্রানজাকশন আইডি</th>
                <th className="px-5 py-3">পরিমাণ</th>
                <th className="px-5 py-3">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 text-slate-600">{formatDateBn(p.createdAt)}</td>
                  <td className="px-5 py-3 text-slate-800">{methodLabel(p.method)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.providerTrxId ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{formatBdt(p.amountBdt)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.status === "verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status === "verified" ? "যাচাইকৃত" : p.status === "failed" ? "ব্যর্থ" : "চলমান"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400">
        নবায়ন ম্যানুয়াল — মেয়াদ শেষের আগে নিজে পেমেন্ট করে নবায়ন করতে হবে। কোনো মাধ্যমে স্বয়ংক্রিয় চার্জের
        নিশ্চিত ব্যবস্থা নেই (bKash/Nagad/Bangla QR এককালীন পেমেন্ট)।
      </p>
    </div>
  );
}
