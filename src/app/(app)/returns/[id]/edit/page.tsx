import { notFound } from "next/navigation";
import ReturnForm from "@/components/ReturnForm";
import { updateTaxReturn } from "@/app/actions";
import { getClientById, getReturnById } from "@/lib/queries";

export default async function EditReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ret = await getReturnById(id);
  if (!ret) notFound();
  const client = await getClientById(ret.clientId);

  const action = updateTaxReturn.bind(null, id, ret.clientId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">রিটার্ন সম্পাদনা করুন</h1>
        <p className="mt-1 text-sm text-slate-500">{client?.name} ({client?.clientCode}) — {ret.returnType} · কর বছর {ret.assessmentYear}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReturnForm action={action} defaults={ret} submitLabel="পুনরায় হিসাব করুন ও সংরক্ষণ করুন" />
      </div>
    </div>
  );
}
