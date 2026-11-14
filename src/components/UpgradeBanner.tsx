import Link from "next/link";

export default function UpgradeBanner({
  title,
  message,
  compact = false,
}: {
  title: string;
  message: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-white shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg text-white shadow-xs">
            👑
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">{message}</p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Pro-তে আপগ্রেড করুন →
        </Link>
      </div>
    </div>
  );
}
