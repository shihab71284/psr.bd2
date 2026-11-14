// ---------------------------------------------------------------------------
// সাবস্ক্রিপশন লজিক — psr.bd (BTCP)
// ---------------------------------------------------------------------------
// সার্ভার-সাইড একমাত্র সত্যের উৎস: কোনো চেম্বার কোন প্ল্যানে আছে, তা এখান
// থেকেই নির্ধারিত হয়। ক্লায়েন্ট-সাইডে দেখানো ব্যাজ/বোতাম শুধু UI —
// সীমা প্রয়োগ (enforcement) সবসময় server action-এ এখানকার ফাংশন দিয়েই হয়।
// ---------------------------------------------------------------------------

import { randomUUID } from "node:crypto";
import { addMonths, addYears } from "date-fns";
import { db } from "@/db";
import { lawyers, payments, subscriptions, clients, taxReturns } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { BillingCycle, PlanId, FREE_MAX_CLIENTS, FREE_MAX_RETURNS, getPrice } from "@/lib/plans";

export type ChamberPlanInfo = {
  plan: PlanId;
  isPro: boolean;
  /** পুরোনো 'active' স্ট্যাটাসের আইনজীবী — কোনো মেয়াদ ছাড়াই Pro ধরা হয়েছে */
  isGrandfathered: boolean;
  lawyer: typeof lawyers.$inferSelect | null;
  status: string;
  currentPeriodEnd: Date | null;
  clientCount: number;
  returnCount: number;
};

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitError";
  }
}

/** সেশন থেকে চেম্বারের (আইনজীবী) সারি খুঁজে বের করা — ইমেইল দিয়ে মেলানো হয়। */
export async function findLawyerForSession(): Promise<typeof lawyers.$inferSelect | null> {
  const session = await getSession();
  if (!session?.email) return null;
  const [lawyer] = await db
    .select()
    .from(lawyers)
    .where(eq(lawyers.email, session.email.toLowerCase()))
    .limit(1);
  return lawyer ?? null;
}

/** চেম্বারের বর্তমান প্ল্যান নির্ধারণ (সার্ভার-সাইড)। */
export async function getChamberPlan(): Promise<ChamberPlanInfo> {
  const [lawyer, usage] = await Promise.all([findLawyerForSession(), getUsage()]);
  const now = new Date();
  const status = (lawyer?.subscriptionStatus ?? "inactive").toLowerCase();
  const periodEnd = lawyer?.currentPeriodEnd ? new Date(lawyer.currentPeriodEnd) : null;

  let isPro = false;
  let isGrandfathered = false;
  const plan = (lawyer?.plan as PlanId | undefined) ?? "free";

  if (status === "active") {
    if (plan === "pro") {
      // Pro মেয়াদ শেষ না হলে Pro, শেষ হলে Free
      isPro = !periodEnd || periodEnd.getTime() > now.getTime();
    } else if (!periodEnd) {
      // পুরোনো 'active' স্ট্যাটাস, কোনো মেয়াদ/প্ল্যান লেখা নেই — grandfathered Pro
      isPro = true;
      isGrandfathered = true;
    }
  }

  return {
    plan: isPro ? "pro" : "free",
    isPro,
    isGrandfathered,
    lawyer: lawyer ?? null,
    status,
    currentPeriodEnd: periodEnd,
    clientCount: usage.clientCount,
    returnCount: usage.returnCount,
  };
}

export async function getUsage(): Promise<{ clientCount: number; returnCount: number }> {
  const [[cc], [rc]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(clients),
    db.select({ count: sql<number>`count(*)::int` }).from(taxReturns),
  ]);
  return { clientCount: cc?.count ?? 0, returnCount: rc?.count ?? 0 };
}

export function assertCanCreateClient(plan: ChamberPlanInfo): void {
  if (plan.isPro) return;
  if (plan.clientCount >= FREE_MAX_CLIENTS) {
    throw new PlanLimitError(
      `ফ্রি প্ল্যানে সর্বোচ্চ ${FREE_MAX_CLIENTS} জন ক্লায়েন্ট রাখা যায় (এখন ${plan.clientCount} জন আছে)। আনলিমিটেড ক্লায়েন্টের জন্য Pro-তে আপগ্রেড করুন।`
    );
  }
}

export function assertCanCreateReturn(plan: ChamberPlanInfo): void {
  if (plan.isPro) return;
  if (plan.returnCount >= FREE_MAX_RETURNS) {
    throw new PlanLimitError(
      `ফ্রি প্ল্যানে সর্বোচ্চ ${FREE_MAX_RETURNS}টি রিটার্ন তৈরি করা যায় (এখন ${plan.returnCount}টি আছে)। আনলিমিটেড রিটার্নের জন্য Pro-তে আপগ্রেড করুন।`
    );
  }
}

export function assertIsPro(plan: ChamberPlanInfo, featureBn: string): void {
  if (!plan.isPro) {
    throw new PlanLimitError(`${featureBn} শুধু Pro প্ল্যানে available। আপগ্রেড করতে /pricing দেখুন।`);
  }
}

/**
 * লগইন করা ব্যবহারকারীর জন্য আইনজীবী (চেম্বার) সারি নিশ্চিত করা।
 * রেজিস্ট্রেশনে শুধু users সারি তৈরি হয় — চেকআউটের সময় আইনজীবী সারি
 * না থাকলে এখান থেকে তৈরি হয় (বার আইডি/ফোন পরে প্রোফাইলে বসানো যাবে)।
 */
export async function ensureLawyerForSession(phoneNumber?: string): Promise<typeof lawyers.$inferSelect> {
  const session = await getSession();
  const existing = await findLawyerForSession();
  if (existing) return existing;
  if (!session) throw new Error("লগইন করা নেই");

  const [lawyer] = await db
    .insert(lawyers)
    .values({
      name: session.name || "চেম্বার",
      email: session.email.toLowerCase(),
      phoneNumber: phoneNumber || "",
      subscriptionStatus: "inactive",
      plan: "free",
    })
    .returning();
  return lawyer;
}

// ---------------------------------------------------------------------------
// Activation — শুধুমাত্র সার্ভার-যাচাইকৃত পেমেন্ট কলব্যাক থেকে ডাকা হবে।
// কলব্যাকের প্যারামিটার কখনোই সরাসরি বিশ্বাস করা হয় না: activate করার আগে
// গেটওয়ের Execute + Query/Verify API সফল হতে হবে (দেখুন lib/payments)।
// ---------------------------------------------------------------------------

export type ActivationInput = {
  userId: string;
  lawyerId: number;
  plan: PlanId;
  billingCycle: BillingCycle;
  amountBdt: number;
  paymentMethod: string;
  providerTrxId: string;
};

export async function activateSubscription(input: ActivationInput) {
  const price = getPrice(input.plan, input.billingCycle);
  const now = new Date();
  const periodEnd = input.billingCycle === "yearly" ? addYears(now, 1) : addMonths(now, price.months);

  const subscriptionId = randomUUID();
  const paymentId = randomUUID();

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      id: subscriptionId,
      lawyerId: input.lawyerId,
      userId: input.userId,
      plan: input.plan,
      billingCycle: input.billingCycle,
      status: "active",
      amountBdt: input.amountBdt,
      currency: "BDT",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentMethod: input.paymentMethod,
      providerTrxId: input.providerTrxId,
    })
    .returning();

  const [payment] = await db
    .insert(payments)
    .values({
      id: paymentId,
      subscriptionId,
      userId: input.userId,
      lawyerId: input.lawyerId,
      amountBdt: input.amountBdt,
      method: input.paymentMethod,
      provider: input.paymentMethod,
      providerTrxId: input.providerTrxId,
      status: "verified",
    })
    .returning();

  await db
    .update(lawyers)
    .set({
      plan: input.plan,
      subscriptionStatus: "active",
      billingCycle: input.billingCycle,
      currentPeriodEnd: periodEnd,
      paymentRef: input.providerTrxId,
    })
    .where(eq(lawyers.id, input.lawyerId));

  return { subscription, payment };
}

/** কনফার্মেশন পেজের জন্য যাচাইকৃত পেমেন্ট খোঁজা (সার্ভার-সাইড)। */
export async function getVerifiedPayment(paymentId: string) {
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment || payment.status !== "verified") return null;
  const [subscription] = payment.subscriptionId
    ? await db.select().from(subscriptions).where(eq(subscriptions.id, payment.subscriptionId)).limit(1)
    : [null];
  return { payment, subscription: subscription ?? null };
}

/** ব্যবহারকারীর সর্বশেষ সক্রিয় সাবস্ক্রিপশন (ম্যানেজ পেজের জন্য)। */
export async function getLatestSubscriptionForUser(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return sub ?? null;
}

/** পেমেন্ট ইতিহাস (ম্যানেজ পেজের জন্য)। */
export async function listPaymentsForUser(userId: string, limit = 10) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}
