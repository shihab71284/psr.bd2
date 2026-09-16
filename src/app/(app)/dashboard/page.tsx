import Link from "next/link";
import { dashboardMetrics, listAllReturns, listDeadlines, listRecentActivity } from "@/lib/queries";
import { RISK_BADGE_CLASSES, RISK_LEVEL_LABELS } from "@/lib/taxEngine";
import AuditExposureWidget from "@/components/AuditExposureWidget";
import ReferColleagueSection from "@/components/ReferColleagueSection";
import DashboardAuditNotifications from "@/components/DashboardAuditNotifications";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDate(d: string | Date) {
  const date = new Date(d);
  return date.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(d: string) {
  const due = new Date(d);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const [session, metrics, returns, deadlinesList, activity] = await Promise.all([
    getSession(),
    dashboardMetrics(),
    listAllReturns(),
    listDeadlines(),
    listRecentActivity(8),
  ]);

  const upcomingDeadlines = deadlinesList
    .filter((d) => d.status !== "completed")
    .slice(0, 6);

  const riskyReturns = returns.filter((r) => r.auditRiskLevel === "high" || r.auditRiskLevel === "critical").slice(0, 5);

  const cards = [
    { label: "মোট ক্লায়েন্ট", value: metrics.clientCount, icon: "👥", href: "/clients", color: "bg-emerald-50 text-emerald-700" },
    { label: "মোট প্রস্তুতকৃত রিটার্ন", value: metrics.returnCount, icon: "📄", href: "/clients", color: "bg-blue-50 text-blue-700" },
    { label: "দাখিলকৃত রিটার্ন", value: metrics.filedCount, icon: "✅", href: "/clients", color: "bg-teal-50 text-teal-700" },
    { label: "উচ্চ ঝুঁকিপূর্ণ রিটার্ন", value: metrics.highRiskCount, icon: "⚠️", href: "/clients", color: "bg-orange-50 text-orange-700" },
    { label: "মেয়াদোত্তীর্ণ সময়সীমা", value: metrics.overdueCount, icon: "⏰", href: "/deadlines", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">ড্যাশবোর্ড</h1>
          <p className="mt-1 text-sm text-slate-500">আপনার প্র্যাকটিসের সার্বিক পরিস্থিতি এক নজরে দেখুন।</p>
        </div>
        <Link
          href="/clients/new"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
        >
          + নতুন ক্লায়েন্ট যুক্ত করুন
        </Link>
      </div>

      {/* Real-time Notification Banners & Live Toast Alerts for Filed Returns and High-Risk Audit Warnings */}
      <DashboardAuditNotifications returnsList={returns} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="mt-1 text-sm text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Firm-wide Audit Exposure & Compliance Health Widget */}
      <AuditExposureWidget returnsList={returns} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">উচ্চ নিরীক্ষা ঝুঁকিপূর্ণ রিটার্ন</h2>
            <Link href="/clients" className="text-sm font-medium text-emerald-700 hover:underline">সব দেখুন</Link>
          </div>
          {riskyReturns.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">কোনো উচ্চ ঝুঁকিপূর্ণ রিটার্ন নেই। চমৎকার!</p>
          ) : (
            <div className="space-y-3">
              {riskyReturns.map((r) => {
                const label = RISK_LEVEL_LABELS[r.auditRiskLevel];
                return (
                  <Link
                    key={r.id}
                    href={`/returns/${r.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-slate-300"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{r.clientName} <span className="text-xs text-slate-400">({r.clientCode})</span></p>
                      <p className="text-xs text-slate-500">{r.returnType} · কর বছর {r.assessmentYear}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_BADGE_CLASSES[r.auditRiskLevel]}`}>
                      {label.bn} ({r.auditRiskScore})
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">আসন্ন সময়সীমা</h2>
            <Link href="/deadlines" className="text-sm font-medium text-emerald-700 hover:underline">সব দেখুন</Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">কোনো সময়সীমা যুক্ত করা হয়নি।</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((d) => {
                const days = daysUntil(String(d.dueDate));
                const overdue = days < 0;
                const urgent = days >= 0 && days <= 7;
                return (
                  <div key={d.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{d.title}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          overdue ? "bg-red-100 text-red-700" : urgent ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {overdue ? `মেয়াদোত্তীর্ণ` : `${days} দিন বাকি`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(String(d.dueDate))} {d.clientName ? `· ${d.clientName}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tax Rebate & Investment Scenario Simulator Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <span className="text-xl">🧮</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  নতুন টুল
                </span>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  ট্যাক্স রেয়াত ও বিনিয়োগ দৃশ্যকল্প সিমুলেটর (Tax Rebate Simulator)
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                আয়কর আইন ২০২৩ এর ধারা ৭৮ অনুযায়ী ডিপিএস, পেনশন, সঞ্চয়পত্র ও শেয়ার বিনিয়োগে সর্বোচ্চ ১৫% কর রেয়াত ও অপ্টিমাল সঞ্চয় দ্রুত সিমুলেট করুন।
              </p>
            </div>
          </div>
          <Link
            href="/calculators?tab=rebate"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
          >
            <span>সিমুলেটরে যান</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Refer a Colleague Section */}
      <ReferColleagueSection
        lawyerName={session?.name}
        userId={session?.userId}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">সাম্প্রতিক কার্যক্রম</h2>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">এখনো কোনো কার্যক্রম নেই।</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-slate-700">{a.message}</p>
                  <p className="text-xs text-slate-400">
                    {a.clientName ? `${a.clientName} · ` : ""}
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
