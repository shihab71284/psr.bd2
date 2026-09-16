import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTCP | Bangladesh Tax Compliance Platform",
  description: "কর আইনজীবী, ডেভেলপার ও ক্লায়েন্টদের জন্য psr.bd - সমন্বিত আয়কর আইন ২০২৩ ও পিএসআর (Proof of Submission of Return) অডিট কমপ্লায়েন্স প্ল্যাটফর্ম, উন্মুক্ত ব্লগ ও অডিট রিস্ক চেকার।",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "BTCP | Bangladesh Tax Compliance Platform",
    description: "কর আইনজীবী, ডেভেলপার ও ক্লায়েন্টদের জন্য psr.bd - সমন্বিত আয়কর আইন ২০২৩ ও পিএসআর (Proof of Submission of Return) অডিট কমপ্লায়েন্স প্ল্যাটফর্ম, উন্মুক্ত ব্লগ ও অডিট রিস্ক চেকার।",
    locale: "bn_BD",
    type: "website",
    url: "https://psr.bd",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-slate-50/70 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">{children}</body>
    </html>
  );
}
