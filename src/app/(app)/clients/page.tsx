import Link from "next/link";
import { listClients } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/taxEngine";

export const dynamic = "force-dynamic";

const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: "ব্যক্তি",
  business: "ব্যবসা",
  partnership: "অংশীদারি ফার্ম",
  company: "কোম্পানি",
};

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">ক্লায়েন্ট ব্যবস্থাপনা</h1>
          <p className="mt-1 text-sm text-slate-500">সকল ক্লায়েন্ট প্রোফাইল এখানে দেখুন ও পরিচালনা করুন।</p>
        </div>
        <Link href="/clients/new" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800">
          + নতুন ক্লায়েন্ট
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {clients.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-400">এখনো কোনো ক্লায়েন্ট যুক্ত করা হয়নি।</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">ক্লায়েন্ট আইডি</th>
                <th className="px-5 py-3">নাম</th>
                <th className="px-5 py-3">ধরন</th>
                <th className="px-5 py-3">শ্রেণি</th>
                <th className="px-5 py-3">টিআইএন</th>
                <th className="px-5 py-3">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-emerald-700 hover:underline">
                      {c.clientCode}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/clients/${c.id}`} className="text-slate-900 hover:underline">{c.name}</Link>
                    <p className="text-xs text-slate-400">{c.phone || c.email || ""}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{CLIENT_TYPE_LABELS[c.clientType] ?? c.clientType}</td>
                  <td className="px-5 py-3 text-slate-600">{CATEGORY_LABELS[c.taxpayerCategory as keyof typeof CATEGORY_LABELS]?.bn ?? c.taxpayerCategory}</td>
                  <td className="px-5 py-3 text-slate-600">{c.tin || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
