import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import { RISK_BADGE_CLASSES, RISK_LEVEL_LABELS } from "@/lib/taxEngine";

type Ret = {
  id: string;
  assessmentYear: string;
  returnType: string;
  status: string;
  auditRiskScore: number;
  auditRiskLevel: string;
  createdAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "খসড়া",
  review: "পর্যালোচনাধীন",
  filed: "দাখিলকৃত",
};

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  review: "bg-blue-100 text-blue-700",
  filed: "bg-emerald-100 text-emerald-700",
};

export default function ReturnsPanel({ clientId, returns }: { clientId: string; returns: Ret[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {returns.length >= 2 ? (
          <Link
            id="btn-goto-risk-comparison"
            href={`/clients/${clientId}?tab=risk-comparison`}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 shadow-sm"
          >
            <BarChart3 className="h-4 w-4 text-emerald-700" />
            <span>কর বছর ঝুঁকি তুলনা ও ট্রেন্ড চার্ট দেখুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <div />}

        <Link
          id="btn-new-return-panel"
          href={`/clients/${clientId}/returns/new`}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 shadow-sm transition"
        >
          + নতুন রিটার্ন প্রস্তুত করুন
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          এই ক্লায়েন্টের জন্য এখনো কোনো রিটার্ন প্রস্তুত করা হয়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {returns.map((r) => {
            const riskLabel = RISK_LEVEL_LABELS[r.auditRiskLevel];
            return (
              <Link
                key={r.id}
                id={`return-card-${r.id}`}
                href={`/returns/${r.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-300"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{r.returnType}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-500">কর বছর: {r.assessmentYear}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_BADGE_CLASSES[r.auditRiskLevel]}`}>
                    {riskLabel.bn} · স্কোর {r.auditRiskScore}
                  </span>
                  <span className="text-xs text-slate-400">বিস্তারিত দেখুন ➔</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
