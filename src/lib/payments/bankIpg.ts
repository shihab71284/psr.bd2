// ---------------------------------------------------------------------------
// ব্যাংক কার্ড / ইন্টারনেট ব্যাংকিং — অ্যাকোয়ারিং ব্যাংকের IPG
// ---------------------------------------------------------------------------
// কার্ড (Visa/Mastercard) ও ইন্টারনেট ব্যাংকিং পেমেন্ট ব্যাংকের নিজস্ব
// ইন্টারনেট পেমেন্ট গেটওয়ে (IPG)-র হোস্টেড পেজে হবে — কার্ডের তথ্য
// কখনো আমাদের সার্ভার ছোঁবে না। ব্যাংক-ভেদে এন্ডপয়েন্ট/ক্রেডেনশিয়াল
// আলাদা হয়; ব্যাংক মার্চেন্ট অ্যাকাউন্ট + IPG ক্রেডেনশিয়াল পেলে
// ব্যাংকের স্পেস অনুযায়ী নিচের TODO জায়গায় কোড বসবে। এখন
// not_configured — ভুয়া পেমেন্ট কখনোই তৈরি করা হয় না।
// ---------------------------------------------------------------------------

import { CheckoutInput, CheckoutResult, VerifyResult } from "./types";

const BANK_IPG_BASE_URL = process.env.BANK_IPG_BASE_URL || "";
const BANK_IPG_MERCHANT_ID = process.env.BANK_IPG_MERCHANT_ID || "";
const BANK_IPG_API_KEY = process.env.BANK_IPG_API_KEY || "";

export function bankIpgMissingEnv(): string[] {
  const missing: string[] = [];
  if (!BANK_IPG_BASE_URL) missing.push("BANK_IPG_BASE_URL");
  if (!BANK_IPG_MERCHANT_ID) missing.push("BANK_IPG_MERCHANT_ID");
  if (!BANK_IPG_API_KEY) missing.push("BANK_IPG_API_KEY");
  return missing;
}

export function bankIpgConfigured(): boolean {
  return bankIpgMissingEnv().length === 0;
}

export async function bankIpgCreateCheckout(_input: CheckoutInput): Promise<CheckoutResult> {
  return {
    ok: false,
    reason: "not_configured",
    messageBn:
      "ব্যাংক কার্ড / ইন্টারনেট ব্যাংকিং এখনো চালু হয়নি — অ্যাকোয়ারিং ব্যাংকের IPG ক্রেডেনশিয়াল (BANK_IPG_BASE_URL / MERCHANT_ID / API_KEY) সেট করতে হবে।",
  };
}

export async function bankIpgVerify(): Promise<VerifyResult> {
  return {
    verified: false,
    reason: "not_configured",
    messageBn: "ব্যাংক IPG যাচাইয়ের ব্যবস্থা এখনো কনফিগার করা হয়নি।",
  };
}
