// ---------------------------------------------------------------------------
// Bangla QR — বাংলাদেশ ব্যাংকের জাতীয় ইন্টারঅপারেবল QR মান (EMVCo ভিত্তিক)
// ---------------------------------------------------------------------------
// গুরুত্বপূর্ণ: Bangladesh Bank-এর সঙ্গে সরাসরি ইন্টিগ্রেট করার কোনো একক
// API নেই। QR পাওয়া যায় অ্যাকোয়ারিং ব্যাংক/MFS-এর কাছ থেকে — যে ব্যাংকে
// মার্চেন্ট (সেটলমেন্ট) অ্যাকাউন্ট আছে, তারাই ডায়নামিক QR (পরিমাণ-সহ)
// তৈরির ব্যবস্থা করে। পেমেন্ট যাচাই হয় অ্যাকোয়ারারের সেটলমেন্ট
// নোটিফিকেশন/সিস্টেমের সঙ্গে মিলিয়ে।
//
// তাই এই অ্যাডাপ্টার ইচ্ছাকৃতভাবে কোনো QR বানায় না: অ্যাকোয়ারারের
// এন্ডপয়েন্ট কনফিগার না থাকলে সবসময় not_configured ফেরত দেয়। ব্যাংক
// থেকে API বিবরণ পেলে নিচের TODO জায়গায় তাদের স্পেস অনুযায়ী কোড বসবে —
// ভুয়া QR দেখিয়ে কখনো পেমেন্ট নেওয়া হবে না।
// ---------------------------------------------------------------------------

import { CheckoutInput, CheckoutResult, VerifyResult } from "./types";

const API_URL = process.env.BANGLA_QR_API_URL || "";
const MERCHANT_ID = process.env.BANGLA_QR_MERCHANT_ID || "";
const API_KEY = process.env.BANGLA_QR_API_KEY || "";

export function banglaQrMissingEnv(): string[] {
  const missing: string[] = [];
  if (!API_URL) missing.push("BANGLA_QR_API_URL");
  if (!MERCHANT_ID) missing.push("BANGLA_QR_MERCHANT_ID");
  if (!API_KEY) missing.push("BANGLA_QR_API_KEY");
  return missing;
}

export function banglaQrConfigured(): boolean {
  return banglaQrMissingEnv().length === 0;
}

export async function banglaQrCreateCheckout(_input: CheckoutInput): Promise<CheckoutResult> {
  return {
    ok: false,
    reason: "not_configured",
    messageBn:
      "বাংলা QR এখনো চালু হয়নি — অ্যাকোয়ারিং ব্যাংকের কাছ থেকে ডায়নামিক QR API-র বিবরণ নিয়ে BANGLA_QR_API_URL / MERCHANT_ID / API_KEY সেট করতে হবে।",
  };
}

export async function banglaQrVerify(): Promise<VerifyResult> {
  return {
    verified: false,
    reason: "not_configured",
    messageBn: "বাংলা QR যাচাইয়ের ব্যবস্থা (অ্যাকোয়ারার সেটলমেন্ট) এখনো কনফিগার করা হয়নি।",
  };
}
