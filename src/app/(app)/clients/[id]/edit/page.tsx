import { notFound } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import { updateClient } from "@/app/actions";
import { getClientById } from "@/lib/queries";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const action = updateClient.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ক্লায়েন্টের তথ্য সম্পাদনা করুন</h1>
        <p className="mt-1 text-sm text-slate-500">{client.clientCode} — {client.name}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClientForm action={action} defaults={client} submitLabel="পরিবর্তন সংরক্ষণ করুন" />
      </div>
    </div>
  );
}
