import ClientForm from "@/components/ClientForm";
import { createClient } from "@/app/actions";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">নতুন ক্লায়েন্ট যুক্ত করুন</h1>
        <p className="mt-1 text-sm text-slate-500">ক্লায়েন্টের প্রাথমিক তথ্য পূরণ করুন। পরবর্তীতে আরও তথ্য ও ডকুমেন্ট যুক্ত করতে পারবেন।</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClientForm action={createClient} submitLabel="ক্লায়েন্ট তৈরি করুন" />
      </div>
    </div>
  );
}
