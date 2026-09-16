"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Zap,
  CheckCheck,
  Undo2,
  FileText,
  Sparkles,
  X,
  ArrowRight,
  Info,
  Check,
} from "lucide-react";
import type { AuditIssue } from "@/lib/taxEngine";
import QuickFixDropdown from "@/components/QuickFixDropdown";
import {
  isLowEffortIssue,
  getLowEffortFixDetails,
  recalculateAuditScore,
} from "@/lib/quickFixHelper";
import { bulkApplyQuickFixes, undoBulkQuickFixes } from "@/app/actions";

interface ReturnIssuesFilterListProps {
  issues: AuditIssue[];
  clientId?: string;
  returnId?: string;
  initialScore?: number;
  initialLevel?: string;
}

const SEVERITY_CONFIG: Record<string, { bn: string; className: string }> = {
  critical: { bn: "সংকটাপন্ন (Critical)", className: "bg-red-100 text-red-700 border-red-200" },
  high: { bn: "উচ্চ (High)", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { bn: "মাঝারি (Medium)", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { bn: "স্বল্প (Low)", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

type SeverityFilter = "all" | "high_critical" | "critical" | "high" | "medium" | "low" | "low_effort" | "resolved";

export default function ReturnIssuesFilterList({
  issues: initialIssues,
  clientId,
  returnId,
  initialScore,
  initialLevel,
}: ReturnIssuesFilterListProps) {
  const router = useRouter();
  const [issuesList, setIssuesList] = useState<AuditIssue[]>(initialIssues);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastResolvedBatch, setLastResolvedBatch] = useState<string[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{
    message: string;
    pointsSaved: number;
    count: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const filterSelectId = useId();

  // Active (unresolved) and resolved issues
  const activeIssues = useMemo(() => issuesList.filter((i) => !i.resolved), [issuesList]);
  const resolvedIssues = useMemo(() => issuesList.filter((i) => i.resolved), [issuesList]);

  // Low-effort issues among active issues
  const unresolvedLowEffortIssues = useMemo(
    () => activeIssues.filter((i) => isLowEffortIssue(i)),
    [activeIssues]
  );

  const totalLowEffortPoints = useMemo(
    () => unresolvedLowEffortIssues.reduce((sum, i) => sum + i.points, 0),
    [unresolvedLowEffortIssues]
  );

  // Counts for quick overview badges
  const counts = useMemo(() => {
    const c = {
      all: activeIssues.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      high_critical: 0,
      low_effort: unresolvedLowEffortIssues.length,
      resolved: resolvedIssues.length,
    };
    for (const issue of activeIssues) {
      if (issue.severity === "critical") {
        c.critical++;
        c.high_critical++;
      } else if (issue.severity === "high") {
        c.high++;
        c.high_critical++;
      } else if (issue.severity === "medium") {
        c.medium++;
      } else if (issue.severity === "low") {
        c.low++;
      }
    }
    return c;
  }, [activeIssues, unresolvedLowEffortIssues, resolvedIssues]);

  // Filter and sort issues (highest points first)
  const filteredIssues = useMemo(() => {
    if (selectedSeverity === "resolved") {
      return resolvedIssues.slice().sort((a, b) => b.points - a.points);
    }
    if (selectedSeverity === "low_effort") {
      return unresolvedLowEffortIssues.slice().sort((a, b) => b.points - a.points);
    }
    return activeIssues
      .filter((issue) => {
        if (selectedSeverity === "all") return true;
        if (selectedSeverity === "high_critical") {
          return issue.severity === "critical" || issue.severity === "high";
        }
        return issue.severity === selectedSeverity;
      })
      .slice()
      .sort((a, b) => b.points - a.points);
  }, [activeIssues, resolvedIssues, unresolvedLowEffortIssues, selectedSeverity]);

  // Bulk apply low-effort quick fixes
  const handleBulkApply = (titlesToResolve: string[]) => {
    if (!titlesToResolve.length) return;

    const targetIssues = issuesList.filter((i) => titlesToResolve.includes(i.title));
    const pointsDeducted = targetIssues.reduce((sum, i) => sum + i.points, 0);

    // Optimistically update issuesList
    const updated = issuesList.map((issue) => {
      if (titlesToResolve.includes(issue.title)) {
        const fix = getLowEffortFixDetails(issue);
        return {
          ...issue,
          resolved: true,
          resolvedAt: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
          resolutionNote: fix.actionBn,
        };
      }
      return issue;
    });

    setIssuesList(updated);
    setLastResolvedBatch(titlesToResolve);
    setLastFeedback({
      message: `${titlesToResolve.length}টি সহজ সমাধান (Low-Effort Quick Fixes) সফলভাবে প্রয়োগ করা হয়েছে।`,
      pointsSaved: pointsDeducted,
      count: titlesToResolve.length,
    });
    setIsModalOpen(false);

    // Trigger server action if returnId is available
    if (returnId) {
      startTransition(async () => {
        try {
          await bulkApplyQuickFixes(returnId, titlesToResolve);
          router.refresh();
        } catch (err) {
          console.error("Failed to apply bulk quick fixes:", err);
        }
      });
    }
  };

  // Revert/Undo last applied bulk quick fixes
  const handleUndo = () => {
    if (!lastResolvedBatch.length) return;

    const updated = issuesList.map((issue) => {
      if (lastResolvedBatch.includes(issue.title)) {
        const { resolved, resolvedAt, resolutionNote, ...rest } = issue;
        return {
          ...rest,
          resolved: false,
        };
      }
      return issue;
    });

    const revertedTitles = [...lastResolvedBatch];
    setIssuesList(updated);
    setLastResolvedBatch([]);
    setLastFeedback(null);

    if (returnId) {
      startTransition(async () => {
        try {
          await undoBulkQuickFixes(returnId, revertedTitles);
          router.refresh();
        } catch (err) {
          console.error("Failed to undo bulk quick fixes:", err);
        }
      });
    }
  };

  // Single quick resolve for individual issue
  const handleSingleResolve = (issueTitle: string) => {
    handleBulkApply([issueTitle]);
  };

  return (
    <div id="return-issues-section" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Top Header with Title, Bulk Action Button, and Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              চিহ্নিত সমস্যাসমূহ ({filteredIssues.length} / {activeIssues.length})
            </h2>
            {counts.high_critical > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                <ShieldAlert className="h-3 w-3" />
                {counts.high_critical}টি জরুরি
              </span>
            )}
            {counts.resolved > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                {counts.resolved}টি সমাধানকৃত
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            ঝুঁকির তীব্রতা অনুযায়ী সমস্যাগুলো ফিল্টার করুন অথবা সহজ সমাধান এক ক্লিকে সমাধান করুন
          </p>
        </div>

        {/* Action Toolbar: Bulk Apply Quick Fixes Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {unresolvedLowEffortIssues.length > 0 ? (
            <button
              type="button"
              id="btn-bulk-apply-quick-fixes"
              onClick={() => setIsModalOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/40 active:scale-98 disabled:opacity-50"
              title="সকল সহজ সমাধানযোগ্য সমস্যা এক ক্লিকে সমাধান করুন"
            >
              <Zap className="h-4 w-4 fill-amber-300 text-amber-300 animate-pulse" />
              <span>Bulk Apply Quick Fixes</span>
              <span className="rounded-md bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                {unresolvedLowEffortIssues.length}টি সহজ সমাধান · {totalLowEffortPoints} পয়েন্ট
              </span>
            </button>
          ) : (
            <div
              id="btn-bulk-apply-quick-fixes-satisfied"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-800"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>সকল সহজ সমাধান সম্পন্ন (All Low-Effort Resolved)</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Feedback Banner with Undo Option */}
      {lastFeedback && (
        <div
          id="quick-fix-feedback-banner"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {lastFeedback.message}
              </p>
              <p className="text-[11px] text-emerald-800">
                মোট <span className="font-semibold text-emerald-950">{lastFeedback.pointsSaved} অডিট ঝুঁকি পয়েন্ট</span> হ্রাস পেয়েছে। সংশ্লিষ্ট সংবিধিবদ্ধ ফর্ম ও ভাউচার রেজিস্টার প্রস্তুত করা হয়েছে।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-undo-bulk-fixes"
              onClick={handleUndo}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>পূর্বাবস্থায় ফেরান (Undo)</span>
            </button>
            <button
              type="button"
              onClick={() => setLastFeedback(null)}
              className="rounded-md p-1 text-slate-400 hover:text-slate-600 transition"
              title="বন্ধ করুন"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Severity Filter Dropdown and Quick Filter Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="filter-pill-all"
            onClick={() => setSelectedSeverity("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedSeverity === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            সকল সক্রিয় ({counts.all})
          </button>

          <button
            type="button"
            id="filter-pill-low-effort"
            onClick={() => setSelectedSeverity("low_effort")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              selectedSeverity === "low_effort"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <Zap className="h-3 w-3 fill-emerald-500 text-emerald-600" />
            <span>সহজ সমাধান ({counts.low_effort})</span>
          </button>

          <button
            type="button"
            id="filter-pill-high-critical"
            onClick={() => setSelectedSeverity("high_critical")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              selectedSeverity === "high_critical"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Critical + High ({counts.high_critical})</span>
          </button>

          <button
            type="button"
            id="filter-pill-critical"
            onClick={() => setSelectedSeverity("critical")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedSeverity === "critical"
                ? "bg-red-700 text-white"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            }`}
          >
            Critical ({counts.critical})
          </button>

          <button
            type="button"
            id="filter-pill-high"
            onClick={() => setSelectedSeverity("high")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedSeverity === "high"
                ? "bg-orange-700 text-white"
                : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
            }`}
          >
            High ({counts.high})
          </button>

          <button
            type="button"
            id="filter-pill-medium"
            onClick={() => setSelectedSeverity("medium")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedSeverity === "medium"
                ? "bg-amber-700 text-white"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            Medium ({counts.medium})
          </button>

          <button
            type="button"
            id="filter-pill-low"
            onClick={() => setSelectedSeverity("low")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedSeverity === "low"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Low ({counts.low})
          </button>

          {counts.resolved > 0 && (
            <button
              type="button"
              id="filter-pill-resolved"
              onClick={() => setSelectedSeverity("resolved")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedSeverity === "resolved"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Check className="h-3 w-3" />
              <span>সমাধানকৃত ({counts.resolved})</span>
            </button>
          )}
        </div>

        {/* Dropdown Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor={filterSelectId} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span className="sr-only sm:not-sr-only">তীব্রতা:</span>
          </label>
          <select
            id={filterSelectId}
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
            className="rounded-xl border border-slate-300 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">সব সক্রিয় সমস্যা ({counts.all}টি)</option>
            <option value="low_effort">⚡ সহজ সমাধানযোগ্য (Low-Effort: {counts.low_effort}টি)</option>
            <option value="high_critical">🚨 শুধুমাত্র Critical ও High ({counts.high_critical}টি)</option>
            <option value="critical">🔴 শুধুমাত্র সংকটাপন্ন (Critical - {counts.critical}টি)</option>
            <option value="high">🟠 শুধুমাত্র উচ্চ (High - {counts.high}টি)</option>
            <option value="medium">🟡 শুধুমাত্র মাঝারি (Medium - {counts.medium}টি)</option>
            <option value="low">⚪ শুধুমাত্র স্বল্প (Low - {counts.low}টি)</option>
            {counts.resolved > 0 && (
              <option value="resolved">✅ সমাধানকৃত সমস্যা ({counts.resolved}টি)</option>
            )}
          </select>
          {selectedSeverity !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedSeverity("all")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
              title="ফিল্টার রিসেট"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Issues List */}
      {issuesList.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="mt-2 text-sm font-semibold text-emerald-900">কোনো সমস্যা পাওয়া যায়নি</p>
          <p className="mt-0.5 text-xs text-emerald-700">রিটার্নটি সম্পূর্ণ সন্তোষজনক মনে হচ্ছে।</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <AlertTriangle className="h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">
            নির্বাচিত ফিল্টারে কোনো সমস্যা পাওয়া যায়নি
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            অন্যান্য সমস্যা দেখতে ফিল্টার পরিবর্তন করুন।
          </p>
          <button
            type="button"
            onClick={() => setSelectedSeverity("all")}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>সকল সক্রিয় সমস্যা দেখুন</span>
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredIssues.map((issue, idx) => {
            const conf = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.low;
            const isHighOrCritical = issue.severity === "high" || issue.severity === "critical";
            const isLowEffort = isLowEffortIssue(issue);
            const lowEffortFix = isLowEffort ? getLowEffortFixDetails(issue) : null;
            const isResolved = Boolean(issue.resolved);

            return (
              <div
                key={`${issue.category}-${issue.title}-${idx}`}
                className={`rounded-xl border p-4 transition-all ${
                  isResolved
                    ? "border-emerald-200 bg-emerald-50/30 opacity-90"
                    : isHighOrCritical
                    ? "border-rose-200/90 bg-rose-50/20 hover:border-rose-300"
                    : isLowEffort
                    ? "border-emerald-200/80 bg-emerald-50/10 hover:border-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isHighOrCritical ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    ) : isLowEffort ? (
                      <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : null}
                    <p
                      className={`font-semibold text-slate-900 ${
                        isResolved ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {issue.titleBn || issue.title}
                    </p>
                    {isLowEffort && !isResolved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <Zap className="h-2.5 w-2.5 fill-emerald-600" />
                        সহজ সমাধান
                      </span>
                    )}
                    {isResolved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        সমাধান সম্পন্ন
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Individual Quick Resolve for Low-Effort Issues */}
                    {isLowEffort && !isResolved && (
                      <button
                        type="button"
                        id={`quick-resolve-btn-${idx}`}
                        onClick={() => handleSingleResolve(issue.title)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition disabled:opacity-50"
                        title="এই সমস্যাটি স্ট্যান্ডার্ড টেমপ্লেট দিয়ে দ্রুত সমাধান করুন"
                      >
                        <Zap className="h-3 w-3 text-emerald-700" />
                        <span>সমাধান করুন</span>
                      </button>
                    )}

                    {/* Quick Fix Dropdown for High/Critical Issues */}
                    {isHighOrCritical && !isResolved && (
                      <QuickFixDropdown issue={issue} clientId={clientId} />
                    )}

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.className}`}
                    >
                      {conf.bn} · {issue.points} পয়েন্ট
                    </span>
                  </div>
                </div>

                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{issue.description}</p>

                {/* Low effort automated fix note preview */}
                {lowEffortFix && !isResolved && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/60 p-2.5 text-xs text-emerald-900">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">স্বয়ংক্রিয় সমাধান প্ল্যান: </span>
                      <span>{lowEffortFix.actionBn}</span>
                    </div>
                  </div>
                )}

                {/* Resolved Note if already fixed */}
                {isResolved && issue.resolutionNote && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">সমাধানের বিবরণ: </span>
                      <span>{issue.resolutionNote}</span>
                      {issue.resolvedAt && (
                        <span className="ml-2 text-[10px] text-emerald-600">
                          (সময়: {issue.resolvedAt})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {issue.recommendation && !isResolved && (
                  <p className="mt-2 text-sm text-emerald-800 bg-emerald-50/80 rounded-lg p-2.5 border border-emerald-100">
                    <span className="font-bold text-emerald-900">সুপারিশ: </span>
                    {issue.recommendation}
                  </p>
                )}

                {issue.section && (
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    আইনি রেফারেন্স: <span className="text-slate-700 font-semibold">{issue.section}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Bulk Apply Quick Fixes */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-bulk-quick-fixes-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            id="modal-bulk-quick-fixes"
            className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Zap className="h-5 w-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <h3 id="modal-bulk-quick-fixes-title" className="text-base font-bold text-slate-900">
                    Bulk Apply Quick Fixes (সকল সহজ সমাধান প্রয়োগ)
                  </h3>
                  <p className="text-xs text-slate-500">
                    এক ক্লিকে সকল কম-প্রচেষ্টার সংবিধিবদ্ধ সমাধান ও স্ট্যান্ডার্ড রেজিস্টার প্রয়োগ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Summary & Issues to be resolved */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  নিচের <strong className="font-bold">{unresolvedLowEffortIssues.length}টি সমস্যা</strong> স্ট্যান্ডার্ড চেকলিস্ট, স্ব-ঘোষণা ও দ্বিতীয় তফসিল টেমপ্লেট সংযুক্তির মাধ্যমে তাৎক্ষণিকভাবে সমাধানযোগ্য। এতে অডিট ঝুঁকি থেকে মোট{" "}
                  <strong className="font-bold">{totalLowEffortPoints} পয়েন্ট হ্রাস পাবে</strong>।
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {unresolvedLowEffortIssues.map((issue, idx) => {
                  const fix = getLowEffortFixDetails(issue);
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{issue.titleBn || issue.title}</span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          -{issue.points} পয়েন্ট
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-start gap-1.5 text-slate-600 pl-5 text-[11px]">
                        <ArrowRight className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{fix.actionBn}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-bulk-quick-fixes"
                disabled={isPending}
                onClick={() => handleBulkApply(unresolvedLowEffortIssues.map((i) => i.title))}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                <span>
                  {isPending ? "প্রয়োগ হচ্ছে..." : `সকল (${unresolvedLowEffortIssues.length}টি) সমাধান প্রয়োগ করুন`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
