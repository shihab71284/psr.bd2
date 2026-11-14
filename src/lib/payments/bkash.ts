// ---------------------------------------------------------------------------
// bKash — Tokenized Checkout v1.2.0-beta (সরাসরি মার্চেন্ট ইন্টিগ্রেশন)
// ---------------------------------------------------------------------------
// ফ্লো: Grant Token → Create Payment → bKashURL-এ রিডাইরেক্ট → Execute +
// Query Payment। টোকেন ১ ঘণ্টা চলে; টোকেন API ঘণ্টায় ২ বারের বেশি কল করা
// যাবে না — তাই মডিউল-স্তরে ক্যাশ করা হয়েছে।
// সূত্র: developer.bka.sh (অফিসিয়াল)। লাইভ বেস URL: tokenized.pay.bka.sh
// ---------------------------------------------------------------------------

import { CheckoutInput, CheckoutResult, VerifyResult } from "./types";

const BASE_URL = process.env.BKASH_BASE_URL || "https://tokenized.pay.bka.sh/v1.2.0-beta";
const APP_KEY = process.env.BKASH_APP_KEY || "";
const APP_SECRET = process.env.BKASH_APP_SECRET || "";
const USERNAME = process.env.BKASH_USERNAME || "";
const PASSWORD = process.env.BKASH_PASSWORD || "";

export function bkashMissingEnv(): string[] {
  const missing: string[] = [];
  if (!APP_KEY) missing.push("BKASH_APP_KEY");
  if (!APP_SECRET) missing.push("BKASH_APP_SECRET");
  if (!USERNAME) missing.push("BKASH_USERNAME");
  if (!PASSWORD) missing.push("BKASH_PASSWORD");
  return missing;
}

export function bkashConfigured(): boolean {
  return bkashMissingEnv().length === 0;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function grantToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const res = await fetch(`${BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: USERNAME, password: PASSWORD },
    body: JSON.stringify({ app_key: APP_KEY, app_secret: APP_SECRET }),
  });
  const data = (await res.json().catch(() => ({}))) as { id_token?: string; expires_in?: number; statusMessage?: string };
  if (!res.ok || !data.id_token) {
    throw new Error(`bKash token grant failed: ${data.statusMessage || res.status}`);
  }
  // id_token ১ ঘণ্টা চলে; ৫৫ মিনিট পর মেয়াদ শেষ ধরা হলো (নিরাপত্তা মার্জিন)
  cachedToken = { token: data.id_token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return data.id_token;
}

async function bkashPost(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "X-APP-Key": APP_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`bKash ${path} failed (${res.status}): ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data;
}

export async function bkashCreateCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!bkashConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      messageBn: "বিকাশ মার্চেন্ট অ্যাকাউন্ট এখনো যুক্ত হয়নি — BKASH_APP_KEY / APP_SECRET / USERNAME / PASSWORD সেট করতে হবে।",
    };
  }
  try {
    const token = await grantToken();
    const data = await bkashPost("/tokenized/checkout/create", token, {
      mode: "0011",
      payerReference: input.orderRef,
      callbackURL: input.callbackUrl,
      amount: String(input.amountBdt),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: input.orderRef,
    });
    const paymentID = data.paymentID as string | undefined;
    const bkashURL = data.bkashURL as string | undefined;
    if (!paymentID || !bkashURL) {
      return { ok: false, reason: "provider_error", messageBn: "বিকাশ থেকে পেমেন্ট লিংক পাওয়া যায়নি। আবার চেষ্টা করুন।" };
    }
    return { ok: true, redirectUrl: bkashURL, providerPaymentId: paymentID };
  } catch (err) {
    console.error("[bKash] create failed:", err);
    return { ok: false, reason: "provider_error", messageBn: "বিকাশের সঙ্গে সংযোগে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" };
  }
}

/**
 * কলব্যাক যাচাই — callback-এর paymentID ধরে Execute + Query করা হয়।
 * শুধু transactionStatus === "Completed" এবং পরিমাণ মিললে verified=true।
 */
export async function bkashVerify(paymentId: string, expectedAmountBdt: number): Promise<VerifyResult> {
  if (!bkashConfigured()) {
    return { verified: false, reason: "not_configured", messageBn: "বিকাশ মার্চেন্ট অ্যাকাউন্ট এখনো যুক্ত হয়নি।" };
  }
  try {
    const token = await grantToken();
    await bkashPost("/tokenized/checkout/execute", token, { paymentID: paymentId });
    const status = await bkashPost("/tokenized/checkout/payment/status", token, { paymentID: paymentId });
    const txnStatus = status.transactionStatus as string | undefined;
    const trxId = status.trxID as string | undefined;
    const amount = Number(status.amount ?? 0);
    if (txnStatus !== "Completed" || !trxId) {
      return { verified: false, reason: "failed", messageBn: `বিকাশ পেমেন্ট সম্পূর্ণ হয়নি (স্ট্যাটাস: ${txnStatus ?? "অজানা"})।` };
    }
    if (amount !== expectedAmountBdt) {
      return { verified: false, reason: "amount_mismatch", messageBn: "পরিমাণ মেলেনি — পেমেন্ট যাচাই করা যায়নি।" };
    }
    return { verified: true, providerTrxId: trxId, amountBdt: amount };
  } catch (err) {
    console.error("[bKash] verify failed:", err);
    return { verified: false, reason: "provider_error", messageBn: "বিকাশ যাচাইয়ে সমস্যা হয়েছে।" };
  }
}
