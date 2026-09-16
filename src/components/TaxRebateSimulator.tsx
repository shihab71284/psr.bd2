"use client";

import { useCallback, useMemo, useState } from "react";
import {
  calculateIncomeTax,
  TaxpayerCategory,
  Location,
  CATEGORY_LABELS,
  LOCATION_LABELS,
} from "@/lib/taxEngine";
import {
  Calculator,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  Check,
  Copy,
  Sparkles,
  BarChart3,
  HelpCircle,
  Sliders,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

function fmt(n: number) {
  return `৳${Math.round(n).toLocaleString("en-US")}`;
}

export interface InvestmentItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  statutoryLimitNote: string;
  maxCap?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  badge: string;
  investments: {
    dps: number; // Deposit Pension Scheme (Cap ৳1,20,000)
    sanchayapatra: number; // National Savings Certificate (Cap ৳5,00,000)
    universalPension: number; // Universal Pension Scheme (No sub-cap)
    lifeInsurance: number; // Life Insurance premium (10% of sum)
    providentFund: number; // Recognized Provident Fund
    stocksMutualFunds: number; // Listed Stocks & Mutual Funds (Cap ৳5,00,000)
    charityDonation: number; // Approved Charities & Philanthropy
  };
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    name: "বর্তমান অবস্থান (বেসলাইন)",
    description: "নিয়মিত সামান্য সঞ্চয় বা প্রভিডেন্ট ফান্ড ব্যতীত অন্য কোনো নতুন বিনিয়োগ নেই।",
    badge: "বর্তমান",
    investments: {
      dps: 30000,
      sanchayapatra: 0,
      universalPension: 0,
      lifeInsurance: 20000,
      providentFund: 40000,
      stocksMutualFunds: 0,
      charityDonation: 0,
    },
  },
  {
    id: "balanced",
    name: "ব্যালান্সড প্ল্যান (ডিপিএস ও পেনশন)",
    description: "ডিপিএস সর্বোচ্চ সীমা ও সর্বজনীন পেনশন স্কিম (ইউপিএস) যুক্ত করে সুষম কর সাশ্রয়।",
    badge: "জনপ্রিয় পছন্দ",
    investments: {
      dps: 120000,
      sanchayapatra: 0,
      universalPension: 60000,
      lifeInsurance: 35000,
      providentFund: 45000,
      stocksMutualFunds: 50000,
      charityDonation: 10000,
    },
  },
  {
    id: "max_savings",
    name: "সর্বোচ্চ কর সাশ্রয় অপটিমাইজার",
    description: "আইন অনুযায়ী অনুমোদিত ২০% সীমার সম্পূর্ণ সুবিধা গ্রহণ করে সর্বোচ্চ কর রেয়াত অর্জন।",
    badge: "সর্বোচ্চ সাশ্রয়",
    investments: {
      dps: 120000,
      sanchayapatra: 200000,
      universalPension: 120000,
      lifeInsurance: 60000,
      providentFund: 60000,
      stocksMutualFunds: 100000,
      charityDonation: 20000,
    },
  },
];

export default function TaxRebateSimulator() {
  // Taxpayer inputs
  const [taxableIncome, setTaxableIncome] = useState<number>(1200000);
  const [category, setCategory] = useState<TaxpayerCategory>("general");
  const [location, setLocation] = useState<Location>("dhaka_ctg");

  // Scenarios state
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("balanced");
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showStatutoryGuide, setShowStatutoryGuide] = useState<boolean>(false);

  // Active scenario object
  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  // Handler to update an investment in the active scenario
  const updateActiveInvestment = (
    field: keyof Scenario["investments"],
    val: number
  ) => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id === activeScenarioId) {
          return {
            ...sc,
            investments: {
              ...sc.investments,
              [field]: Math.max(0, val),
            },
          };
        }
        return sc;
      })
    );
  };

  // Helper to compute tax metrics for a given scenario
  const computeScenarioMetrics = useCallback(
    (sc: Scenario) => {
      const inv = sc.investments;

      // Apply statutory sub-caps according to 6th Schedule Part 3
      const effectiveDps = Math.min(inv.dps, 120000); // ৳১,২০,০০০ সর্বোচ্চ সীমা
      const effectiveSanchay = Math.min(inv.sanchayapatra, 500000); // ৳৫,০০,০০০
      const effectiveStocks = Math.min(inv.stocksMutualFunds, 500000); // ৳৫,০০,০০০
      const effectiveUniversalPension = inv.universalPension; // সম্পূর্ণ রেয়াতযোগ্য
      const effectiveInsurance = inv.lifeInsurance;
      const effectivePf = inv.providentFund;
      const effectiveCharity = inv.charityDonation;

      const actualInvested =
        inv.dps +
        inv.sanchayapatra +
        inv.universalPension +
        inv.lifeInsurance +
        inv.providentFund +
        inv.stocksMutualFunds +
        inv.charityDonation;

      const allowableInvestmentSum =
        effectiveDps +
        effectiveSanchay +
        effectiveUniversalPension +
        effectiveInsurance +
        effectivePf +
        effectiveStocks +
        effectiveCharity;

      // Base tax calculation without investment rebate
      const baseTaxResult = calculateIncomeTax({
        category,
        location,
        incomeSalary: taxableIncome,
        incomeBusiness: 0,
        incomeProperty: 0,
        incomeCapitalGain: 0,
        incomeAgricultural: 0,
        incomeOther: 0,
        investmentAmount: 0,
        totalAssets: 2000000,
        totalLiabilities: 200000,
        tdsAmount: 0,
        advanceTaxPaid: 0,
      });

      const grossTax = baseTaxResult.grossTaxBeforeRebate;
      const minTax = LOCATION_LABELS[location].minTax;

      // Statutory Limit: Lowest of 3 elements:
      // 1. Actual Allowable Investment
      // 2. 20% of Taxable Income
      // 3. ৳15,00,000 (Maximum Cap)
      const incomeTwentyPercent = taxableIncome * 0.2;
      const statutoryCap = 1500000;
      const maxPermissibleInvestment = Math.min(incomeTwentyPercent, statutoryCap);

      const eligibleInvestment = Math.min(
        allowableInvestmentSum,
        maxPermissibleInvestment
      );

      // Rebate = 15% of eligible investment
      const calculatedRebate = eligibleInvestment * 0.15;
      const actualRebateApplied = Math.min(calculatedRebate, grossTax);

      // Tax after rebate considering minimum tax
      const preMinTax = Math.max(0, grossTax - actualRebateApplied);
      const finalTax =
        grossTax > 0 ? Math.max(preMinTax, minTax) : 0;

      const taxSaved = Math.max(0, grossTax - finalTax);
      const savingsPercentage = grossTax > 0 ? (taxSaved / grossTax) * 100 : 0;
      const instantRoi = actualInvested > 0 ? (taxSaved / actualInvested) * 100 : 0;

      return {
        actualInvested,
        allowableInvestmentSum,
        incomeTwentyPercent,
        statutoryCap,
        maxPermissibleInvestment,
        eligibleInvestment,
        grossTax,
        minTax,
        calculatedRebate,
        actualRebateApplied,
        finalTax,
        taxSaved,
        savingsPercentage,
        instantRoi,
        subCapExcess: {
          dps: Math.max(0, inv.dps - 120000),
          sanchay: Math.max(0, inv.sanchayapatra - 500000),
          stocks: Math.max(0, inv.stocksMutualFunds - 500000),
        },
      };
    },
    [category, location, taxableIncome]
  );

  // Metrics for all scenarios
  const scenarioMetrics = useMemo(() => {
    return scenarios.map((sc) => ({
      scenario: sc,
      metrics: computeScenarioMetrics(sc),
    }));
  }, [scenarios, computeScenarioMetrics]);

  const activeMetrics = useMemo(() => {
    return computeScenarioMetrics(activeScenario);
  }, [activeScenario, computeScenarioMetrics]);

  // Optimal Additional Investment Recommendation
  const optimalRecommendation = useMemo(() => {
    const { maxPermissibleInvestment, eligibleInvestment, grossTax, minTax } =
      activeMetrics;
    const roomInCap = Math.max(0, maxPermissibleInvestment - eligibleInvestment);

    // Max tax that can theoretically be saved before hitting minimum tax
    const maxPossibleTaxReduction = Math.max(0, grossTax - minTax);
    const maxInvestmentNeededForZeroTax = maxPossibleTaxReduction / 0.15;
    const actualNeededInvestment = Math.min(roomInCap, Math.max(0, maxInvestmentNeededForZeroTax - eligibleInvestment));
    const potentialAdditionalSaving = actualNeededInvestment * 0.15;

    return {
      neededInvestment: Math.round(actualNeededInvestment),
      potentialAdditionalSaving: Math.round(potentialAdditionalSaving),
      isMaxed: actualNeededInvestment <= 0 || eligibleInvestment >= maxPermissibleInvestment,
    };
  }, [activeMetrics]);

  // Quick preset loader: Apply exact optimal investment to active scenario
  const handleApplyOptimal = () => {
    const target = activeMetrics.maxPermissibleInvestment;
    // Distribute smartly: ৳120k DPS, ৳120k Universal Pension, remainder in Sanchayapatra / PF
    const dps = Math.min(120000, target);
    const remainingAfterDps = target - dps;
    const universalPension = Math.min(120000, remainingAfterDps);
    const remainingAfterUp = remainingAfterDps - universalPension;
    const sanchayapatra = Math.min(250000, remainingAfterUp);
    const remainingAfterSanchay = remainingAfterUp - sanchayapatra;
    const pf = remainingAfterSanchay;

    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id === activeScenarioId) {
          return {
            ...sc,
            investments: {
              dps,
              universalPension,
              sanchayapatra,
              lifeInsurance: 20000,
              providentFund: Math.max(0, pf),
              stocksMutualFunds: 0,
              charityDonation: 0,
            },
          };
        }
        return sc;
      })
    );
  };

  const handleResetCurrentScenario = () => {
    const def = DEFAULT_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (def) {
      setScenarios((prev) =>
        prev.map((sc) => (sc.id === activeScenarioId ? { ...def } : sc))
      );
    }
  };

  const handleCopySummary = async () => {
    try {
      const text = `📊 ট্যাক্স রেয়াত ও বিনিয়োগ সিমুলেশন রিপোর্ট (psr.bd)
করদাতার ক্যাটাগরি: ${CATEGORY_LABELS[category].bn}
করযোগ্য বার্ষিক আয়: ${fmt(taxableIncome)}
গ্রস প্রদেয় কর (বিনিয়োগ ছাড়া): ${fmt(activeMetrics.grossTax)}

[নির্বাচিত পরিকল্পনা: ${activeScenario.name}]
• মোট বিনিয়োগ: ${fmt(activeMetrics.actualInvested)}
• রেয়াতযোগ্য অনুমোদিত বিনিয়োগ: ${fmt(activeMetrics.eligibleInvestment)} (আয়ের ২০% সীমা: ${fmt(activeMetrics.incomeTwentyPercent)})
• ১৫% হারে কর রেয়াত: ${fmt(activeMetrics.actualRebateApplied)}
• রেয়াত পরবর্তী প্রদেয় কর: ${fmt(activeMetrics.finalTax)}
• প্রকৃত কর সাশ্রয়: ${fmt(activeMetrics.taxSaved)} (${activeMetrics.savingsPercentage.toFixed(1)}% কর হ্রাস)
• তাৎক্ষণিক কর সাশ্রয় রিটার্ন (ROI): ${activeMetrics.instantRoi.toFixed(1)}%

আয়কর আইন ২০২৩ এর ধারা ৭৮ ও ষষ্ঠ তফসিল (অংশ ৩) অনুসারে প্রস্তুতকৃত।`;

      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div id="tax-rebate-simulator" className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  ট্যাক্স রেয়াত ও বিনিয়োগ দৃশ্যকল্প সিমুলেটর (Tax Rebate Simulator)
                </h2>
                <span className="rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  ধারা ৭৮ ও ষষ্ঠ তফসিল (অংশ ৩)
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                বিভিন্ন খাতে বিনিয়োগ পরিকল্পনা পরিবর্তন করে তাৎক্ষণিক কর সাশ্রয় ও অপ্টিমাল বিনিয়োগের পরিমাণ সিমুলেট করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowStatutoryGuide(!showStatutoryGuide)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>আইনি বিধিমালার নির্দেশিকা</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>রিপোর্ট কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Statutory Rules Guide */}
        {showStatutoryGuide && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              আয়কর আইন ২০২৩ এর বিধান অনুযায়ী বিনিয়োগ রেয়াতের নিয়মাবলী:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>সর্বোচ্চ অনুমোদনযোগ্য বিনিয়োগ:</strong> (১) প্রকৃত বিনিয়োগ, (২) করযোগ্য আয়ের ২০% এবং (৩) সর্বোচ্চ ৳১৫,০০,০০০ — এই তিনটির মধ্যে যেটি সর্বনিম্ন।
              </li>
              <li>
                <strong>রেয়াতের হার:</strong> অনুমোদনযোগ্য বিনিয়োগের ওপর ১৫% হারে সরাসরি করদায় থেকে বাদ যাবে।
              </li>
              <li>
                <strong>ডিপিএস (DPS) সীমা:</strong> তফশিলি ব্যাংকে যেকোনো ব্যক্তি করদাতার ডিপোজিট পেনশন স্কিমে বার্ষিক সর্বোচ্চ ৳১,২০,০০০ রেয়াতযোগ্য।
              </li>
              <li>
                <strong>সঞ্চয়পত্র ও শেয়ার সীমা:</strong> জাতীয় সঞ্চয়পত্র এবং তালিকাভুক্ত শেয়ার/মিউচুয়াল ফান্ডে পৃথকভাবে সর্বোচ্চ ৳৫,০০,০০০ পর্যন্ত বিনিয়োগ রেয়াতযোগ্য।
              </li>
              <li>
                <strong>সর্বজনীন পেনশন স্কিম (ইউপিএস):</strong> প্রগতি, সুরক্ষা, সমতা ও প্রত্যয় স্কিমে জমাকৃত কিস্তি সম্পূর্ণ রেয়াতযোগ্য (কোনো সাব-ক্যাপ নেই)।
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Taxpayer Profile Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              করযোগ্য বার্ষিক আয় (Taxable Income)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">৳</span>
              <input
                type="number"
                value={taxableIncome}
                onChange={(e) => setTaxableIncome(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="1200000"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              ২০% সীমা: <span className="font-bold text-emerald-800">{fmt(taxableIncome * 0.2)}</span>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              করদাতার ক্যাটাগরি (করমুক্ত সীমা)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaxpayerCategory)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.bn} ({fmt(v.threshold)})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              বেস করমুক্ত সীমা: {fmt(CATEGORY_LABELS[category].threshold)}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              করদাতার অবস্থান (ন্যূনতম কর)
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              {Object.entries(LOCATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.bn} ({fmt(v.minTax)})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              ন্যূনতম প্রযোজ্য কর: {fmt(LOCATION_LABELS[location].minTax)}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            দৃশ্যকল্প নির্বাচন (Select Investment Scenario)
          </span>
          <button
            type="button"
            onClick={handleApplyOptimal}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>এই দৃশ্যকল্পে অপ্টিমাল বিনিয়োগ অটো-সেট করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenarioId;
            const metrics = scenarioMetrics.find((m) => m.scenario.id === sc.id)?.metrics;

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenarioId(sc.id)}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200/80 text-slate-700"
                      }`}
                    >
                      {sc.badge}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      সাশ্রয়: {metrics ? fmt(metrics.taxSaved) : "৳০"}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-900">{sc.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                  <span className="text-slate-500">মোট বিনিয়োগ:</span>
                  <span className="font-bold text-slate-900">
                    {metrics ? fmt(metrics.actualInvested) : "৳০"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Workspace (Inputs on Left, Live Results on Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Investment Breakdown Inputs */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  বিনিয়োগ খাতসমূহ ({activeScenario.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetCurrentScenario}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="h-3 w-3" />
                <span>রিসেট</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* DPS */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      ডিপোজিট পেনশন স্কিম (DPS)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      তফশিলি ব্যাংকে ডিপিএস কিস্তি (সর্বোচ্চ রেয়াতযোগ্য: ৳১,২০,০০০/বছর)
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.dps}
                      onChange={(e) => updateActiveInvestment("dps", Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
                {activeScenario.investments.dps > 120000 && (
                  <p className="mt-1.5 text-[11px] font-medium text-amber-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    আইনি সীমা ৳১,২০,০০০ এর অতিরিক্ত ৳
                    {(activeScenario.investments.dps - 120000).toLocaleString()} রেয়াত পাবে না।
                  </p>
                )}
              </div>

              {/* Universal Pension Scheme */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-950">
                        সর্বজনীন পেনশন স্কিম (ইউপিএস)
                      </span>
                      <span className="rounded bg-emerald-200/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-900">
                        শতভাগ রেয়াতযোগ্য
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80">
                      প্রগতি, সুরক্ষা, সমতা বা প্রত্যয় স্কিমে প্রদত্ত চাঁদা
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.universalPension}
                      onChange={(e) =>
                        updateActiveInvestment("universalPension", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-emerald-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sanchayapatra */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      সঞ্চয়পত্র ও সরকারি ট্রেজারি বন্ড
                    </span>
                    <p className="text-[11px] text-slate-500">
                      জাতীয় সঞ্চয় অধিদপ্তর বা বাংলাদেশ ব্যাংক (সর্বোচ্চ রেয়াতযোগ্য: ৳৫,০০,০০০)
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.sanchayapatra}
                      onChange={(e) =>
                        updateActiveInvestment("sanchayapatra", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
                {activeScenario.investments.sanchayapatra > 500000 && (
                  <p className="mt-1.5 text-[11px] font-medium text-amber-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    সঞ্চয়পত্রে সর্বোচ্চ রেয়াতযোগ্য সীমা ৳৫,০০,০০০ অতিক্রম করেছে।
                  </p>
                )}
              </div>

              {/* Life Insurance */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">জীবন বীমা প্রিমিয়াম</span>
                    <p className="text-[11px] text-slate-500">
                      করদাতার নিজের বা স্ত্রী/সন্তানের জীবন বীমায় প্রদত্ত প্রিমিয়াম
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.lifeInsurance}
                      onChange={(e) =>
                        updateActiveInvestment("lifeInsurance", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Provident Fund */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      অনুমোদিত ভবিষ্যৎ তহবিল (RPF) ও কল্যাণ তহবিল
                    </span>
                    <p className="text-[11px] text-slate-500">
                      চাকরিজীবীর স্বীকৃত প্রভিডেন্ট ফান্ড ও গ্রুপ বীমা কিস্তি
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.providentFund}
                      onChange={(e) =>
                        updateActiveInvestment("providentFund", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stocks & Mutual Funds */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      তালিকাভুক্ত শেয়ার ও মিউচুয়াল ফান্ড
                    </span>
                    <p className="text-[11px] text-slate-500">
                      ডিএসই/সিএসই তালিকাভুক্ত কোম্পানির শেয়ার (সর্বোচ্চ রেয়াতযোগ্য: ৳৫,০০,০০০)
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.stocksMutualFunds}
                      onChange={(e) =>
                        updateActiveInvestment("stocksMutualFunds", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Charities & Donations */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      অনুমোদিত দাতব্য প্রতিষ্ঠান / মুক্তিযুদ্ধ জাদুঘর দান
                    </span>
                    <p className="text-[11px] text-slate-500">
                      সরকারি গেজেটভুক্ত জাতীয় প্রতিষ্ঠান, এশিয়াটিক সোসাইটি, ইত্যাদিতে অনুদান
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      value={activeScenario.investments.charityDonation}
                      onChange={(e) =>
                        updateActiveInvestment("charityDonation", Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Tax Savings Dashboard & Cap Visualizer */}
        <div className="space-y-4 lg:col-span-5">
          {/* Key Savings Card */}
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                প্রকৃত কর সাশ্রয় (Net Tax Saved)
              </span>
              <div className="flex items-center gap-1 font-mono text-xs text-emerald-100">
                <PiggyBank className="h-4 w-4" />
                <span>১৫% কর রেয়াত</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {fmt(activeMetrics.taxSaved)}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-emerald-100">
                <span>মূল করের</span>
                <span className="rounded bg-white/20 px-1.5 py-0.2 font-bold font-mono">
                  {activeMetrics.savingsPercentage.toFixed(1)}%
                </span>
                <span>সাশ্রয় হয়েছে</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-white/20 pt-4 text-xs">
              <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100">রেয়াতপূর্ব গ্রস কর:</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {fmt(activeMetrics.grossTax)}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100">প্রদেয় নিট কর:</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {fmt(activeMetrics.finalTax)}
                </p>
              </div>
            </div>
          </div>

          {/* Investment Limit Breakdown Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              রেয়াতযোগ্য সীমা বিশ্লেষণ (Three-Tier Limit Test)
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-600">১. অনুমোদিত প্রকৃত বিনিয়োগ:</span>
                <span className="font-mono font-bold text-slate-900">
                  {fmt(activeMetrics.allowableInvestmentSum)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-600">২. মোট করযোগ্য আয়ের ২০%:</span>
                <span className="font-mono font-bold text-slate-900">
                  {fmt(activeMetrics.incomeTwentyPercent)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-600">৩. সংবিধিবদ্ধ সর্বোচ্চ সিলিং:</span>
                <span className="font-mono font-bold text-slate-900">
                  {fmt(activeMetrics.statutoryCap)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-emerald-950 font-semibold p-1">
                <span>চূড়ান্ত রেয়াতযোগ্য ভিত্তি (সর্বনিম্ন):</span>
                <span className="text-sm font-mono font-extrabold text-emerald-700">
                  {fmt(activeMetrics.eligibleInvestment)}
                </span>
              </div>
            </div>

            {/* Progress to 20% limit bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>২০% সীমা ব্যবহার:</span>
                <span className="font-bold text-slate-700">
                  {activeMetrics.incomeTwentyPercent > 0
                    ? `${Math.min(100, Math.round((activeMetrics.eligibleInvestment / activeMetrics.incomeTwentyPercent) * 100))}%`
                    : "০%"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      activeMetrics.incomeTwentyPercent > 0
                        ? (activeMetrics.eligibleInvestment / activeMetrics.incomeTwentyPercent) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Optimal Recommendation Callout */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Zap className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">স্মার্ট অপটিমাইজেশন পর্যবেক্ষণ:</span>
                {optimalRecommendation.isMaxed ? (
                  <p className="mt-1 text-amber-900/90 leading-relaxed">
                    অভিনন্দন! আপনার বর্তমান পরিকল্পনায় কর রেয়াতের অনুমোদিত সীমা সম্পূর্ণভাবে পূরণ হয়েছে। 
                    অতিরিক্ত অর্থ বিনিয়োগ করলে আর কোনো অতিরিক্ত কর রেয়াত সুবিধা পাওয়া যাবে না।
                  </p>
                ) : (
                  <p className="mt-1 text-amber-900/90 leading-relaxed">
                    আপনি আরও <strong className="text-amber-950">{fmt(optimalRecommendation.neededInvestment)}</strong> উপযুক্ত খাতে বিনিয়োগ করলে অতিরিক্ত{" "}
                    <strong className="text-emerald-800">{fmt(optimalRecommendation.potentialAdditionalSaving)}</strong> কর সাশ্রয় করতে পারবেন!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table of Scenarios */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                দৃশ্যকল্পসমূহের তুলনামূলক বিশ্লেষণ (Scenario Comparison Table)
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              রিয়েল-টাইমে ৩টি পরিকল্পনার সরাসরি তুলনা
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/60 text-slate-700">
              <tr>
                <th className="py-3 px-4 font-bold">পরিমাপক / বৈশিষ্ট্য</th>
                {scenarioMetrics.map(({ scenario }) => (
                  <th
                    key={scenario.id}
                    className={`py-3 px-4 font-bold ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50 text-emerald-950 border-x border-emerald-200"
                        : "text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{scenario.name}</span>
                      {scenario.id === activeScenarioId && (
                        <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">মোট প্রকৃত বিনিয়োগ</td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-2.5 px-4 font-mono font-medium ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50/40 border-x border-emerald-200"
                        : ""
                    }`}
                  >
                    {fmt(metrics.actualInvested)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">
                  রেয়াতযোগ্য বিনিয়োগ (সীমার মধ্যে)
                </td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-2.5 px-4 font-mono font-medium ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50/40 border-x border-emerald-200"
                        : ""
                    }`}
                  >
                    {fmt(metrics.eligibleInvestment)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">মোট কর রেয়াত (১৫%)</td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-2.5 px-4 font-mono font-bold text-emerald-800 ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50/40 border-x border-emerald-200"
                        : ""
                    }`}
                  >
                    {fmt(metrics.actualRebateApplied)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">প্রদেয় নিট কর</td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-2.5 px-4 font-mono font-bold text-slate-900 ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50/40 border-x border-emerald-200"
                        : ""
                    }`}
                  >
                    {fmt(metrics.finalTax)}
                  </td>
                ))}
              </tr>

              <tr className="bg-slate-50/60 font-semibold">
                <td className="py-3 px-4 text-emerald-950 font-bold">মোট কর সাশ্রয়</td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-3 px-4 font-mono font-extrabold text-emerald-700 text-sm ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-100/60 border-x border-emerald-300"
                        : ""
                    }`}
                  >
                    {fmt(metrics.taxSaved)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">
                  তাৎক্ষণিক কর রিটার্ন (Instant ROI)
                </td>
                {scenarioMetrics.map(({ scenario, metrics }) => (
                  <td
                    key={scenario.id}
                    className={`py-2.5 px-4 font-mono font-semibold text-slate-700 ${
                      scenario.id === activeScenarioId
                        ? "bg-emerald-50/40 border-x border-emerald-200"
                        : ""
                    }`}
                  >
                    {metrics.instantRoi.toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
