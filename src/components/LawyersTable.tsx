"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  UserCheck,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  Users,
  Calendar,
  Award,
} from "lucide-react";

export type LawyerItem = {
  id: number;
  name: string;
  barId: string | null;
  tin: string | null;
  email: string;
  phoneNumber: string;
  subscriptionStatus: string | null;
  createdAt: Date | string | null;
};

export function LawyerStatusBadge({
  status,
  size = "md",
}: {
  status: string | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "active") {
    return (
      <span
        id={`status-badge-active`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 font-medium text-emerald-700 shadow-xs transition-colors ${
          size === "lg" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="font-semibold">Active</span>
        <span className="text-[11px] opacity-85">(সক্রিয়)</span>
      </span>
    );
  }

  if (normalized === "trialling" || normalized === "trial") {
    return (
      <span
        id={`status-badge-trialling`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 font-medium text-blue-700 shadow-xs transition-colors ${
          size === "lg" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
        </span>
        <span className="font-semibold">Trialling</span>
        <span className="text-[11px] opacity-85">(ট্রায়াল)</span>
      </span>
    );
  }

  if (normalized === "expired") {
    return (
      <span
        id={`status-badge-expired`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 font-medium text-rose-700 shadow-xs transition-colors ${
          size === "lg" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
        </span>
        <span className="font-semibold">Expired</span>
        <span className="text-[11px] opacity-85">(মেয়াদোত্তীর্ণ)</span>
      </span>
    );
  }

  return (
    <span
      id={`status-badge-inactive`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 font-medium text-slate-700 shadow-xs transition-colors ${
        size === "lg" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <span className="inline-flex h-2 w-2 rounded-full bg-slate-400"></span>
      <span className="font-semibold">Inactive</span>
      <span className="text-[11px] opacity-85">(নিষ্ক্রিয়)</span>
    </span>
  );
}

export type LawyerClient = {
  id: string;
  lawyerId: number | null;
  clientCode: string;
  name: string;
  taxpayerType?: string | null;
  tin?: string | null;
  phone?: string | null;
  status?: string | null;
};

interface LawyersTableProps {
  lawyers: LawyerItem[];
  clients: LawyerClient[];
}

export default function LawyersTable({ lawyers, clients }: LawyersTableProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trialling" | "expired">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLawyer(null);
      }
    };
    if (selectedLawyer) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLawyer]);

  // Filtered lawyers by status and search query (name or ID)
  const filteredLawyers = lawyers.filter((l) => {
    // Status filter
    if (statusFilter !== "all") {
      const norm = (l.subscriptionStatus || "").trim().toLowerCase();
      if (statusFilter === "trialling") {
        if (norm !== "trialling" && norm !== "trial") return false;
      } else if (norm !== statusFilter) {
        return false;
      }
    }

    // Search query filter (by name or ID)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const nameMatch = l.name.toLowerCase().includes(q);
      const barIdMatch = (l.barId || "").toLowerCase().includes(q);
      const idMatch =
        String(l.id).toLowerCase() === q ||
        `#${l.id}`.toLowerCase() === q ||
        `id-${l.id}`.toLowerCase().includes(q);
      const tinMatch = (l.tin || "").toLowerCase().includes(q);
      const emailMatch = l.email.toLowerCase().includes(q);
      return nameMatch || barIdMatch || idMatch || tinMatch || emailMatch;
    }

    return true;
  });

  // Clients assigned to the currently selected lawyer
  const assignedClients = selectedLawyer
    ? clients.filter((c) => c.lawyerId === selectedLawyer.id)
    : [];

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">বার কাউন্সিল নিবন্ধিত সদস্যবৃন্দ</h2>
            <p className="text-xs text-slate-500">
              যেকোনো আইনজীবীর বিস্তারিত তথ্য ও পরিচালিত ক্লায়েন্ট তালিকা দেখতে সারির ওপর ক্লিক করুন।
            </p>
          </div>

          {/* Status Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              সকল ({lawyers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "active"
                  ? "border border-emerald-300 bg-emerald-600 text-white"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              Active ({lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "active").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("trialling")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "trialling"
                  ? "border border-blue-300 bg-blue-600 text-white"
                  : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-300"></span>
              Trialling ({lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "trialling" || (l.subscriptionStatus || "").toLowerCase() === "trial").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("expired")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "expired"
                  ? "border border-rose-300 bg-rose-600 text-white"
                  : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-300"></span>
              Expired ({lawyers.filter((l) => (l.subscriptionStatus || "").toLowerCase() === "expired").length})
            </button>
          </div>
        </div>

        {/* Search Input and Filter Summary Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="lawyer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আইনজীবীর নাম বা আইডি (Bar ID / ID) দিয়ে খুঁজুন..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Filter lawyers by name or ID"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                title="মুছে ফেলুন (Clear search)"
                aria-label="Clear search input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              প্রদর্শিত:{" "}
              <strong className="font-semibold text-slate-900">
                {filteredLawyers.length}
              </strong>{" "}
              / {lawyers.length} জন
            </span>
            {(searchQuery.trim() !== "" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                রিসেট করুন
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">আইনজীবীর নাম</th>
                <th className="px-4 py-3">বার আইডি (নিবন্ধন নং)</th>
                <th className="px-4 py-3">টিআইএন</th>
                <th className="px-4 py-3">ইমেইল</th>
                <th className="px-4 py-3">ফোন নম্বর</th>
                <th className="px-4 py-3 text-center">ক্লায়েন্ট সংখ্যা</th>
                <th className="px-4 py-3 text-center" id="th-lawyers-status">
                  <span className="font-semibold text-slate-900">Status</span>
                  <span className="block text-[10px] font-normal lowercase text-slate-400">সাবস্ক্রিপশন</span>
                </th>
                <th className="px-4 py-3 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLawyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">কোনো আইনজীবী পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-400">
                        {searchQuery.trim()
                          ? `"${searchQuery}" দিয়ে কোনো ফলাফল মেলেনি। সঠিক নাম বা আইডি দিয়ে পুনরায় চেষ্টা করুন।`
                          : "নির্বাচিত স্ট্যাটাসের কোনো আইনজীবী পাওয়া যায়নি।"}
                      </p>
                      {(searchQuery.trim() !== "" || statusFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          অনুসন্ধান রিসেট করুন
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLawyers.map((l) => {
                  const lawyerClientCount = clients.filter((c) => c.lawyerId === l.id).length;
                  return (
                    <tr
                      key={l.id}
                      id={`lawyer-row-${l.id}`}
                      onClick={() => setSelectedLawyer(l)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedLawyer(l);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer transition-colors hover:bg-emerald-50/50 focus:bg-emerald-50/50 focus:outline-none"
                      title="বিস্তারিত দেখতে ক্লিক করুন"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                            {l.name.slice(0, 2)}
                          </div>
                          <div>
                            <span>{l.name}</span>
                            <span className="block text-[11px] font-normal text-slate-400">
                              আইনজীবী / আইটিপি
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {l.barId || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {l.tin || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{l.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{l.phoneNumber}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          <Users className="h-3 w-3 text-slate-500" />
                          {lawyerClientCount}
                        </span>
                      </td>
                      {/* Status Column with dynamic visual badge */}
                      <td className="px-4 py-3 text-center" id={`status-col-${l.id}`}>
                        <LawyerStatusBadge status={l.subscriptionStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800">
                          বিস্তারিত
                          <span aria-hidden="true">&rarr;</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lawyer Detail Modal */}
      {selectedLawyer && (
        <div
          id="lawyer-detail-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedLawyer(null)}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            id="lawyer-detail-modal-container"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              id="btn-close-lawyer-modal"
              type="button"
              onClick={() => setSelectedLawyer(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              aria-label="বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5 pr-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xl font-bold text-white shadow-md">
                {selectedLawyer.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id="modal-title" className="text-xl font-bold text-slate-900">
                    {selectedLawyer.name}
                  </h3>
                  <LawyerStatusBadge status={selectedLawyer.subscriptionStatus} size="lg" />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  বাংলাদেশ বার কাউন্সিল সনদপ্রাপ্ত ও আয়কর আইন ২০২৩ এর নিবন্ধিত পেশাজীবী
                </p>
              </div>
            </div>

            {/* Statutory Legal Representation Info (ধারা ৪২) */}
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>আইনগত প্রতিনিধিত্ব ও এখতিয়ার (আয়কর আইন ২০২৩ এর ধারা ৪২):</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
                ধারা ৪২ অনুযায়ী উক্ত আইনজীবী বা আয়কর উপদেষ্টা (ITP) করদাতার ক্ষমতাপ্রাপ্ত প্রতিনিধিরূপে
                উপ-কর কমিশনার, কমিশনার (আপিল) ও কর ট্রাইব্যুনালের শুনানিতে অংশগ্রহণে বিধিবদ্ধভাবে যোগ্য।
              </p>
            </div>

            {/* Detailed Credentials Grid */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  বার কাউন্সিল নিবন্ধন (Bar ID)
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                  {selectedLawyer.barId || "নথিভুক্ত নয়"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  ই-টিআইএন (TIN)
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                  {selectedLawyer.tin || "নথিভুক্ত নয়"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  যোগাযোগ নম্বর
                </span>
                <a
                  href={`tel:${selectedLawyer.phoneNumber}`}
                  className="mt-1 inline-block font-mono text-sm font-bold text-emerald-700 hover:underline"
                >
                  {selectedLawyer.phoneNumber}
                </a>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  ইমেইল ঠিকানা
                </span>
                <a
                  href={`mailto:${selectedLawyer.email}`}
                  className="mt-1 inline-block text-sm font-bold text-emerald-700 hover:underline break-all"
                >
                  {selectedLawyer.email}
                </a>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  প্ল্যাটফর্মে নিবন্ধনের তারিখ
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedLawyer.createdAt
                    ? new Date(selectedLawyer.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  পরিচালিত সক্রিয় ক্লায়েন্ট
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {assignedClients.length} জন করদাতা অন্তর্ভুক্ত
                </p>
              </div>
            </div>

            {/* Assigned Clients List */}
            <div className="mt-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  পরিচালিত ক্লায়েন্ট তালিকা ({assignedClients.length})
                </h4>
                <Link
                  href="/clients"
                  className="text-xs font-medium text-emerald-700 hover:underline"
                  onClick={() => setSelectedLawyer(null)}
                >
                  সকল ক্লায়েন্ট দেখুন &rarr;
                </Link>
              </div>

              {assignedClients.length > 0 ? (
                <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {assignedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-slate-50"
                    >
                      <div>
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline"
                          onClick={() => setSelectedLawyer(null)}
                        >
                          {client.name}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">{client.clientCode}</span>
                          <span>&bull;</span>
                          <span>
                            {client.taxpayerType === "firm"
                              ? "অংশীদারি ফার্ম"
                              : client.taxpayerType === "company"
                              ? "কোম্পানি"
                              : "স্বাভাবিক ব্যক্তি"}
                          </span>
                          {client.tin && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono">TIN: {client.tin}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                        onClick={() => setSelectedLawyer(null)}
                      >
                        প্রোফাইল
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  বর্তমানে এই আইনজীবীর অধীনে কোনো ক্লায়েন্ট সরাসরি সংযুক্ত নেই।
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <a
                href={`tel:${selectedLawyer.phoneNumber}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                সরাসরি কল
              </a>
              <a
                href={`mailto:${selectedLawyer.email}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                ইমেইল পাঠান
              </a>
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
