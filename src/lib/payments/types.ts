// ---------------------------------------------------------------------------
// পেমেন্ট গেটওয়ে — টাইপ ও সাধারণ চুক্তি (psr.bd)
// ---------------------------------------------------------------------------
// চার মাধ্যমের সঙ্গে সরাসরি ইন্টিগ্রেশন (নিজস্ব গেটওয়ে — কোনো অ্যাগ্রিগেটর নয়)।
// কোনো ক্রেডেনশিয়াল এখনো নেই — তাই কনফিগার না থাকলে সব মাধ্যম
// "শীঘ্রই আসছে" অবস্থায় থাকে এবং পেমেন্ট কখনোই ভুয়া সফল দেখানো হয় না।
// ---------------------------------------------------------------------------

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "bangla_qr"
  | "bank_card"
  | "bank_internet_banking";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "bkash",
  "nagad",
  "bangla_qr",
  "bank_card",
  "bank_internet_banking",
];

export const METHOD_LABELS: Record<PaymentMethod, { bn: string; en: string; short: string }> = {
  bkash: { bn: "বিকাশ", en: "bKash", short: "বিকাশ" },
  nagad: { bn: "নগদ", en: "Nagad", short: "নগদ" },
  bangla_qr: { bn: "বাংলা QR", en: "Bangla QR", short: "QR" },
  bank_card: { bn: "ব্যাংক কার্ড (Visa / Mastercard)", en: "Bank Card", short: "কার্ড" },
  bank_internet_banking: { bn: "ইন্টারনেট ব্যাংকিং", en: "Internet Banking", short: "IB" },
};

export type ProviderStatus = {
  method: PaymentMethod;
  configured: boolean;
  /** কনফিগার করতে কোন env ভেরিয়েবলগুলো বাকি */
  missingEnv: string[];
  noteBn: string;
};

export type CheckoutInput = {
  method: PaymentMethod;
  amountBdt: number;
  /** আমাদের অর্ডার রেফারেন্স (payments.id) */
  orderRef: string;
  plan: string;
  billingCycle: string;
  /** গেটওয়ে থেকে ফেরত আসার URL */
  callbackUrl: string;
};

export type CheckoutResult =
  | { ok: true; redirectUrl: string; providerPaymentId: string | null; qrPayload?: string }
  | { ok: false; reason: "not_configured" | "provider_error"; messageBn: string; detail?: string };

/** কলব্যাক/ওয়েবহুক যাচাইয়ের ফল — শুধুমাত্র verified=true হলে সাবস্ক্রিপশন চালু হয়। */
export type VerifyResult =
  | { verified: true; providerTrxId: string; amountBdt: number }
  | { verified: false; reason: "not_configured" | "not_found" | "amount_mismatch" | "failed" | "provider_error"; messageBn: string };

export function methodLabel(method: string): string {
  return METHOD_LABELS[method as PaymentMethod]?.bn ?? method;
}
