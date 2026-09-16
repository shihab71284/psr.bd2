"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Minus,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import QuickFixDropdown from "@/components/QuickFixDropdown";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AuditIssue, IncomeTaxResult, RISK_BADGE_CLASSES, RISK_LEVEL_LABELS } from "@/lib/taxEngine";

type ReturnItem = {
  id: string;
  clientId: string;
  assessmentYear: string;
  returnType: string;
  status: string;
  incomeSalary: string | number;
  incomeBusiness: string | number;
  incomeProperty: string | number;
  incomeCapitalGain: string | number;
  incomeAgricultural: string | number;
  incomeOther: string | number;
  previousYearIncome: string | number;
  investmentAmount: string | number;
  loanInterest: string | number;
  donations: string | number;
  totalAssets: string | number;
  totalLiabilities: string | number;
  tdsAmount: string | number;
  advanceTaxPaid: string | number;
  hasBusinessAudit: boolean;
  calculation: any;
  auditRiskScore: number;
  auditRiskLevel: string;
  auditIssues: any;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "খসড়া",
  review: "পর্যালোচনাধীন",
  filed: "দাখিলকৃত",
};

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  review: "bg-blue-50 text-blue-700 border-blue-200",
  filed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const CATEGORY_NAMES: Record<string, { bn: string; en: string }> = {
  compliance: { bn: "সম্মতির ঝুঁকি (Compliance)", en: "Compliance" },
  financial: { bn: "আর্থিক অসঙ্গতি (Financial)", en: "Financial Discrepancy" },
  documentation: { bn: "নথিপত্র ঘাটতি (Documentation)", en: "Documentation" },
  regulatory: { bn: "নিয়ন্ত্রক বাধ্যবাধকতা (Regulatory)", en: "Regulatory" },
};

function fmt(n: number | string | undefined | null) {
  const val = Number(n) || 0;
  return `৳${Math.round(val).toLocaleString("en-US")}`;
}

export default function AuditRiskComparison({
  clientId,
  clientName,
  clientCode,
  returns,
}: {
  clientId: string;
  clientName: string;
  clientCode: string;
  returns: ReturnItem[];
}) {
  // Sort returns chronologically by assessment year
  const sortedReturns = useMemo(() => {
    return [...returns].sort((a, b) => {
      const yearA = parseInt(a.assessmentYear.split("-")[0], 10) || 0;
      const yearB = parseInt(b.assessmentYear.split("-")[0], 10) || 0;
      return yearA - yearB;
    });
  }, [returns]);

  // Default to the last two assessment years
  const defaultYearA = sortedReturns.length >= 2 ? sortedReturns[sortedReturns.length - 2].id : sortedReturns[0]?.id || "";
  const defaultYearB = sortedReturns.length >= 2 ? sortedReturns[sortedReturns.length - 1].id : sortedReturns[0]?.id || "";

  const [yearAId, setYearAId] = useState<string>(defaultYearA);
  const [yearBId, setYearBId] = useState<string>(defaultYearB);
  const [activeChartTab, setActiveChartTab] = useState<"trend" | "categories" | "financial">("trend");
  const [activeIssueFilter, setActiveIssueFilter] = useState<"all" | "resolved" | "new" | "persistent">("all");

  const returnA = useMemo(() => sortedReturns.find((r) => r.id === yearAId), [sortedReturns, yearAId]);
  const returnB = useMemo(() => sortedReturns.find((r) => r.id === yearBId), [sortedReturns, yearBId]);

  const handleSwap = () => {
    setYearAId(yearBId);
    setYearBId(yearAId);
  };

  // If client has less than 2 returns
  if (sortedReturns.length < 2) {
    return (
      <div id="risk-comparison-insufficient" className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Layers className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">কর বছর ঝুঁকি তুলনা ও ট্রেন্ড বিশ্লেষণ</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          একই ক্লায়েন্টের অডিট ঝুঁকি স্কোর ও পারফরম্যান্স ট্রেন্ড তুলনা করার জন্য অন্তত দুটি ভিন্ন কর বছরের রিটার্ন প্রয়োজন।
          বর্তমানে এই ক্লায়েন্টের জন্য {sortedReturns.length === 1 ? "কেবল ১টি" : "কোনো"} রিটার্ন সংরক্ষিত আছে।
        </p>

        {sortedReturns.length === 1 && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">বর্তমান কর বছর</p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{sortedReturns[0].returnType} · কর বছর {sortedReturns[0].assessmentYear}</p>
                <p className="text-xs text-slate-500">স্ট্যাটাস: {STATUS_LABELS[sortedReturns[0].status]}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_BADGE_CLASSES[sortedReturns[0].auditRiskLevel]}`}>
                স্কোর {sortedReturns[0].auditRiskScore} · {RISK_LEVEL_LABELS[sortedReturns[0].auditRiskLevel]?.bn}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Link
            id="btn-create-second-return"
            href={`/clients/${clientId}/returns/new`}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            + পরবর্তী কর বছরের রিটার্ন তৈরি করুন
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Metrics & Breakdowns for Return A and Return B
  const issuesA: AuditIssue[] = (returnA?.auditIssues as AuditIssue[]) || [];
  const issuesB: AuditIssue[] = (returnB?.auditIssues as AuditIssue[]) || [];

  const calcA = (returnA?.calculation as IncomeTaxResult) || {};
  const calcB = (returnB?.calculation as IncomeTaxResult) || {};

  const totalIncomeA =
    Number(returnA?.incomeSalary || 0) +
    Number(returnA?.incomeBusiness || 0) +
    Number(returnA?.incomeProperty || 0) +
    Number(returnA?.incomeCapitalGain || 0) +
    Number(returnA?.incomeAgricultural || 0) +
    Number(returnA?.incomeOther || 0);

  const totalIncomeB =
    Number(returnB?.incomeSalary || 0) +
    Number(returnB?.incomeBusiness || 0) +
    Number(returnB?.incomeProperty || 0) +
    Number(returnB?.incomeCapitalGain || 0) +
    Number(returnB?.incomeAgricultural || 0) +
    Number(returnB?.incomeOther || 0);

  const netWealthA = Number(returnA?.totalAssets || 0) - Number(returnA?.totalLiabilities || 0);
  const netWealthB = Number(returnB?.totalAssets || 0) - Number(returnB?.totalLiabilities || 0);

  const taxPayableA = calcA.finalPayable !== undefined ? calcA.finalPayable : Number(calcA.taxAfterMinimum || 0);
  const taxPayableB = calcB.finalPayable !== undefined ? calcB.finalPayable : Number(calcB.taxAfterMinimum || 0);

  const scoreA = returnA?.auditRiskScore || 0;
  const scoreB = returnB?.auditRiskScore || 0;
  const scoreDelta = scoreB - scoreA;
  const scoreChangePercent = scoreA > 0 ? Math.round(((scoreB - scoreA) / scoreA) * 100) : 0;

  // Breakdown by category for Year A and Year B
  const categories = ["compliance", "financial", "documentation", "regulatory"] as const;
  const categoryBreakdown = categories.map((cat) => {
    const pointsA = issuesA.filter((i) => i.category === cat).reduce((sum, i) => sum + (i.points || 0), 0);
    const pointsB = issuesB.filter((i) => i.category === cat).reduce((sum, i) => sum + (i.points || 0), 0);
    return {
      category: cat,
      labelBn: CATEGORY_NAMES[cat].bn,
      labelEn: CATEGORY_NAMES[cat].en,
      yearA: pointsA,
      yearB: pointsB,
      delta: pointsB - pointsA,
    };
  });

  // Multi-Year Trend Chart Data (all years for this client)
  const multiYearData = sortedReturns.map((r) => {
    const isYearA = r.id === yearAId;
    const isYearB = r.id === yearBId;
    return {
      assessmentYear: r.assessmentYear,
      score: r.auditRiskScore,
      level: RISK_LEVEL_LABELS[r.auditRiskLevel]?.bn || r.auditRiskLevel,
      status: STATUS_LABELS[r.status] || r.status,
      returnType: r.returnType,
      isSelectedA: isYearA,
      isSelectedB: isYearB,
    };
  });

  // Financial Comparison Chart Data
  const financialCompareData = [
    {
      metric: "মোট করযোগ্য আয়",
      [returnA?.assessmentYear || "Year A"]: totalIncomeA,
      [returnB?.assessmentYear || "Year B"]: totalIncomeB,
    },
    {
      metric: "মোট নীট সম্পদ",
      [returnA?.assessmentYear || "Year A"]: netWealthA,
      [returnB?.assessmentYear || "Year B"]: netWealthB,
    },
    {
      metric: "প্রদেয় আয়কর",
      [returnA?.assessmentYear || "Year A"]: taxPayableA,
      [returnB?.assessmentYear || "Year B"]: taxPayableB,
    },
    {
      metric: "উৎস ও অগ্রিম কর",
      [returnA?.assessmentYear || "Year A"]: Number(returnA?.tdsAmount || 0) + Number(returnA?.advanceTaxPaid || 0),
      [returnB?.assessmentYear || "Year B"]: Number(returnB?.tdsAmount || 0) + Number(returnB?.advanceTaxPaid || 0),
    },
  ];

  // Category Comparison Chart Data
  const categoryCompareData = categoryBreakdown.map((c) => ({
    name: c.labelEn,
    nameBn: c.labelBn.split(" ")[0],
    [returnA?.assessmentYear || "Year A"]: c.yearA,
    [returnB?.assessmentYear || "Year B"]: c.yearB,
  }));

  // Analyze Issues Evolution (Resolved vs New vs Persistent)
  const titlesA = new Set(issuesA.map((i) => i.title));
  const titlesB = new Set(issuesB.map((i) => i.title));

  const resolvedIssues = issuesA.filter((i) => !titlesB.has(i.title));
  const newIssues = issuesB.filter((i) => !titlesA.has(i.title));
  const persistentIssues = issuesB.filter((i) => titlesA.has(i.title));

  return (
    <div id="audit-risk-comparison-container" className="space-y-6">
      {/* 1. Header & Year Selectors */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">অডিট ঝুঁকি স্কোর ও কর্মক্ষমতা ট্রেন্ড তুলনা</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ক্লায়েন্ট: <span className="font-medium text-slate-700">{clientName}</span> ({clientCode}) — বিভিন্ন কর বছরের ঝুঁকি প্রোফাইল ও নিরীক্ষা নিরীক্ষণের তুলনামূলক চিত্র
            </p>
          </div>

          {/* Quick Score Delta Summary Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                scoreDelta < 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : scoreDelta > 0
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {scoreDelta < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <span>ঝুঁকি হ্রাস: {Math.abs(scoreDelta)} পয়েন্ট ({Math.abs(scoreChangePercent)}% উন্নতি)</span>
                </>
              ) : scoreDelta > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span>ঝুঁকি বৃদ্ধি: +{scoreDelta} পয়েন্ট ({scoreChangePercent}% বৃদ্ধি)</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-slate-500" />
                  <span>ঝুঁকি স্কোর অপরিবর্তিত (০ পয়েন্ট)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Year Selector Dropdowns */}
        <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-11">
          {/* Year A Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-5">
            <label htmlFor="select-year-a" className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                বেস কর বছর (Year 1)
              </span>
              {returnA && (
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[returnA.status]}`}>
                  {STATUS_LABELS[returnA.status]}
                </span>
              )}
            </label>
            <select
              id="select-year-a"
              value={yearAId}
              onChange={(e) => setYearAId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {sortedReturns.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === yearBId}>
                  কর বছর {r.assessmentYear} ({r.returnType}) — ঝুঁকি স্কোর: {r.auditRiskScore} ({RISK_LEVEL_LABELS[r.auditRiskLevel]?.bn})
                </option>
              ))}
            </select>
            {returnA && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">ঝুঁকি স্তর:</span>
                <span className={`rounded-full px-2 py-0.5 font-bold ${RISK_BADGE_CLASSES[returnA.auditRiskLevel]}`}>
                  {returnA.auditRiskScore}/১০০ ({RISK_LEVEL_LABELS[returnA.auditRiskLevel]?.bn})
                </span>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              id="btn-swap-comparison-years"
              type="button"
              onClick={handleSwap}
              title="কর বছর অদলবদল করুন"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* Year B Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-5">
            <label htmlFor="select-year-b" className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                তুলনামূলক কর বছর (Year 2)
              </span>
              {returnB && (
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[returnB.status]}`}>
                  {STATUS_LABELS[returnB.status]}
                </span>
              )}
            </label>
            <select
              id="select-year-b"
              value={yearBId}
              onChange={(e) => setYearBId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {sortedReturns.map((r) => (
                <option key={r.id} value={r.id} disabled={r.id === yearAId}>
                  কর বছর {r.assessmentYear} ({r.returnType}) — ঝুঁকি স্কোর: {r.auditRiskScore} ({RISK_LEVEL_LABELS[r.auditRiskLevel]?.bn})
                </option>
              ))}
            </select>
            {returnB && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">ঝুঁকি স্তর:</span>
                <span className={`rounded-full px-2 py-0.5 font-bold ${RISK_BADGE_CLASSES[returnB.auditRiskLevel]}`}>
                  {returnB.auditRiskScore}/১০০ ({RISK_LEVEL_LABELS[returnB.auditRiskLevel]?.bn})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Executive Performance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Audit Risk Score */}
        <div id="card-metric-risk-score" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">অডিট ঝুঁকি স্কোর ট্রানজিশন</p>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {scoreA} ➔ {scoreB}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                scoreDelta < 0
                  ? "bg-emerald-100 text-emerald-800"
                  : scoreDelta > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {returnA?.assessmentYear} ({RISK_LEVEL_LABELS[returnA?.auditRiskLevel || "low"]?.bn}) থেকে{" "}
            {returnB?.assessmentYear} ({RISK_LEVEL_LABELS[returnB?.auditRiskLevel || "low"]?.bn})
          </p>
        </div>

        {/* Metric 2: Taxable Income */}
        <div id="card-metric-income" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">মোট করযোগ্য আয়</p>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900">{fmt(totalIncomeB)}</div>
            <span className="text-xs text-slate-500">আগে: {fmt(totalIncomeA)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            আয় বৃদ্ধি:{" "}
            <span className={totalIncomeB >= totalIncomeA ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
              {totalIncomeA > 0 ? `${Math.round(((totalIncomeB - totalIncomeA) / totalIncomeA) * 100)}%` : "০%"}
            </span>
          </p>
        </div>

        {/* Metric 3: Net Wealth Growth */}
        <div id="card-metric-wealth" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">নীট পরিসম্পদ (Net Wealth)</p>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900">{fmt(netWealthB)}</div>
            <span className="text-xs text-slate-500">আগে: {fmt(netWealthA)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            সম্পদ পরিবর্তন:{" "}
            <span className={netWealthB >= netWealthA ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
              {fmt(netWealthB - netWealthA)}
            </span>
          </p>
        </div>

        {/* Metric 4: Final Tax Liability */}
        <div id="card-metric-tax" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">চূড়ান্ত নিট করদায়</p>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900">{fmt(taxPayableB)}</div>
            <span className="text-xs text-slate-500">আগে: {fmt(taxPayableA)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            অডিট সমস্যা সংখ্যা:{" "}
            <span className="font-semibold text-slate-800">
              {issuesA.length} ➔ {issuesB.length} টি
            </span>
          </p>
        </div>
      </div>

      {/* 3. Interactive Visualization Tabs (Recharts) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">ভিজ্যুয়াল ট্রেন্ড ও অ্যানালিটিক্স</h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              NBR নিরীক্ষা মূল্যায়ন কাঠামো
            </span>
          </div>

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              id="tab-chart-trend"
              type="button"
              onClick={() => setActiveChartTab("trend")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeChartTab === "trend" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বহুবর্ষীয় ঝুঁকি ট্রেন্ড
            </button>
            <button
              id="tab-chart-categories"
              type="button"
              onClick={() => setActiveChartTab("categories")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeChartTab === "categories" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ক্যাটাগরিভিত্তিক তুলনা
            </button>
            <button
              id="tab-chart-financial"
              type="button"
              onClick={() => setActiveChartTab("financial")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeChartTab === "financial" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              আর্থিক মেট্রিক তুলনা
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* Chart 1: Multi-Year Risk Score Trend */}
          {activeChartTab === "trend" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <p>সকল কর বছরের অডিট ঝুঁকি স্কোর গ্রাফ (রেফারেন্স লাইন অনুযায়ী ঝুঁকি এলাকা প্রদর্শিত)</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                    ০-২৫: নিরাপদ (Low)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                    ২৬-৫০: মাঝারি (Medium)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                    ৫১-৭৫: উচ্চ (High)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    ৭৬+: ক্রিটিক্যাল (Critical)
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={multiYearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="assessmentYear"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                              <p className="font-bold text-slate-900">কর বছর: {data.assessmentYear}</p>
                              <p className="text-slate-600 mt-1">রিটার্ন ফরম: {data.returnType}</p>
                              <p className="text-slate-600">স্ট্যাটাস: {data.status}</p>
                              <p className="mt-2 font-semibold text-emerald-800">
                                অডিট ঝুঁকি স্কোর: {data.score}/১০০ ({data.level})
                              </p>
                              {data.isSelectedA && (
                                <p className="mt-1 font-medium text-blue-700">✓ বেস বছর (Year 1) হিসেবে নির্বাচিত</p>
                              )}
                              {data.isSelectedB && (
                                <p className="mt-1 font-medium text-purple-700">✓ তুলনামূলক বছর (Year 2) হিসেবে নির্বাচিত</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Risk Threshold Lines */}
                    <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" label={{ value: "স্বল্প", fill: "#059669", fontSize: 10 }} />
                    <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "মাঝারি", fill: "#d97706", fontSize: 10 }} />
                    <ReferenceLine y={75} stroke="#f97316" strokeDasharray="3 3" label={{ value: "উচ্চ", fill: "#ea580c", fontSize: 10 }} />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#047857"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                      activeDot={{ r: 6, stroke: "#047857", strokeWidth: 2, fill: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Category Breakdown Side-by-Side */}
          {activeChartTab === "categories" && (
            <div>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <p>৪টি মূল কমপ্লায়েন্স পিলারের ঝুঁকি পয়েন্ট তুলনা ({returnA?.assessmentYear} বনাম {returnB?.assessmentYear})</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-slate-500"></span>
                    {returnA?.assessmentYear} (বেস বছর)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600"></span>
                    {returnB?.assessmentYear} (তুলনামূলক বছর)
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryCompareData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      label={{ value: "ঝুঁকি পয়েন্ট", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={(val, name) => [`${val} পয়েন্ট`, name]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend />
                    <Bar dataKey={returnA?.assessmentYear || "Year A"} fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={returnB?.assessmentYear || "Year B"} fill="#047857" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Financial Metrics Delta */}
          {activeChartTab === "financial" && (
            <div>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <p>আর্থিক সূচক ও করদায়ের তুলনামূলক হিসাব (টাকায়)</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-slate-500"></span>
                    {returnA?.assessmentYear}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600"></span>
                    {returnB?.assessmentYear}
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialCompareData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="metric"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickFormatter={(val) => `৳${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val, name) => [fmt(val as number), name]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend />
                    <Bar dataKey={returnA?.assessmentYear || "Year A"} fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={returnB?.assessmentYear || "Year B"} fill="#047857" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Risk Pillars Comparative Progress Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">৪টি মূল নিরীক্ষা ঝুঁকি পিলারের বিস্তারিত অগ্রগতি</h3>
        <p className="mt-1 text-sm text-slate-500">
          জাতীয় রাজস্ব বোর্ড (NBR) ও আয়কর আইন ২০২৩ এর নিরীক্ষা নির্দেশিকা অনুযায়ী প্রতিটি বিভাগের ঝুঁকি বিশ্লেষণ:
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryBreakdown.map((cat) => {
            const delta = cat.delta;
            const isImproved = delta < 0;
            const isWorsened = delta > 0;

            return (
              <div key={cat.category} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{cat.labelBn}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isImproved
                        ? "bg-emerald-100 text-emerald-800"
                        : isWorsened
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isImproved ? `উন্নতি (${delta} পয়েন্ট)` : isWorsened ? `অবনতি (+${delta} পয়েন্ট)` : "অপরিবর্তিত"}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {/* Year A Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{returnA?.assessmentYear}</span>
                      <span className="font-medium text-slate-700">{cat.yearA} পয়েন্ট</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (cat.yearA / 40) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Year B Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{returnB?.assessmentYear}</span>
                      <span className="font-medium text-slate-700">{cat.yearB} পয়েন্ট</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          cat.yearB <= cat.yearA ? "bg-emerald-600" : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min(100, (cat.yearB / 40) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Audit Issues Evolution & Diff Tracker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">নিরীক্ষা ঝুঁকি ও কমপ্লায়েন্স সমস্যা রূপান্তর ট্র্যাকার</h3>
            <p className="mt-1 text-sm text-slate-500">
              {returnA?.assessmentYear} থেকে {returnB?.assessmentYear}-এ সমাধানকৃত সমস্যা এবং নতুন উদীয়মান ঝুঁকি চিহ্নিতকরণ
            </p>
          </div>

          {/* Issue Filter Tabs */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveIssueFilter("all")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeIssueFilter === "all" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              সকল ({resolvedIssues.length + newIssues.length + persistentIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveIssueFilter("resolved")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeIssueFilter === "resolved" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              সমাধানকৃত ({resolvedIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveIssueFilter("new")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeIssueFilter === "new" ? "bg-white text-red-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              নতুন ঝুঁকি ({newIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveIssueFilter("persistent")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeIssueFilter === "persistent" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              অপরিবর্তিত ({persistentIssues.length})
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Resolved Issues */}
          {(activeIssueFilter === "all" || activeIssueFilter === "resolved") && resolvedIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>সমাধানকৃত নিরীক্ষা সমস্যা ({resolvedIssues.length}টি)</span>
                <span className="text-xs font-normal text-slate-500">
                  — যা {returnA?.assessmentYear}-এ ছিল কিন্তু {returnB?.assessmentYear}-এ সফলভাবে নিরসন হয়েছে
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {resolvedIssues.map((issue, idx) => (
                  <div key={idx} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {CATEGORY_NAMES[issue.category]?.bn || issue.category}
                        </span>
                        <h4 className="mt-1 font-semibold text-slate-900">{issue.titleBn || issue.title}</h4>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-emerald-200/70 px-2 py-0.5 text-xs font-bold text-emerald-900">
                        -{issue.points} ঝুঁকি হ্রাস
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{issue.description}</p>
                    <div className="mt-2 text-xs text-emerald-700 font-medium">
                      ✓ সফলভাবে নথি/প্রমাণ দাখিলের মাধ্যমে নিরীক্ষা ঝুঁকি মুক্ত হয়েছে।
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Issues */}
          {(activeIssueFilter === "all" || activeIssueFilter === "new") && newIssues.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>নতুন উদ্ভূত ঝুঁকি ({newIssues.length}টি)</span>
                <span className="text-xs font-normal text-slate-500">
                  — যা {returnB?.assessmentYear}-এ প্রথম দেখা গেছে এবং সমাধান আবশ্যক
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {newIssues.map((issue, idx) => (
                  <div key={idx} className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                          {CATEGORY_NAMES[issue.category]?.bn || issue.category}
                        </span>
                        <h4 className="mt-1 font-semibold text-slate-900">{issue.titleBn || issue.title}</h4>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-red-200/70 px-2 py-0.5 text-xs font-bold text-red-900">
                        +{issue.points} নতুন ঝুঁকি
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 rounded-lg bg-white/80 p-2 text-xs text-slate-700">
                        <span className="font-semibold text-red-700">করণীয়: </span>
                        {issue.recommendation}
                      </div>
                    )}
                    {(issue.severity === "high" || issue.severity === "critical" || issue.points >= 8) && (
                      <div className="mt-2.5 flex justify-end">
                        <QuickFixDropdown issue={issue} clientId={returnB?.clientId} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Issues */}
          {(activeIssueFilter === "all" || activeIssueFilter === "persistent") && persistentIssues.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>উভয় কর বছরে চলমান অপরিবর্তিত ঝুঁকি ({persistentIssues.length}টি)</span>
                <span className="text-xs font-normal text-slate-500">
                  — যা উভয় বর্ষেই বিদ্যমান ছিল এবং এখনো সমাধান হয়নি
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {persistentIssues.map((issue, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          {CATEGORY_NAMES[issue.category]?.bn || issue.category}
                        </span>
                        <h4 className="mt-1 font-semibold text-slate-900">{issue.titleBn || issue.title}</h4>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-bold text-amber-900">
                        {issue.points} পয়েন্ট
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 rounded-lg bg-white/80 p-2 text-xs text-slate-700">
                        <span className="font-semibold text-amber-800">জরুরি সুপারিশ: </span>
                        {issue.recommendation}
                      </div>
                    )}
                    {(issue.severity === "high" || issue.severity === "critical" || issue.points >= 8) && (
                      <div className="mt-2.5 flex justify-end">
                        <QuickFixDropdown issue={issue} clientId={returnB?.clientId} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedIssues.length === 0 && newIssues.length === 0 && persistentIssues.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              উভয় কর বছরের জন্য কোনো চিহ্নিত অডিট সমস্যা রেকর্ড পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>

      {/* 6. Comprehensive Side-by-Side Comparison Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">বিস্তারিত মেট্রিক ও কমপ্লায়েন্স ম্যাট্রিক্স</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="rounded-l-lg px-4 py-3 font-semibold">বিবরণ / প্যারামিটার</th>
                <th className="px-4 py-3 font-semibold">{returnA?.assessmentYear} (বেস বছর)</th>
                <th className="px-4 py-3 font-semibold">{returnB?.assessmentYear} (তুলনামূলক বছর)</th>
                <th className="rounded-r-lg px-4 py-3 font-semibold">পার্থক্য / ট্রেন্ড (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Audit Risk Score */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">অডিট ঝুঁকি স্কোর</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${RISK_BADGE_CLASSES[returnA?.auditRiskLevel || "low"]}`}>
                    {scoreA} ({RISK_LEVEL_LABELS[returnA?.auditRiskLevel || "low"]?.bn})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${RISK_BADGE_CLASSES[returnB?.auditRiskLevel || "low"]}`}>
                    {scoreB} ({RISK_LEVEL_LABELS[returnB?.auditRiskLevel || "low"]?.bn})
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <span className={scoreDelta < 0 ? "text-emerald-700" : scoreDelta > 0 ? "text-red-700" : "text-slate-600"}>
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} পয়েন্ট
                  </span>
                </td>
              </tr>

              {/* Status */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">রিটার্ন স্ট্যাটাস</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[returnA?.status || "draft"]}`}>
                    {STATUS_LABELS[returnA?.status || "draft"]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[returnB?.status || "draft"]}`}>
                    {STATUS_LABELS[returnB?.status || "draft"]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">—</td>
              </tr>

              {/* Audit Report Conducted */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">আইনানুযায়ী অডিট সম্পন্ন (Audit Conducted)</td>
                <td className="px-4 py-3">
                  {returnA?.hasBusinessAudit ? (
                    <span className="text-emerald-700 font-semibold">✓ হ্যাঁ</span>
                  ) : (
                    <span className="text-slate-500">✕ না</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {returnB?.hasBusinessAudit ? (
                    <span className="text-emerald-700 font-semibold">✓ হ্যাঁ</span>
                  ) : (
                    <span className="text-slate-500">✕ না</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {returnB?.hasBusinessAudit && !returnA?.hasBusinessAudit ? (
                    <span className="font-semibold text-emerald-700">কমপ্লায়েন্স অর্জিত</span>
                  ) : !returnB?.hasBusinessAudit && returnA?.hasBusinessAudit ? (
                    <span className="font-semibold text-red-700">অডিট অনুপস্থিত</span>
                  ) : (
                    <span className="text-slate-500">অপরিবর্তিত</span>
                  )}
                </td>
              </tr>

              {/* Gross Total Income */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">মোট করযোগ্য আয়</td>
                <td className="px-4 py-3">{fmt(totalIncomeA)}</td>
                <td className="px-4 py-3">{fmt(totalIncomeB)}</td>
                <td className="px-4 py-3 font-semibold">
                  <span className={totalIncomeB >= totalIncomeA ? "text-emerald-700" : "text-amber-700"}>
                    {fmt(totalIncomeB - totalIncomeA)}
                  </span>
                </td>
              </tr>

              {/* Net Wealth */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">নীট সম্পদ (পরিসম্পদ - দায়)</td>
                <td className="px-4 py-3">{fmt(netWealthA)}</td>
                <td className="px-4 py-3">{fmt(netWealthB)}</td>
                <td className="px-4 py-3 font-semibold">
                  <span className={netWealthB >= netWealthA ? "text-emerald-700" : "text-amber-700"}>
                    {fmt(netWealthB - netWealthA)}
                  </span>
                </td>
              </tr>

              {/* Investment Amount & Rebate */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">বিনিয়োগ ও কর রেয়াত পরিমাণ</td>
                <td className="px-4 py-3">{fmt(returnA?.investmentAmount)}</td>
                <td className="px-4 py-3">{fmt(returnB?.investmentAmount)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {fmt(Number(returnB?.investmentAmount || 0) - Number(returnA?.investmentAmount || 0))}
                </td>
              </tr>

              {/* Tax Payable */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">চূড়ান্ত প্রদেয় আয়কর</td>
                <td className="px-4 py-3">{fmt(taxPayableA)}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{fmt(taxPayableB)}</td>
                <td className="px-4 py-3 font-semibold">
                  {fmt(taxPayableB - taxPayableA)}
                </td>
              </tr>

              {/* TDS & Advance Tax */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">পরিশোধিত উৎস কর (TDS) ও অগ্রিম কর</td>
                <td className="px-4 py-3">
                  {fmt(Number(returnA?.tdsAmount || 0) + Number(returnA?.advanceTaxPaid || 0))}
                </td>
                <td className="px-4 py-3">
                  {fmt(Number(returnB?.tdsAmount || 0) + Number(returnB?.advanceTaxPaid || 0))}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {fmt(
                    Number(returnB?.tdsAmount || 0) +
                      Number(returnB?.advanceTaxPaid || 0) -
                      (Number(returnA?.tdsAmount || 0) + Number(returnA?.advanceTaxPaid || 0))
                  )}
                </td>
              </tr>

              {/* Audit Issues Count */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">শনাক্তকৃত মোট অডিট সমস্যা</td>
                <td className="px-4 py-3">{issuesA.length} টি</td>
                <td className="px-4 py-3">{issuesB.length} টি</td>
                <td className="px-4 py-3 font-semibold">
                  <span className={issuesB.length <= issuesA.length ? "text-emerald-700" : "text-red-700"}>
                    {issuesB.length - issuesA.length > 0 ? `+${issuesB.length - issuesA.length}` : issuesB.length - issuesA.length} টি
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Links */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            প্রতিটি কর বছরের সম্পূর্ণ হিসাব, স্ল্যাব ব্রেকডাউন এবং ফর্ম প্রিন্ট করতে বিস্তারিত রিটার্ন ভিউ দেখুন:
          </p>
          <div className="flex gap-2">
            {returnA && (
              <Link
                id="link-view-return-a"
                href={`/returns/${returnA.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <span>{returnA.assessmentYear} রিটার্ন দেখুন</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {returnB && (
              <Link
                id="link-view-return-b"
                href={`/returns/${returnB.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <span>{returnB.assessmentYear} রিটার্ন দেখুন</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
