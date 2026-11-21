import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://psr.bd"),
  title: "BTCP | Bangladesh Tax Compliance Platform",
  description: "কর আইনজীবী, ডেভেলপার ও ক্লায়েন্টদের জন্য psr.bd - সমন্বিত আয়কর আইন ২০২৩ ও পিএসআর (Proof of Submission of Return) অডিট কমপ্লায়েন্স প্ল্যাটফর্ম, উন্মুক্ত ব্লগ ও অডিট রিস্ক চেকার।",
  alternates: {
    canonical: "/",
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "psr.bd",
  url: "https://psr.bd/",
  telephone: "+8801578367800",
  founder: { "@type": "Person", name: "S M Sihabul Islam" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "114, Alkaran, GPO, Kotowali",
    addressLocality: "Chittagong",
    postalCode: "4000",
    addressCountry: "BD",
  },
  sameAs: ["https://github.com/shihab71284"],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd (BTCP) কী?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "psr.bd হলো BTCP — Bangladesh Tax Compliance Platform, বাংলাদেশের আয়কর আইন ২০২৩ অনুযায়ী কর কমপ্লায়েন্সের একটি প্ল্যাটফর্ম। এতে ধারা ২৬৪-এর পিএসআর (Proof of Submission of Return) প্রস্তুতি, ধারা ১০৪-এর অডিট শিল্ড যাচাই, ধারা ১৬৬-এর হিসাব খাতা ট্র্যাকিং, ক্লায়েন্ট ও রিটার্ন ব্যবস্থাপনা এবং ডেডলাইন ট্র্যাকিং রয়েছে।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What is psr.bd (BTCP)?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "psr.bd is BTCP — the Bangladesh Tax Compliance Platform, a tax compliance platform under the Income Tax Act 2023 of Bangladesh. It covers PSR (Proof of Submission of Return) preparation under Section 264, Section 104 audit shield checks, Section 166 books-of-accounts tracking, client and return management, and deadline tracking.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd কাদের জন্য?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "psr.bd মূলত কর আইনজীবী ও ট্যাক্স চেম্বারের জন্য তৈরি, যাতে তারা এক জায়গা থেকে ক্লায়েন্ট, রিটার্ন ও ডেডলাইন পরিচালনা করতে পারেন। সাধারণ করদাতা ও ক্লায়েন্টরাও ফ্রি অডিট রিস্ক সিমুলেটর, ক্যালকুলেটর, ব্লগ ও জ্ঞানভান্ডার ব্যবহার করতে পারেন।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "Who is psr.bd for?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "psr.bd is built mainly for tax lawyers and tax chambers, so they can manage clients, returns and deadlines in one place. Individual taxpayers and clients can also use the free audit risk simulator, calculators, blog and knowledge base.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "পিএসআর (PSR) কী?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "পিএসআর হলো Proof of Submission of Return — আয়কর আইন ২০২৩-এর ধারা ২৬৪ অনুযায়ী রিটার্ন দাখিলের প্রমাণ। psr.bd প্ল্যাটফর্মে পিএসআর প্রস্তুতি ও যাচাই সংক্রান্ত কাজে সহায়তা করা হয়।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What is PSR (Proof of Submission of Return)?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "PSR is the Proof of Submission of Return — evidence that a tax return was filed, under Section 264 of the Income Tax Act 2023. The psr.bd platform helps with PSR preparation and verification work.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "ধারা ১০৪ অডিট শিল্ড কী এবং psr.bd-তে এটি কীভাবে যাচাই করা যায়?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "আয়কর আইন ২০২৩-এর ধারা ১০৪ অনুযায়ী, পূর্ববর্তী বছরের তুলনায় ১৫% বা তদূর্ধ্ব আয় বৃদ্ধি পেলে স্বনির্ধারণী রিটার্নে অডিট সিলেকশন থেকে আইনি সুরক্ষা পাওয়া যায়। psr.bd-র ফ্রি ইনস্ট্যান্ট সিমুলেটরে পূর্ববর্তী ও চলতি করবর্ষের আয় দিয়ে এই শিল্ড প্রযোজ্য কিনা তাৎক্ষণিকভাবে যাচাই করা যায়।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What is the Section 104 audit shield and how can I check it on psr.bd?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "Under Section 104 of the Income Tax Act 2023, a self-assessment return can be legally shielded from audit selection when income grows by 15% or more compared with the previous year. On psr.bd, the free instant simulator checks whether this shield applies using your previous-year and current-year income figures.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "ধারা ১৬৬ হিসাব খাতা ট্র্যাকিং কী?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "ধারা ১৬৬ অনুযায়ী বাধ্যতামূলক হিসাব খাতা ও ভাউচার সংরক্ষণ করতে হয়। psr.bd হিসাব খাতার ঘাটতি এবং ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক নগদ ঋণের মতো ঝুঁকি শনাক্ত করতে সহায়তা করে।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What is Section 166 books-of-accounts tracking?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "Section 166 requires maintaining books of accounts and vouchers. psr.bd helps identify gaps in books of accounts and risks such as informal cash loans above BDT 5 lakh.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd-তে ক্লায়েন্ট ও রিটার্ন ব্যবস্থাপনা কীভাবে কাজ করে?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "চেম্বার ড্যাশবোর্ড থেকে ক্লায়েন্ট যোগ করা, তাদের রিটার্ন তৈরি ও ট্র্যাক করা যায়। ফ্রি প্ল্যানে প্রথম ৫ জন ক্লায়েন্ট ও প্রথম ৫টি রিটার্ন (ড্রাফট) অন্তর্ভুক্ত; Pro প্ল্যানে ক্লায়েন্ট ও রিটার্নের সংখ্যায় কোনো সীমা নেই। বিস্তারিত দেখুন https://psr.bd/pricing পেজে।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "How does client and return management work on psr.bd?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "From the chamber dashboard you can add clients and create and track their returns. The Free plan includes the first 5 clients and first 5 returns (drafts); the Pro plan has no limit on clients or returns. See https://psr.bd/pricing for details.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd-তে ডেডলাইন ট্র্যাকিং কীভাবে কাজ করে?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "ফ্রি প্ল্যানে সাধারণ বার্ষিক ডেডলাইন ক্যালেন্ডার রয়েছে। Pro প্ল্যানে প্রতি-ক্লায়েন্ট ডেডলাইন ও মেয়াদোত্তীর্ণ অ্যালার্টসহ আরও বিস্তারিত ডেডলাইন ট্র্যাকিং পাওয়া যায়। বর্তমান প্ল্যানের বিস্তারিত https://psr.bd/pricing পেজে দেখুন।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "How does deadline tracking work on psr.bd?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "The Free plan includes a general annual deadline calendar. The Pro plan adds per-client deadlines and expiry alerts for more detailed deadline tracking. See https://psr.bd/pricing for current plan details.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd-তে কী কী বিনামূল্যে ব্যবহার করা যায়?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "ল্যান্ডিং পেজের অডিট রিস্ক সিমুলেটর, ক্যালকুলেটর, ব্লগ, জ্ঞানভান্ডার ও চেকলিস্ট সবার জন্য ফ্রি। এছাড়া ফ্রি প্ল্যানে বেসিক ড্যাশবোর্ড, প্রথম ৫ জন ক্লায়েন্ট, প্রথম ৫টি ড্রাফট রিটার্ন এবং সাধারণ বার্ষিক ডেডলাইন ক্যালেন্ডার অন্তর্ভুক্ত।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What can I use for free on psr.bd?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "The landing-page audit risk simulator, calculators, blog, knowledge base and checklists are free for everyone. The Free plan also includes a basic dashboard, the first 5 clients, the first 5 draft returns, and a general annual deadline calendar.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "ফ্রি ও Pro প্ল্যানের পার্থক্য কী এবং মূল্য কোথায় দেখব?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "ফ্রি প্ল্যানে ক্লায়েন্ট ও রিটার্নের সীমা রয়েছে (প্রথম ৫ জন ক্লায়েন্ট ও ৫টি ড্রাফট রিটার্ন)। Pro প্ল্যানে এই সীমা থাকে না এবং উন্নত অডিট ও ডেডলাইন টুল পাওয়া যায়। হালনাগাদ মূল্য ও প্ল্যানের বিস্তারিত জানতে https://psr.bd/pricing পেজটি দেখুন।",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "What is the difference between the Free and Pro plans, and where can I see pricing?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "The Free plan has limits on clients and returns (first 5 clients and 5 draft returns). The Pro plan removes those limits and adds advanced audit and deadline tools. For current pricing and plan details, see https://psr.bd/pricing.",
      },
    },
    {
      "@type": "Question",
      inLanguage: "bn",
      name: "psr.bd-র সাথে কীভাবে যোগাযোগ করব?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "bn",
        text: "ঠিকানা: 114, Alkaran, GPO, Kotowali, Chittagong, 4000। ফোন: +8801578-367800। ওয়েবসাইট: https://psr.bd/",
      },
    },
    {
      "@type": "Question",
      inLanguage: "en",
      name: "How can I contact psr.bd?",
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
        text: "Address: 114, Alkaran, GPO, Kotowali, Chittagong, 4000. Phone: +8801578-367800. Website: https://psr.bd/",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7R4Z3777T7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag("js", new Date()); gtag("config", "G-7R4Z3777T7");`}
        </Script>
      </head>
      <body className="bg-slate-50/70 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">{children}</body>
    </html>
  );
}
