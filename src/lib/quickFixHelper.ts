import type { AuditIssue } from "@/lib/taxEngine";

/**
 * Determines whether an audit issue is categorized as "low-effort"
 * (i.e. can be resolved automatically via standard document templates,
 * routine checklists, or automated schedule attachments).
 */
export function isLowEffortIssue(issue: AuditIssue): boolean {
  if (issue.resolved) return false;
  
  // Any issue with low severity and non-zero points is strictly low-effort
  if (issue.severity === "low" && issue.points > 0) return true;

  const title = (issue.title || "").toLowerCase();
  const titleBn = (issue.titleBn || "").toLowerCase();
  const desc = (issue.description || "").toLowerCase();

  // Low-effort routine documentation gaps and administrative mismatch fixes
  if (
    title.includes("expense documentation") ||
    titleBn.includes("ব্যয়ের দলিলাদি") ||
    desc.includes("expense") ||
    title.includes("depreciation schedule") ||
    titleBn.includes("অবচয় তফসিল") ||
    title.includes("return type mismatch") ||
    titleBn.includes("রিটার্নের ধরন") ||
    title.includes("missing nid") ||
    titleBn.includes("এনআইডি অনুপস্থিত")
  ) {
    return true;
  }

  // Any other issue with points <= 5 that is in documentation category
  if (issue.category === "documentation" && issue.points <= 5) {
    return true;
  }

  return false;
}

export interface LowEffortFixDetail {
  actionBn: string;
  actionEn: string;
  appliedDocument?: string;
  effortBadge: string;
}

/**
 * Returns specific automated quick-fix action descriptions for low-effort issues.
 */
export function getLowEffortFixDetails(issue: AuditIssue): LowEffortFixDetail {
  const title = (issue.title || "").toLowerCase();
  const titleBn = (issue.titleBn || "").toLowerCase();

  if (title.includes("expense") || titleBn.includes("ব্যয়")) {
    return {
      actionBn: "স্ট্যান্ডার্ড ভাউচার ফাইল ও দৈনিক ব্যয় রেজিস্টার টেমপ্লেট সংযুক্ত ও সত্যায়িত করা হয়েছে।",
      actionEn: "Standard expense register & voucher bundle auto-attached.",
      appliedDocument: "expense_receipts",
      effortBadge: "স্বয়ংক্রিয় রেজিস্টার",
    };
  }

  if (title.includes("depreciation") || titleBn.includes("অবচয়")) {
    return {
      actionBn: "আয়কর আইন ২০২৩ এর দ্বিতীয় তফসিল অনুযায়ী স্ট্যান্ডার্ড অবচয় হিসাব শিডিউল প্রস্তুত ও সংযুক্ত করা হয়েছে।",
      actionEn: "Schedule 2 standard depreciation schedule auto-generated.",
      appliedDocument: "depreciation_schedule",
      effortBadge: "তফসিল জেনারেশন",
    };
  }

  if (title.includes("return type") || titleBn.includes("ধরন")) {
    return {
      actionBn: "ব্যবসায়িক আয়ের উপযোগী স্ট্যান্ডার্ড রিটার্ন ফর্ম (IT-12 / IT-11GA) এ স্বয়ংক্রিয় রূপান্তর সম্পন্ন হয়েছে।",
      actionEn: "Form automatically corrected to business-compliant IT-12 form.",
      effortBadge: "ফরম আপডেট",
    };
  }

  if (title.includes("nid") || titleBn.includes("এনআইডি")) {
    return {
      actionBn: "ক্লায়েন্ট ফাইলে এনআইডি ডিক্লারেশন স্লিপ ও প্রাপ্তি স্বীকারপত্র যুক্ত করা হয়েছে।",
      actionEn: "Client NID verification declaration attached.",
      appliedDocument: "nid",
      effortBadge: "আইডি ডিক্লারেশন",
    };
  }

  return {
    actionBn: "স্ট্যান্ডার্ড চেকলিস্ট ও স্ব-ঘোষণা নথির মাধ্যমে সংবিধিবদ্ধ সমাধান প্রয়োগ করা হয়েছে।",
    actionEn: "Resolved via standard statutory compliance self-declaration.",
    effortBadge: "স্ব-ঘোষণা",
  };
}

/**
 * Recalculates audit score after excluding resolved issues
 */
export function recalculateAuditScore(
  allIssues: AuditIssue[],
  isRiskShielded = false,
  hasLargeLoanNoBank = false
): { score: number; level: "low" | "medium" | "high" | "critical"; activePoints: number; deductedPoints: number } {
  const activeIssues = allIssues.filter((i) => !i.resolved);
  const resolvedIssues = allIssues.filter((i) => i.resolved);

  const activePoints = activeIssues.reduce((sum, i) => sum + i.points, 0);
  const deductedPoints = resolvedIssues.reduce((sum, i) => sum + i.points, 0);

  const breakdown = { compliance: 0, financial: 0, documentation: 0, regulatory: 0 };
  for (const issue of activeIssues) {
    if (breakdown[issue.category] !== undefined) {
      breakdown[issue.category] += issue.points;
    }
  }

  const capped = {
    compliance: Math.min(breakdown.compliance, 40),
    financial: Math.min(breakdown.financial, 35),
    documentation: Math.min(breakdown.documentation, 15),
    regulatory: Math.min(breakdown.regulatory, 10),
  };

  let rawScore = capped.compliance + capped.financial + capped.documentation + capped.regulatory;
  if (isRiskShielded && !hasLargeLoanNoBank) {
    rawScore = Math.max(5, Math.round(rawScore * 0.5));
  }

  const score = Math.min(100, Math.max(0, rawScore));
  let level: "low" | "medium" | "high" | "critical" = "low";
  if (score > 60) level = "critical";
  else if (score > 40) level = "high";
  else if (score > 20) level = "medium";

  return { score, level, activePoints, deductedPoints };
}
