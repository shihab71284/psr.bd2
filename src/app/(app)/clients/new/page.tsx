import ClientForm from "@/components/ClientForm";
import UpgradeBanner from "@/components/UpgradeBanner";
import { createClient } from "@/app/actions";
import { getChamberPlan } from "@/lib/subscription";
import { FREE_MAX_CLIENTS } from "@/lib/plans";

export default async function NewClientPage() {
  const chamber = await getChamberPlan();
  const atLimit = !chamber.isPro && chamber.clientCount >= FREE_MAX_CLIENTS;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">নতুন ক্লায়েন্ট যুক্ত করুন</h1>
        <p className="mt-1 text-sm text-slate-500">ক্লায়েন্টের প্রাথমিক তথ্য পূরণ করুন। পরবর্তীতে আরও তথ্য ও ডকুমেন্ট যুক্ত করতে পারবেন।</p>
      </div>
      {atLimit ? (
        <UpgradeBanner
          title="ফ্রি সীমা পূর্ণ হয়েছে"
          message={`ফ্রি প্ল্যানে সর্বোচ্চ ${FREE_MAX_CLIENTS} জন ক্লায়েন্ট রাখা যায় (এখন ${chamber.clientCount} জন আছে)। আরও ক্লায়েন্ট যুক্ত করতে Pro-তে আপগ্রেড করুন।`}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ClientForm action={createClient} submitLabel="ক্লায়েন্ট তৈরি করুন" />
        </div>
      )}
    </div>
  );
}
