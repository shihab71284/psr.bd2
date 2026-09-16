// Bangladesh Income Tax Compliance & Firm-wide Audit Exposure Calculator
// Based on Income Tax Act 2023 (Sections 104, 166, 182, 272, 275) and Audit Guidelines 2025

export interface ReturnExposureItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  assessmentYear: string;
  incomeYear?: string | null;
  returnType: string;
  status: string;
  totalIncome?: string | number | null;
  auditRiskScore?: string | number | null;
  auditRiskLevel?: string | null;
  isRiskShielded?: boolean | null;
  hasLargeLoanNoBank?: boolean | null;
  bookOfAccountsMaintained?: boolean | null;
  hasExemptIncome?: boolean | null;
  calculation?: any;
  auditIssues?: any;
  submissionDate?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface CalculatedReturnWithExposure extends ReturnExposureItem {
  calculatedExposure: number;
  taxPayable: number;
  primaryTrigger: string;
  actionableFix: string;
  mitigablePortion: number;
}

export interface FirmAuditExposureSummary {
  totalExposure: number;
  criticalExposure: number;
  highExposure: number;
  mediumExposure: number;
  lowExposure: number;
  totalReturns: number;
  uniqueClientsCount: number;
  shieldedReturnsCount: number;
  complianceHealthScore: number;
  mitigableExposure: number;
  byLevel: {
    critical: { count: number; exposure: number; percent: number; clientCount: number };
    high: { count: number; exposure: number; percent: number; clientCount: number };
    medium: { count: number; exposure: number; percent: number; clientCount: number };
    low: { count: number; exposure: number; percent: number; clientCount: number };
  };
  returns: CalculatedReturnWithExposure[];
}

export function calculateReturnExposure(ret: ReturnExposureItem): {
  exposure: number;
  taxPayable: number;
  primaryTrigger: string;
  actionableFix: string;
  mitigablePortion: number;
} {
  const calc = ret.calculation || {};
  const taxPayable = Math.max(
    0,
    Number(calc.finalPayable || calc.taxAfterMinimum || calc.grossTaxBeforeRebate || 0)
  );
  const level = (ret.auditRiskLevel || "low").toLowerCase();

  let loanExposure = 0;
  let bookExposure = 0;
  let exemptionExposure = 0;

  // ১. ব্যাংক স্টেটমেন্ট ছাড়া ৫ লক্ষাধিক অপ্রাতিষ্ঠানিক ঋণ (ধারা ১০৪(২)(খ) / ধারা ২১)
  if (ret.hasLargeLoanNoBank) {
    // কর ফাঁকি বা অপ্রদর্শিত আয় গণ্য করে ধারা ২৭২ পেনাল্টি (১৫% + ১০%/বছর) সহ আনুমানিক দায়
    loanExposure = 185000;
  }

  // ২. ধারা ১৬৬ অনুযায়ী বিধিবদ্ধ হিসাব খাতা ও ভাউচার সংরক্ষণ ঘাটতি
  if (ret.bookOfAccountsMaintained === false) {
    // ব্যয় নাকচ ও ধারা ২৬৬/২৭১ জরিমানা ঝুঁকি
    bookExposure = 75000;
  }

  // ৩. ধারা ৩ ও ষষ্ঠ তফসিল অনুযায়ী কর অব্যাহতি দাবি (সনদহীন)
  if (ret.hasExemptIncome) {
    exemptionExposure = 35000;
  }

  let exposure = 0;
  let primaryTrigger = "নিয়মিত সেলফ-অ্যাসেসমেন্ট";
  let actionableFix = "ফাইল ও রিটার্ন নথিভুক্ত রাখুন";
  let mitigablePortion = 0;

  if (level === "critical") {
    // ধারা ১৮২ অনুযায়ী সরাসরি অডিট সিলেকশন ও ধারা ২৭২ এর সর্বোচ্চ জরিমানা ঝুঁকি
    exposure = Math.round(taxPayable * 1.4 + loanExposure + bookExposure + exemptionExposure + 60000);
    mitigablePortion = loanExposure + bookExposure;

    if (ret.hasLargeLoanNoBank) {
      primaryTrigger = "ধারা ১০৪: অপ্রাতিষ্ঠানিক ঋণ > ৫ লাখ (ব্যাংক স্টেটমেন্ট নেই)";
      actionableFix = "ঋণদাতার ব্যাংক হিসাব বিবরণী ও টিআইএন ফাইল করুন";
    } else if (ret.bookOfAccountsMaintained === false) {
      primaryTrigger = "ধারা ১৬৬: বিধিবদ্ধ হিসাব খাতা ও ভাউচার অনুপস্থিত";
      actionableFix = "অনুমোদিত ক্যাশ ও লেজার খাতা অডিট উপযোগী করুন";
    } else {
      primaryTrigger = "অডিট ঝুঁকি সূচক সংকটজনক (> ৬০ পয়েন্ট)";
      actionableFix = "এনবিআরে দাখিলের পূর্বে ফাইল পুঙ্খানুপুঙ্খ অডিট করুন";
    }
  } else if (level === "high") {
    // উচ্চ অডিট সম্ভাবনা
    exposure = Math.round(taxPayable * 0.75 + loanExposure * 0.7 + bookExposure * 0.7 + 35000);
    mitigablePortion = Math.round(loanExposure * 0.7 + bookExposure * 0.7);

    if (ret.hasLargeLoanNoBank) {
      primaryTrigger = "অপ্রাতিষ্ঠানিক ঋণ যাচাই নোটিশ ঝুঁকি";
      actionableFix = "ব্যাংকিং চ্যানেলে লেনদেনের স্টেটমেন্ট সংযুক্ত করুন";
    } else if (ret.bookOfAccountsMaintained === false) {
      primaryTrigger = "হিসাব বই ও ক্রয়-বিক্রয় চালানের ঘাটতি";
      actionableFix = "আয়-ব্যয়ের সমর্থনে ব্যাংক চালান ও ভাউচার সংগ্রহ করুন";
    } else {
      primaryTrigger = "উচ্চ অডিট ঝুঁকি (টিডিএস বা নথিপত্র অসম্পূর্ণ)";
      actionableFix = "অনুপস্থিত চালান ও উৎসে কর সনদ সংগ্রহ করুন";
    }
  } else if (level === "medium") {
    // মাঝারি ঝুঁকি
    exposure = Math.round(Math.max(15000, taxPayable * 0.25 + exemptionExposure * 0.5));
    mitigablePortion = Math.round(exemptionExposure * 0.5);
    primaryTrigger = "নথিপত্র যাচাই ও রিবেট পুনর্মূল্যায়ন ঝুঁকি";
    actionableFix = "বিনিয়োগ প্রমাণপত্র ও ব্যাংক স্টেটমেন্ট প্রস্তুত রাখুন";
  } else {
    // Low / Shielded
    if (ret.isRiskShielded) {
      exposure = 0;
      mitigablePortion = 0;
      primaryTrigger = "ধারা ১০৪: ১৫% আয় বৃদ্ধি অডিট সুরক্ষা সক্রিয়";
      actionableFix = "ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে নিরাপদে দাখিলযোগ্য";
    } else {
      exposure = Math.round(Math.min(10000, taxPayable * 0.05));
      mitigablePortion = 0;
      primaryTrigger = "স্বল্প ঝুঁকিপূর্ণ নিয়মিত সেলফ-অ্যাসেসমেন্ট";
      actionableFix = "স্বাভাবিক নিয়মে দাখিল ও একনলেজমেন্ট সংগ্রহ করুন";
    }
  }

  return { exposure, taxPayable, primaryTrigger, actionableFix, mitigablePortion };
}

export function computeFirmAuditExposure(returnsList: ReturnExposureItem[]): FirmAuditExposureSummary {
  const calculatedList: CalculatedReturnWithExposure[] = returnsList.map((r) => {
    const { exposure, taxPayable, primaryTrigger, actionableFix, mitigablePortion } = calculateReturnExposure(r);
    return {
      ...r,
      calculatedExposure: exposure,
      taxPayable,
      primaryTrigger,
      actionableFix,
      mitigablePortion,
    };
  });

  let totalExposure = 0;
  let criticalExposure = 0;
  let highExposure = 0;
  let mediumExposure = 0;
  let lowExposure = 0;
  let mitigableExposure = 0;
  let shieldedCount = 0;

  const criticalClients = new Set<string>();
  const highClients = new Set<string>();
  const mediumClients = new Set<string>();
  const lowClients = new Set<string>();
  const allClients = new Set<string>();

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const item of calculatedList) {
    totalExposure += item.calculatedExposure;
    mitigableExposure += item.mitigablePortion;
    allClients.add(item.clientId);

    if (item.isRiskShielded) {
      shieldedCount++;
    }

    const lvl = (item.auditRiskLevel || "low").toLowerCase();
    if (lvl === "critical") {
      criticalCount++;
      criticalExposure += item.calculatedExposure;
      criticalClients.add(item.clientId);
    } else if (lvl === "high") {
      highCount++;
      highExposure += item.calculatedExposure;
      highClients.add(item.clientId);
    } else if (lvl === "medium") {
      mediumCount++;
      mediumExposure += item.calculatedExposure;
      mediumClients.add(item.clientId);
    } else {
      lowCount++;
      lowExposure += item.calculatedExposure;
      lowClients.add(item.clientId);
    }
  }

  const totalReturns = calculatedList.length;

  // Compliance Health Score: (Low * 100 + Medium * 65 + High * 25 + Critical * 0) / total
  const complianceHealthScore =
    totalReturns > 0
      ? Math.round(
          (lowCount * 100 + mediumCount * 65 + highCount * 25 + criticalCount * 0) / totalReturns
        )
      : 100;

  const getPercent = (amount: number) =>
    totalExposure > 0 ? Math.round((amount / totalExposure) * 100) : 0;

  return {
    totalExposure,
    criticalExposure,
    highExposure,
    mediumExposure,
    lowExposure,
    totalReturns,
    uniqueClientsCount: allClients.size,
    shieldedReturnsCount: shieldedCount,
    complianceHealthScore,
    mitigableExposure,
    byLevel: {
      critical: {
        count: criticalCount,
        exposure: criticalExposure,
        percent: getPercent(criticalExposure),
        clientCount: criticalClients.size,
      },
      high: {
        count: highCount,
        exposure: highExposure,
        percent: getPercent(highExposure),
        clientCount: highClients.size,
      },
      medium: {
        count: mediumCount,
        exposure: mediumExposure,
        percent: getPercent(mediumExposure),
        clientCount: mediumClients.size,
      },
      low: {
        count: lowCount,
        exposure: lowExposure,
        percent: getPercent(lowExposure),
        clientCount: lowClients.size,
      },
    },
    returns: calculatedList,
  };
}
