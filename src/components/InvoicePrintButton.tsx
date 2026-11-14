"use client";

export default function InvoicePrintButton({ label = "ইনভয়েস / রসিদ ডাউনলোড (PDF)" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 print:hidden"
    >
      🧾 {label}
    </button>
  );
}
