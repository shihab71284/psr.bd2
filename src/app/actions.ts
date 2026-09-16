"use server";

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
  newsletterSubscribers,
  taxReturns,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assessAuditRisk, calculateGiftTax, calculateIncomeTax, AuditIssue } from "@/lib/taxEngine";
import { getLowEffortFixDetails, recalculateAuditScore } from "@/lib/quickFixHelper";
import { ANNUAL_DEADLINE_TEMPLATES } from "@/lib/content";

async function logActivity(message: string, clientId?: string) {
  const session = await getSession();
  await db.insert(activityLogs).values({
    message,
    clientId: clientId ?? null,
    actorId: session?.userId ?? null,
  });
}

async function nextClientCode() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(clients);
  const seq = (count ?? 0) + 1;
  return `CID-${String(seq).padStart(5, "0")}`;
}

function str(v: FormDataEntryValue | null) {
  return v ? String(v).trim() : "";
}
function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createClient(formData: FormData) {
  const code = await nextClientCode();
  const name = str(formData.get("name"));
  const lawyerId = num(formData.get("lawyerId")) || 1;
  const taxpayerType = str(formData.get("taxpayerType")) || str(formData.get("clientType")) || "individual";

  const [client] = await db
    .insert(clients)
    .values({
      lawyerId,
      clientCode: code,
      name,
      taxpayerType,
      clientType: taxpayerType,
      gender: str(formData.get("gender")) || null,
      genderCategory: str(formData.get("genderCategory")) || "general",
      isResident: formData.get("isResident") !== "false",
      taxpayerCategory: str(formData.get("taxpayerCategory")) || "general",
      location: str(formData.get("location")) || "other",
      tin: str(formData.get("tin")) || null,
      nid: str(formData.get("nid")) || null,
      bin: str(formData.get("bin")) || null,
      phone: str(formData.get("phone")) || null,
      email: str(formData.get("email")) || null,
      address: str(formData.get("address")) || null,
      businessType: str(formData.get("businessType")) || null,
      vatRegistered: formData.get("vatRegistered") === "on",
      notes: str(formData.get("notes")) || null,
    })
    .returning();

  await logActivity(`নতুন ক্লায়েন্ট তৈরি করা হয়েছে: ${name} (${code})`, client.id);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const lawyerId = num(formData.get("lawyerId")) || 1;
  const taxpayerType = str(formData.get("taxpayerType")) || str(formData.get("clientType")) || "individual";

  await db
    .update(clients)
    .set({
      lawyerId,
      name: str(formData.get("name")),
      taxpayerType,
      clientType: taxpayerType,
      gender: str(formData.get("gender")) || null,
      genderCategory: str(formData.get("genderCategory")) || "general",
      isResident: formData.get("isResident") !== "false",
      taxpayerCategory: str(formData.get("taxpayerCategory")) || "general",
      location: str(formData.get("location")) || "other",
      tin: str(formData.get("tin")) || null,
      nid: str(formData.get("nid")) || null,
      bin: str(formData.get("bin")) || null,
      phone: str(formData.get("phone")) || null,
      email: str(formData.get("email")) || null,
      address: str(formData.get("address")) || null,
      businessType: str(formData.get("businessType")) || null,
      vatRegistered: formData.get("vatRegistered") === "on",
      status: str(formData.get("status")) || "active",
      notes: str(formData.get("notes")) || null,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId));

  await logActivity("ক্লায়েন্টের তথ্য হালনাগাদ করা হয়েছে", clientId);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  redirect(`/clients/${clientId}`);
}

// ----------------- ব্যাংক হিসাব (Client Bank Accounts) [২৮] -----------------
export async function createBankAccount(clientId: string, formData: FormData) {
  const bankName = str(formData.get("bankName"));
  const branchName = str(formData.get("branchName"));
  const accountNumber = str(formData.get("accountNumber"));
  const totalDeposit = num(formData.get("totalDeposit"));
  const closingBalance = num(formData.get("closingBalance"));
  const interestEarned = num(formData.get("interestEarned"));
  const tdsDeducted = num(formData.get("tdsDeducted"));

  await db.insert(clientBankAccounts).values({
    clientId,
    bankName,
    branchName,
    accountNumber,
    totalDeposit: String(totalDeposit),
    closingBalance: String(closingBalance),
    interestEarned: String(interestEarned),
    tdsDeducted: String(tdsDeducted),
  });

  await logActivity(`নতুন ব্যাংক হিসাব যুক্ত করা হয়েছে: ${bankName} (${accountNumber})`, clientId);
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteBankAccount(id: number, clientId: string) {
  await db.delete(clientBankAccounts).where(eq(clientBankAccounts.id, id));
  await logActivity(`ব্যাংক হিসাব মুছে ফেলা হয়েছে (#${id})`, clientId);
  revalidatePath(`/clients/${clientId}`);
}

// ----------------- দানকর ট্র্যাকিং (Gift Records - দানকর আইন, ১৯৯০) [১৬৩৯] -----------------
export async function createGiftRecord(donorClientId: string, formData: FormData) {
  const recipientName = str(formData.get("recipientName"));
  const relationship = str(formData.get("relationship")) || "other";
  const giftDescription = str(formData.get("giftDescription"));
  const fairMarketValue = num(formData.get("fairMarketValue"));

  // স্বয়ংক্রিয়ভাবে দানকর আইন ১৯৯০ অনুযায়ী প্রদেয় কর হিসাব
  const taxResult = calculateGiftTax(fairMarketValue, relationship);

  await db.insert(giftRecords).values({
    donorClientId,
    recipientName,
    relationship,
    giftDescription,
    fairMarketValue: String(fairMarketValue),
    giftTaxPayable: String(taxResult.giftTaxPayable),
  });

  await logActivity(
    `নতুন দান রেকর্ড যুক্ত করা হয়েছে: প্রাপক ${recipientName}, প্রদেয় দানকর: ৳${taxResult.giftTaxPayable.toLocaleString("bn-BD")}`,
    donorClientId
  );
  revalidatePath(`/clients/${donorClientId}`);
  revalidatePath("/gifts");
}

export async function deleteGiftRecord(id: number, donorClientId: string) {
  await db.delete(giftRecords).where(eq(giftRecords.id, id));
  await logActivity(`দান রেকর্ড মুছে ফেলা হয়েছে (#${id})`, donorClientId);
  revalidatePath(`/clients/${donorClientId}`);
  revalidatePath("/gifts");
}

export async function addDocument(clientId: string, formData: FormData) {
  await db.insert(documents).values({
    clientId,
    category: str(formData.get("category")),
    title: str(formData.get("title")),
    notes: str(formData.get("notes")) || null,
    status: str(formData.get("status")) || "submitted",
    expiryDate: str(formData.get("expiryDate")) || null,
  });

  await logActivity(`নতুন ডকুমেন্ট যুক্ত করা হয়েছে: ${str(formData.get("title"))}`, clientId);
  revalidatePath(`/clients/${clientId}`);
  await recomputeAllReturnsForClient(clientId);
}

export async function updateDocumentStatus(documentId: string, clientId: string, status: string) {
  await db.update(documents).set({ status }).where(eq(documents.id, documentId));
  revalidatePath(`/clients/${clientId}`);
  await recomputeAllReturnsForClient(clientId);
}

export async function deleteDocument(documentId: string, clientId: string) {
  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath(`/clients/${clientId}`);
  await recomputeAllReturnsForClient(clientId);
}

async function computeReturnPayload(clientId: string, data: {
  returnType: string;
  incomeSalary: number;
  incomeBusiness: number;
  incomeProperty: number;
  incomeCapitalGain: number;
  incomeAgricultural: number;
  incomeOther: number;
  previousYearIncome: number;
  investmentAmount: number;
  loanInterest: number;
  donations: number;
  totalAssets: number;
  totalLiabilities: number;
  tdsAmount: number;
  advanceTaxPaid: number;
  hasBusinessAudit: boolean;
  hasLargeLoanNoBank?: boolean;
  hasExemptIncome?: boolean;
  bookOfAccountsMaintained?: boolean;
  isRiskShielded?: boolean;
}) {
  const client = (await db.select().from(clients).where(eq(clients.id, clientId)).limit(1))[0];
  const docs = await db.select().from(documents).where(eq(documents.clientId, clientId));
  const docCategories = Array.from(new Set(docs.map((d) => d.category)));

  const calculation = calculateIncomeTax({
    category: (client.taxpayerCategory as "general" | "female_senior" | "disabled" | "freedom_fighter") || "general",
    location: (client.location as "dhaka_ctg" | "other_city_corp" | "other") || "other",
    incomeSalary: data.incomeSalary,
    incomeBusiness: data.incomeBusiness,
    incomeProperty: data.incomeProperty,
    incomeCapitalGain: data.incomeCapitalGain,
    incomeAgricultural: data.incomeAgricultural,
    incomeOther: data.incomeOther,
    investmentAmount: data.investmentAmount,
    totalAssets: data.totalAssets,
    totalLiabilities: data.totalLiabilities,
    tdsAmount: data.tdsAmount,
    advanceTaxPaid: data.advanceTaxPaid,
    hasBusinessIncome: data.incomeBusiness > 0,
  });

  const audit = assessAuditRisk({
    client: {
      tin: client.tin,
      nid: client.nid,
      clientType: client.clientType,
      vatRegistered: client.vatRegistered,
    },
    taxReturn: {
      returnType: data.returnType,
      incomeSalary: data.incomeSalary,
      incomeBusiness: data.incomeBusiness,
      incomeProperty: data.incomeProperty,
      incomeCapitalGain: data.incomeCapitalGain,
      incomeAgricultural: data.incomeAgricultural,
      incomeOther: data.incomeOther,
      previousYearIncome: data.previousYearIncome,
      investmentAmount: data.investmentAmount,
      loanInterest: data.loanInterest,
      totalAssets: data.totalAssets,
      totalLiabilities: data.totalLiabilities,
      tdsAmount: data.tdsAmount,
      hasBusinessAudit: data.hasBusinessAudit,
      hasLargeLoanNoBank: data.hasLargeLoanNoBank,
      hasExemptIncome: data.hasExemptIncome,
      bookOfAccountsMaintained: data.bookOfAccountsMaintained,
      isRiskShielded: data.isRiskShielded,
    },
    documentCategories: docCategories,
  });

  return { calculation, audit };
}

function readReturnForm(formData: FormData) {
  return {
    returnType: str(formData.get("returnType")) || "IT-11",
    assessmentYear: str(formData.get("assessmentYear")),
    incomeYear: str(formData.get("incomeYear")),
    incomeSalary: num(formData.get("incomeSalary")),
    incomeBusiness: num(formData.get("incomeBusiness")),
    incomeProperty: num(formData.get("incomeProperty")),
    incomeCapitalGain: num(formData.get("incomeCapitalGain")),
    incomeAgricultural: num(formData.get("incomeAgricultural")),
    incomeOther: num(formData.get("incomeOther")),
    previousYearIncome: num(formData.get("previousYearIncome")),
    investmentAmount: num(formData.get("investmentAmount")),
    loanInterest: num(formData.get("loanInterest")),
    donations: num(formData.get("donations")),
    totalAssets: num(formData.get("totalAssets")),
    totalLiabilities: num(formData.get("totalLiabilities")),
    tdsAmount: num(formData.get("tdsAmount")),
    advanceTaxPaid: num(formData.get("advanceTaxPaid")),
    hasBusinessAudit: formData.get("hasBusinessAudit") === "on",
    hasLargeLoanNoBank: formData.get("hasLargeLoanNoBank") === "on",
    hasExemptIncome: formData.get("hasExemptIncome") === "on",
    bookOfAccountsMaintained: formData.get("bookOfAccountsMaintained") !== "off",
    isRiskShielded: formData.get("isRiskShielded") === "on",
    submissionDate: str(formData.get("submissionDate")) || null,
    notes: str(formData.get("notes")) || null,
  };
}

export async function createTaxReturn(clientId: string, formData: FormData) {
  const data = readReturnForm(formData);
  const { calculation, audit } = await computeReturnPayload(clientId, data);

  const totalIncome =
    data.incomeSalary +
    data.incomeBusiness +
    data.incomeProperty +
    data.incomeCapitalGain +
    data.incomeAgricultural +
    data.incomeOther;

  const [ret] = await db
    .insert(taxReturns)
    .values({
      clientId,
      assessmentYear: data.assessmentYear,
      incomeYear: data.incomeYear || data.assessmentYear,
      returnType: data.returnType,
      totalIncome: String(totalIncome),
      incomeSalary: String(data.incomeSalary),
      incomeBusiness: String(data.incomeBusiness),
      incomeProperty: String(data.incomeProperty),
      incomeCapitalGain: String(data.incomeCapitalGain),
      incomeAgricultural: String(data.incomeAgricultural),
      incomeOther: String(data.incomeOther),
      previousYearIncome: String(data.previousYearIncome),
      investmentAmount: String(data.investmentAmount),
      loanInterest: String(data.loanInterest),
      donations: String(data.donations),
      totalAssets: String(data.totalAssets),
      totalLiabilities: String(data.totalLiabilities),
      tdsAmount: String(data.tdsAmount),
      advanceTaxPaid: String(data.advanceTaxPaid),
      hasBusinessAudit: data.hasBusinessAudit,
      hasLargeLoanNoBank: data.hasLargeLoanNoBank,
      hasExemptIncome: data.hasExemptIncome,
      bookOfAccountsMaintained: data.bookOfAccountsMaintained,
      isRiskShielded: data.isRiskShielded || Boolean(audit.isRiskShielded),
      submissionDate: data.submissionDate,
      notes: data.notes,
      calculation,
      auditRiskScore: String(audit.score),
      auditRiskLevel: audit.level,
      auditIssues: audit.issues,
    })
    .returning();

  await logActivity(`নতুন রিটার্ন প্রস্তুত করা হয়েছে: ${data.returnType} (${data.assessmentYear})`, clientId);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/returns/${ret.id}`);
}

export async function updateTaxReturn(returnId: string, clientId: string, formData: FormData) {
  const data = readReturnForm(formData);
  const { calculation, audit } = await computeReturnPayload(clientId, data);

  const totalIncome =
    data.incomeSalary +
    data.incomeBusiness +
    data.incomeProperty +
    data.incomeCapitalGain +
    data.incomeAgricultural +
    data.incomeOther;

  await db
    .update(taxReturns)
    .set({
      assessmentYear: data.assessmentYear,
      incomeYear: data.incomeYear || data.assessmentYear,
      returnType: data.returnType,
      totalIncome: String(totalIncome),
      incomeSalary: String(data.incomeSalary),
      incomeBusiness: String(data.incomeBusiness),
      incomeProperty: String(data.incomeProperty),
      incomeCapitalGain: String(data.incomeCapitalGain),
      incomeAgricultural: String(data.incomeAgricultural),
      incomeOther: String(data.incomeOther),
      previousYearIncome: String(data.previousYearIncome),
      investmentAmount: String(data.investmentAmount),
      loanInterest: String(data.loanInterest),
      donations: String(data.donations),
      totalAssets: String(data.totalAssets),
      totalLiabilities: String(data.totalLiabilities),
      tdsAmount: String(data.tdsAmount),
      advanceTaxPaid: String(data.advanceTaxPaid),
      hasBusinessAudit: data.hasBusinessAudit,
      hasLargeLoanNoBank: data.hasLargeLoanNoBank,
      hasExemptIncome: data.hasExemptIncome,
      bookOfAccountsMaintained: data.bookOfAccountsMaintained,
      isRiskShielded: data.isRiskShielded || Boolean(audit.isRiskShielded),
      submissionDate: data.submissionDate,
      notes: data.notes,
      calculation,
      auditRiskScore: String(audit.score),
      auditRiskLevel: audit.level,
      auditIssues: audit.issues,
      updatedAt: new Date(),
    })
    .where(eq(taxReturns.id, returnId));

  await logActivity(`রিটার্ন হালনাগাদ ও পুনর্গণনা করা হয়েছে`, clientId);
  revalidatePath(`/returns/${returnId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/returns/${returnId}`);
}

export async function updateReturnStatus(returnId: string, clientId: string, status: string) {
  await db.update(taxReturns).set({ status, updatedAt: new Date() }).where(eq(taxReturns.id, returnId));
  await logActivity(`রিটার্নের অবস্থা পরিবর্তন করা হয়েছে: ${status}`, clientId);
  revalidatePath(`/returns/${returnId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}

export async function bulkApplyQuickFixes(returnId: string, resolvedTitles: string[]) {
  const [ret] = await db.select().from(taxReturns).where(eq(taxReturns.id, returnId)).limit(1);
  if (!ret) throw new Error("Return not found");

  const currentIssues = (ret.auditIssues as unknown as AuditIssue[]) || [];
  const updatedIssues = currentIssues.map((issue) => {
    if (resolvedTitles.includes(issue.title)) {
      const fix = getLowEffortFixDetails(issue);
      return {
        ...issue,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolutionNote: fix.actionBn,
      };
    }
    return issue;
  });

  const { score, level } = recalculateAuditScore(
    updatedIssues,
    Boolean(ret.isRiskShielded),
    Boolean(ret.hasLargeLoanNoBank)
  );

  // If any fix suggests auto-attaching documents, insert verified document records
  for (const title of resolvedTitles) {
    const issue = currentIssues.find((i) => i.title === title);
    if (issue) {
      const fix = getLowEffortFixDetails(issue);
      if (fix.appliedDocument && ret.clientId) {
        const existingDocs = await db.select().from(documents).where(eq(documents.clientId, ret.clientId));
        if (!existingDocs.some((d) => d.category === fix.appliedDocument)) {
          await db.insert(documents).values({
            clientId: ret.clientId,
            title: `${issue.titleBn || issue.title} - কুইক ফিক্স নথিপত্র`,
            category: fix.appliedDocument,
            notes: `${fix.appliedDocument}_quick_fix.pdf`,
            status: "verified",
          });
        }
      }
    }
  }

  await db
    .update(taxReturns)
    .set({
      auditIssues: updatedIssues,
      auditRiskScore: String(score),
      auditRiskLevel: level,
      updatedAt: new Date(),
    })
    .where(eq(taxReturns.id, returnId));

  await logActivity(
    `রিটার্নের ${resolvedTitles.length}টি সহজ সমাধান (Low-Effort Quick Fixes) এক ক্লিকে প্রয়োগ করা হয়েছে। নতুন ঝুঁকি স্কোর: ${score}`,
    ret.clientId
  );

  revalidatePath(`/returns/${returnId}`);
  revalidatePath(`/clients/${ret.clientId}`);
  return { success: true, newScore: score, newLevel: level, resolvedCount: resolvedTitles.length };
}

export async function undoBulkQuickFixes(returnId: string, titlesToUndo: string[]) {
  const [ret] = await db.select().from(taxReturns).where(eq(taxReturns.id, returnId)).limit(1);
  if (!ret) throw new Error("Return not found");

  const currentIssues = (ret.auditIssues as unknown as AuditIssue[]) || [];
  const updatedIssues = currentIssues.map((issue) => {
    if (titlesToUndo.includes(issue.title)) {
      const { resolved, resolvedAt, resolutionNote, ...rest } = issue;
      return {
        ...rest,
        resolved: false,
      };
    }
    return issue;
  });

  const { score, level } = recalculateAuditScore(
    updatedIssues,
    Boolean(ret.isRiskShielded),
    Boolean(ret.hasLargeLoanNoBank)
  );

  await db
    .update(taxReturns)
    .set({
      auditIssues: updatedIssues,
      auditRiskScore: String(score),
      auditRiskLevel: level,
      updatedAt: new Date(),
    })
    .where(eq(taxReturns.id, returnId));

  await logActivity(
    `রিটার্নের কুইক ফিক্স পূর্বাবস্থায় ফিরিয়ে নেওয়া হয়েছে। ঝুঁকি স্কোর: ${score}`,
    ret.clientId
  );

  revalidatePath(`/returns/${returnId}`);
  revalidatePath(`/clients/${ret.clientId}`);
  return { success: true, newScore: score, newLevel: level };
}

async function recomputeAllReturnsForClient(clientId: string) {
  const returns = await db.select().from(taxReturns).where(eq(taxReturns.clientId, clientId));
  for (const ret of returns) {
    const data = {
      returnType: ret.returnType,
      incomeSalary: Number(ret.incomeSalary),
      incomeBusiness: Number(ret.incomeBusiness),
      incomeProperty: Number(ret.incomeProperty),
      incomeCapitalGain: Number(ret.incomeCapitalGain),
      incomeAgricultural: Number(ret.incomeAgricultural),
      incomeOther: Number(ret.incomeOther),
      previousYearIncome: Number(ret.previousYearIncome),
      investmentAmount: Number(ret.investmentAmount),
      loanInterest: Number(ret.loanInterest),
      donations: Number(ret.donations),
      totalAssets: Number(ret.totalAssets),
      totalLiabilities: Number(ret.totalLiabilities),
      tdsAmount: Number(ret.tdsAmount),
      advanceTaxPaid: Number(ret.advanceTaxPaid),
      hasBusinessAudit: Boolean(ret.hasBusinessAudit),
      hasLargeLoanNoBank: Boolean(ret.hasLargeLoanNoBank),
      hasExemptIncome: Boolean(ret.hasExemptIncome),
      bookOfAccountsMaintained: ret.bookOfAccountsMaintained ?? true,
      isRiskShielded: Boolean(ret.isRiskShielded),
    };
    const { calculation, audit } = await computeReturnPayload(clientId, data);
    await db
      .update(taxReturns)
      .set({
        calculation,
        auditRiskScore: String(audit.score),
        auditRiskLevel: audit.level,
        auditIssues: audit.issues,
        isRiskShielded: Boolean(ret.isRiskShielded) || Boolean(audit.isRiskShielded),
      })
      .where(eq(taxReturns.id, ret.id));
  }
}

export async function createDeadline(formData: FormData) {
  const clientId = str(formData.get("clientId"));
  await db.insert(deadlines).values({
    clientId: clientId || null,
    title: str(formData.get("title")),
    category: str(formData.get("category")) || "income_tax",
    dueDate: str(formData.get("dueDate")),
    notes: str(formData.get("notes")) || null,
  });
  await logActivity(`নতুন সময়সীমা যুক্ত করা হয়েছে: ${str(formData.get("title"))}`, clientId || undefined);
  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

export async function updateDeadlineStatus(id: string, status: string) {
  await db.update(deadlines).set({ status }).where(eq(deadlines.id, id));
  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

export async function deleteDeadline(id: string) {
  await db.delete(deadlines).where(eq(deadlines.id, id));
  revalidatePath("/deadlines");
}

export async function seedAnnualDeadlinesForClient(clientId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const rows = ANNUAL_DEADLINE_TEMPLATES.map((t) => {
    const [mm, dd] = t.monthDay.split("-").map(Number);
    let dueYear = year;
    const candidate = new Date(year, mm - 1, dd);
    if (candidate < now) dueYear = year + 1;
    const dueDate = `${dueYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    return {
      clientId,
      title: t.titleBn,
      category: t.category,
      dueDate,
    };
  });
  await db.insert(deadlines).values(rows);
  await logActivity("বার্ষিক সময়সীমা টেমপ্লেট থেকে ডেডলাইন যুক্ত করা হয়েছে", clientId);
  revalidatePath("/deadlines");
  revalidatePath(`/clients/${clientId}`);
}

export async function createBlogPost(formData: FormData) {
  const title = str(formData.get("title"));
  const content = str(formData.get("content"));
  const authorName = str(formData.get("authorName")) || "বেনামী লেখক";
  const authorRole = str(formData.get("authorRole")) || "developer";
  const authorTitle = str(formData.get("authorTitle")) || "";
  const category = str(formData.get("category")) || "tax_tech";
  const tags = str(formData.get("tags")) || "";

  if (!title || !content) {
    throw new Error("শিরোনাম ও মূল বিষয়বস্তু আবশ্যক");
  }

  // Generate URL slug from title
  const slug =
    title
      .toLowerCase()
      .replace(/[^\w\u0980-\u09FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100) +
    "-" +
    Date.now().toString(36);

  // Estimate read time (approx 150 words per minute)
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 150));

  // Generate short excerpt
  const excerpt =
    content
      .replace(/[#*`_>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180) + (content.length > 180 ? "..." : "");

  await db.insert(blogPosts).values({
    title,
    slug,
    content,
    excerpt,
    authorName,
    authorRole,
    authorTitle:
      authorTitle ||
      (authorRole === "developer"
        ? "সফটওয়্যার ডেভেলপার"
        : authorRole === "lawyer"
        ? "ট্যাক্স আইনজীবী"
        : "করদাতা ও ক্লায়েন্ট"),
    category,
    tags,
    likesCount: 0,
    readMinutes,
    isFeatured: false,
  });

  revalidatePath("/");
  return { success: true, slug };
}

export async function likeBlogPost(postId: string) {
  try {
    await db
      .update(blogPosts)
      .set({
        likesCount: sql`COALESCE(${blogPosts.likesCount}, 0) + 1`,
      })
      .where(eq(blogPosts.id, postId));
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to like post:", err);
    return { success: false };
  }
}

export async function subscribeNewsletter(formData: FormData) {
  const email = str(formData.get("email"));
  const name = str(formData.get("name")) || null;
  const phone = str(formData.get("phone")) || null;

  if (!email || !email.includes("@")) {
    throw new Error("সঠিক ইমেইল ঠিকানা প্রদান করুন");
  }

  try {
    await db.insert(newsletterSubscribers).values({
      email,
      name,
      phone,
    });
  } catch (err) {
    // ignore duplicate
    console.log("Subscriber might already exist", err);
  }

  revalidatePath("/");
  return { success: true };
}

