// ---------------------------------------------------------------------------
// Nagad — Payment Gateway (PGW) Checkout (সরাসরি মার্চেন্ট ইন্টিগ্রেশন)
// ---------------------------------------------------------------------------
// ফ্লো: Initialize → Complete → callBackUrl-এ রিডাইরেক্ট → Callback → Verify।
// সব sensitiveData RSA এনক্রিপশনে যায় (Nagad পাবলিক কী দিয়ে এনক্রিপ্ট,
// মার্চেন্ট প্রাইভেট কী দিয়ে ডিক্রিপ্ট); signature = মার্চেন্ট প্রাইভেট কী
// দিয়ে sensitiveData এনক্রিপ্ট করা।
// সূত্র: developer.nagad.com.bd ও পাবলিক PGW গাইড। বেস URL:
//   Sandbox: https://sandboxapi.nagad.com.bd/remote-payment-gateway-1.0/api/dfs
//   Live:    https://api.nagad.com.bd/remote-payment-gateway-1.0/api/dfs
// ⚠️ Verify এন্ডপয়েন্টের পথ পাবলিক গাইডগুলোতে একমত নয় — নিচে
// GET /check-out/verify/payment/{paymentReferenceId} ব্যবহার করা হয়েছে
// (nagadpy-র অফিসিয়াল-অনুসারী বাস্তবায়ন অনুযায়ী)। মার্চেন্ট পোর্টালের
// ডকুমেন্টেশনে যাচাই করে নিতে হবে; ক্রেডেনশিয়াল ছাড়া এই কোড চলেই না।
// আরও শর্ত: Nagad প্রোডাকশনে সার্ভার IP হোয়াইটলিস্টিং চায় — Vercel-এর
// IP পরিবর্তনশীল, তাই মার্চেন্ট অনবোর্ডিংয়ের সময় Nagad-কে জানাতে হবে।
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { CheckoutInput, CheckoutResult, VerifyResult } from "./types";

const BASE_URL = process.env.NAGAD_BASE_URL || "https://api.nagad.com.bd/remote-payment-gateway-1.0/api/dfs";
const MERCHANT_ID = process.env.NAGAD_MERCHANT_ID || "";
const MERCHANT_PRIVATE_KEY = (process.env.NAGAD_MERCHANT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const NAGAD_PUBLIC_KEY = (process.env.NAGAD_PUBLIC_KEY || "").replace(/\\n/g, "\n");
// Nagad প্রোডাকশনে সার্ভারের IP হোয়াইটলিস্ট করা থাকে — X-KM-IP-V4 হেডারে সেই
// IP পাঠাতে হয়। Vercel-এর egress IP স্থির নয়, তাই মার্চেন্ট অনবোর্ডিংয়ের
// সময় Nagad-কে জানাতে হবে; এখানে env থেকে নেওয়া যায়।
const SERVER_IP = process.env.NAGAD_SERVER_IP || "127.0.0.1";

export function nagadMissingEnv(): string[] {
  const missing: string[] = [];
  if (!MERCHANT_ID) missing.push("NAGAD_MERCHANT_ID");
  if (!MERCHANT_PRIVATE_KEY) missing.push("NAGAD_MERCHANT_PRIVATE_KEY");
  if (!NAGAD_PUBLIC_KEY) missing.push("NAGAD_PUBLIC_KEY");
  return missing;
}

export function nagadConfigured(): boolean {
  return nagadMissingEnv().length === 0;
}

function dhakaDateTime(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

function publicEncrypt(obj: Record<string, unknown>): string {
  return crypto
    .publicEncrypt({ key: NAGAD_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(JSON.stringify(obj)))
    .toString("base64");
}

function privateEncrypt(text: string): string {
  return crypto
    .privateEncrypt({ key: MERCHANT_PRIVATE_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text))
    .toString("base64");
}

function privateDecrypt(base64: string): Record<string, unknown> {
  const plain = crypto
    .privateDecrypt({ key: MERCHANT_PRIVATE_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(base64, "base64"))
    .toString("utf8");
  return JSON.parse(plain) as Record<string, unknown>;
}

function newChallenge(): string {
  return crypto.randomBytes(20).toString("hex");
}

async function nagadPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-KM-Api-Version": "v-0.2.0", "X-KM-IP-V4": SERVER_IP, "X-KM-Client-Type": "PC_WEB" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Nagad ${path} failed (${res.status}): ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data;
}

export async function nagadCreateCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!nagadConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      messageBn: "নগদ মার্চেন্ট অ্যাকাউন্ট এখনো যুক্ত হয়নি — NAGAD_MERCHANT_ID ও RSA কী-জোড়া সেট করতে হবে।",
    };
  }
  try {
    const orderId = input.orderRef;
    const dateTime = dhakaDateTime();
    const challenge = newChallenge();

    // ১) Initialize — paymentReferenceId পাওয়া যায়
    const initSensitive = publicEncrypt({ merchantId: MERCHANT_ID, datetime: dateTime, challenge });
    const initRes = await nagadPost(`/check-out/initialize/${MERCHANT_ID}/${orderId}`, {
      accountNumber: MERCHANT_ID,
      dateTime,
      sensitiveData: initSensitive,
      signature: privateEncrypt(initSensitive),
    });
    const initData = privateDecrypt(String(initRes.sensitiveData));
    const paymentReferenceId = String(initData.paymentReferenceId ?? "");
    if (!paymentReferenceId) {
      return { ok: false, reason: "provider_error", messageBn: "নগদ থেকে paymentReferenceId পাওয়া যায়নি। আবার চেষ্টা করুন।" };
    }

    // ২) Complete — callBackUrl (নগদ চেকআউট পেজ) পাওয়া যায়
    const completeSensitive = publicEncrypt({
      merchantId: MERCHANT_ID,
      orderId,
      currencyCode: "050",
      amount: String(input.amountBdt),
      challenge,
    });
    const completeRes = await nagadPost(`/check-out/complete/${paymentReferenceId}`, {
      sensitiveData: completeSensitive,
      signature: privateEncrypt(completeSensitive),
      merchantId: MERCHANT_ID,
      orderId,
      challenge,
    });
    const completeData = privateDecrypt(String(completeRes.sensitiveData));
    const callBackUrl = String(completeData.callBackUrl ?? "");
    if (!callBackUrl) {
      return { ok: false, reason: "provider_error", messageBn: "নগদ থেকে চেকআউট লিংক পাওয়া যায়নি। আবার চেষ্টা করুন।" };
    }
    return { ok: true, redirectUrl: callBackUrl, providerPaymentId: paymentReferenceId };
  } catch (err) {
    console.error("[Nagad] create failed:", err);
    return { ok: false, reason: "provider_error", messageBn: "নগদের সঙ্গে সংযোগে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" };
  }
}

/**
 * কলব্যাক যাচাই — paymentReferenceId ধরে সার্ভার-থেকে-সার্ভারে স্ট্যাটাস
 * নিশ্চিত করা হয়। status === "Success" এবং পরিমাণ মিললেই verified=true।
 */
export async function nagadVerify(paymentReferenceId: string, expectedAmountBdt: number): Promise<VerifyResult> {
  if (!nagadConfigured()) {
    return { verified: false, reason: "not_configured", messageBn: "নগদ মার্চেন্ট অ্যাকাউন্ট এখনো যুক্ত হয়নি।" };
  }
  try {
    const res = await fetch(`${BASE_URL}/check-out/verify/payment/${paymentReferenceId}`, {
      method: "GET",
      headers: { "X-KM-Api-Version": "v-0.2.0" },
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const status = String(data.status ?? "");
    const amount = Number(data.amount ?? 0);
    // Nagad-এর কিছু রেসপন্সে transaction id 'paymentRefId' / 'issuerPaymentRefNo'-তে থাকে
    const trxId = String(data.paymentRefId ?? data.issuerPaymentRefNo ?? paymentReferenceId);
    if (status !== "Success") {
      return { verified: false, reason: "failed", messageBn: `নগদ পেমেন্ট সম্পূর্ণ হয়নি (স্ট্যাটাস: ${status || "অজানা"})।` };
    }
    if (amount !== 0 && amount !== expectedAmountBdt) {
      return { verified: false, reason: "amount_mismatch", messageBn: "পরিমাণ মেলেনি — পেমেন্ট যাচাই করা যায়নি।" };
    }
    return { verified: true, providerTrxId: trxId, amountBdt: amount || expectedAmountBdt };
  } catch (err) {
    console.error("[Nagad] verify failed:", err);
    return { verified: false, reason: "provider_error", messageBn: "নগদ যাচাইয়ে সমস্যা হয়েছে।" };
  }
}
