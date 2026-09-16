"use client";

import { useMemo, useState } from "react";
import TaxRebateSimulator from "@/components/TaxRebateSimulator";
import {
  CATEGORY_LABELS,
  DEPRECIATION_RATES,
  LOCATION_LABELS,
  TDS_RATES,
  TaxpayerCategory,
  Location,
  calculateAdvanceTax,
  calculateCapitalGain,
  calculateDepreciation,
  calculateGiftTax,
  calculateIncomeTax,
  calculateInvestmentRebate,
  calculateNetWorth,
  calculateTds,
  calculateVat,
  splitPartnershipIncome,
} from "@/lib/taxEngine";

function fmt(n: number) {
  return `৳${Math.round(n).toLocaleString("en-US")}`;
}

const TABS = [
  { id: "income", label: "আয়কর ক্যালকুলেটর" },
  { id: "rebate", label: "বিনিয়োগ রেয়াত ও সিমুলেটর" },
  { id: "gift", label: "দানকর (আইন ১৯৯০)" },
  { id: "vat", label: "ভ্যাট ক্যালকুলেটর" },
  { id: "depreciation", label: "অবচয় ক্যালকুলেটর" },
  { id: "networth", label: "নিট সম্পদ ও সারচার্জ" },
  { id: "capitalgain", label: "মূলধনী মুনাফা" },
  { id: "tds", label: "টিডিএস ক্যালকুলেটর" },
  { id: "advance", label: "অগ্রিম কর" },
  { id: "partnership", label: "অংশীদারি আয় বণ্টন" },
];

export default function CalculatorHub({ defaultTab }: { defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab || "income");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            type="button"
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
              active === t.id ? "bg-white text-emerald-700 shadow" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "income" && <IncomeTaxCalc />}
      {active === "gift" && <GiftTaxCalc />}
      {active === "vat" && <VatCalc />}
      {active === "rebate" && <RebateCalc />}
      {active === "depreciation" && <DepreciationCalc />}
      {active === "networth" && <NetWorthCalc />}
      {active === "capitalgain" && <CapitalGainCalc />}
      {active === "tds" && <TdsCalc />}
      {active === "advance" && <AdvanceTaxCalc />}
      {active === "partnership" && <PartnershipCalc />}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

function ResultBox({ items }: { items: { label: string; value: string; big?: boolean }[] }) {
  return (
    <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4">
      {items.map((it, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{it.label}</span>
          <span className={it.big ? "text-xl font-bold text-emerald-800" : "text-sm font-semibold text-slate-900"}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

function IncomeTaxCalc() {
  const [category, setCategory] = useState<TaxpayerCategory>("general");
  const [location, setLocation] = useState<Location>("other");
  const [income, setIncome] = useState({ salary: 600000, business: 0, property: 0, capitalGain: 0, agricultural: 0, other: 0 });
  const [investment, setInvestment] = useState(50000);
  const [assets, setAssets] = useState(2000000);
  const [liabilities, setLiabilities] = useState(200000);
  const [tds, setTds] = useState(20000);
  const [advance, setAdvance] = useState(0);

  const result = useMemo(
    () =>
      calculateIncomeTax({
        category,
        location,
        incomeSalary: income.salary,
        incomeBusiness: income.business,
        incomeProperty: income.property,
        incomeCapitalGain: income.capitalGain,
        incomeAgricultural: income.agricultural,
        incomeOther: income.other,
        investmentAmount: investment,
        totalAssets: assets,
        totalLiabilities: liabilities,
        tdsAmount: tds,
        advanceTaxPaid: advance,
        hasBusinessIncome: income.business > 0,
      }),
    [category, location, income, investment, assets, liabilities, tds, advance]
  );

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="করদাতা শ্রেণি">
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as TaxpayerCategory)}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.bn}</option>)}
          </select>
        </Field>
        <Field label="অবস্থান">
          <select className={inputClass} value={location} onChange={(e) => setLocation(e.target.value as Location)}>
            {Object.entries(LOCATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v.bn}</option>)}
          </select>
        </Field>
        <Field label="বেতন আয়"><input type="number" className={inputClass} value={income.salary} onChange={(e) => setIncome({ ...income, salary: Number(e.target.value) })} /></Field>
        <Field label="ব্যবসায়িক আয়"><input type="number" className={inputClass} value={income.business} onChange={(e) => setIncome({ ...income, business: Number(e.target.value) })} /></Field>
        <Field label="সম্পত্তি আয়"><input type="number" className={inputClass} value={income.property} onChange={(e) => setIncome({ ...income, property: Number(e.target.value) })} /></Field>
        <Field label="মূলধনী মুনাফা"><input type="number" className={inputClass} value={income.capitalGain} onChange={(e) => setIncome({ ...income, capitalGain: Number(e.target.value) })} /></Field>
        <Field label="বিনিয়োগ পরিমাণ"><input type="number" className={inputClass} value={investment} onChange={(e) => setInvestment(Number(e.target.value))} /></Field>
        <Field label="মোট সম্পদ"><input type="number" className={inputClass} value={assets} onChange={(e) => setAssets(Number(e.target.value))} /></Field>
        <Field label="মোট দায়"><input type="number" className={inputClass} value={liabilities} onChange={(e) => setLiabilities(Number(e.target.value))} /></Field>
        <Field label="টিডিএস"><input type="number" className={inputClass} value={tds} onChange={(e) => setTds(Number(e.target.value))} /></Field>
        <Field label="অগ্রিম কর"><input type="number" className={inputClass} value={advance} onChange={(e) => setAdvance(Number(e.target.value))} /></Field>
      </div>

      <ResultBox
        items={[
          { label: "মোট আয়", value: fmt(result.totalIncome) },
          { label: "করমুক্ত সীমা", value: fmt(result.threshold) },
          { label: "মোট কর (রেয়াতের পূর্বে)", value: fmt(result.grossTaxBeforeRebate) },
          { label: "বিনিয়োগ রেয়াত", value: fmt(result.investmentRebate) },
          { label: "সারচার্জ", value: fmt(result.surchargeAmount) },
          { label: "ন্যূনতম কর প্রয়োগ হয়েছে?", value: result.minimumTaxApplied ? "হ্যাঁ" : "না" },
          { label: result.isRefund ? "ফেরতযোগ্য পরিমাণ" : "প্রদেয় কর", value: fmt(Math.abs(result.finalPayable)), big: true },
        ]}
      />
    </Card>
  );
}

function VatCalc() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(0.15);
  const [inclusive, setInclusive] = useState(false);
  const result = useMemo(() => calculateVat(amount, rate, inclusive), [amount, rate, inclusive]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="পরিমাণ (৳)"><input type="number" className={inputClass} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field>
        <Field label="ভ্যাট হার">
          <select className={inputClass} value={rate} onChange={(e) => setRate(Number(e.target.value))}>
            <option value={0.05}>৫%</option>
            <option value={0.075}>৭.৫%</option>
            <option value={0.15}>১৫%</option>
          </select>
        </Field>
        <Field label="পরিমাণে ভ্যাট অন্তর্ভুক্ত?">
          <select className={inputClass} value={inclusive ? "yes" : "no"} onChange={(e) => setInclusive(e.target.value === "yes")}>
            <option value="no">না (ভ্যাট এক্সক্লুসিভ)</option>
            <option value="yes">হ্যাঁ (ভ্যাট ইনক্লুসিভ)</option>
          </select>
        </Field>
      </div>
      <ResultBox
        items={[
          { label: "মূল্য (VAT ছাড়া)", value: fmt(result.base) },
          { label: "ভ্যাট পরিমাণ", value: fmt(result.vat) },
          { label: "সর্বমোট", value: fmt(result.total), big: true },
        ]}
      />
    </Card>
  );
}

function RebateCalc() {
  const [viewMode, setViewMode] = useState<"simulator" | "quick">("simulator");
  const [taxableIncome, setTaxableIncome] = useState(1000000);
  const [investmentAmount, setInvestmentAmount] = useState(150000);
  const result = useMemo(() => calculateInvestmentRebate(taxableIncome, investmentAmount), [taxableIncome, investmentAmount]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setViewMode("simulator")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
            viewMode === "simulator"
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ✨ বিনিয়োগ দৃশ্যকল্প সিমুলেটর (Scenario Simulator)
        </button>
        <button
          type="button"
          onClick={() => setViewMode("quick")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
            viewMode === "quick"
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ⚡ দ্রুত রেয়াত হিসাব (Quick Calc)
        </button>
      </div>

      {viewMode === "simulator" ? (
        <TaxRebateSimulator />
      ) : (
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="করযোগ্য মোট আয়">
              <input
                type="number"
                className={inputClass}
                value={taxableIncome}
                onChange={(e) => setTaxableIncome(Number(e.target.value))}
              />
            </Field>
            <Field label="বিনিয়োগের পরিমাণ">
              <input
                type="number"
                className={inputClass}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              />
            </Field>
          </div>
          <ResultBox
            items={[
              { label: "রেয়াতযোগ্য বিনিয়োগ (সীমার মধ্যে)", value: fmt(result.eligibleInvestment) },
              { label: "মোট রেয়াত (১৫%)", value: fmt(result.rebate), big: true },
            ]}
          />
          <p className="mt-3 text-xs text-slate-500">
            নিয়ম: প্রকৃত বিনিয়োগ, মোট আয়ের ২০% ও সর্বোচ্চ ৳১৫,০০,০০০ — এই তিনটির মধ্যে যেটি সর্বনিম্ন তার ওপর ১৫% রেয়াত প্রযোজ্য।
          </p>
        </Card>
      )}
    </div>
  );
}

function DepreciationCalc() {
  const [openingWDV, setOpeningWDV] = useState(500000);
  const [additions, setAdditions] = useState(0);
  const [category, setCategory] = useState<keyof typeof DEPRECIATION_RATES>("machinery");
  const result = useMemo(() => calculateDepreciation(openingWDV, additions, category), [openingWDV, additions, category]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="সম্পদের ধরন">
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as keyof typeof DEPRECIATION_RATES)}>
            {Object.entries(DEPRECIATION_RATES).map(([k, v]) => <option key={k} value={k}>{v.bn} ({Math.round(v.rate * 10000) / 100}%)</option>)}
          </select>
        </Field>
        <Field label="বছরের শুরুর জের (Opening WDV)"><input type="number" className={inputClass} value={openingWDV} onChange={(e) => setOpeningWDV(Number(e.target.value))} /></Field>
        <Field label="বছরে সংযোজন"><input type="number" className={inputClass} value={additions} onChange={(e) => setAdditions(Number(e.target.value))} /></Field>
      </div>
      <ResultBox
        items={[
          { label: "ভিত্তি (Opening + সংযোজন)", value: fmt(result.base) },
          { label: "অবচয় হার", value: `${Math.round(result.rate * 10000) / 100}%` },
          { label: "বছরের অবচয়", value: fmt(result.depreciation) },
          { label: "সমাপনী জের (Closing WDV)", value: fmt(result.closingWDV), big: true },
        ]}
      />
    </Card>
  );
}

function NetWorthCalc() {
  const [assets, setAssets] = useState(35000000);
  const [liabilities, setLiabilities] = useState(5000000);
  const result = useMemo(() => calculateNetWorth(assets, liabilities), [assets, liabilities]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="মোট সম্পদ"><input type="number" className={inputClass} value={assets} onChange={(e) => setAssets(Number(e.target.value))} /></Field>
        <Field label="মোট দায়"><input type="number" className={inputClass} value={liabilities} onChange={(e) => setLiabilities(Number(e.target.value))} /></Field>
      </div>
      <ResultBox
        items={[
          { label: "নিট সম্পদ", value: fmt(result.netWorth), big: true },
          { label: "সারচার্জ প্রযোজ্য? (> ৪ কোটি)", value: result.surchargeApplicable ? "হ্যাঁ, ১০% সারচার্জ প্রযোজ্য" : "না" },
        ]}
      />
    </Card>
  );
}

function CapitalGainCalc() {
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [salePrice, setSalePrice] = useState(800000);
  const [holdingYears, setHoldingYears] = useState(3);
  const [listed, setListed] = useState(true);
  const result = useMemo(() => calculateCapitalGain(purchasePrice, salePrice, holdingYears, listed), [purchasePrice, salePrice, holdingYears, listed]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="ক্রয় মূল্য"><input type="number" className={inputClass} value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} /></Field>
        <Field label="বিক্রয় মূল্য"><input type="number" className={inputClass} value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} /></Field>
        <Field label="ধারণকাল (বছর)"><input type="number" className={inputClass} value={holdingYears} onChange={(e) => setHoldingYears(Number(e.target.value))} /></Field>
        <Field label="সম্পদের ধরন">
          <select className={inputClass} value={listed ? "listed" : "unlisted"} onChange={(e) => setListed(e.target.value === "listed")}>
            <option value="listed">তালিকাভুক্ত শেয়ার</option>
            <option value="unlisted">অতালিকাভুক্ত/স্থাবর সম্পত্তি</option>
          </select>
        </Field>
      </div>
      <ResultBox
        items={[
          { label: "মূলধনী মুনাফা", value: fmt(result.gain) },
          { label: "প্রযোজ্য হার", value: `${Math.round(result.taxRate * 100)}%` },
          { label: "প্রদেয় কর", value: fmt(result.tax), big: true },
        ]}
      />
      <p className="mt-3 text-xs text-slate-500">{result.note}</p>
    </Card>
  );
}

function TdsCalc() {
  const [amount, setAmount] = useState(100000);
  const [category, setCategory] = useState<keyof typeof TDS_RATES>("contractor");
  const result = useMemo(() => calculateTds(amount, category), [amount, category]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="পরিশোধের পরিমাণ"><input type="number" className={inputClass} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field>
        <Field label="ক্যাটাগরি">
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as keyof typeof TDS_RATES)}>
            {Object.entries(TDS_RATES).map(([k, v]) => <option key={k} value={k}>{v.bn} ({Math.round(v.rate * 100)}%)</option>)}
          </select>
        </Field>
      </div>
      <ResultBox
        items={[
          { label: "টিডিএস হার", value: `${Math.round(result.rate * 100)}%` },
          { label: "টিডিএস পরিমাণ", value: fmt(result.tds) },
          { label: "নীট পরিশোধ", value: fmt(result.netPayment), big: true },
        ]}
      />
    </Card>
  );
}

function AdvanceTaxCalc() {
  const [estimatedTax, setEstimatedTax] = useState(600000);
  const [previousYearTax, setPreviousYearTax] = useState(500000);
  const result = useMemo(() => calculateAdvanceTax(estimatedTax, previousYearTax), [estimatedTax, previousYearTax]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="চলতি বছরের আনুমানিক কর"><input type="number" className={inputClass} value={estimatedTax} onChange={(e) => setEstimatedTax(Number(e.target.value))} /></Field>
        <Field label="পূর্ববর্তী বছরের কর"><input type="number" className={inputClass} value={previousYearTax} onChange={(e) => setPreviousYearTax(Number(e.target.value))} /></Field>
      </div>
      <ResultBox
        items={[
          { label: "অগ্রিম কর প্রযোজ্য?", value: result.applicable ? "হ্যাঁ (কর > ৳৪,০০,০০০)" : "না" },
          { label: "বার্ষিক অগ্রিম কর", value: fmt(result.annual), big: true },
        ]}
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {result.schedule.map((s, i) => (
          <div key={i} className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 font-semibold text-slate-800">{fmt(s.amount)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PartnershipCalc() {
  const [totalIncome, setTotalIncome] = useState(2000000);
  const [partners, setPartners] = useState([
    { name: "অংশীদার ১", ratio: 60 },
    { name: "অংশীদার ২", ratio: 40 },
  ]);
  const result = useMemo(() => splitPartnershipIncome(totalIncome, partners), [totalIncome, partners]);

  function updatePartner(idx: number, field: "name" | "ratio", value: string) {
    setPartners((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: field === "ratio" ? Number(value) : value } : p)));
  }

  return (
    <Card>
      <Field label="মোট ব্যবসায়িক আয়">
        <input type="number" className={inputClass} value={totalIncome} onChange={(e) => setTotalIncome(Number(e.target.value))} />
      </Field>
      <div className="mt-4 space-y-3">
        {partners.map((p, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <input className={inputClass} value={p.name} onChange={(e) => updatePartner(i, "name", e.target.value)} />
            <input type="number" className={inputClass} value={p.ratio} onChange={(e) => updatePartner(i, "ratio", e.target.value)} placeholder="অনুপাত (%)" />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPartners([...partners, { name: `অংশীদার ${partners.length + 1}`, ratio: 0 }])}
        className="mt-3 text-sm font-medium text-emerald-700 hover:underline"
      >
        + আরেকজন অংশীদার যুক্ত করুন
      </button>
      <ResultBox items={result.map((r) => ({ label: `${r.name} (${r.ratio}%)`, value: fmt(r.share) }))} />
    </Card>
  );
}

function GiftTaxCalc() {
  const [fairMarketValue, setFairMarketValue] = useState(500000);
  const [relationship, setRelationship] = useState("other");

  const calc = useMemo(
    () => calculateGiftTax(fairMarketValue, relationship),
    [fairMarketValue, relationship]
  );

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">দানকর ক্যালকুলেটর (দানকর আইন, ১৯৯০)</h3>
        <p className="text-xs text-slate-500">
          রক্তের সম্পর্কের আত্মীয়দের (স্বামী/স্ত্রী, সন্তান, পিতা-মাতা) দান সম্পূর্ণ করমুক্ত। অন্যদের ক্ষেত্রে প্রগতিশীল স্লাবে কর ধার্য।
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="গ্রহীতার সাথে সম্পর্ক">
          <select
            className={inputClass}
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value="spouse">স্ত্রী / স্বামী (সম্পূর্ণ করমুক্ত)</option>
            <option value="child">পুত্র / কন্যা (সম্পূর্ণ করমুক্ত)</option>
            <option value="parent">পিতা / মাতা (সম্পূর্ণ করমুক্ত)</option>
            <option value="sibling">ভাই / বোন</option>
            <option value="other">অন্যান্য ব্যক্তি বা তৃতীয় পক্ষ</option>
          </select>
        </Field>
        <Field label="দানকৃত সম্পত্তির ন্যায্য বাজারমূল্য (Fair Market Value)">
          <input
            type="number"
            className={inputClass}
            value={fairMarketValue}
            onChange={(e) => setFairMarketValue(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <ResultBox
        items={[
          { label: "মোট বাজারমূল্য", value: fmt(calc.fairMarketValue) },
          { label: "আইন অনুযায়ী অব্যাহতি (Exemption)", value: fmt(calc.exemptionAmount) },
          { label: "করযোগ্য দানের পরিমাণ", value: fmt(calc.taxableGiftValue) },
          { label: "প্রদেয় দানকর (Gift Tax Payable)", value: fmt(calc.giftTaxPayable), big: true },
        ]}
      />

      <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
        <p className="font-semibold">{calc.legalRef}</p>
        <p className="mt-0.5 text-slate-600">{calc.note}</p>
      </div>
    </Card>
  );
}

