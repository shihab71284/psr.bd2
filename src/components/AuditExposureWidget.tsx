"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Filter,
  HelpCircle,
  Info,
  Layers,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  computeFirmAuditExposure,
  FirmAuditExposureSummary,
  ReturnExposureItem,
} from "@/lib/auditExposure";
import { RISK_BADGE_CLASSES, RISK_LEVEL_LABELS } from "@/lib/taxEngine";

function fmtTk(n: number) {
  return `৳${Math.round(n).toLocaleString("en-US")}`;
}

export default function AuditExposureWidget({
  returnsList,
}: {
  returnsList: ReturnExposureItem[];
}) {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<
    "all" | "critical" | "high" | "medium" | "low"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const summary = useMemo(() => {
    return computeFirmAuditExposure(returnsList);
  }, [returnsList]);

  // Filter returns based on selected tab and search
  const filteredReturns = useMemo(() => {
    return summary.returns.filter((r) => {
      const matchesLevel =
        selectedRiskFilter === "all" ||
        (r.auditRiskLevel || "").toLowerCase() === selectedRiskFilter;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.clientName.toLowerCase().includes(q) ||
        r.clientCode.toLowerCase().includes(q) ||
        r.assessmentYear.toLowerCase().includes(q) ||
        r.primaryTrigger.toLowerCase().includes(q);

      return matchesLevel && matchesSearch;
    });
  }, [summary.returns, selectedRiskFilter, searchQuery]);

  // Exposure distribution percentages for the visual bar
  const totalExp = Math.max(1, summary.totalExposure);
  const criticalPct = Math.round((summary.criticalExposure / totalExp) * 100);
  const highPct = Math.round((summary.highExposure / totalExp) * 100);
  const mediumPct = Math.round((summary.mediumExposure / totalExp) * 100);
  const lowPct = Math.max(0, 100 - (criticalPct + highPct + mediumPct));

  return (
    <div
      id="firm-audit-exposure-widget"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
    >
      {/* Widget Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 backdrop-blur-md ring-1 ring-emerald-400/30">
              <ShieldAlert className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ফার্মব্যাপী নিরীক্ষা ঝুঁকি ও আর্থিক এক্সপোজার
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  ধারা ১৮২ ও ১০৪
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-300">
                সকল ক্লায়েন্টের প্রাক-ফাইলিং নিরীক্ষা ঝুঁকি মূল্যায়ন, সম্ভাব্য আর্থিক দায় ও কমপ্লায়েন্স হেলথ ইনডেক্স।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                মোট ক্লায়েন্ট ফাইল
              </span>
              <span className="text-sm font-bold text-white">
                {summary.uniqueClientsCount} জন ({summary.totalReturns}টি রিটার্ন)
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700/60" />
            <Link
              href="/returns"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <span>সকল রিটার্ন</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Key Performance Indicators */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 border-b border-slate-100 bg-slate-50/50">
        {/* KPI 1: Total Audit Exposure */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">মোট নিরীক্ষা এক্সপোজার</span>
            <span className="rounded-md bg-rose-100 p-1 text-rose-700">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-rose-600 tracking-tight">
              {fmtTk(summary.totalExposure)}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            অডিটে নির্বাচিত হলে সম্ভাব্য অতিরিক্ত কর ও ধারা ২৭২ জরিমানা দায়
          </p>
        </div>

        {/* KPI 2: Firm Compliance Health Score */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ফার্ম কমপ্লায়েন্স হেলথ</span>
            <span
              className={`rounded-md p-1 ${
                summary.complianceHealthScore >= 75
                  ? "bg-emerald-100 text-emerald-700"
                  : summary.complianceHealthScore >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <p
              className={`text-2xl font-black tracking-tight ${
                summary.complianceHealthScore >= 75
                  ? "text-emerald-700"
                  : summary.complianceHealthScore >= 50
                  ? "text-amber-700"
                  : "text-rose-700"
              }`}
            >
              {summary.complianceHealthScore}%
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                summary.complianceHealthScore >= 75
                  ? "bg-emerald-100 text-emerald-800"
                  : summary.complianceHealthScore >= 50
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {summary.complianceHealthScore >= 75
                ? "সুরক্ষিত প্র্যাকটিস"
                : summary.complianceHealthScore >= 50
                ? "সতর্কতা প্রয়োজন"
                : "উচ্চ ঝুঁকি বিদ্যমান"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                summary.complianceHealthScore >= 75
                  ? "bg-emerald-500"
                  : summary.complianceHealthScore >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${summary.complianceHealthScore}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Section 104 Shielded Returns */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ধারা ১০৪ সুরক্ষা প্রাপ্ত</span>
            <span className="rounded-md bg-emerald-100 p-1 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {summary.shieldedReturnsCount}টি রিটার্ন
            </p>
            <span className="text-xs text-slate-500">
              ({summary.totalReturns > 0 ? Math.round((summary.shieldedReturnsCount / summary.totalReturns) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ১৫% আয় বৃদ্ধিতে ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে সুরক্ষিত
          </p>
        </div>

        {/* KPI 4: Mitigable Exposure */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">তাত্ক্ষণিক প্রতিকারযোগ্য ঝুঁকি</span>
            <span className="rounded-md bg-blue-100 p-1 text-blue-700">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-blue-700 tracking-tight">
              {fmtTk(summary.mitigableExposure)}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            ব্যাংক স্টেটমেন্ট ও হিসাব খাতা (S.166) সংযুক্ত করে যা হ্রাস করা সম্ভব
          </p>
        </div>
      </div>

      {/* Visual Risk Exposure Distribution Bar */}
      <div className="border-b border-slate-100 px-6 py-4 bg-white">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            ঝুঁকি স্তর অনুযায়ী এক্সপোজারের অনুপাত (Risk Level Distribution)
          </span>
          <span className="text-slate-400 text-[11px]">
            ক্লিক করে নির্দিষ্ট ঝুঁকির তালিকা ফিল্টার করুন
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
          {criticalPct > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRiskFilter("critical")}
              style={{ width: `${criticalPct}%` }}
              className="group relative h-full rounded-l-full bg-rose-500 transition-all hover:bg-rose-600 focus:outline-none"
              title={`সংকটাপন্ন ঝুঁকি: ${fmtTk(summary.criticalExposure)} (${criticalPct}%)`}
            />
          )}
          {highPct > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRiskFilter("high")}
              style={{ width: `${highPct}%` }}
              className="group relative h-full bg-orange-500 transition-all hover:bg-orange-600 focus:outline-none"
              title={`উচ্চ ঝুঁকি: ${fmtTk(summary.highExposure)} (${highPct}%)`}
            />
          )}
          {mediumPct > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRiskFilter("medium")}
              style={{ width: `${mediumPct}%` }}
              className="group relative h-full bg-amber-400 transition-all hover:bg-amber-500 focus:outline-none"
              title={`মাঝারি ঝুঁকি: ${fmtTk(summary.mediumExposure)} (${mediumPct}%)`}
            />
          )}
          {lowPct > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRiskFilter("low")}
              style={{ width: `${lowPct}%` }}
              className="group relative h-full rounded-r-full bg-emerald-500 transition-all hover:bg-emerald-600 focus:outline-none"
              title={`সুরক্ষিত / স্বল্প ঝুঁকি: ${fmtTk(summary.lowExposure)} (${lowPct}%)`}
            />
          )}
        </div>

        {/* 4 Interactive Risk Level Category Badges */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {/* Critical Risk */}
          <button
            type="button"
            onClick={() =>
              setSelectedRiskFilter(selectedRiskFilter === "critical" ? "all" : "critical")
            }
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedRiskFilter === "critical"
                ? "border-rose-400 bg-rose-50/90 ring-2 ring-rose-500/20"
                : "border-slate-100 bg-slate-50/70 hover:border-rose-200 hover:bg-rose-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                সংকটাপন্ন ঝুঁকি
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                {summary.byLevel.critical.count}টি ফাইল
              </span>
            </div>
            <p className="mt-1.5 text-base font-bold text-rose-700">
              {fmtTk(summary.criticalExposure)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              মোট এক্সপোজারের {summary.byLevel.critical.percent}%
            </p>
          </button>

          {/* High Risk */}
          <button
            type="button"
            onClick={() =>
              setSelectedRiskFilter(selectedRiskFilter === "high" ? "all" : "high")
            }
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedRiskFilter === "high"
                ? "border-orange-400 bg-orange-50/90 ring-2 ring-orange-500/20"
                : "border-slate-100 bg-slate-50/70 hover:border-orange-200 hover:bg-orange-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-800">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                উচ্চ ঝুঁকি
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                {summary.byLevel.high.count}টি ফাইল
              </span>
            </div>
            <p className="mt-1.5 text-base font-bold text-orange-700">
              {fmtTk(summary.highExposure)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              মোট এক্সপোজারের {summary.byLevel.high.percent}%
            </p>
          </button>

          {/* Medium Risk */}
          <button
            type="button"
            onClick={() =>
              setSelectedRiskFilter(selectedRiskFilter === "medium" ? "all" : "medium")
            }
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedRiskFilter === "medium"
                ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-500/20"
                : "border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                মাঝারি ঝুঁকি
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {summary.byLevel.medium.count}টি ফাইল
              </span>
            </div>
            <p className="mt-1.5 text-base font-bold text-amber-700">
              {fmtTk(summary.mediumExposure)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              মোট এক্সপোজারের {summary.byLevel.medium.percent}%
            </p>
          </button>

          {/* Low / Shielded */}
          <button
            type="button"
            onClick={() =>
              setSelectedRiskFilter(selectedRiskFilter === "low" ? "all" : "low")
            }
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedRiskFilter === "low"
                ? "border-emerald-400 bg-emerald-50/90 ring-2 ring-emerald-500/20"
                : "border-slate-100 bg-slate-50/70 hover:border-emerald-200 hover:bg-emerald-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                সুরক্ষিত / স্বল্প ঝুঁকি
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {summary.byLevel.low.count}টি ফাইল
              </span>
            </div>
            <p className="mt-1.5 text-base font-bold text-emerald-700">
              {fmtTk(summary.lowExposure)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {summary.shieldedReturnsCount}টি ধারা ১০৪ সুরক্ষিত
            </p>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar for Client Returns Breakdown */}
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> ফিল্টার:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRiskFilter("all")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              selectedRiskFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            সকল ({summary.totalReturns})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRiskFilter("critical")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              selectedRiskFilter === "critical"
                ? "bg-rose-600 text-white"
                : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
            }`}
          >
            সংকটাপন্ন ({summary.byLevel.critical.count})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRiskFilter("high")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              selectedRiskFilter === "high"
                ? "bg-orange-600 text-white"
                : "bg-white text-orange-700 border border-orange-200 hover:bg-orange-50"
            }`}
          >
            উচ্চ ({summary.byLevel.high.count})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRiskFilter("medium")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              selectedRiskFilter === "medium"
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            মাঝারি ({summary.byLevel.medium.count})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRiskFilter("low")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              selectedRiskFilter === "low"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            সুরক্ষিত ({summary.byLevel.low.count})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্লায়েন্টের নাম বা কোড খুঁজুন..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Client Returns Detailed Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">ক্লায়েন্টের নাম ও কোড</th>
              <th className="px-4 py-3 font-semibold">কর বছর ও রিটার্ন</th>
              <th className="px-4 py-3 text-center font-semibold">ঝুঁকি স্তর ও স্কোর</th>
              <th className="px-4 py-3 text-right font-semibold">সম্ভাব্য অডিট এক্সপোজার</th>
              <th className="px-5 py-3 font-semibold">প্রধান ঝুঁকি ও প্রতিকারমূলক পদক্ষেপ</th>
              <th className="px-4 py-3 text-right font-semibold">একশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                  নির্বাচিত ক্যাটাগরির কোনো ক্লায়েন্ট রিটার্ন পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredReturns.map((r) => {
                const label = RISK_LEVEL_LABELS[r.auditRiskLevel || "low"] || {
                  bn: "স্বল্প ঝুঁকি",
                  en: "Low Risk",
                };
                const lvl = (r.auditRiskLevel || "").toLowerCase();

                return (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    {/* Client info */}
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                            lvl === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : lvl === "high"
                              ? "bg-orange-100 text-orange-800"
                              : lvl === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {r.clientName.slice(0, 2)}
                        </div>
                        <div>
                          <Link
                            href={`/clients/${r.clientId}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {r.clientName}
                          </Link>
                          <span className="block font-mono text-[10px] text-slate-400">
                            {r.clientCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Assessment year & return type */}
                    <td className="px-4 py-3 text-slate-600">
                      <span className="font-semibold text-slate-800">{r.assessmentYear}</span>
                      <span className="block text-[11px] text-slate-400">{r.returnType}</span>
                    </td>

                    {/* Risk Badge & Score */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          RISK_BADGE_CLASSES[r.auditRiskLevel || "low"] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {label.bn} ({Math.round(Number(r.auditRiskScore || 0))})
                      </span>
                    </td>

                    {/* Calculated Exposure Amount */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono text-sm font-black ${
                          lvl === "critical"
                            ? "text-rose-600"
                            : lvl === "high"
                            ? "text-orange-600"
                            : lvl === "medium"
                            ? "text-amber-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {r.calculatedExposure > 0 ? fmtTk(r.calculatedExposure) : "৳০ (ঝুঁকিমুক্ত)"}
                      </span>
                      {r.isRiskShielded ? (
                        <span className="block text-[10px] font-medium text-emerald-600">
                          ধারা ১০৪ সুরক্ষা
                        </span>
                      ) : r.taxPayable > 0 ? (
                        <span className="block text-[10px] text-slate-400">
                          কর দাবি: {fmtTk(r.taxPayable)}
                        </span>
                      ) : null}
                    </td>

                    {/* Primary Trigger & Actionable Fix */}
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        {lvl === "critical" || lvl === "high" ? (
                          <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                        ) : lvl === "medium" ? (
                          <Info className="h-3 w-3 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                        <span>{r.primaryTrigger}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        <strong className="text-slate-600">পরামর্শ:</strong> {r.actionableFix}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/returns/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <span>রিটার্ন দেখুন</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Statutory Legal Counsel Advisory Banner (ধারা ১৮২, ১০৪ ও ২৬৬) */}
      <div className="border-t border-slate-100 bg-emerald-50/50 p-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-emerald-100 p-1.5 text-emerald-800 shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="text-xs text-emerald-950">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="font-bold text-emerald-900">
                পেশাগত কর কাউন্সেলিং গাইডলাইন (আয়কর আইন ২০২৩ এর ধারা ১০৪ ও ১৮২):
              </strong>
              <span className="rounded bg-emerald-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-900">
                অডিট ডিফেন্স
              </span>
            </div>
            <p className="mt-1 leading-relaxed text-emerald-800/90 text-[11px]">
              • ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক ঋণের ক্ষেত্রে ব্যাংকিং স্টেটমেন্ট ও ঋণদাতার ই-টিআইএন ফাইলে নিশ্চিত থাকলে তা সরাসরি অডিট সিলেকশন ঝুঁকি থেকে অব্যাহতি দেয়।
              <br />
              • পূর্ববর্তী বছরের তুলনায় আয় ১৫% বা তার বেশি হলে ধারা ১০৪ অনুযায়ী ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টের অডিট সুরক্ষা কার্যকর হয়।
              <br />
              • উপ-কর কমিশনার কর্তৃক ধারা ১৮২(১০) অনুযায়ী ড্রাফট অডিট রিপোর্ট জারি করা হলে, সংশোধিত রিটার্ন দাখিল করে ধারা ১৮২(১১) অনুযায়ী <strong>অডিট নিষ্পত্তি পত্র (Audit Disposal Letter)</strong> গ্রহণ করে প্র্যাকটিসের যেকোনো ফৌজদারি বা শাস্তিমূলক দায় চিরতরে নিষ্ক্রিয় করা যায়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
