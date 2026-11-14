// ---------------------------------------------------------------------------
// সাবস্ক্রিপশন প্ল্যান ক্যাটালগ — psr.bd (BTCP)
// ---------------------------------------------------------------------------
// দামগুলো PLACEHOLDER — সিহাবের অনুমোদন ছাড়া চূড়ান্ত নয়। প্ল্যান ফাইলে
// (subscription-plan.md) কোনো অঙ্ক নির্ধারিত ছিল না, তাই যুক্তিসংগত BDT
// অনুমান ব্যবহার করা হয়েছে: চেম্বার-ভিত্তিক B2B টুল হিসেবে মাসিক ৳১,৫০০,
// বার্ষিক ৳১৫,০০০ (২ মাস ফ্রি)। দাম বদলাতে শুধু এই ফাইলটি বদলালেই হবে।
// ---------------------------------------------------------------------------

export type PlanId = "free" | "pro";
export type BillingCycle = "monthly" | "yearly";

export interface PlanPrice {
  cycle: BillingCycle;
  amountBdt: number;
  labelBn: string;
  /** মেয়াদের দৈর্ঘ্য — activation-এ currentPeriodEnd হিসাব করতে ব্যবহৃত হয় */
  months: number;
}

export interface PlanDefinition {
  id: PlanId;
  nameBn: string;
  nameEn: string;
  prices: PlanPrice[];
  maxClients: number | null; // null = আনলিমিটেড
  maxReturns: number | null; // null = আনলিমিটেড (চেম্বারের মোট রিটার্ন)
  featuresBn: string[];
  limitsBn: string[];
}

export const FREE_MAX_CLIENTS = 5;
export const FREE_MAX_RETURNS = 5;

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    nameBn: "ফ্রি",
    nameEn: "Free",
    prices: [{ cycle: "monthly", amountBdt: 0, labelBn: "ফ্রি — ৳০", months: 1 }],
    maxClients: FREE_MAX_CLIENTS,
    maxReturns: FREE_MAX_RETURNS,
    featuresBn: [
      "ল্যান্ডিং সিমুলেটর ও ১০টি ক্যালকুলেটর (সবার জন্য ফ্রি)",
      "ব্লগ, নলেজ বেস ও চেকলিস্ট",
      "বেসিক ড্যাশবোর্ড",
      `প্রথম ${FREE_MAX_CLIENTS} জন ক্লায়েন্ট`,
      `প্রথম ${FREE_MAX_RETURNS}টি রিটার্ন (শুধু ড্রাফট)`,
      "সাধারণ বার্ষিক ডেডলাইন ক্যালেন্ডার",
    ],
    limitsBn: [
      `${FREE_MAX_CLIENTS} জনের বেশি ক্লায়েন্ট নয়`,
      `${FREE_MAX_RETURNS}টির বেশি রিটার্ন নয়`,
      "Bulk Quick-Fix, PDF এক্সপোর্ট ও ক্লায়েন্ট পোর্টাল নেই",
    ],
  },
  pro: {
    id: "pro",
    nameBn: "প্রো",
    nameEn: "Pro",
    prices: [
      { cycle: "monthly", amountBdt: 1500, labelBn: "৳১,৫০০ / মাস", months: 1 },
      { cycle: "yearly", amountBdt: 15000, labelBn: "৳১৫,০০০ / বছর", months: 12 },
    ],
    maxClients: null,
    maxReturns: null,
    featuresBn: [
      "আনলিমিটেড ক্লায়েন্ট, ব্যাংক অ্যাকাউন্ট ও ডকুমেন্ট",
      "আনলিমিটেড রিটার্ন — §104 শিল্ড + অডিট-ঝুঁকি স্কোরিং",
      "Bulk Quick-Fix (এক ক্লিকে সব সহজ সমাধান)",
      "প্রতি-ক্লায়েন্ট ডেডলাইন, অটো-সিড ও মেয়াদোত্তীর্ণ অ্যালার্ট",
      "মাল্টি-ইউজার চেম্বার (পার্টনার / অ্যাসোসিয়েট / অ্যাসিস্ট্যান্ট)",
      "ক্লায়েন্ট পোর্টাল / PSR যাচাই শেয়ার লিংক",
      "রিটার্ন + অডিট রিপোর্ট PDF এক্সপোর্ট (প্রিন্ট / PDF)",
      "ডেডলাইন ইমেইল/SMS রিমাইন্ডার (সেবা চালু হলে)",
      "পূর্ণ Audit Exposure উইজেট + ঝুঁকি তুলনা",
    ],
    limitsBn: ["কোনো সীমা নেই — প্রতি চেম্বারে একটি সাবস্ক্রিপশন"],
  },
};

export function getPlan(planId: PlanId): PlanDefinition {
  return PLANS[planId] ?? PLANS.free;
}

export function getPrice(planId: PlanId, cycle: BillingCycle): PlanPrice {
  const plan = getPlan(planId);
  return plan.prices.find((p) => p.cycle === cycle) ?? plan.prices[0];
}

export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-US")}`;
}

export function formatDateBn(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}
