"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { ensureLawyerForSession } from "@/lib/subscription";
import { createCheckout, getProviderStatuses, PaymentMethod } from "@/lib/payments";
import { BillingCycle, PlanId, getPrice } from "@/lib/plans";
import { eq } from "drizzle-orm";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://psr.bd";

/**
 * চেকআউট শুরু — প্ল্যান বাছাই → লগইন → মাধ্যম বাছাই → প্রোভাইডার পেজ।
 * প্রোভাইডার কনফিগার করা না থাকলে পেমেন্ট শুরু হয় না — "শীঘ্রই আসছে"
 * অবস্থায় ফেরত পাঠানো হয়। কোনো ভুয়া সফল পেমেন্ট তৈরি করা হয় না।
 */
export async function initiateCheckout(formData: FormData) {
  const plan = (String(formData.get("plan") || "pro") === "free" ? "free" : "pro") as PlanId;
  const cycle = (String(formData.get("cycle") || "monthly") === "yearly" ? "yearly" : "monthly") as BillingCycle;
  const method = String(formData.get("method") || "") as PaymentMethod;
  const phone = String(formData.get("phone") || "").trim();

  const session = await getSession();
  if (!session) redirect("/login");

  const price = getPrice(plan, cycle);
  if (price.amountBdt <= 0) redirect("/dashboard");

  const status = getProviderStatuses().find((s) => s.method === method);
  if (!status || !status.configured) {
    redirect(`/subscription/checkout?plan=${plan}&cycle=${cycle}&error=not_configured&method=${method}`);
  }

  const lawyer = await ensureLawyerForSession(phone || undefined);
  const orderId = randomUUID();

  // ১) পেমেন্টের প্রাথমিক রেকর্ড (initiated) — কলব্যাক এটাই খুঁজে পাবে
  await db.insert(payments).values({
    id: orderId,
    subscriptionId: null,
    userId: session.userId,
    lawyerId: typeof lawyer.id === "number" ? lawyer.id : null,
    amountBdt: price.amountBdt,
    method,
    provider: method,
    providerPaymentId: null,
    providerTrxId: null,
    status: "initiated",
  });

  // ২) প্রোভাইডারের কাছে চেকআউট তৈরি
  const callbackUrl = `${APP_BASE_URL}/api/subscription/callback?method=${method}&order=${orderId}`;
  const result = await createCheckout({
    method,
    amountBdt: price.amountBdt,
    orderRef: orderId,
    plan,
    billingCycle: cycle,
    callbackUrl,
  });

  if (!result.ok) {
    await db.update(payments).set({ status: "failed" }).where(eq(payments.id, orderId));
    redirect(
      `/subscription/checkout?plan=${plan}&cycle=${cycle}&error=${result.reason}&method=${method}`
    );
  }

  // ৩) প্রোভাইডারের পেমেন্ট আইডি সংরক্ষণ — কলব্যাক যাচাইয়ে এটাই মেলানো হবে
  if (result.providerPaymentId) {
    await db
      .update(payments)
      .set({ providerPaymentId: result.providerPaymentId })
      .where(eq(payments.id, orderId));
  }

  // ৪) ব্যবহারকারীকে প্রোভাইডারের পেমেন্ট পেজে পাঠানো হয়
  redirect(result.redirectUrl);
}
