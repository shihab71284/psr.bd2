import Link from "next/link";
import { CATEGORY_LABELS, LOCATION_LABELS, RISK_BADGE_CLASSES, RISK_LEVEL_LABELS } from "@/lib/taxEngine";

type Client = {
  id: string;
  clientCode: string;
  name: string;
  clientType: string;
  taxpayerType?: string | null;
  gender: string | null;
  genderCategory?: string | null;
  isResident?: boolean | null;
  taxpayerCategory: string;
  location: string;
  tin: string | null;
  nid: string | null;
  bin: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  businessType: string | null;
  vatRegistered: boolean;
  status: string;
  notes: string | null;
};

type Ret = {
  id: string;
  assessmentYear: string;
  status: string;
  auditRiskLevel: string;
  auditRiskScore: number;
  isRiskShielded?: boolean;
  bookOfAccountsMaintained?: boolean;
  hasLargeLoanNoBank?: boolean;
};
type Doc = { status: string };

export default function OverviewPanel({
  client,
  returns,
  documents,
  deadlineCount,
}: {
  client: Client;
  returns: Ret[];
  documents: Doc[];
  deadlineCount: number;
}) {
  const latestReturn = returns[0];
  const verifiedDocs = documents.filter((d) => d.status === "verified").length;
  const complianceScore = documents.length ? Math.round((verifiedDocs / documents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="মোট প্রস্তুতকৃত রিটার্ন" value={String(returns.length)} />
        <InfoCard label="দলিলাদি জমা" value={String(documents.length)} />
        <InfoCard label="সম্মতি স্কোর" value={`${complianceScore}%`} />
        <InfoCard label="সক্রিয় সময়সীমা" value={String(deadlineCount)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">ক্লায়েন্ট তথ্য</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Detail label="ক্লায়েন্ট আইডি" value={client.clientCode} />
            <Detail
              label="করদাতার ধরন (ধারা ১৬৪)"
              value={
                client.taxpayerType === "firm"
                  ? "অংশীদারি ফার্ম (Firm)"
                  : client.taxpayerType === "company"
                  ? "কোম্পানি (Company)"
                  : "স্বাভাবিক ব্যক্তি (Individual)"
              }
            />
            <Detail
              label="আবাসিক মর্যাদা"
              value={client.isResident === false ? "অনাবাসিক (Non-Resident)" : "আবাসিক (Resident)"}
            />
            <Detail label="করদাতা শ্রেণি" value={CATEGORY_LABELS[client.taxpayerCategory as keyof typeof CATEGORY_LABELS]?.bn} />
            <Detail label="করমুক্ত সীমা" value={`৳${CATEGORY_LABELS[client.taxpayerCategory as keyof typeof CATEGORY_LABELS]?.threshold.toLocaleString("en-US")}`} />
            <Detail label="অবস্থান" value={LOCATION_LABELS[client.location as keyof typeof LOCATION_LABELS]?.bn} />
            <Detail label="ন্যূনতম কর" value={`৳${LOCATION_LABELS[client.location as keyof typeof LOCATION_LABELS]?.minTax.toLocaleString("en-US")}`} />
            <Detail label="টিআইএন" value={client.tin || "—"} />
            <Detail label="এনআইডি" value={client.nid || "—"} />
            <Detail label="বিআইএন" value={client.bin || "—"} />
            <Detail label="ভ্যাট নিবন্ধন" value={client.vatRegistered ? "নিবন্ধিত" : "নিবন্ধিত নয়"} />
            <Detail label="ফোন" value={client.phone || "—"} />
            <Detail label="ইমেইল" value={client.email || "—"} />
            <Detail label="ব্যবসার ধরন" value={client.businessType || "—"} />
          </dl>
          {client.address && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">ঠিকানা</p>
              <p className="mt-1 text-sm text-slate-700">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">মন্তব্য</p>
              <p className="mt-1 text-sm text-slate-700">{client.notes}</p>
            </div>
          )}
          <Link href={`/clients/${client.id}/edit`} className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:underline">
            তথ্য সম্পাদনা করুন →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">সাম্প্রতিক নিরীক্ষা ঝুঁকি</h3>
          {latestReturn ? (
            <div>
              <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${RISK_BADGE_CLASSES[latestReturn.auditRiskLevel]}`}>
                {RISK_LEVEL_LABELS[latestReturn.auditRiskLevel].bn}
              </div>
              <p className="text-3xl font-bold text-slate-900">{latestReturn.auditRiskScore}<span className="text-base font-normal text-slate-400">/100</span></p>
              <p className="mt-1 text-sm text-slate-500">কর বছর {latestReturn.assessmentYear}</p>

              {latestReturn.isRiskShielded && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200">
                  <p className="font-semibold">🛡️ ধারা ১০৪ অডিট শিল্ড সুরক্ষিত</p>
                  <p className="text-[11px] text-emerald-700">১৫%+ প্রবৃদ্ধি প্রদর্শন করায় অডিট থেকে মুক্ত।</p>
                </div>
              )}

              {latestReturn.hasLargeLoanNoBank && (
                <div className="mt-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-900 border border-rose-200">
                  <p className="font-semibold">⚠️ ধারা ১০৪ অ-ব্যাংকিং ঋণ সতর্কতা</p>
                  <p className="text-[11px] text-rose-700">ব্যাংক চ্যানেল ব্যতীত ৫ লক্ষাধিক টাকার ঋণ বিদ্যমান।</p>
                </div>
              )}

              <Link href={`/returns/${latestReturn.id}`} className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
                বিস্তারিত রিপোর্ট দেখুন →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-400">এখনো কোনো রিটার্ন প্রস্তুত করা হয়নি।</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value || "—"}</dd>
    </div>
  );
}
