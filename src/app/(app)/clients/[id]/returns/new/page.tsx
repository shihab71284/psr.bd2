import { notFound } from "next/navigation";
import ReturnForm from "@/components/ReturnForm";
import UpgradeBanner from "@/components/UpgradeBanner";
import { createTaxReturn } from "@/app/actions";
import { getClientById } from "@/lib/queries";
import { getChamberPlan } from "@/lib/subscription";
import { FREE_MAX_RETURNS } from "@/lib/plans";

export default async function NewReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  const chamber = await getChamberPlan();
  const atLimit = !chamber.isPro && chamber.returnCount >= FREE_MAX_RETURNS;

  const action = createTaxReturn.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">নতুন রিটার্ন প্রস্তুত করুন</h1>
        <p className="mt-1 text-sm text-slate-500">{client.name} ({client.clientCode}) — তথ্য পূরণ করার সাথে সাথে কর হিসাব ও নিরীক্ষা ঝুঁকি স্বয়ংক্রিয়ভাবে গণনা হবে।</p>
      </div>
      {atLimit ? (
        <UpgradeBanner
          title="ফ্রি সীমা পূর্ণ হয়েছে"
          message={`ফ্রি প্ল্যানে সর্বোচ্চ ${FREE_MAX_RETURNS}টি রিটার্ন তৈরি করা যায় (এখন ${chamber.returnCount}টি আছে)। আনলিমিটেড রিটার্নের জন্য Pro-তে আপগ্রেড করুন।`}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ReturnForm action={action} submitLabel="হিসাব করুন ও সংরক্ষণ করুন" />
        </div>
      )}
    </div>
  );
}
