"use client";

import { RETURN_TYPES } from "@/lib/taxEngine";

type ReturnDefaults = {
  assessmentYear?: string | null;
  incomeYear?: string | null;
  returnType?: string | null;
  submissionDate?: string | null;
  incomeSalary?: string | number | null;
  incomeBusiness?: string | number | null;
  incomeProperty?: string | number | null;
  incomeCapitalGain?: string | number | null;
  incomeAgricultural?: string | number | null;
  incomeOther?: string | number | null;
  previousYearIncome?: string | number | null;
  investmentAmount?: string | number | null;
  loanInterest?: string | number | null;
  donations?: string | number | null;
  totalAssets?: string | number | null;
  totalLiabilities?: string | number | null;
  tdsAmount?: string | number | null;
  advanceTaxPaid?: string | number | null;
  hasBusinessAudit?: boolean | null;
  hasLargeLoanNoBank?: boolean | null;
  hasExemptIncome?: boolean | null;
  bookOfAccountsMaintained?: boolean | null;
  isRiskShielded?: boolean | null;
  notes?: string | null;
};

function currentAssessmentYear() {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
}

function currentIncomeYear() {
  const y = new Date().getFullYear();
  return `${y - 1}-${y}`;
}

export default function ReturnForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: ReturnDefaults;
  submitLabel: string;
}) {
  const d = defaults ?? {};

  return (
    <form action={action} className="space-y-8">
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">রিটার্নের সাধারণ তথ্য</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="কর নিরূপণ বছর (Assessment Year) *">
            <input name="assessmentYear" required defaultValue={d.assessmentYear ?? currentAssessmentYear()} className="input" placeholder="২০২৫-২০২৬" />
          </Field>
          <Field label="আয় বছর (Income Year)">
            <input name="incomeYear" defaultValue={d.incomeYear ?? currentIncomeYear()} className="input" placeholder="২০২৪-২০২৫" />
          </Field>
          <Field label="রিটার্নের ধরন">
            <select name="returnType" defaultValue={d.returnType ?? "IT-11"} className="input">
              {RETURN_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.bn}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">আয়ের উৎস (৳)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="বেতন আয়"><input name="incomeSalary" type="number" step="0.01" defaultValue={d.incomeSalary ?? 0} className="input" /></Field>
          <Field label="ব্যবসায়িক আয়"><input name="incomeBusiness" type="number" step="0.01" defaultValue={d.incomeBusiness ?? 0} className="input" /></Field>
          <Field label="সম্পত্তি থেকে আয়"><input name="incomeProperty" type="number" step="0.01" defaultValue={d.incomeProperty ?? 0} className="input" /></Field>
          <Field label="মূলধনী মুনাফা"><input name="incomeCapitalGain" type="number" step="0.01" defaultValue={d.incomeCapitalGain ?? 0} className="input" /></Field>
          <Field label="কৃষি আয়"><input name="incomeAgricultural" type="number" step="0.01" defaultValue={d.incomeAgricultural ?? 0} className="input" /></Field>
          <Field label="অন্যান্য আয়"><input name="incomeOther" type="number" step="0.01" defaultValue={d.incomeOther ?? 0} className="input" /></Field>
          <Field label="পূর্ববর্তী বছরের মোট আয়"><input name="previousYearIncome" type="number" step="0.01" defaultValue={d.previousYearIncome ?? 0} className="input" /></Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">বিনিয়োগ ও দায় (৳)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="বিনিয়োগ রেয়াতযোগ্য পরিমাণ"><input name="investmentAmount" type="number" step="0.01" defaultValue={d.investmentAmount ?? 0} className="input" /></Field>
          <Field label="ঋণের সুদ"><input name="loanInterest" type="number" step="0.01" defaultValue={d.loanInterest ?? 0} className="input" /></Field>
          <Field label="দান/অনুদান"><input name="donations" type="number" step="0.01" defaultValue={d.donations ?? 0} className="input" /></Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">সম্পদ ও দায় (IT-10B2016)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="মোট সম্পদ"><input name="totalAssets" type="number" step="0.01" defaultValue={d.totalAssets ?? 0} className="input" /></Field>
          <Field label="মোট দায়"><input name="totalLiabilities" type="number" step="0.01" defaultValue={d.totalLiabilities ?? 0} className="input" /></Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">কর পরিশোধ ও দাখিল</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="উৎসে কর্তিত কর (TDS)"><input name="tdsAmount" type="number" step="0.01" defaultValue={d.tdsAmount ?? 0} className="input" /></Field>
          <Field label="অগ্রিম কর পরিশোধ"><input name="advanceTaxPaid" type="number" step="0.01" defaultValue={d.advanceTaxPaid ?? 0} className="input" /></Field>
          <Field label="রিটার্ন দাখিলের তারিখ">
            <input name="submissionDate" type="date" defaultValue={d.submissionDate ?? ""} className="input" />
          </Field>
        </div>
      </section>

      {/* সংবিধিবদ্ধ কমপ্লায়েন্স ও নিরীক্ষা ঝুঁকি প্রোটেকশন [ধারা ১০৪, ১৬৬, ৩] */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-emerald-950">
          সংবিধিবদ্ধ কমপ্লায়েন্স ও নিরীক্ষা সুরক্ষা (Statutory Compliance & Audit Shield)
        </h3>
        <p className="mb-4 text-xs text-slate-600">
          আয়কর আইন ২০২৩ এর ধারা ১০৪, ১৬৬ ও ৩ অনুযায়ী তথ্য যাচাইকরণ যা অডিট ঝুঁকি স্কোর প্রভাবিত করে:
        </p>
        <div className="space-y-3 text-sm text-slate-800">
          <label className="flex items-start gap-3 rounded-lg bg-white p-3 border border-slate-200">
            <input
              type="checkbox"
              name="isRiskShielded"
              defaultChecked={Boolean(d.isRiskShielded)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-emerald-900">
                ধারা ১০৪ সার্বজনীন স্বনির্ধারণী অডিট শিল্ড (Universal Self-Assessment Audit Shield)
              </span>
              <p className="text-xs text-slate-500">
                পূর্ববর্তী বছরের তুলনায় ১৫% বা তদূর্ধ্ব প্রবৃদ্ধি প্রদর্শন করায় অডিট থেকে সুরক্ষিত।
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg bg-white p-3 border border-slate-200">
            <input
              type="checkbox"
              name="bookOfAccountsMaintained"
              defaultChecked={d.bookOfAccountsMaintained ?? true}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">
                ধারা ১৬৬ সংবিধিবদ্ধ হিসাব বহি সংরক্ষণ (Statutory Books of Accounts)
              </span>
              <p className="text-xs text-slate-500">
                আইন অনুযায়ী প্রয়োজনীয় রেজিস্টার ও হিসাব বহি যথাযথভাবে সংরক্ষণ করা হয়েছে।
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg bg-white p-3 border border-slate-200">
            <input
              type="checkbox"
              name="hasExemptIncome"
              defaultChecked={Boolean(d.hasExemptIncome)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">
                ধারা ৩ করমুক্ত আয়ের দালিলিক প্রমাণ (Proof of Tax-Exempt Income)
              </span>
              <p className="text-xs text-slate-500">
                করমুক্ত আয় প্রদর্শন করা হলে যথাযথ প্রমাণক ও অনুমোদন সংরক্ষিত রয়েছে।
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg bg-white p-3 border border-slate-200">
            <input
              type="checkbox"
              name="hasLargeLoanNoBank"
              defaultChecked={Boolean(d.hasLargeLoanNoBank)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-semibold text-rose-900">
                ধারা ১০৪ ব্যাংকিং চ্যানেল ব্যতীত ৫ লক্ষাধিক টাকার অ-প্রাতিষ্ঠানিক ঋণ (Non-Banking Loan &gt; 5 Lakh)
              </span>
              <p className="text-xs text-slate-500">
                ব্যাংক বা আর্থিক মাধ্যম ব্যতীত বৃহৎ পরিমাণের ঋণ গ্রহণ (উচ্চ নিরীক্ষা ঝুঁকি)।
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg bg-white p-3 border border-slate-200">
            <input
              type="checkbox"
              name="hasBusinessAudit"
              defaultChecked={Boolean(d.hasBusinessAudit)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">
                চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা নিরীক্ষা সম্পন্ন (CA Statutory Audit Completed)
              </span>
            </div>
          </label>
        </div>
      </section>

      <section>
        <Field label="মন্তব্য">
          <textarea name="notes" defaultValue={d.notes ?? ""} className="input" rows={3} />
        </Field>
      </section>

      <button className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto sm:px-8">
        {submitLabel}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: rgb(4 120 87);
          box-shadow: 0 0 0 1px rgb(4 120 87);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
