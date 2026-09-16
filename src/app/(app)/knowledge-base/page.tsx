import Link from "next/link";
import { CHECKLIST_TEMPLATES, KNOWLEDGE_ARTICLES } from "@/lib/content";

export default function KnowledgeBasePage() {
  const categories = Array.from(new Set(KNOWLEDGE_ARTICLES.map((a) => a.categoryBn)));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">জ্ঞানভান্ডার ও আইনি নির্দেশিকা</h1>
        <p className="mt-1 text-sm text-slate-500">আয়কর আইন ২০২৩, অর্থ আইন ২০২৫ ও ভ্যাট আইন ভিত্তিক ব্যবহারিক নির্দেশিকা।</p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{cat}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KNOWLEDGE_ARTICLES.filter((a) => a.categoryBn === cat).map((a) => (
              <Link
                key={a.slug}
                href={`/knowledge-base/${a.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">{a.titleBn}</h3>
                <p className="mt-2 text-sm text-slate-500">{a.summaryBn}</p>
                <p className="mt-3 text-sm font-medium text-emerald-700">বিস্তারিত পড়ুন →</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">সম্মতি চেকলিস্ট টেমপ্লেট</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {CHECKLIST_TEMPLATES.map((t) => (
            <div key={t.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">{t.titleBn}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {t.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-600">☐</span>
                    <span>{item.bn}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
