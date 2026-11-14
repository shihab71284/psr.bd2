import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import { initiateCheckout } from "@/app/subscription/actions";
import { getProviderStatuses, methodLabel } from "@/lib/payments";
import { BillingCycle, PlanId, formatBdt, getPrice } from "@/lib/plans";
import { getChamberPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "এই পেমেন্ট মাধ্যমটি এখনো চালু হয়নি — মার্চেন্ট অ্যাকাউন্ট যুক্ত হলে এটি সক্রিয় হবে।",
  provider_error: "পেমেন্ট মাধ্যমের সঙ্গে সংযোগে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  invalid: "অনুরোধটি সঠিক নয়। আবার চেষ্টা করুন।",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string; error?: string; method?: string }>;
}) {
  const sp = await searchParams;
  const plan = (sp.plan === "free" ? "free" : "pro") as PlanId;
  const cycle = (sp.cycle === "yearly" ? "yearly" : "monthly") as BillingCycle;
  const price = getPrice(plan, cycle);
  const statuses = getProviderStatuses();
  const chamber = await getChamberPlan();
  const error = sp.error ? ERROR_MESSAGES[sp.error] ?? ERROR_MESSAGES.invalid : null;

  const periodEnd =
    cycle === "yearly"
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      : new Date(new Date().setMonth(new Date().getMonth() + 1));
  const periodEndBn = periodEnd.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
  const todayBn = new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <LandingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">চেকআউট — Pro সাবস্ক্রিপশন</h1>
        <p className="mt-2 text-sm text-slate-500">
          প্ল্যান বাছাই → পেমেন্ট মাধ্যম বাছাই → প্রোভাইডার পেজে পেমেন্ট → যাচাই → কনফার্মেশন।
        </p>

        {chamber.isPro && (
          <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            এই চেম্বার ইতিমধ্যে <strong>Pro</strong> প্ল্যানে আছে
            {chamber.currentPeriodEnd ? ` — মেয়াদ ${chamber.currentPeriodEnd.toLocaleDateString("bn-BD")} পর্যন্ত` : ""}
            {chamber.isGrandfathered ? " (আগের সক্রিয় সাবস্ক্রিপশন)" : ""}। নবায়ন করতে নিচে আবার পেমেন্ট
            করুন, অথবা <Link href="/subscription" className="font-bold underline">সাবস্ক্রিপশন পেজ</Link> দেখুন।
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <strong>পেমেন্ট শুরু করা যায়নি:</strong> {error}
          </div>
        )}

        {/* প্ল্যান সারাংশ */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">নির্বাচিত প্ল্যান</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                Pro — {cycle === "monthly" ? "মাসিক" : "বার্ষিক"} (প্রতি চেম্বার)
              </p>
              <p className="mt-1 text-sm text-slate-500">
                মেয়াদ: {todayBn} → {periodEndBn}
              </p>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{formatBdt(price.amountBdt)}</p>
          </div>
          <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            ← প্ল্যান বদলান
          </Link>
        </div>

        {/* পেমেন্ট মাধ্যম */}
        <form action={initiateCheckout} className="mt-8 space-y-4">
          <input type="hidden" name="plan" value={plan} />
          <input type="hidden" name="cycle" value={cycle} />
          <h2 className="text-lg font-bold text-slate-900">পেমেন্ট মাধ্যম বাছুন</h2>
          <p className="text-sm text-slate-500">
            পেমেন্ট প্রোভাইডারের নিজের নিরাপদ পেজে হবে — কার্ড বা ওয়ালেটের তথ্য এই সাইটে সংরক্ষণ করা হয় না।
          </p>

          <label className="block text-sm font-semibold text-slate-700">
            মোবাইল নম্বর (ঐচ্ছিক — চেম্বার প্রোফাইলের জন্য)
            <input
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {statuses.map((s) => (
              <button
                key={s.method}
                type="submit"
                name="method"
                value={s.method}
                disabled={!s.configured}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                  s.configured
                    ? "border-emerald-300 bg-emerald-50/60 hover:border-emerald-500 hover:bg-emerald-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
                }`}
              >
                <span className="flex items-center gap-2 text-base font-bold text-slate-900">
                  {methodLabel(s.method)}
                  {s.configured ? (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">চালু</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      শীঘ্রই আসছে
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-500">{s.noteBn}</span>
                {s.configured && <span className="mt-1 text-xs font-bold text-emerald-700">পেমেন্ট করতে এগিয়ে যান →</span>}
              </button>
            ))}
          </div>

          <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            মার্চেন্ট অ্যাকাউন্ট যুক্ত না হওয়া পর্যন্ত পেমেন্ট বোতামগুলো বন্ধ থাকবে — কোনো টাকা নেওয়া হবে না।
            সাবস্ক্রিপশন শুধুমাত্র গেটওয়ের যাচাইকৃত পেমেন্টের পরেই চালু হয়; মেয়াদ শেষে ম্যানুয়াল নবায়ন (রিমাইন্ডার
            পাঠানো হবে)।
          </p>
        </form>
      </main>
      <LandingFooter />
    </div>
  );
}
