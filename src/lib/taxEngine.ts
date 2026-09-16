// Bangladesh Income Tax calculation & audit-risk rule engine
// NOTE: Figures are indicative, based on Income Tax Act 2023 / Finance Act 2025
// structure. Always verify against the latest NBR SRO / circular before filing.

export type TaxpayerCategory = "general" | "female_senior" | "disabled" | "freedom_fighter";
export type Location = "dhaka_ctg" | "other_city_corp" | "other";

export const CATEGORY_LABELS: Record<TaxpayerCategory, { bn: string; en: string; threshold: number }> = {
  general: { bn: "সাধারণ পুরুষ করদাতা", en: "General (Male)", threshold: 375000 },
  female_senior: { bn: "মহিলা / ৬৫+ বয়স্ক করদাতা", en: "Female / Senior (65+)", threshold: 425000 },
  disabled: { bn: "প্রতিবন্ধী করদাতা", en: "Person with Disability", threshold: 500000 },
  freedom_fighter: { bn: "গেজেটভুক্ত মুক্তিযোদ্ধা", en: "Gazetted Freedom Fighter", threshold: 525000 },
};

export const LOCATION_LABELS: Record<Location, { bn: string; en: string; minTax: number }> = {
  dhaka_ctg: { bn: "ঢাকা উত্তর/দক্ষিণ সিটি কর্পোরেশন ও চট্টগ্রাম সিটি কর্পোরেশন", en: "Dhaka North/South & Chattogram City Corp.", minTax: 5000 },
  other_city_corp: { bn: "অন্যান্য সিটি কর্পোরেশন", en: "Other City Corporations", minTax: 4000 },
  other: { bn: "সিটি কর্পোরেশনের বাইরে", en: "Outside City Corporation", minTax: 3000 },
};

export const DEPRECIATION_RATES: Record<string, { bn: string; en: string; rate: number }> = {
  building: { bn: "দালান/ভবন", en: "Building", rate: 0.05 },
  furniture: { bn: "আসবাবপত্র", en: "Furniture & Fixtures", rate: 0.1 },
  machinery: { bn: "যন্ত্রপাতি ও মেশিনারি", en: "Plant & Machinery", rate: 0.2 },
  motor_vehicle: { bn: "মোটরযান", en: "Motor Vehicle", rate: 0.2 },
  computer: { bn: "কম্পিউটার", en: "Computer & IT Equipment", rate: 0.3333 },
  office_equipment: { bn: "অফিস সরঞ্জাম", en: "Office Equipment", rate: 0.1 },
};

export const TDS_RATES: Record<string, { bn: string; en: string; rate: number }> = {
  salary: { bn: "বেতন (গড় হার)", en: "Salary (avg. slab rate)", rate: 0.1 },
  contractor: { bn: "সরবরাহ/ঠিকাদারি", en: "Contractor / Supplier", rate: 0.05 },
  professional_fee: { bn: "পেশাগত ফি", en: "Professional / Technical Fee", rate: 0.1 },
  rent: { bn: "ভাড়া", en: "House / Property Rent", rate: 0.05 },
  interest: { bn: "সঞ্চয়/মুনাফা", en: "Interest / Savings Profit", rate: 0.1 },
  commission: { bn: "কমিশন", en: "Commission / Brokerage", rate: 0.1 },
};

export const VAT_RATES = [0.05, 0.075, 0.15];

export interface IncomeTaxInput {
  category: TaxpayerCategory;
  location: Location;
  incomeSalary: number;
  incomeBusiness: number;
  incomeProperty: number;
  incomeCapitalGain: number;
  incomeAgricultural: number;
  incomeOther: number;
  investmentAmount: number;
  totalAssets: number;
  totalLiabilities: number;
  tdsAmount: number;
  advanceTaxPaid: number;
  hasBusinessIncome?: boolean;
}

export interface SlabBreakdown {
  from: number;
  to: number | null;
  rate: number;
  taxableInBand: number;
  taxOnBand: number;
}

export interface IncomeTaxResult {
  totalIncome: number;
  taxableIncome: number;
  threshold: number;
  slabs: SlabBreakdown[];
  grossTaxBeforeRebate: number;
  eligibleInvestment: number;
  investmentRebate: number;
  taxAfterRebate: number;
  netWealth: number;
  surchargeApplicable: boolean;
  surchargeRate: number;
  surchargeAmount: number;
  minimumTax: number;
  minimumTaxApplied: boolean;
  taxAfterMinimum: number;
  tdsAmount: number;
  advanceTaxPaid: number;
  finalPayable: number;
  isRefund: boolean;
}

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const totalIncome =
    input.incomeSalary +
    input.incomeBusiness +
    input.incomeProperty +
    input.incomeCapitalGain +
    input.incomeAgricultural +
    input.incomeOther;

  const taxableIncome = Math.max(0, totalIncome);
  const threshold = CATEGORY_LABELS[input.category].threshold;

  // Progressive slab structure (indicative, FY2025-26)
  const bands: { width: number; rate: number }[] = [
    { width: threshold, rate: 0 },
    { width: 300000, rate: 0.05 },
    { width: 400000, rate: 0.1 },
    { width: 500000, rate: 0.15 },
    { width: 500000, rate: 0.2 },
    { width: Infinity, rate: 0.25 },
  ];

  let remaining = taxableIncome;
  let cursor = 0;
  const slabs: SlabBreakdown[] = [];
  let grossTax = 0;

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandAmount = Math.min(remaining, band.width);
    const taxOnBand = bandAmount * band.rate;
    slabs.push({
      from: cursor,
      to: band.width === Infinity ? null : cursor + band.width,
      rate: band.rate,
      taxableInBand: bandAmount,
      taxOnBand,
    });
    grossTax += taxOnBand;
    remaining -= bandAmount;
    cursor += band.width;
  }

  // Investment rebate: 15% of lower of (actual investment, 20% of taxable income, 15,00,000)
  const investmentCap = Math.min(input.investmentAmount, taxableIncome * 0.2, 1500000);
  const eligibleInvestment = Math.max(0, investmentCap);
  let investmentRebate = eligibleInvestment * 0.15;
  investmentRebate = Math.min(investmentRebate, grossTax);

  const taxAfterRebate = Math.max(0, grossTax - investmentRebate);

  const netWealth = Math.max(0, input.totalAssets - input.totalLiabilities);
  const surchargeApplicable = netWealth > 40000000;
  const surchargeRate = surchargeApplicable ? 0.1 : 0;
  const surchargeAmount = taxAfterRebate * surchargeRate;

  const minimumTax = LOCATION_LABELS[input.location].minTax;
  const preMinimumTax = taxAfterRebate + surchargeAmount;
  const minimumTaxApplied = (input.hasBusinessIncome ?? true) && taxableIncome > threshold && preMinimumTax < minimumTax;
  const taxAfterMinimum = minimumTaxApplied ? minimumTax : preMinimumTax;

  const finalPayable = taxAfterMinimum - input.tdsAmount - input.advanceTaxPaid;

  return {
    totalIncome,
    taxableIncome,
    threshold,
    slabs,
    grossTaxBeforeRebate: grossTax,
    eligibleInvestment,
    investmentRebate,
    taxAfterRebate,
    netWealth,
    surchargeApplicable,
    surchargeRate,
    surchargeAmount,
    minimumTax,
    minimumTaxApplied,
    taxAfterMinimum,
    tdsAmount: input.tdsAmount,
    advanceTaxPaid: input.advanceTaxPaid,
    finalPayable: Math.round(finalPayable),
    isRefund: finalPayable < 0,
  };
}

export function calculateVat(amount: number, rate: number, inclusive: boolean) {
  if (inclusive) {
    const base = amount / (1 + rate);
    const vat = amount - base;
    return { base: round2(base), vat: round2(vat), total: round2(amount) };
  }
  const vat = amount * rate;
  return { base: round2(amount), vat: round2(vat), total: round2(amount + vat) };
}

export function calculateDepreciation(openingWDV: number, additions: number, category: keyof typeof DEPRECIATION_RATES) {
  const rate = DEPRECIATION_RATES[category].rate;
  const base = openingWDV + additions;
  const depreciation = base * rate;
  const closingWDV = base - depreciation;
  return { base: round2(base), rate, depreciation: round2(depreciation), closingWDV: round2(closingWDV) };
}

export function calculateTds(paymentAmount: number, category: keyof typeof TDS_RATES) {
  const rate = TDS_RATES[category].rate;
  const tds = paymentAmount * rate;
  return { rate, tds: round2(tds), netPayment: round2(paymentAmount - tds) };
}

export function calculateNetWorth(assets: number, liabilities: number) {
  const netWorth = assets - liabilities;
  const surchargeApplicable = netWorth > 40000000;
  return { netWorth: round2(netWorth), surchargeApplicable };
}

export function calculateCapitalGain(purchasePrice: number, salePrice: number, holdingYears: number, listed: boolean) {
  const gain = Math.max(0, salePrice - purchasePrice);
  let taxRate = 0;
  let note = "";
  if (listed) {
    if (holdingYears > 5) {
      taxRate = 0;
      note = "৫ বছরের বেশি ধারণকৃত তালিকাভুক্ত শেয়ারের মুনাফা করমুক্ত";
    } else {
      taxRate = 0.15;
      note = "৫ বছরের কম ধারণকৃত তালিকাভুক্ত শেয়ারের উপর ১৫% কর";
    }
  } else {
    taxRate = holdingYears >= 5 ? 0.15 : 0.15;
    note = "অতালিকাভুক্ত/স্থাবর সম্পত্তির ক্ষেত্রে সাধারণত ১৫% কর প্রযোজ্য (নির্দিষ্ট শর্ত সাপেক্ষে)";
  }
  const tax = gain * taxRate;
  return { gain: round2(gain), taxRate, tax: round2(tax), note };
}

export function calculateAdvanceTax(estimatedIncomeTax: number, previousYearTax: number) {
  const base = previousYearTax > 0 ? Math.min(estimatedIncomeTax, previousYearTax === 0 ? estimatedIncomeTax : previousYearTax) : estimatedIncomeTax;
  const applicable = estimatedIncomeTax > 400000 || previousYearTax > 400000;
  const quarterly = round2(base / 4);
  return {
    applicable,
    annual: round2(base),
    quarterly,
    schedule: [
      { label: "১৫ সেপ্টেম্বর", amount: quarterly },
      { label: "১৫ ডিসেম্বর", amount: quarterly },
      { label: "১৫ মার্চ", amount: quarterly },
      { label: "১৫ জুন", amount: quarterly },
    ],
  };
}

export function calculateInvestmentRebate(taxableIncome: number, investmentAmount: number) {
  const eligibleInvestment = Math.min(investmentAmount, taxableIncome * 0.2, 1500000);
  const rebate = Math.max(0, eligibleInvestment) * 0.15;
  return { eligibleInvestment: round2(eligibleInvestment), rebate: round2(rebate) };
}

export function splitPartnershipIncome(totalIncome: number, partners: { name: string; ratio: number }[]) {
  const totalRatio = partners.reduce((s, p) => s + p.ratio, 0) || 1;
  return partners.map((p) => ({
    name: p.name,
    ratio: p.ratio,
    share: round2((totalIncome * p.ratio) / totalRatio),
  }));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------------- AUDIT RISK ENGINE ----------------

export interface AuditIssue {
  category: "compliance" | "financial" | "documentation" | "regulatory";
  title: string;
  titleBn: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  points: number;
  section?: string;
  recommendation: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface AuditRiskInput {
  client: {
    tin?: string | null;
    nid?: string | null;
    clientType: string;
    vatRegistered: boolean;
  };
  taxReturn: {
    returnType: string;
    incomeSalary: number;
    incomeBusiness: number;
    incomeProperty: number;
    incomeCapitalGain: number;
    incomeAgricultural: number;
    incomeOther: number;
    previousYearIncome: number;
    investmentAmount: number;
    loanInterest: number;
    totalAssets: number;
    totalLiabilities: number;
    tdsAmount: number;
    hasBusinessAudit: boolean;
    hasLargeLoanNoBank?: boolean; // ৫ লক্ষের বেশি প্রাতিষ্ঠানিক বহির্ভূত ঋণ ব্যাংক স্টেটমেন্ট ছাড়া [১০৪]
    hasExemptIncome?: boolean; // কর অব্যাহতিপ্রাপ্ত আয় আছে কি না [৩]
    bookOfAccountsMaintained?: boolean; // হিসাব খাতা সংরক্ষণ করা হয়েছে কি না [১৬৬]
    isRiskShielded?: boolean; // ১৫% আয় বৃদ্ধির নিয়মে সুরক্ষিত কি না [১০৪]
  };
  documentCategories: string[];
}

export interface AuditRiskResult {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  issues: AuditIssue[];
  breakdown: { compliance: number; financial: number; documentation: number; regulatory: number };
  isRiskShielded?: boolean;
}

// ---------- দানকর হিসাব (দানকর আইন, ১৯৯০) [১৬৩৯] ----------
export const GIFT_TAX_SLABS = [
  { limit: 500000, rate: 0, descBn: "প্রথম ৫,০০,০০০ টাকা পর্যন্ত (করমুক্ত)" },
  { limit: 500000, rate: 5, descBn: "পরবর্তী ৫,০০,০০০ টাকা (৫%)" },
  { limit: 1000000, rate: 10, descBn: "পরবর্তী ১০,০০,০০০ টাকা (১০%)" },
  { limit: 2000000, rate: 15, descBn: "পরবর্তী ২০,০০,০০০ টাকা (১৫%)" },
  { limit: Infinity, rate: 20, descBn: "অবশিষ্টাংশ (২০%)" },
];

export interface GiftTaxResult {
  fairMarketValue: number;
  isExempt: boolean;
  exemptionReason: string;
  exemptionAmount: number;
  taxableAmount: number;
  taxableGiftValue: number;
  giftTaxPayable: number;
  legalRef: string;
  note: string;
  slabs: { label: string; amount: number; rate: number; tax: number }[];
}

export function calculateGiftTax(
  fairMarketValue: number,
  relationship: string
): GiftTaxResult {
  const value = Math.max(0, fairMarketValue);
  const exemptRelationships = ["spouse", "parent", "sibling", "child"];

  if (exemptRelationships.includes(relationship?.toLowerCase())) {
    const reason = "দানকর আইন, ১৯৯০ এর ধারা ৪(১) অনুযায়ী স্বামী/স্ত্রী, পিতা/মাতা, সন্তান বা আপন ভাই-বোনকে প্রদত্ত দান সম্পূর্ণ করমুক্ত।";
    return {
      fairMarketValue: value,
      isExempt: true,
      exemptionReason: reason,
      exemptionAmount: value,
      taxableAmount: 0,
      taxableGiftValue: 0,
      giftTaxPayable: 0,
      legalRef: "দানকর আইন, ১৯৯০ (ধারা ৪)",
      note: reason,
      slabs: [],
    };
  }

  // General donor slabs under Gift Tax Act 1990
  const slabsConfig = [
    { limit: 500000, rate: 0, label: "প্রথম ৫,০০,০০০ টাকা পর্যন্ত (করমুক্ত)" },
    { limit: 500000, rate: 0.05, label: "পরবর্তী ৫,০০,০০০ টাকা (৫%)" },
    { limit: 1000000, rate: 0.10, label: "পরবর্তী ১০,০০,০০০ টাকা (১০%)" },
    { limit: 2000000, rate: 0.15, label: "পরবর্তী ২০,০০,০০০ টাকা (১৫%)" },
    { limit: Infinity, rate: 0.20, label: "অবশিষ্টাংশ (২০%)" },
  ];

  let remaining = value;
  let totalTax = 0;
  const slabs: { label: string; amount: number; rate: number; tax: number }[] = [];

  for (const slab of slabsConfig) {
    if (remaining <= 0) break;
    const band = Math.min(remaining, slab.limit);
    const tax = band * slab.rate;
    slabs.push({
      label: slab.label,
      amount: band,
      rate: slab.rate,
      tax: round2(tax),
    });
    totalTax += tax;
    remaining -= band;
  }

  const exemptionAmount = Math.min(value, 500000);
  const taxable = Math.max(0, value - 500000);
  const reason = "দানকর আইন, ১৯৯০ এর ১ম তফসিল অনুযায়ী প্রদেয় কর হিসাবকৃত।";

  return {
    fairMarketValue: value,
    isExempt: false,
    exemptionReason: reason,
    exemptionAmount,
    taxableAmount: taxable,
    taxableGiftValue: taxable,
    giftTaxPayable: round2(totalTax),
    legalRef: "দানকর আইন, ১৯৯০ (১ম তফসিল)",
    note: reason,
    slabs,
  };
}

export function assessAuditRisk(input: AuditRiskInput): AuditRiskResult {
  const issues: AuditIssue[] = [];
  const docs = new Set(input.documentCategories);
  const r = input.taxReturn;
  const totalIncome =
    r.incomeSalary + r.incomeBusiness + r.incomeProperty + r.incomeCapitalGain + r.incomeAgricultural + r.incomeOther;
  const netWealth = r.totalAssets - r.totalLiabilities;
  const hasBusiness = r.incomeBusiness > 0;

  // --- A. Compliance risks (max 40) ---
  if (!input.client.tin) {
    issues.push({
      category: "compliance",
      title: "Missing TIN",
      titleBn: "টিআইএন অনুপস্থিত",
      description: "Client profile does not have a valid TIN recorded.",
      severity: "critical",
      points: 10,
      section: "Income Tax Act 2023, S.166-176",
      recommendation: "TIN সংগ্রহ করে ক্লায়েন্ট প্রোফাইল সম্পূর্ণ করুন।",
    });
  }
  if (!input.client.nid && input.client.clientType === "individual") {
    issues.push({
      category: "compliance",
      title: "Missing NID",
      titleBn: "এনআইডি অনুপস্থিত",
      description: "National ID copy is not attached to the client file.",
      severity: "medium",
      points: 5,
      recommendation: "ক্লায়েন্টের কাছ থেকে NID কপি সংগ্রহ করুন।",
    });
  }
  if ((r.totalAssets === 0 && r.totalLiabilities === 0) && totalIncome > 0) {
    issues.push({
      category: "compliance",
      title: "IT-10B2016 (Assets & Liabilities) missing",
      titleBn: "সম্পদ ও দায় বিবরণী (IT-10B2016) অসম্পূর্ণ",
      description: "Total assets/liabilities not provided; statement of assets & liabilities appears incomplete.",
      severity: "high",
      points: 10,
      section: "IT-10B2016",
      recommendation: "সম্পদ ও দায়ের সম্পূর্ণ তালিকা প্রস্তুত করুন।",
    });
  }
  if (r.tdsAmount > 0 && !docs.has("tds_certificate")) {
    issues.push({
      category: "compliance",
      title: "TDS certificates missing",
      titleBn: "টিডিএস সার্টিফিকেট অনুপস্থিত",
      description: "TDS credit is claimed but no TDS certificate document is on file.",
      severity: "high",
      points: 8,
      recommendation: "সকল উৎসে কর কর্তনের সার্টিফিকেট সংগ্রহ করুন।",
    });
  }
  if (r.investmentAmount > 0 && !docs.has("investment_proof")) {
    issues.push({
      category: "compliance",
      title: "Investment proof missing",
      titleBn: "বিনিয়োগের প্রমাণপত্র অনুপস্থিত",
      description: "Investment rebate is claimed without supporting proof documents.",
      severity: "medium",
      points: 6,
      section: "Schedule 24D",
      recommendation: "DPS/বিমা/সঞ্চয়পত্রের রশিদ বা সার্টিফিকেট সংগ্রহ করুন।",
    });
  }
  if (hasBusiness && r.returnType.includes("S")) {
    issues.push({
      category: "compliance",
      title: "Return type mismatch",
      titleBn: "রিটার্নের ধরন অসামঞ্জস্যপূর্ণ",
      description: "Business income exists but a salaried-only return form (IT-11S) is selected.",
      severity: "high",
      points: 8,
      recommendation: "সঠিক রিটার্ন ফরম নির্বাচন করুন (ব্যবসায়িক আয়সহ)।",
    });
  }

  // --- B. Financial risks (max 35) ---
  if (totalIncome > 0 && netWealth > 0 && netWealth < totalIncome * 0.5) {
    issues.push({
      category: "financial",
      title: "Net worth too low vs. income",
      titleBn: "আয়ের তুলনায় নিট সম্পদ অস্বাভাবিক কম",
      description: "Net wealth is unusually low compared to reported total income, which may raise scrutiny.",
      severity: "medium",
      points: 8,
      recommendation: "সম্পদ বিবরণী পুনরায় যাচাই করুন এবং ব্যাখ্যা প্রস্তুত রাখুন।",
    });
  }
  if (totalIncome > 0 && netWealth > totalIncome * 15) {
    issues.push({
      category: "financial",
      title: "Unexplained wealth growth",
      titleBn: "আয়ের তুলনায় সম্পদের অস্বাভাবিক প্রবৃদ্ধি",
      description: "Net wealth is disproportionately high relative to declared income for the year.",
      severity: "high",
      points: 9,
      recommendation: "সম্পদ বৃদ্ধির উৎস সম্পর্কিত ব্যাখ্যা ও দলিলাদি প্রস্তুত রাখুন।",
    });
  }
  if (r.previousYearIncome > 0 && totalIncome < r.previousYearIncome * 0.7) {
    const declinePct = Math.round((1 - totalIncome / r.previousYearIncome) * 100);
    issues.push({
      category: "financial",
      title: "Revenue decline > 30%",
      titleBn: `আয় হ্রাস (${declinePct}%)`,
      description: `Reported income has dropped by ${declinePct}% compared to the previous year without documented explanation.`,
      severity: "high",
      points: 8,
      recommendation: "আয় হ্রাসের কারণ সংক্রান্ত ব্যাখ্যা ও প্রমাণ সংযুক্ত করুন।",
    });
  }
  const taxToIncomeRatio = totalIncome > 0 ? (r.tdsAmount / totalIncome) * 100 : 0;
  if (totalIncome > 0 && (taxToIncomeRatio < 2 || taxToIncomeRatio > 25)) {
    issues.push({
      category: "financial",
      title: "Unusual tax-to-income ratio",
      titleBn: "কর ও আয়ের অনুপাত অস্বাভাবিক",
      description: `Effective TDS-to-income ratio is ${taxToIncomeRatio.toFixed(1)}%, outside the typical 2%-25% band.`,
      severity: "medium",
      points: 6,
      recommendation: "TDS ও আয়ের হিসাব পুনরায় মিলিয়ে দেখুন।",
    });
  }
  if (hasBusiness && r.incomeBusiness > 0 && netWealth < 0) {
    issues.push({
      category: "financial",
      title: "Negative net wealth with business income",
      titleBn: "ব্যবসায়িক আয় থাকা সত্ত্বেও ঋণাত্মক নিট সম্পদ",
      description: "Liabilities exceed assets while business income is reported positive.",
      severity: "medium",
      points: 4,
      recommendation: "দায় ও সম্পদের হিসাব পুনরায় যাচাই করুন।",
    });
  }

  // --- C. Documentation risks (max 15) ---
  if (hasBusiness && !docs.has("depreciation_schedule")) {
    issues.push({
      category: "documentation",
      title: "Depreciation schedule missing",
      titleBn: "অবচয় তফসিল অনুপস্থিত",
      description: "Business income reported but no depreciation schedule is attached.",
      severity: "medium",
      points: 5,
      section: "Second Schedule",
      recommendation: "সম্পদভিত্তিক অবচয় তফসিল প্রস্তুত করুন।",
    });
  }
  if (r.loanInterest > 0 && !docs.has("loan_document")) {
    issues.push({
      category: "documentation",
      title: "Loan documentation missing",
      titleBn: "ঋণ সংক্রান্ত দলিল অনুপস্থিত",
      description: "Loan interest deduction claimed without loan agreement/certificate.",
      severity: "medium",
      points: 5,
      recommendation: "ঋণচুক্তি ও সুদ সনদ সংগ্রহ করুন।",
    });
  }
  if (hasBusiness && !docs.has("expense_receipts")) {
    issues.push({
      category: "documentation",
      title: "Expense documentation incomplete",
      titleBn: "ব্যয়ের দলিলাদি অসম্পূর্ণ",
      description: "Business expenses are not fully supported by receipts/invoices.",
      severity: "low",
      points: 5,
      recommendation: "সকল বড় ব্যয়ের রশিদ/চালান সংরক্ষণ করুন।",
    });
  }

  // --- D. Regulatory risks (max 10) ---
  if (hasBusiness && r.incomeBusiness > 3000000 && !input.client.vatRegistered) {
    issues.push({
      category: "regulatory",
      title: "VAT registration likely required",
      titleBn: "ভ্যাট নিবন্ধন প্রয়োজন হতে পারে",
      description: "Business turnover appears to exceed the mandatory VAT registration threshold.",
      severity: "high",
      points: 5,
      section: "VAT and SD Act 2012",
      recommendation: "BIN নিবন্ধনের জন্য আবেদন করুন এবং ভ্যাট রিটার্ন দাখিল নিশ্চিত করুন।",
    });
  }
  if (hasBusiness && r.incomeBusiness > 30000000 && !r.hasBusinessAudit) {
    issues.push({
      category: "regulatory",
      title: "Statutory audit likely required",
      titleBn: "নিরীক্ষা প্রয়োজন হতে পারে",
      description: "Business income level suggests a statutory audit requirement has not been fulfilled.",
      severity: "high",
      points: 5,
      recommendation: "স্বীকৃত চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা নিরীক্ষা সম্পন্ন করুন।",
    });
  }

  // --- E. বাংলাদেশ আয়কর আইন ২০২৩ এর ধারা ১০৪, ১৬৬ ও ৩ সংক্রান্ত অডিট রুলস ---
  const prevIncome = r.previousYearIncome || 0;
  const is15PercentGrowth = prevIncome > 0 && totalIncome >= prevIncome * 1.15;
  const isRiskShielded = Boolean(r.isRiskShielded || is15PercentGrowth);

  // ধারা ১০৪: ১৫% আয় বৃদ্ধির নিয়মে সুরক্ষিত কি না (Universal Self-Assessment Audit Shield) [১০৪]
  if (isRiskShielded) {
    issues.unshift({
      category: "compliance",
      title: "15% Income Growth Audit Shield Active (S.104)",
      titleBn: "১৫% আয় বৃদ্ধি অডিট সুরক্ষা সক্রিয় (ধারা ১০৪)",
      description: "পূর্ববর্তী কর বছরের চেয়ে মোট আয় ১৫% বা তার বেশি হওয়ায় ইউনিভার্সাল সেলফ অ্যাসেসমেন্টের আওতায় অডিট ঝুঁকি থেকে সুরক্ষিত।",
      severity: "low",
      points: 0,
      section: "Income Tax Act 2023, S.104",
      recommendation: "আয় বৃদ্ধির এই ধারা অব্যাহত রাখুন এবং রিটার্নে ব্যাংক হিসাব বিবরণী সংযুক্ত রাখুন।",
    });
  }

  // ধারা ১০৪: ৫ লক্ষের বেশি প্রাতিষ্ঠানিক বহির্ভূত ঋণ ব্যাংক স্টেটমেন্ট ছাড়া [১০৪]
  if (r.hasLargeLoanNoBank) {
    issues.push({
      category: "compliance",
      title: "Non-institutional Loan > 5 Lakh without Bank Statement (S.104)",
      titleBn: "ব্যাংক স্টেটমেন্ট ব্যতীত ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক ঋণ (ধারা ১০৪)",
      description: "ব্যাংকিং চ্যানেলের বাইরে বা ব্যাংক বিবরণী ছাড়া ৫ লক্ষ টাকার অধিক ঋণ গ্রহণ সরাসরি উচ্চ অডিট নিরীক্ষা ঝুঁকি সৃষ্টি করে।",
      severity: "critical",
      points: 20,
      section: "Income Tax Act 2023, S.104 / 166",
      recommendation: "ব্যাংকিং মাধ্যমে লেনদেনের পূর্ণাঙ্গ স্টেটমেন্ট ও ঋণদাতার টিআইএন অবিলম্বে ফাইল করুন।",
    });
  }

  // ধারা ১৬৬: হিসাব খাতা সংরক্ষণ করা হয়েছে কি না [১৬৬]
  if (r.bookOfAccountsMaintained === false) {
    issues.push({
      category: "regulatory",
      title: "Statutory Books of Accounts Not Maintained (S.166)",
      titleBn: "বিধিবদ্ধ হিসাব খাতা সংরক্ষণ করা হয়নি (ধারা ১৬৬)",
      description: "ধারা ১৬৬ অনুযায়ী বাধ্যতামূলক হিসাব খাতা, রেজিস্টার ও ভাউচার ফাইল সংরক্ষণ করা হয়নি।",
      severity: "high",
      points: 15,
      section: "Income Tax Act 2023, S.166",
      recommendation: "অনুমোদিত ক্যাশ বুক, লেজার, স্টক রেজিস্টার ও ভাউচার ফাইল দ্রুত প্রস্তুত করুন।",
    });
  }

  // ধারা ৩: কর অব্যাহতিপ্রাপ্ত আয় আছে কি না [৩]
  if (r.hasExemptIncome && !docs.has("audit_report") && !docs.has("correspondence")) {
    issues.push({
      category: "financial",
      title: "Tax-exempt Income Proof Required (S.3)",
      titleBn: "কর অব্যাহতিপ্রাপ্ত আয়ের স্বপক্ষে প্রমাণক প্রয়োজন (ধারা ৩)",
      description: "কর অব্যাহতিপ্রাপ্ত আয় দাবি করা হয়েছে; ষষ্ঠ তফসিল অনুযায়ী প্রাসঙ্গিক প্রমাণপত্র সংরক্ষণ করা প্রয়োজন।",
      severity: "medium",
      points: 8,
      section: "Income Tax Act 2023, S.3 / Schedule 6",
      recommendation: "ষষ্ঠ তফসিল অনুযায়ী কর অব্যাহতির সনদপত্র ও ব্যাংক লেনদেনের বিবরণী ফাইলের সাথে যুক্ত করুন।",
    });
  }

  const breakdown = { compliance: 0, financial: 0, documentation: 0, regulatory: 0 };
  for (const issue of issues) breakdown[issue.category] += issue.points;

  const capped = {
    compliance: Math.min(breakdown.compliance, 40),
    financial: Math.min(breakdown.financial, 35),
    documentation: Math.min(breakdown.documentation, 15),
    regulatory: Math.min(breakdown.regulatory, 10),
  };

  let rawScore = capped.compliance + capped.financial + capped.documentation + capped.regulatory;
  if (isRiskShielded && !r.hasLargeLoanNoBank) {
    // 15% income growth under S.104 shields the taxpayer from high audit risk
    rawScore = Math.max(5, Math.round(rawScore * 0.5));
  }

  const score = Math.min(100, Math.max(0, rawScore));

  let level: AuditRiskResult["level"] = "low";
  if (score > 60) level = "critical";
  else if (score > 40) level = "high";
  else if (score > 20) level = "medium";

  return { score, level, issues, breakdown: capped, isRiskShielded };
}

export const RISK_LEVEL_LABELS: Record<string, { bn: string; en: string; color: string }> = {
  low: { bn: "স্বল্প ঝুঁকি", en: "Low Risk", color: "emerald" },
  medium: { bn: "মাঝারি ঝুঁকি", en: "Medium Risk", color: "amber" },
  high: { bn: "উচ্চ ঝুঁকি", en: "High Risk", color: "orange" },
  critical: { bn: "সংকটাপন্ন ঝুঁকি", en: "Critical Risk", color: "red" },
};

export const RISK_BADGE_CLASSES: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const DOCUMENT_CATEGORIES: { value: string; bn: string; en: string }[] = [
  { value: "nid", bn: "জাতীয় পরিচয়পত্র", en: "National ID" },
  { value: "tin_certificate", bn: "টিআইএন সার্টিফিকেট", en: "TIN Certificate" },
  { value: "salary_certificate", bn: "বেতন সনদ", en: "Salary Certificate" },
  { value: "bank_statement", bn: "ব্যাংক স্টেটমেন্ট", en: "Bank Statement" },
  { value: "tds_certificate", bn: "টিডিএস সার্টিফিকেট", en: "TDS Certificate" },
  { value: "investment_proof", bn: "বিনিয়োগ প্রমাণপত্র", en: "Investment Proof" },
  { value: "loan_document", bn: "ঋণ দলিল", en: "Loan Document" },
  { value: "property_deed", bn: "সম্পত্তির দলিল", en: "Property Deed" },
  { value: "trade_license", bn: "ট্রেড লাইসেন্স", en: "Trade License" },
  { value: "depreciation_schedule", bn: "অবচয় তফসিল", en: "Depreciation Schedule" },
  { value: "expense_receipts", bn: "ব্যয়ের রশিদ", en: "Expense Receipts" },
  { value: "previous_return", bn: "পূর্ববর্তী রিটার্ন", en: "Previous Year Return" },
  { value: "audit_report", bn: "নিরীক্ষা প্রতিবেদন", en: "Audit Report" },
  { value: "correspondence", bn: "এনবিআর পত্রাদি", en: "NBR Correspondence" },
];

export const RETURN_TYPES = [
  { value: "IT-11", bn: "IT-11 (সাধারণ ব্যক্তি)", en: "IT-11 (Individual)" },
  { value: "IT-11S", bn: "IT-11S (বেতনভোগী ব্যক্তি)", en: "IT-11S (Salaried)" },
  { value: "IT-11C", bn: "IT-11C (মূলধনী মুনাফাসহ)", en: "IT-11C (with Capital Gain)" },
  { value: "IT-11A", bn: "IT-11A (কৃষি আয়সহ)", en: "IT-11A (with Agricultural Income)" },
  { value: "IT-12", bn: "IT-12 (ব্যবসায়িক আয়সহ)", en: "IT-12 (with Business Income)" },
  { value: "IT-11CHA2016", bn: "IT-11CHA2016 (অংশীদারি ফার্ম)", en: "IT-11CHA2016 (Partnership)" },
];
