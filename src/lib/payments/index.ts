// ---------------------------------------------------------------------------
// পেমেন্ট গেটওয়ে — একক প্রবেশপথ (psr.bd)
// ---------------------------------------------------------------------------
// চার মাধ্যম একই চুক্তিতে চলে: createCheckout → প্রোভাইডার পেজে রিডাইরেক্ট
// → callback → verifyPayment (Execute + Query/Verify, সার্ভার-থেকে-সার্ভারে)।
// কলব্যাকের প্যারামিটার কখনো বিশ্বাস করা হয় না — শুধু verifyPayment-এর
// verified=true হলেই সাবস্ক্রিপশন চালু হয় (দেখুন lib/subscription.ts)।
// ---------------------------------------------------------------------------

import {
  CheckoutInput,
  CheckoutResult,
  PaymentMethod,
  ProviderStatus,
  VerifyResult,
} from "./types";
import { banglaQrConfigured, banglaQrCreateCheckout, banglaQrMissingEnv, banglaQrVerify } from "./banglaQr";
import { bankIpgConfigured, bankIpgCreateCheckout, bankIpgMissingEnv, bankIpgVerify } from "./bankIpg";
import { bkashConfigured, bkashCreateCheckout, bkashMissingEnv, bkashVerify } from "./bkash";
import { nagadConfigured, nagadCreateCheckout, nagadMissingEnv, nagadVerify } from "./nagad";

export * from "./types";

const NOTES: Record<PaymentMethod, string> = {
  bkash: "Tokenized Checkout — মার্চেন্ট অ্যাকাউন্ট + API ক্রেডেনশিয়াল লাগবে",
  nagad: "PGW Checkout — মার্চেন্ট রেজিস্ট্রেশন + RSA কী-জোড়া লাগবে; IP হোয়াইটলিস্টিং প্রযোজ্য",
  bangla_qr: "ডায়নামিক QR — অ্যাকোয়ারিং ব্যাংকের API বিবরণ লাগবে (Bangladesh Bank-এর একক কোনো API নেই)",
  bank_card: "ব্যাংকের IPG — অ্যাকোয়ারিং ব্যাংকের মার্চেন্ট অ্যাকাউন্ট + IPG ক্রেডেনশিয়াল লাগবে",
  bank_internet_banking: "ব্যাংকের IPG — অ্যাকোয়ারিং ব্যাংকের মার্চেন্ট অ্যাকাউন্ট + IPG ক্রেডেনশিয়াল লাগবে",
};

/** প্রতিটি মাধ্যম কনফিগার করা আছে কিনা (শুধু env-এর নাম দেখা হয়, মান নয়)। */
export function getProviderStatuses(): ProviderStatus[] {
  const defs: { method: PaymentMethod; configured: boolean; missingEnv: string[] }[] = [
    { method: "bkash", configured: bkashConfigured(), missingEnv: bkashMissingEnv() },
    { method: "nagad", configured: nagadConfigured(), missingEnv: nagadMissingEnv() },
    { method: "bangla_qr", configured: banglaQrConfigured(), missingEnv: banglaQrMissingEnv() },
    { method: "bank_card", configured: bankIpgConfigured(), missingEnv: bankIpgMissingEnv() },
    { method: "bank_internet_banking", configured: bankIpgConfigured(), missingEnv: bankIpgMissingEnv() },
  ];
  return defs.map((d) => ({ ...d, noteBn: NOTES[d.method] }));
}

export function isAnyProviderConfigured(): boolean {
  return getProviderStatuses().some((s) => s.configured);
}

/** পেমেন্ট শুরু — প্রোভাইডারের হোস্টেড পেজ/QR-এর URL ফেরত দেয়। */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  switch (input.method) {
    case "bkash":
      return bkashCreateCheckout(input);
    case "nagad":
      return nagadCreateCheckout(input);
    case "bangla_qr":
      return banglaQrCreateCheckout(input);
    case "bank_card":
    case "bank_internet_banking":
      return bankIpgCreateCheckout(input);
  }
}

/**
 * সার্ভার-সাইড যাচাই — গেটওয়ের Execute/Query (bKash) বা Complete/Verify
 * (Nagad) কল করে টাকা সত্যিই এসেছে কিনা নিশ্চিত করা হয়।
 */
export async function verifyPayment(
  method: PaymentMethod,
  providerPaymentId: string,
  expectedAmountBdt: number
): Promise<VerifyResult> {
  switch (method) {
    case "bkash":
      return bkashVerify(providerPaymentId, expectedAmountBdt);
    case "nagad":
      return nagadVerify(providerPaymentId, expectedAmountBdt);
    case "bangla_qr":
      return banglaQrVerify();
    case "bank_card":
    case "bank_internet_banking":
      return bankIpgVerify();
  }
}
