import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getClientById,
  listBankAccountsForClient,
  listDeadlinesForClient,
  listDocumentsForClient,
  listGiftRecordsForClient,
  listReturnsForClient,
} from "@/lib/queries";
import Tabs from "@/components/Tabs";
import OverviewPanel from "@/components/OverviewPanel";
import DocumentsPanel from "@/components/DocumentsPanel";
import ReturnsPanel from "@/components/ReturnsPanel";
import DeadlinesPanel from "@/components/DeadlinesPanel";
import AuditRiskComparison from "@/components/AuditRiskComparison";
import BankAccountsPanel from "@/components/BankAccountsPanel";
import GiftRecordsPanel from "@/components/GiftRecordsPanel";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = (await searchParams) || {};
  const client = await getClientById(id);
  if (!client) notFound();

  const [documents, returns, deadlines, bankAccounts, giftRecords] = await Promise.all([
    listDocumentsForClient(id),
    listReturnsForClient(id),
    listDeadlinesForClient(id),
    listBankAccountsForClient(id),
    listGiftRecordsForClient(id),
  ]);

  const activeDeadlines = deadlines.filter((d) => d.status !== "completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{client.name}</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{client.clientCode}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{client.phone || "—"} {client.email ? `· ${client.email}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            সম্পাদনা করুন
          </Link>
          <Link href={`/clients/${id}/returns/new`} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
            + নতুন রিটার্ন
          </Link>
        </div>
      </div>

      <Tabs
        initialTab={tab}
        tabs={[
          {
            id: "overview",
            label: "সারসংক্ষেপ",
            content: (
              <OverviewPanel client={client} returns={returns as never} documents={documents} deadlineCount={activeDeadlines.length} />
            ),
          },
          { id: "returns", label: `রিটার্ন (${returns.length})`, content: <ReturnsPanel clientId={id} returns={returns as never} /> },
          {
            id: "bank-accounts",
            label: `ব্যাংক হিসাব (${bankAccounts.length})`,
            content: <BankAccountsPanel clientId={id} bankAccounts={bankAccounts as never} />,
          },
          {
            id: "gifts",
            label: `দানকর রেকর্ড (${giftRecords.length})`,
            content: <GiftRecordsPanel donorClientId={id} giftRecords={giftRecords as never} />,
          },
          {
            id: "risk-comparison",
            label: "ঝুঁকি তুলনা ও ট্রেন্ড",
            content: (
              <AuditRiskComparison
                clientId={id}
                clientName={client.name}
                clientCode={client.clientCode}
                returns={returns as never}
              />
            ),
          },
          { id: "documents", label: `ডকুমেন্ট (${documents.length})`, content: <DocumentsPanel clientId={id} documents={documents as never} /> },
          { id: "deadlines", label: `সময়সীমা (${activeDeadlines.length})`, content: <DeadlinesPanel clientId={id} deadlines={deadlines as never} /> },
        ]}
      />
    </div>
  );
}
