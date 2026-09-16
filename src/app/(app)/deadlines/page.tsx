import Link from "next/link";
import { listClients, listDeadlines } from "@/lib/queries";
import { createDeadline, deleteDeadline, updateDeadlineStatus } from "@/app/actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  income_tax: "আয়কর",
  vat: "ভ্যাট",
  audit: "নিরীক্ষা",
  appeal: "আপিল",
  other: "অন্যান্য",
};

function daysUntil(d: string) {
  const due = new Date(d);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DeadlinesPage() {
  const [deadlines, clients] = await Promise.all([listDeadlines(), listClients()]);

  const upcoming = deadlines.filter((d) => d.status !== "completed");
  const completed = deadlines.filter((d) => d.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">সময়সীমা ক্যালেন্ডার</h1>
        <p className="mt-1 text-sm text-slate-500">আয়কর, ভ্যাট, নিরীক্ষা ও আপিলের সকল সময়সীমা একসাথে পরিচালনা করুন।</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">নতুন সময়সীমা যুক্ত করুন</h3>
        <form action={createDeadline} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input name="title" required placeholder="শিরোনাম" className="input" />
          <select name="clientId" className="input" defaultValue="">
            <option value="">সাধারণ (নির্দিষ্ট ক্লায়েন্ট ছাড়া)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.clientCode})</option>
            ))}
          </select>
          <select name="category" defaultValue="income_tax" className="input">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input name="dueDate" type="date" required className="input" />
          <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">যুক্ত করুন</button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-900">চলমান সময়সীমা ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">কোনো চলমান সময়সীমা নেই।</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((d) => {
              const days = daysUntil(String(d.dueDate));
              const overdue = days < 0;
              const urgent = days >= 0 && days <= 7;
              return (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-500">
                      {CATEGORY_LABELS[d.category]} · {new Date(d.dueDate).toLocaleDateString("bn-BD")}
                      {d.clientName && (
                        <>
                          {" · "}
                          <Link href={`/clients/${d.clientId}`} className="text-emerald-700 hover:underline">{d.clientName}</Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        overdue ? "bg-red-100 text-red-700" : urgent ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {overdue ? "মেয়াদোত্তীর্ণ" : `${days} দিন বাকি`}
                    </span>
                    <form action={updateDeadlineStatus.bind(null, d.id, "completed")}>
                      <button className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">সম্পন্ন করুন</button>
                    </form>
                    <form action={deleteDeadline.bind(null, d.id)}>
                      <button className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">মুছুন</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {completed.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-900">সম্পন্ন সময়সীমা ({completed.length})</h2>
          <ul className="divide-y divide-slate-100">
            {completed.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3 opacity-70">
                <p className="text-sm text-slate-600 line-through">{d.title}</p>
                <span className="text-xs text-slate-400">{new Date(d.dueDate).toLocaleDateString("bn-BD")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
