import { notFound } from "next/navigation";
import ReturnForm from "@/components/ReturnForm";
import { createTaxReturn } from "@/app/actions";
import { getClientById } from "@/lib/queries";

export default async function NewReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const action = createTaxReturn.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">নতুন রিটার্ন প্রস্তুত করুন</h1>
        <p className="mt-1 text-sm text-slate-500">{client.name} ({client.clientCode}) — তথ্য পূরণ করার সাথে সাথে কর হিসাব ও নিরীক্ষা ঝুঁকি স্বয়ংক্রিয়ভাবে গণনা হবে।</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReturnForm action={action} submitLabel="হিসাব করুন ও সংরক্ষণ করুন" />
      </div>
    </div>
  );
}
