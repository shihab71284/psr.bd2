import { notFound } from "next/navigation";
import Link from "next/link";
import { BarChart3, HelpCircle } from "lucide-react";
import { getReturnById, getClientById } from "@/lib/queries";
import { updateReturnStatus } from "@/app/actions";
import { IncomeTaxResult, RISK_BADGE_CLASSES, RISK_LEVEL_LABELS, AuditIssue } from "@/lib/taxEngine";
import ReturnIssuesFilterList from "@/components/ReturnIssuesFilterList";
import AuditRiskHelpSection from "@/components/AuditRiskHelpSection";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = { draft: "খসড়া", review: "পর্যালোচনাধীন", filed: "দাখিলকৃত" };

const CATEGORY_LABELS: Record<string, string> = {
  compliance: "সম্মতি ঝুঁকি",
  financial: "আর্থিক ঝুঁকি",
  documentation: "ডকুমেন্টেশন ঝুঁকি",
  regulatory: "নিয়ন্ত্রক ঝুঁকি",
};

function fmt(n: number) {
  return `৳${Math.round(n).toLocaleString("en-US")}`;
}

function decisionFor(level: string) {
  switch (level) {
    case "low":
      return { title: "রিটার্ন দাখিলের জন্য প্রস্তুত", body: "সকল প্রয়োজনীয় তথ্য ও দলিলাদি সঠিক প্রতীয়মান হচ্ছে। এখনই দাখিল করা যেতে পারে।", className: "border-emerald-300 bg-emerald-50 text-emerald-800" };
    case "medium":
      return { title: "দাখিলের পূর্বে সমস্যাগুলো সমাধান করুন", body: "নিচে চিহ্নিত বিষয়গুলো সমাধান করার পর দাখিল করার সুপারিশ করা হচ্ছে।", className: "border-amber-300 bg-amber-50 text-amber-800" };
    case "high":
      return { title: "বিশেষজ্ঞ পরামর্শ গ্রহণ করুন", body: "জটিল সমস্যাগুলোর জন্য একজন চার্টার্ড অ্যাকাউন্ট্যান্ট বা সিনিয়র পার্টনারের সহায়তা নিন।", className: "border-orange-300 bg-orange-50 text-orange-800" };
    default:
      return { title: "এখনই দাখিল করবেন না", body: "গুরুতর ঝুঁকি চিহ্নিত হয়েছে যা জরিমানা বা আইনি জটিলতার কারণ হতে পারে। সমস্যাগুলো সমাধান না করে দাখিল করা উচিত নয়।", className: "border-red-300 bg-red-50 text-red-800" };
  }
}

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ret = await getReturnById(id);
  if (!ret) notFound();
  const client = await getClientById(ret.clientId);

  const calc = ret.calculation as unknown as IncomeTaxResult;
  const issues = (ret.auditIssues as unknown as AuditIssue[]) ?? [];
  const decision = decisionFor(ret.auditRiskLevel);

  const grouped: Record<string, AuditIssue[]> = {};
  for (const issue of issues) {
    grouped[issue.category] = grouped[issue.category] || [];
    grouped[issue.category].push(issue);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link href={`/clients/${ret.clientId}`} className="text-emerald-700 hover:underline">{client?.name}</Link> ({client?.clientCode})
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{ret.returnType} — কর বছর {ret.assessmentYear}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/returns/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            সম্পাদনা করুন
          </Link>
          <form>
            <select
              defaultValue={ret.status}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <form key={status} action={updateReturnStatus.bind(null, id, ret.clientId, status)}>
            <button
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                ret.status === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          </form>
        ))}
      </div>

      {/* Audit risk overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">NBR অডিট ঝুঁকি মূল্যায়ন</p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              id="btn-goto-risk-help"
              href="#audit-risk-help-tips-section"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-700" />
              <span>সহায়িকা ও টিপস</span>
            </a>
            <Link
              id="btn-compare-with-other-years"
              href={`/clients/${ret.clientId}?tab=risk-comparison`}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-700" />
              <span>অন্যান্য কর বছরের সাথে ঝুঁকি তুলনা ও ট্রেন্ড চার্ট ➔</span>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500">নিরীক্ষা ঝুঁকি স্কোর</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{ret.auditRiskScore}<span className="text-lg font-normal text-slate-400">/100</span></p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${RISK_BADGE_CLASSES[ret.auditRiskLevel]}`}>
              {RISK_LEVEL_LABELS[ret.auditRiskLevel].bn}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {Boolean(ret.auditIssues) && (
              <>
                {["compliance", "financial", "documentation", "regulatory"].map((cat) => (
                  <div key={cat} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-lg font-bold text-slate-800">{grouped[cat]?.reduce((s, i) => s + i.points, 0) ?? 0}</p>
                    <p className="text-xs text-slate-500">{CATEGORY_LABELS[cat]}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className={`mt-5 rounded-xl border px-4 py-3 ${decision.className}`}>
          <p className="font-semibold">{decision.title}</p>
          <p className="mt-1 text-sm">{decision.body}</p>
        </div>
      </div>

      {/* Issues list with Severity Filter & Bulk Apply Quick Fixes */}
      <ReturnIssuesFilterList
        issues={issues}
        clientId={ret.clientId}
        returnId={ret.id}
        initialScore={Number(ret.auditRiskScore) || 0}
        initialLevel={ret.auditRiskLevel}
      />

      {/* Help & Tips: NBR Audit Risk Category Guide */}
      <AuditRiskHelpSection />

      {/* Statutory Section 104 / 166 / 3 Compliance Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">সংবিধিবদ্ধ কমপ্লায়েন্স ও আইনি সুরক্ষা নিরীক্ষা</h2>
        <p className="mb-4 text-xs text-slate-500">
          আয়কর আইন ২০২৩ এর ধারা ১০৪, ১৬৬ এবং ৩ এর আলোকে বিশেষ কমপ্লায়েন্স প্যারামিটারসমূহ:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-xl p-4 border ${ret.isRiskShielded ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 border-slate-200"}`}>
            <p className="text-xs font-semibold text-slate-600">ধারা ১০৪ অডিট শিল্ড</p>
            <p className={`mt-1 text-sm font-bold ${ret.isRiskShielded ? "text-emerald-800" : "text-slate-700"}`}>
              {ret.isRiskShielded ? "🛡️ প্রযোজ্য ও সুরক্ষিত" : "প্রযোজ্য নয়"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {ret.isRiskShielded ? "১৫%+ প্রবৃদ্ধি হওয়ায় অডিট থেকে মুক্ত" : "স্বাভাবিক নিরীক্ষা প্রযোজ্য"}
            </p>
          </div>

          <div className={`rounded-xl p-4 border ${ret.bookOfAccountsMaintained ? "bg-emerald-50/70 border-emerald-300" : "bg-amber-50/70 border-amber-300"}`}>
            <p className="text-xs font-semibold text-slate-600">ধারা ১৬৬ হিসাব বহি</p>
            <p className={`mt-1 text-sm font-bold ${ret.bookOfAccountsMaintained ? "text-emerald-800" : "text-amber-800"}`}>
              {ret.bookOfAccountsMaintained ? "✓ যথাযথ সংরক্ষিত" : "⚠️ সংরক্ষিত নয়"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">সংবিধিবদ্ধ হিসাব রেজিস্টার</p>
          </div>

          <div className={`rounded-xl p-4 border ${ret.hasExemptIncome ? "bg-blue-50/70 border-blue-300" : "bg-slate-50 border-slate-200"}`}>
            <p className="text-xs font-semibold text-slate-600">ধারা ৩ করমুক্ত আয় প্রমাণ</p>
            <p className={`mt-1 text-sm font-bold ${ret.hasExemptIncome ? "text-blue-800" : "text-slate-700"}`}>
              {ret.hasExemptIncome ? "✓ দালিলিক প্রমাণাদি যুক্ত" : "প্রযোজ্য নয় / প্রমাণ অমিল"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">অনুমোদিত নথিপত্রাদি</p>
          </div>

          <div className={`rounded-xl p-4 border ${ret.hasLargeLoanNoBank ? "bg-rose-50/70 border-rose-300" : "bg-emerald-50/70 border-emerald-300"}`}>
            <p className="text-xs font-semibold text-slate-600">ধারা ১০৪ অ-প্রাতিষ্ঠানিক ঋণ</p>
            <p className={`mt-1 text-sm font-bold ${ret.hasLargeLoanNoBank ? "text-rose-800" : "text-emerald-800"}`}>
              {ret.hasLargeLoanNoBank ? "⚠️ ৫ লক্ষাধিক ঋণ বিদ্যমান" : "✓ অননুমোদিত ঋণ নেই"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">ব্যাংকিং চ্যানেলের বাইরে ঋণ</p>
          </div>
        </div>
      </div>

      {/* Tax calculation */}
      {calc && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">কর গণনার বিবরণ</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryStat label="মোট আয়" value={fmt(calc.totalIncome)} />
            <SummaryStat label="করমুক্ত সীমা" value={fmt(calc.threshold)} />
            <SummaryStat label="নিট সম্পদ" value={fmt(calc.netWealth)} />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">স্ল্যাব পরিসীমা</th>
                  <th className="px-3 py-2">হার</th>
                  <th className="px-3 py-2">করযোগ্য অংশ</th>
                  <th className="px-3 py-2 text-right">কর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calc.slabs.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{fmt(s.from)} – {s.to ? fmt(s.to) : "ঊর্ধ্বে"}</td>
                    <td className="px-3 py-2">{Math.round(s.rate * 100)}%</td>
                    <td className="px-3 py-2">{fmt(s.taxableInBand)}</td>
                    <td className="px-3 py-2 text-right">{fmt(s.taxOnBand)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
            <Row label="মোট কর (রেয়াতের পূর্বে)" value={fmt(calc.grossTaxBeforeRebate)} />
            <Row label="রেয়াতযোগ্য বিনিয়োগ" value={fmt(calc.eligibleInvestment)} />
            <Row label="বিনিয়োগ রেয়াত (১৫%)" value={`- ${fmt(calc.investmentRebate)}`} />
            <Row label="রেয়াতের পর কর" value={fmt(calc.taxAfterRebate)} />
            <Row label={`সারচার্জ (${calc.surchargeApplicable ? "প্রযোজ্য" : "প্রযোজ্য নয়"})`} value={fmt(calc.surchargeAmount)} />
            <Row label="ন্যূনতম কর" value={fmt(calc.minimumTax)} highlight={calc.minimumTaxApplied} />
            <Row label="উৎসে কর্তিত কর (TDS)" value={`- ${fmt(calc.tdsAmount)}`} />
            <Row label="অগ্রিম কর পরিশোধ" value={`- ${fmt(calc.advanceTaxPaid)}`} />
          </div>

          <div className={`mt-6 rounded-xl px-5 py-4 text-center ${calc.isRefund ? "bg-emerald-50" : "bg-slate-900"}`}>
            <p className={`text-sm font-medium ${calc.isRefund ? "text-emerald-700" : "text-slate-300"}`}>
              {calc.isRefund ? "ফেরতযোগ্য (Refund)" : "প্রদেয় কর (Payable)"}
            </p>
            <p className={`text-3xl font-bold ${calc.isRefund ? "text-emerald-800" : "text-white"}`}>
              {fmt(Math.abs(calc.finalPayable))}
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            * এই হিসাব একটি নির্দেশক গণনা। চূড়ান্ত রিটার্ন দাখিলের পূর্বে সর্বশেষ এনবিআর প্রজ্ঞাপন যাচাই করুন।
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${highlight ? "bg-amber-50" : ""}`}>
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
