import { db } from "@/db";
import {
  activityLogs,
  blogPosts,
  clientBankAccounts,
  clients,
  deadlines,
  documents,
  giftRecords,
  lawyers,
  taxReturns,
  users,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function listClients() {
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: string) {
  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return client;
}

export async function listLawyers() {
  return db.select().from(lawyers).orderBy(lawyers.id);
}

export async function getLawyerById(id: number) {
  const [lawyer] = await db.select().from(lawyers).where(eq(lawyers.id, id)).limit(1);
  return lawyer;
}

export async function listBankAccountsForClient(clientId: string) {
  return db
    .select()
    .from(clientBankAccounts)
    .where(eq(clientBankAccounts.clientId, clientId))
    .orderBy(clientBankAccounts.id);
}

export async function listGiftRecordsForClient(clientId: string) {
  return db
    .select()
    .from(giftRecords)
    .where(eq(giftRecords.donorClientId, clientId))
    .orderBy(desc(giftRecords.createdAt));
}

export async function listAllGiftRecords() {
  return db
    .select({
      id: giftRecords.id,
      donorClientId: giftRecords.donorClientId,
      donorClientName: clients.name,
      donorClientCode: clients.clientCode,
      recipientName: giftRecords.recipientName,
      relationship: giftRecords.relationship,
      giftDescription: giftRecords.giftDescription,
      fairMarketValue: giftRecords.fairMarketValue,
      giftTaxPayable: giftRecords.giftTaxPayable,
      createdAt: giftRecords.createdAt,
    })
    .from(giftRecords)
    .innerJoin(clients, eq(giftRecords.donorClientId, clients.id))
    .orderBy(desc(giftRecords.createdAt));
}

export async function listDocumentsForClient(clientId: string) {
  return db.select().from(documents).where(eq(documents.clientId, clientId)).orderBy(desc(documents.uploadedAt));
}

export async function listReturnsForClient(clientId: string) {
  return db.select().from(taxReturns).where(eq(taxReturns.clientId, clientId)).orderBy(desc(taxReturns.createdAt));
}

export async function getReturnById(id: string) {
  const [ret] = await db.select().from(taxReturns).where(eq(taxReturns.id, id)).limit(1);
  return ret;
}

export async function listAllReturns() {
  return db
    .select({
      id: taxReturns.id,
      clientId: taxReturns.clientId,
      clientName: clients.name,
      clientCode: clients.clientCode,
      assessmentYear: taxReturns.assessmentYear,
      incomeYear: taxReturns.incomeYear,
      returnType: taxReturns.returnType,
      status: taxReturns.status,
      totalIncome: taxReturns.totalIncome,
      isRiskShielded: taxReturns.isRiskShielded,
      hasLargeLoanNoBank: taxReturns.hasLargeLoanNoBank,
      bookOfAccountsMaintained: taxReturns.bookOfAccountsMaintained,
      hasExemptIncome: taxReturns.hasExemptIncome,
      submissionDate: taxReturns.submissionDate,
      auditRiskScore: taxReturns.auditRiskScore,
      auditRiskLevel: taxReturns.auditRiskLevel,
      calculation: taxReturns.calculation,
      auditIssues: taxReturns.auditIssues,
      createdAt: taxReturns.createdAt,
      updatedAt: taxReturns.updatedAt,
    })
    .from(taxReturns)
    .innerJoin(clients, eq(taxReturns.clientId, clients.id))
    .orderBy(desc(taxReturns.updatedAt));
}

export async function listDeadlines() {
  return db
    .select({
      id: deadlines.id,
      title: deadlines.title,
      category: deadlines.category,
      dueDate: deadlines.dueDate,
      status: deadlines.status,
      notes: deadlines.notes,
      clientId: deadlines.clientId,
      clientName: clients.name,
      createdAt: deadlines.createdAt,
    })
    .from(deadlines)
    .leftJoin(clients, eq(deadlines.clientId, clients.id))
    .orderBy(deadlines.dueDate);
}

export async function listDeadlinesForClient(clientId: string) {
  return db.select().from(deadlines).where(eq(deadlines.clientId, clientId)).orderBy(deadlines.dueDate);
}

export async function listRecentActivity(limit = 12) {
  return db
    .select({
      id: activityLogs.id,
      message: activityLogs.message,
      createdAt: activityLogs.createdAt,
      clientId: activityLogs.clientId,
      clientName: clients.name,
      actorName: users.name,
    })
    .from(activityLogs)
    .leftJoin(clients, eq(activityLogs.clientId, clients.id))
    .leftJoin(users, eq(activityLogs.actorId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function dashboardMetrics() {
  const [[clientCount], [returnCount], [filedCount], [highRiskCount], [overdueCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(clients),
    db.select({ count: sql<number>`count(*)::int` }).from(taxReturns),
    db.select({ count: sql<number>`count(*)::int` }).from(taxReturns).where(eq(taxReturns.status, "filed")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(taxReturns)
      .where(sql`${taxReturns.auditRiskLevel} in ('high','critical')`),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(deadlines)
      .where(and(eq(deadlines.status, "upcoming"), sql`${deadlines.dueDate} < current_date`)),
  ]);

  return {
    clientCount: clientCount?.count ?? 0,
    returnCount: returnCount?.count ?? 0,
    filedCount: filedCount?.count ?? 0,
    highRiskCount: highRiskCount?.count ?? 0,
    overdueCount: overdueCount?.count ?? 0,
  };
}

export async function listBlogPosts() {
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));
}

