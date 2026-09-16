"use client";

import { CATEGORY_LABELS, LOCATION_LABELS } from "@/lib/taxEngine";

type ClientDefaults = {
  name?: string;
  clientType?: string;
  taxpayerType?: string | null;
  gender?: string | null;
  genderCategory?: string | null;
  isResident?: boolean | null;
  taxpayerCategory?: string;
  location?: string;
  tin?: string | null;
  nid?: string | null;
  bin?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  businessType?: string | null;
  vatRegistered?: boolean;
  status?: string;
  notes?: string | null;
};

export default function ClientForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: ClientDefaults;
  submitLabel: string;
}) {
  const d = defaults ?? {};

  return (
    <form action={action} className="space-y-8">
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">ব্যক্তিগত/প্রাতিষ্ঠানিক তথ্য</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="পুরো নাম *">
            <input name="name" required defaultValue={d.name} className="input" />
          </Field>
          <Field label="করদাতার ধরন (Taxpayer Type - ধারা ১৬৪)">
            <select name="taxpayerType" defaultValue={d.taxpayerType ?? d.clientType ?? "individual"} className="input">
              <option value="individual">স্বাভাবিক ব্যক্তি (Individual)</option>
              <option value="firm">অংশীদারি ফার্ম (Firm)</option>
              <option value="company">কোম্পানি (Company)</option>
            </select>
          </Field>
          <Field label="লিঙ্গ ও জেন্ডার ক্যাটাগরি">
            <select name="genderCategory" defaultValue={d.genderCategory ?? (d.gender === "female" ? "female" : "general")} className="input">
              <option value="general">সাধারণ পুরুষ (General)</option>
              <option value="female">মহিলা করদাতা (Female)</option>
            </select>
          </Field>
          <Field label="আবাসিক মর্যাদা (Residential Status)">
            <select name="isResident" defaultValue={d.isResident === false ? "false" : "true"} className="input">
              <option value="true">আবাসিক (Resident Taxpayer)</option>
              <option value="false">অনাবাসিক (Non-Resident Taxpayer)</option>
            </select>
          </Field>
          <Field label="করদাতা শ্রেণি (করমুক্ত সীমা নির্ধারণে ব্যবহৃত)">
            <select name="taxpayerCategory" defaultValue={d.taxpayerCategory ?? "general"} className="input">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.bn} (৳{v.threshold.toLocaleString("en-US")})
                </option>
              ))}
            </select>
          </Field>
          <Field label="অবস্থান (ন্যূনতম কর নির্ধারণে ব্যবহৃত)">
            <select name="location" defaultValue={d.location ?? "other"} className="input">
              {Object.entries(LOCATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.bn} (ন্যূনতম কর ৳{v.minTax.toLocaleString("en-US")})
                </option>
              ))}
            </select>
          </Field>
          {defaults && (
            <Field label="অবস্থা">
              <select name="status" defaultValue={d.status ?? "active"} className="input">
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </select>
            </Field>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">পরিচিতি ও যোগাযোগ</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="টিআইএন">
            <input name="tin" defaultValue={d.tin ?? ""} className="input" placeholder="১২ সংখ্যার TIN" />
          </Field>
          <Field label="এনআইডি">
            <input name="nid" defaultValue={d.nid ?? ""} className="input" />
          </Field>
          <Field label="বিআইএন (ভ্যাট)">
            <input name="bin" defaultValue={d.bin ?? ""} className="input" />
          </Field>
          <Field label="ফোন">
            <input name="phone" defaultValue={d.phone ?? ""} className="input" />
          </Field>
          <Field label="ইমেইল">
            <input name="email" type="email" defaultValue={d.email ?? ""} className="input" />
          </Field>
          <Field label="ব্যবসার ধরন">
            <input name="businessType" defaultValue={d.businessType ?? ""} className="input" placeholder="যেমন: পাইকারি ব্যবসা" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="ঠিকানা">
            <textarea name="address" defaultValue={d.address ?? ""} className="input" rows={2} />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="vatRegistered" defaultChecked={d.vatRegistered} className="h-4 w-4 rounded border-slate-300" />
          ভ্যাট নিবন্ধিত (BIN আছে)
        </label>
      </section>

      <section>
        <Field label="মন্তব্য">
          <textarea name="notes" defaultValue={d.notes ?? ""} className="input" rows={3} />
        </Field>
      </section>

      <button className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto sm:px-8">
        {submitLabel}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: rgb(4 120 87);
          box-shadow: 0 0 0 1px rgb(4 120 87);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
