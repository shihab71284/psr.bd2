"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

export interface ReturnNotificationItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCode?: string;
  assessmentYear: string;
  incomeYear?: string;
  returnType: string;
  status: string; // 'draft' | 'review' | 'filed'
  auditRiskScore?: string | number | null;
  auditRiskLevel: string; // 'low' | 'medium' | 'high' | 'critical'
  auditIssues?: any;
  submissionDate?: string | null;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

interface ToastNotification {
  id: string;
  type: "high_risk" | "return_filed";
  title: string;
  subtitle: string;
  detail: string;
  clientName: string;
  clientCode?: string;
  returnId: string;
  clientId: string;
  score?: number;
  timestamp: string;
}

export default function DashboardAuditNotifications({
  returnsList,
}: {
  returnsList: ReturnNotificationItem[];
}) {
  // 1. Identify High-Risk returns (Risk Level High or Critical, or Score >= 60)
  const highRiskReturns = useMemo(() => {
    return returnsList.filter(
      (r) =>
        r.auditRiskLevel === "high" ||
        r.auditRiskLevel === "critical" ||
        Number(r.auditRiskScore || 0) >= 60
    );
  }, [returnsList]);

  // 2. Identify Filed returns (status === 'filed')
  const filedReturns = useMemo(() => {
    return returnsList.filter((r) => r.status === "filed");
  }, [returnsList]);

  // Dismissed IDs state (stored in session / local state)
  const [dismissedHighRisk, setDismissedHighRisk] = useState<string[]>([]);
  const [dismissedFiled, setDismissedFiled] = useState<string[]>([]);
  const [showHighRiskBanner, setShowHighRiskBanner] = useState(true);
  const [showFiledBanner, setShowFiledBanner] = useState(true);
  const [isHighRiskExpanded, setIsHighRiskExpanded] = useState(true);
  const [isFiledExpanded, setIsFiledExpanded] = useState(true);

  // Initialize active toast and queue in state initializer without cascading effects
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(() => {
    if (highRiskReturns.length > 0) {
      const topRisk = highRiskReturns[0];
      const issues = Array.isArray(topRisk.auditIssues) ? topRisk.auditIssues : [];
      const primaryIssue =
        issues.length > 0
          ? issues[0]?.title || "ধারা ১০৪ প্রবৃদ্ধি ঘাটতি বা ধারা ১৬৬ হিসাব খাতা অডিট"
          : "এনবিআর ধারা ১০৪ / ১৬৬ অডিট রিস্ক নির্দেশক শনাক্ত";

      return {
        id: `risk-${topRisk.id}`,
        type: "high_risk",
        title: "উচ্চ নিরীক্ষা ঝুঁকি সতর্কতা (High Audit Risk)",
        subtitle: `${topRisk.clientName} (${topRisk.returnType} · কর বছর ${topRisk.assessmentYear})`,
        detail: `ঝুঁকি স্কোর: ${topRisk.auditRiskScore ?? "৭৫"}/১০০ · প্রধান কারণ: ${primaryIssue}`,
        clientName: topRisk.clientName,
        clientCode: topRisk.clientCode,
        returnId: topRisk.id,
        clientId: topRisk.clientId,
        score: Number(topRisk.auditRiskScore || 75),
        timestamp: "এইমাত্র পরীক্ষিত",
      };
    }

    if (filedReturns.length > 0) {
      const topFiled = filedReturns[0];
      return {
        id: `filed-${topFiled.id}`,
        type: "return_filed",
        title: "রিটার্ন সফলভাবে দাখিল সম্পন্ন (Return Filed)",
        subtitle: `${topFiled.clientName} (${topFiled.returnType} · কর বছর ${topFiled.assessmentYear})`,
        detail:
          "ধারা ২৬৪ অনুসারে পিএসআর (PSR) সনদ ও অ্যাকনলেজমেন্ট প্রস্তুত। ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে দাখিলকৃত।",
        clientName: topFiled.clientName,
        clientCode: topFiled.clientCode,
        returnId: topFiled.id,
        clientId: topFiled.clientId,
        timestamp: "দাখিলকৃত",
      };
    }

    return null;
  });

  const [toastQueue, setToastQueue] = useState<ToastNotification[]>(() => {
    if (highRiskReturns.length > 0 && filedReturns.length > 0) {
      const topFiled = filedReturns[0];
      return [
        {
          id: `filed-${topFiled.id}`,
          type: "return_filed",
          title: "রিটার্ন সফলভাবে দাখিল সম্পন্ন (Return Filed)",
          subtitle: `${topFiled.clientName} (${topFiled.returnType} · কর বছর ${topFiled.assessmentYear})`,
          detail:
            "ধারা ২৬৪ অনুসারে পিএসআর (PSR) সনদ ও অ্যাকনলেজমেন্ট প্রস্তুত। ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে দাখিলকৃত।",
          clientName: topFiled.clientName,
          clientCode: topFiled.clientCode,
          returnId: topFiled.id,
          clientId: topFiled.clientId,
          timestamp: "দাখিলকৃত",
        },
      ];
    }
    return [];
  });

  const [isToastPaused, setIsToastPaused] = useState(false);

  // Filter out dismissed items for banners
  const visibleHighRisk = useMemo(() => {
    return highRiskReturns.filter((r) => !dismissedHighRisk.includes(r.id));
  }, [highRiskReturns, dismissedHighRisk]);

  const visibleFiled = useMemo(() => {
    return filedReturns.filter((r) => !dismissedFiled.includes(r.id));
  }, [filedReturns, dismissedFiled]);

  const handleNextToast = useCallback(() => {
    setToastQueue((prevQueue) => {
      if (prevQueue.length > 0) {
        setActiveToast(prevQueue[0]);
        return prevQueue.slice(1);
      } else {
        setActiveToast(null);
        return [];
      }
    });
  }, []);

  const handleDismissToast = useCallback(() => {
    handleNextToast();
  }, [handleNextToast]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!activeToast || isToastPaused) return;

    const timer = setTimeout(() => {
      handleNextToast();
    }, 7500);

    return () => clearTimeout(timer);
  }, [activeToast, isToastPaused, handleNextToast]);

  // Simulation helpers (to test live toasts on-demand)
  const triggerSimulatedFilingToast = () => {
    const simToast: ToastNotification = {
      id: `sim-filed-${Date.now()}`,
      type: "return_filed",
      title: "🎉 নতুন রিটার্ন দাখিল নিশ্চিতকরণ (Return Filed)",
      subtitle: "তানভীর আহমেদ (IT-11 · কর বছর ২০২৬-২০২৭)",
      detail: "এনবিআর ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে দাখিল সম্পন্ন হয়েছে। ধারা ২৬৪ পিএসআর প্রস্তুত।",
      clientName: "তানভীর আহমেদ",
      returnId: returnsList[0]?.id || "demo-return",
      clientId: returnsList[0]?.clientId || "demo-client",
      timestamp: "এখনই",
    };
    setActiveToast(simToast);
    setShowFiledBanner(true);
  };

  const triggerSimulatedHighRiskToast = () => {
    const simToast: ToastNotification = {
      id: `sim-risk-${Date.now()}`,
      type: "high_risk",
      title: "⚠️ উচ্চ নিরীক্ষা ঝুঁকি সতর্কতা (Audit Warning)",
      subtitle: "প্রাইম লজিস্টিকস লিমিটেড (আইটি-১১গ · স্কোর: ৮২/১০০)",
      detail: "ধারা ১০৪ এর ১৫% আয় প্রবৃদ্ধি ঘাটতি এবং ধারা ১৬৬ ভাউচার অমিল শনাক্ত হয়েছে। অডিট স্ক্রুটিনির ঝুঁকি রয়েছে।",
      clientName: "প্রাইম লজিস্টিকস লিমিটেড",
      returnId:
        returnsList.find((r) => r.auditRiskLevel === "high")?.id ||
        returnsList[0]?.id ||
        "demo-return",
      clientId: returnsList[0]?.clientId || "demo-client",
      score: 82,
      timestamp: "এখনই",
    };
    setActiveToast(simToast);
    setShowHighRiskBanner(true);
  };

  const resetAllDismissals = () => {
    setDismissedHighRisk([]);
    setDismissedFiled([]);
    setShowHighRiskBanner(true);
    setShowFiledBanner(true);
  };

  return (
    <div className="space-y-4">
      {/* -------------------- BANNER SECTION -------------------- */}

      {/* 1. HIGH AUDIT RISK WARNING BANNER */}
      {showHighRiskBanner && visibleHighRisk.length > 0 && (
        <div
          id="banner-high-risk-warning"
          className="relative overflow-hidden rounded-2xl border border-rose-300/90 bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/40 p-4 sm:p-5 shadow-xs transition-all"
        >
          {/* Top warning stripe accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left alert summary */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-2xs">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-rose-300 bg-rose-100/90 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                    জরুরি সতর্কতা
                  </span>
                  <h3 className="text-sm font-bold text-rose-950 sm:text-base">
                    উচ্চ নিরীক্ষা ঝুঁকি সতর্কতা (High Audit Risk Warning)
                  </h3>
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    {visibleHighRisk.length} টি রিটার্নে অডিট ঝুঁকি
                  </span>
                </div>

                <p className="mt-1 text-xs text-rose-900/90 leading-relaxed sm:text-sm">
                  আয়কর আইন ২০২৩ এর ধারা ১০৪ (১৫% ন্যূনতম আয় প্রবৃদ্ধি শিল্ড) বা ধারা ১৬৬ (হিসাব খাতা ও প্রমাণক) পরিপালনে ঘাটতি রয়েছে। 
                  এনবিআর সার্বজনীন স্বনির্ধারণী অডিট সিলেকশন স্ক্রুটিনি এড়াতে এখনই ফাইলগুলো রিভিউ করুন।
                </p>
              </div>
            </div>

            {/* Right Controls (Expand / Dismiss) */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsHighRiskExpanded(!isHighRiskExpanded)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-rose-800 hover:bg-white transition-colors"
              >
                {isHighRiskExpanded ? (
                  <>
                    <span>সংক্ষিপ্ত করুন</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>ফাইলগুলো দেখুন ({visibleHighRisk.length})</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowHighRiskBanner(false)}
                title="ব্যানার বন্ধ করুন"
                className="rounded-lg p-1 text-rose-700 hover:bg-rose-100/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded List of High Risk Returns */}
          {isHighRiskExpanded && (
            <div className="mt-4 border-t border-rose-200/80 pt-3">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {visibleHighRisk.slice(0, 4).map((r) => {
                  const issues = Array.isArray(r.auditIssues) ? r.auditIssues : [];
                  const primaryTrigger =
                    issues[0]?.title ||
                    "ধারা ১০৪ এর ১৫% গ্রোথ শর্ত পূরণ হয়নি / হিসাব খাতা অডিট ঝুঁকি";

                  return (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between rounded-xl border border-rose-200/90 bg-white p-3 shadow-2xs hover:border-rose-400 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {r.clientName}{" "}
                            {r.clientCode && (
                              <span className="font-normal text-slate-500 font-mono">
                                ({r.clientCode})
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {r.returnType} · কর বছর {r.assessmentYear}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            স্কোর: {r.auditRiskScore || "৭৫"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-rose-800/90 font-medium">
                        ⚠️ {primaryTrigger}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        <span className="text-[10px] text-slate-500">
                          ধারা ১০৪/১৬৬ অডিট এক্সপোজার
                        </span>
                        <Link
                          href={`/returns/${r.id}`}
                          className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 hover:underline"
                        >
                          অডিট কুইক-ফিক্স খুলুন <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleHighRisk.length > 4 && (
                <div className="mt-2 text-right">
                  <Link
                    href="/clients"
                    className="text-xs font-semibold text-rose-800 hover:underline"
                  >
                    সকল উচ্চ ঝুঁকিপূর্ণ রিটার্ন দেখুন ({visibleHighRisk.length}টি) →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. NEWLY FILED RETURN CONFIRMATION BANNER */}
      {showFiledBanner && visibleFiled.length > 0 && (
        <div
          id="banner-newly-filed-return"
          className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/40 p-4 sm:p-5 shadow-xs transition-all"
        >
          {/* Emerald accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-600 shadow-2xs">
                <FileCheck2 className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    দাখিল নিশ্চিতকরণ
                  </span>
                  <h3 className="text-sm font-bold text-emerald-950 sm:text-base">
                    রিটার্ন সফলভাবে দাখিল ও পিএসআর (PSR) প্রস্তুত
                  </h3>
                  <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    {visibleFiled.length} টি রিটার্ন দাখিল সম্পন্ন
                  </span>
                </div>

                <p className="mt-1 text-xs text-emerald-900/90 leading-relaxed sm:text-sm">
                  করদাতাদের রিটার্ন এনবিআর ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে সফলভাবে দাখিল হয়েছে। ধারা ২৬৪ অনুসারে ব্যাংক লোন, গাড়ি ও ৪৩+ নাগরিক সেবায় গ্রহণযোগ্য প্রমাণক (PSR) প্রস্তুত।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsFiledExpanded(!isFiledExpanded)}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-white transition-colors"
              >
                {isFiledExpanded ? (
                  <>
                    <span>সংক্ষিপ্ত করুন</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>দাখিলকৃত রিটার্ন ({visibleFiled.length})</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowFiledBanner(false)}
                title="ব্যানার বন্ধ করুন"
                className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded List of Filed Returns */}
          {isFiledExpanded && (
            <div className="mt-4 border-t border-emerald-200/80 pt-3">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {visibleFiled.slice(0, 2).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs hover:border-emerald-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                        <p className="text-xs font-bold text-slate-900">{r.clientName}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.returnType} · কর বছর {r.assessmentYear} · পিএসআর ভেরিফায়েড
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/returns/${r.id}`}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        রিটার্ন ও PSR দেখুন
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- INTERACTIVE TEST / CONTROL PILL -------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <Bell className="h-4 w-4 text-emerald-700" />
          <span>ড্যাশবোর্ড নোটিফিকেশন ইঞ্জিন:</span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
            {highRiskReturns.length} অডিট সতর্কতা
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
            {filedReturns.length} দাখিলকৃত রিটার্ন
          </span>
        </div>

        {/* Live Simulation Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 font-medium hidden md:inline">সিমুলেশন টেস্ট:</span>
          <button
            type="button"
            onClick={triggerSimulatedHighRiskToast}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-colors"
          >
            <Zap className="h-3 w-3" />
            উচ্চ ঝুঁকি টোস্ট টেস্ট
          </button>

          <button
            type="button"
            onClick={triggerSimulatedFilingToast}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            রিটার্ন দাখিল টোস্ট টেস্ট
          </button>

          {(!showHighRiskBanner || !showFiledBanner) && (
            <button
              type="button"
              onClick={resetAllDismissals}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
              title="সকল ব্যানার পুনরায় প্রদর্শন করুন"
            >
              <RotateCcw className="h-3 w-3" />
              ব্যানার রিস্টোর
            </button>
          )}
        </div>
      </div>

      {/* -------------------- FLOATING LIVE NOTIFICATION TOAST -------------------- */}
      <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeToast && (
            <motion.div
              key={activeToast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onMouseEnter={() => setIsToastPaused(true)}
              onMouseLeave={() => setIsToastPaused(false)}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${
                activeToast.type === "high_risk"
                  ? "border-rose-300 bg-white/95 text-slate-900 ring-1 ring-rose-200"
                  : "border-emerald-300 bg-white/95 text-slate-900 ring-1 ring-emerald-200"
              }`}
            >
              {/* Progress Countdown Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                <div
                  className={`h-full animate-[shrink_7.5s_linear_forwards] ${
                    activeToast.type === "high_risk" ? "bg-rose-500" : "bg-emerald-600"
                  }`}
                  style={{
                    animationPlayState: isToastPaused ? "paused" : "running",
                  }}
                />
              </div>

              <div className="flex items-start gap-3 pt-1">
                {/* Status Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                    activeToast.type === "high_risk"
                      ? "bg-rose-600 shadow-xs shadow-rose-200"
                      : "bg-emerald-600 shadow-xs shadow-emerald-200"
                  }`}
                >
                  {activeToast.type === "high_risk" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeToast.type === "high_risk"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {activeToast.type === "high_risk" ? "অডিট অ্যালার্ট" : "দাখিল সম্পন্ন"}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {activeToast.timestamp}
                    </span>
                  </div>

                  <h4 className="mt-1 text-sm font-bold text-slate-900 leading-tight">
                    {activeToast.title}
                  </h4>

                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    {activeToast.subtitle}
                  </p>

                  <p className="mt-1 text-xs text-slate-600 leading-snug">
                    {activeToast.detail}
                  </p>

                  {/* Toast Action Buttons */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-600 font-medium">
                      {isToastPaused ? "কাউন্টডাউন বিরতি..." : "স্বয়ংক্রিয়ভাবে বন্ধ হবে"}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/returns/${activeToast.returnId}`}
                        onClick={handleDismissToast}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors ${
                          activeToast.type === "high_risk"
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <span>
                          {activeToast.type === "high_risk"
                            ? "ঝুঁকি সমাধান করুন"
                            : "রিটার্ন ও PSR দেখুন"}
                        </span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleDismissToast}
                  className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="টোস্ট বন্ধ করুন"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
