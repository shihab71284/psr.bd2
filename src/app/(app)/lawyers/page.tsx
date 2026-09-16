import { listLawyers, listClients } from "@/lib/queries";
import LawyersTable from "@/components/LawyersTable";

export const dynamic = "force-dynamic";

export default async function LawyersPage() {
  const [lawyers, clients] = await Promise.all([listLawyers(), listClients()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">আইনজীবী ও সাবস্ক্রাইবার প্যানেল</h1>
          <p className="mt-1 text-sm text-slate-500">
            বাংলাদেশ বার কাউন্সিলের নিবন্ধিত আইনজীবী, আইটিপি (ITP) ও কর পরামর্শকদের তালিকা ও সাবস্ক্রিপশন স্ট্যাটাস।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">মোট নিবন্ধিত আইনজীবী</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{lawyers.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-800">সক্রিয় সাবস্ক্রিপশন (Active)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "active").length}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm">
          <p className="text-xs font-medium text-blue-800">ট্রায়াল পিরিয়ড (Trialling)</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "trialling" || (l.subscriptionStatus || "").toLowerCase() === "trial").length}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <p className="text-xs font-medium text-rose-800">মেয়াদোত্তীর্ণ (Expired)</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">
            {lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "expired").length}
          </p>
        </div>
      </div>

      <LawyersTable lawyers={lawyers} clients={clients} />
    </div>
  );
}

