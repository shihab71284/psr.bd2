import { notFound } from "next/navigation";
import Link from "next/link";
import { KNOWLEDGE_ARTICLES } from "@/lib/content";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/knowledge-base" className="text-sm font-medium text-emerald-700 hover:underline">← জ্ঞানভান্ডারে ফিরে যান</Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{article.categoryBn}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{article.titleBn}</h1>
        <p className="mt-2 text-sm text-slate-500">{article.summaryBn}</p>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {article.bodyBn.map((p, i) => (
          <p key={i} className="leading-relaxed text-slate-700">{p}</p>
        ))}
      </div>
      <p className="text-xs text-slate-400">* এই তথ্য শুধুমাত্র সাধারণ নির্দেশনার জন্য এবং তা আইনি পরামর্শ হিসেবে বিবেচিত হবে না। নির্দিষ্ট ক্ষেত্রে সর্বশেষ এনবিআর প্রজ্ঞাপন ও বিশেষজ্ঞ মতামত যাচাই করুন।</p>
    </div>
  );
}
