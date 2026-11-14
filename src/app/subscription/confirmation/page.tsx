import Link from "next/link";
import InvoicePrintButton from "@/components/InvoicePrintButton";
import { getVerifiedPayment } from "@/lib/subscription";
import { formatBdt, formatDateBn } from "@/lib/plans";
import { methodLabel } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * সাবস্ক্রিপশন কনফার্মেশন — শুধু সার্ভার-যাচাইকৃত পেমেন্ট দেখানো হয়।
 * URL-এর প্যারামিটার (যেমন ?ref=...) দিয়ে কখনো সফল দেখানো হয় না:
 * পেমেন্টের স্ট্যাটাস ডেটাবেস থেকে যাচাই করে তারপরই রসিদ রেন্ডার হয়।
 */
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const verified = sp.ref ? await getVerifiedPayment(sp.ref) : null;

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 font-sans">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">⚠️</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">পেমেন্ট যাচাই করা যায়নি</h1>
          <p className="mt-2 text-sm text-slate-500">
            এই রেফারেন্সে কোনো যাচাইকৃত পেমেন্ট পাওয়া যায়নি। পেমেন্ট সম্পূর্ণ না হলে সাবস্ক্রিপশন চালু
            হয় না। টাকা কেটে থাকলে ব্যাংক/ওয়ালেটের ট্রানজাকশন আইডি নিয়ে যোগাযোগ করুন।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">
              আবার চেষ্টা করুন
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              ড্যাশবোর্ডে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { payment, subscription } = verified;
  const planBn = subscription?.plan === "pro" ? "Pro" : "ফ্রি";
  const cycleBn = subscription?.billingCycle === "yearly" ? "বার্ষিক" : "মাসিক";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-receipt, #invoice-receipt * { visibility: visible; }
          #invoice-receipt { position: absolute; inset: 0; margin: 0; box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm print:hidden">
          <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white">
            ✓
          </p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">সাবস্ক্রিপশন নিশ্চিত হয়েছে!</h1>
          <p className="mt-2 text-sm text-slate-500">
            আপনার পেমেন্ট গেটওয়ে থেকে যাচাই করা হয়েছে এবং Pro প্ল্যান চালু হয়েছে।
          </p>
        </div>

        {/* রসিদ */}
        <div id="invoice-receipt" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="font-mono text-sm font-bold text-emerald-800">psr.bd</p>
              <p className="text-xs text-slate-500">BTCP — Bangladesh Tax Compliance Platform</p>
            </div>
            <p className="text-right text-xs text-slate-500">
              রসিদ / ইনভয়েস
              <br />
              <span className="font-mono font-bold text-slate-800">{payment.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">প্ল্যান</dt>
              <dd className="font-bold text-slate-900">
                {planBn} — {cycleBn}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">মেয়াদ</dt>
              <dd className="font-semibold text-slate-900">
                {formatDateBn(subscription?.currentPeriodStart)} → {formatDateBn(subscription?.currentPeriodEnd)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">পেমেন্ট মাধ্যম</dt>
              <dd className="font-semibold text-slate-900">{methodLabel(payment.method)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">ট্রানজাকশন আইডি</dt>
              <dd className="font-mono font-semibold text-slate-900">{payment.providerTrxId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
              <dt className="font-bold text-slate-900">পরিশোধিত মোট</dt>
              <dd className="text-lg font-bold text-emerald-700">{formatBdt(payment.amountBdt)} BDT</dd>
            </div>
          </dl>

          <p className="mt-5 text-xs text-slate-400">
            মেয়াদ শেষের আগে নবায়নের রিমাইন্ডার পাঠানো হবে। ম্যানুয়াল নবায়ন — মেয়াদ শেষ হলে আবার পেমেন্ট
            করে নবায়ন করুন।
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <InvoicePrintButton />
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
          >
            ড্যাশবোর্ডে যান →
          </Link>
          <Link
            href="/subscription"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            সাবস্ক্রিপশন দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
}
