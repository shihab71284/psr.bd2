"use client";

import { useState } from "react";
import { createBankAccount, deleteBankAccount } from "@/app/actions";

export type BankAccount = {
  id: number;
  clientId: string;
  bankName: string;
  branchName: string | null;
  accountNumber: string;
  totalDeposit: string | null;
  closingBalance: string | null;
  interestEarned: string | null;
  tdsDeducted: string | null;
  createdAt?: Date | string | null;
};

export default function BankAccountsPanel({
  clientId,
  bankAccounts,
}: {
  clientId: string;
  bankAccounts: BankAccount[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const totalDeposits = bankAccounts.reduce((acc, a) => acc + (Number(a.totalDeposit) || 0), 0);
  const totalBalance = bankAccounts.reduce((acc, a) => acc + (Number(a.closingBalance) || 0), 0);
  const totalInterest = bankAccounts.reduce((acc, a) => acc + (Number(a.interestEarned) || 0), 0);
  const totalTds = bankAccounts.reduce((acc, a) => acc + (Number(a.tdsDeducted) || 0), 0);

  const addAction = createBankAccount.bind(null, clientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">ব্যাংক হিসাব বিবরণী (তফসিল ২৪এ - অনুচ্ছেদ ২৮)</h2>
          <p className="text-xs text-slate-500">
            আয়কর আইন ২০২৩ ও বিধিমালা অনুযায়ী করদাতার ব্যাংক হিসাবের বাৎসরিক লেনদেন, অর্জিত সুদ ও উৎসে করের বিবরণ।
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
        >
          {showAddForm ? "ফর্ম বন্ধ করুন" : "+ নতুন ব্যাংক হিসাব যুক্ত করুন"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">মোট হিসাব সংখ্যা</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{bankAccounts.length} টি</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">আয়বর্ষে মোট জমা</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">৳{totalDeposits.toLocaleString("en-US")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">সমাপনী মোট স্থিতি</p>
          <p className="mt-1 text-xl font-bold text-slate-900">৳{totalBalance.toLocaleString("en-US")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">অর্জিত সুদ (টিডিএস: ৳{totalTds.toLocaleString("en-US")})</p>
          <p className="mt-1 text-xl font-bold text-blue-700">৳{totalInterest.toLocaleString("en-US")}</p>
        </div>
      </div>

      {/* Add Bank Account Modal/Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-emerald-950">নতুন ব্যাংক হিসাবের বিবরণ পূরণ করুন</h3>
          <form
            action={async (formData) => {
              setIsSubmitting(true);
              try {
                await addAction(formData);
                setShowAddForm(false);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">ব্যাংক বা আর্থিক প্রতিষ্ঠানের নাম *</span>
                <input
                  name="bankName"
                  required
                  placeholder="যেমন: সোনালী ব্যাংক পিএলসি"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">শাখার নাম</span>
                <input
                  name="branchName"
                  placeholder="যেমন: কারওয়ান বাজার শাখা"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">হিসাব নম্বর (Account Number) *</span>
                <input
                  name="accountNumber"
                  required
                  placeholder="যেমন: 2050123456789"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">আয়বর্ষে মোট জমা (৳)</span>
                <input
                  name="totalDeposit"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">সমাপনী স্থিতি / ব্যালেন্স (৳)</span>
                <input
                  name="closingBalance"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">অর্জিত সুদ বা মুনাফা (৳)</span>
                <input
                  name="interestEarned"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">উৎসে কর্তিত কর - TDS (৳)</span>
                <input
                  name="tdsDeducted"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-700 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "হিসাব সংরক্ষণ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Bank Accounts */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">ব্যাংক ও শাখার নাম</th>
                <th className="px-4 py-3">হিসাব নম্বর</th>
                <th className="px-4 py-3 text-right">মোট জমা (৳)</th>
                <th className="px-4 py-3 text-right">সমাপনী স্থিতি (৳)</th>
                <th className="px-4 py-3 text-right">অর্জিত সুদ (৳)</th>
                <th className="px-4 py-3 text-right">উৎসে কর (৳)</th>
                <th className="px-4 py-3 text-center">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bankAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    কোনো ব্যাংক হিসাবের তথ্য এখনো যুক্ত করা হয়নি। উপরের বোতামে ক্লিক করে নতুন হিসাব যুক্ত করুন।
                  </td>
                </tr>
              ) : (
                bankAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{account.bankName}</div>
                      {account.branchName && (
                        <div className="text-xs font-normal text-slate-500">{account.branchName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{account.accountNumber}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ৳{Number(account.totalDeposit || 0).toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                      ৳{Number(account.closingBalance || 0).toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ৳{Number(account.interestEarned || 0).toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      ৳{Number(account.tdsDeducted || 0).toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form
                        action={async () => {
                          if (confirm("আপনি কি এই ব্যাংক হিসাবটি মুছে ফেলতে নিশ্চিত?")) {
                            await deleteBankAccount(account.id, clientId);
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="মুছে ফেলুন"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
