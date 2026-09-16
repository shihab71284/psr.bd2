import { DOCUMENT_CATEGORIES } from "@/lib/taxEngine";
import { addDocument, deleteDocument, updateDocumentStatus } from "@/app/actions";

type Doc = {
  id: string;
  category: string;
  title: string;
  notes: string | null;
  status: string;
  expiryDate: string | null;
  uploadedAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমান",
  submitted: "জমাকৃত",
  verified: "যাচাইকৃত",
  expired: "মেয়াদোত্তীর্ণ",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  verified: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
};

export default function DocumentsPanel({ clientId, documents }: { clientId: string; documents: Doc[] }) {
  const addAction = addDocument.bind(null, clientId);

  const requiredCategories = DOCUMENT_CATEGORIES.length;
  const uploadedCategories = new Set(documents.map((d) => d.category)).size;
  const progress = requiredCategories ? Math.round((uploadedCategories / requiredCategories) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <p className="font-medium text-slate-700">ডকুমেন্ট সংগ্রহের অগ্রগতি</p>
          <p className="text-slate-500">{uploadedCategories}/{requiredCategories} বিভাগ</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">নতুন ডকুমেন্ট যুক্ত করুন</h3>
        <form action={addAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select name="category" required className="input" defaultValue="">
            <option value="" disabled>ডকুমেন্ট বিভাগ</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.bn}</option>
            ))}
          </select>
          <input name="title" required placeholder="ডকুমেন্টের শিরোনাম" className="input" />
          <input name="expiryDate" type="date" className="input" title="মেয়াদ উত্তীর্ণের তারিখ (ঐচ্ছিক)" />
          <select name="status" className="input" defaultValue="submitted">
            <option value="pending">অপেক্ষমান</option>
            <option value="submitted">জমাকৃত</option>
            <option value="verified">যাচাইকৃত</option>
          </select>
          <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">যুক্ত করুন</button>
          <input name="notes" placeholder="মন্তব্য (ঐচ্ছিক)" className="input sm:col-span-2 lg:col-span-5" />
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {documents.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">এখনো কোনো ডকুমেন্ট যুক্ত করা হয়নি।</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">শিরোনাম</th>
                <th className="px-4 py-3">বিভাগ</th>
                <th className="px-4 py-3">অবস্থা</th>
                <th className="px-4 py-3">মেয়াদ</th>
                <th className="px-4 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const catLabel = DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.bn ?? doc.category;
                return (
                  <tr key={doc.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{doc.title}</p>
                      {doc.notes && <p className="text-xs text-slate-400">{doc.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{catLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[doc.status]}`}>
                        {STATUS_LABELS[doc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{doc.expiryDate ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <form action={updateDocumentStatus.bind(null, doc.id, clientId, "verified")}>
                          <button className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">যাচাই</button>
                        </form>
                        <form action={deleteDocument.bind(null, doc.id, clientId)}>
                          <button className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">মুছুন</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
