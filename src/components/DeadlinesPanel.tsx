import { createDeadline, deleteDeadline, seedAnnualDeadlinesForClient, updateDeadlineStatus } from "@/app/actions";

type Deadline = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  status: string;
  notes: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  income_tax: "আয়কর",
  vat: "ভ্যাট",
  audit: "নিরীক্ষা",
  appeal: "আপিল",
  other: "অন্যান্য",
};

export default function DeadlinesPanel({ clientId, deadlines }: { clientId: string; deadlines: Deadline[] }) {
  const seedAction = seedAnnualDeadlinesForClient.bind(null, clientId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-700">নতুন সময়সীমা যুক্ত করুন</h3>
          <form action={seedAction}>
            <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
              বার্ষিক সময়সীমা টেমপ্লেট প্রয়োগ করুন
            </button>
          </form>
        </div>
        <form action={createDeadline} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input name="title" required placeholder="শিরোনাম" className="input" />
          <select name="category" defaultValue="income_tax" className="input">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input name="dueDate" type="date" required className="input" />
          <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">যুক্ত করুন</button>
          <input name="notes" placeholder="মন্তব্য (ঐচ্ছিক)" className="input sm:col-span-2 lg:col-span-4" />
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {deadlines.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">কোনো সময়সীমা যুক্ত করা হয়নি।</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {deadlines.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-slate-900">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {CATEGORY_LABELS[d.category]} · {new Date(d.dueDate).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      d.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {d.status === "completed" ? "সম্পন্ন" : "চলমান"}
                  </span>
                  {d.status !== "completed" && (
                    <form action={updateDeadlineStatus.bind(null, d.id, "completed")}>
                      <button className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">সম্পন্ন করুন</button>
                    </form>
                  )}
                  <form action={deleteDeadline.bind(null, d.id)}>
                    <button className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">মুছুন</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
