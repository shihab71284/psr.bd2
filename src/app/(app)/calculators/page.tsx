import CalculatorHub from "@/components/CalculatorHub";

export default async function CalculatorsPage(props: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const initialTab = searchParams?.tab;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ট্যাক্স ক্যালকুলেটর</h1>
        <p className="mt-1 text-sm text-slate-500">
          সাধারণ কর হিসাব দ্রুত সম্পন্ন করুন — সবকিছু রিয়েল-টাইমে গণনা হয়।
        </p>
      </div>
      <CalculatorHub defaultTab={initialTab} />
    </div>
  );
}
