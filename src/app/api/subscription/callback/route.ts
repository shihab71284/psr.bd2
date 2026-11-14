import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPayment, PaymentMethod } from "@/lib/payments";
import { activateSubscription, ensureLawyerForSession } from "@/lib/subscription";
import { getPrice } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * পেমেন্ট কলব্যাক — প্রোভাইডার থেকে ফেরত আসার ঠিকানা।
 * গুরুত্বপূর্ণ: কলব্যাকের প্যারামিটার (যেমন status=Success) বিশ্বাস করা
 * হয় না। সার্ভার গেটওয়ের Execute + Query/Verify API কল করে টাকা সত্যিই
 * এসেছে কিনা নিশ্চিত করে, তারপরই সাবস্ক্রিপশন চালু হয়।
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const method = (url.searchParams.get("method") || "") as PaymentMethod;
  const orderId = url.searchParams.get("order") || "";

  const fail = (error: string) =>
    NextResponse.redirect(new URL(`/subscription/checkout?error=${error}`, req.url));

  if (!orderId || !["bkash", "nagad", "bangla_qr", "bank_card", "bank_internet_banking"].includes(method)) {
    return fail("invalid");
  }

  // ১) আমাদের পেমেন্ট রেকর্ড খোঁজা (initiated অবস্থায় তৈরি হয়েছিল)
  const [payment] = await db.select().from(payments).where(eq(payments.id, orderId)).limit(1);
  if (!payment) return fail("invalid");

  // ইতিমধ্যে যাচাইকৃত হলে আবার অ্যাক্টিভেট না করে কনফার্মেশনে পাঠানো হয়
  if (payment.status === "verified") {
    return NextResponse.redirect(new URL(`/subscription/confirmation?ref=${payment.id}`, req.url));
  }

  // ২) প্রোভাইডারের পেমেন্ট আইডি মেলানো — কলব্যাকের মান ও সংরক্ষিত মান
  //    দুটোই লাগবে; অমিল হলে যাচাই হবে না।
  const callbackPaymentId =
    method === "bkash"
      ? url.searchParams.get("paymentID") || ""
      : method === "nagad"
        ? url.searchParams.get("payment_ref_id") || ""
        : "";
  const storedPaymentId = payment.providerPaymentId;
  if (storedPaymentId && callbackPaymentId && storedPaymentId !== callbackPaymentId) {
    await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
    return fail("invalid");
  }
  const providerPaymentId = storedPaymentId || callbackPaymentId;
  if (!providerPaymentId) return fail("invalid");

  // ৩) সার্ভার-থেকে-সার্ভারে যাচাই (Execute + Query / Complete + Verify)
  const result = await verifyPayment(method, providerPaymentId, payment.amountBdt);
  if (!result.verified) {
    await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
    return fail(result.reason === "amount_mismatch" ? "invalid" : "failed");
  }

  // ৪) একই trxID দিয়ে আগেই চালু হয়েছে কিনা (ডাবল-অ্যাক্টিভেশন রোধ)
  const existing = await db
    .select()
    .from(payments)
    .where(eq(payments.providerTrxId, result.providerTrxId))
    .limit(1);
  const alreadyVerified = existing.find((p) => p.status === "verified" && p.id !== payment.id);
  if (alreadyVerified) {
    return NextResponse.redirect(new URL(`/subscription/confirmation?ref=${alreadyVerified.id}`, req.url));
  }

  // ৫) সাবস্ক্রিপশন চালু (মেয়াদ: মাসিক +১ মাস, বার্ষিক +১ বছর)
  const lawyer = await ensureLawyerForSession();
  const lawyerId = typeof lawyer.id === "number" ? lawyer.id : payment.lawyerId;
  if (lawyerId == null || !payment.userId) return fail("invalid");

  // প্ল্যান/সাইকেল: পেমেন্টের পরিমাণ থেকে নির্ধারণ (৳১৫,০০০ = বার্ষিক, ৳১,৫০০ = মাসিক)
  const yearlyPrice = getPrice("pro", "yearly").amountBdt;
  const billingCycle = payment.amountBdt === yearlyPrice ? "yearly" : "monthly";

  const { subscription } = await activateSubscription({
    userId: payment.userId,
    lawyerId,
    plan: "pro",
    billingCycle,
    amountBdt: result.amountBdt,
    paymentMethod: method,
    providerTrxId: result.providerTrxId,
  });

  await db
    .update(payments)
    .set({
      status: "verified",
      providerTrxId: result.providerTrxId,
      subscriptionId: subscription.id,
    })
    .where(eq(payments.id, payment.id));

  return NextResponse.redirect(new URL(`/subscription/confirmation?ref=${payment.id}`, req.url));
}
