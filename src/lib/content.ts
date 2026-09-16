// Static reference content: compliance checklists, deadline templates and
// knowledge base articles used across the platform.

export interface ChecklistTemplate {
  key: string;
  titleBn: string;
  titleEn: string;
  items: { bn: string; en: string }[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    key: "individual",
    titleBn: "ব্যক্তি করদাতার রিটার্ন চেকলিস্ট",
    titleEn: "Individual Return Checklist",
    items: [
      { bn: "ক্লায়েন্টের ব্যক্তিগত তথ্য সংগ্রহ (নাম, এনআইডি, টিআইএন)", en: "Collect client personal details (Name, NID, TIN)" },
      { bn: "পূর্ববর্তী বছরের রিটার্ন সংগ্রহ", en: "Get previous year tax return" },
      { bn: "বেতন সনদ সংগ্রহ (বেতনভোগী হলে)", en: "Collect salary certificate (if salaried)" },
      { bn: "বাড়ি ভাড়ার সনদ (প্রযোজ্য ক্ষেত্রে)", en: "Get house rent certificate (if applicable)" },
      { bn: "বিনিয়োগ প্রমাণ সংগ্রহ (বিমা, ডিপিএস, মিউচুয়াল ফান্ড)", en: "Collect investment proofs" },
      { bn: "ঋণচুক্তি ও সুদ সনদ সংগ্রহ", en: "Get loan agreements & interest certificates" },
      { bn: "ব্যাংক স্টেটমেন্ট সংগ্রহ", en: "Collect bank statements" },
      { bn: "টিডিএস সার্টিফিকেট সংগ্রহ", en: "Get TDS certificates" },
      { bn: "সম্পত্তি সংক্রান্ত দলিল সংগ্রহ", en: "Collect property documents" },
      { bn: "IT-10B2016 (সম্পদ ও দায়) প্রস্তুত", en: "Prepare IT-10B2016 (Assets & Liabilities)" },
      { bn: "IT-10BB2016 (জীবনযাত্রার ব্যয়) প্রস্তুত", en: "Prepare IT-10BB2016 (Lifestyle expenses)" },
      { bn: "কর দায় হিসাব করুন", en: "Calculate tax liability" },
      { bn: "সকল তফসিল প্রস্তুত করুন", en: "Prepare all schedules" },
      { bn: "সকল হিসাব যাচাই করুন", en: "Verify all calculations" },
      { bn: "ক্লায়েন্টের অনুমোদন নিন", en: "Get client approval" },
      { bn: "রিটার্ন দাখিল করুন", en: "File return" },
    ],
  },
  {
    key: "business",
    titleBn: "ব্যবসায়িক রিটার্ন চেকলিস্ট",
    titleEn: "Business Return Checklist",
    items: [
      { bn: "ব্যবসায়িক নিবন্ধনের বিস্তারিত সংগ্রহ", en: "Collect business registration details" },
      { bn: "অংশীদারি দলিল (প্রযোজ্য ক্ষেত্রে)", en: "Get partnership deed (if applicable)" },
      { bn: "আর্থিক বিবরণী সংগ্রহ", en: "Collect financial statements" },
      { bn: "নিরীক্ষিত হিসাব সংগ্রহ (প্রয়োজনে)", en: "Get audited accounts (if required)" },
      { bn: "লাভ-ক্ষতি হিসাব প্রস্তুত করুন", en: "Prepare P&L statement" },
      { bn: "ব্যালেন্স শীট প্রস্তুত করুন", en: "Prepare balance sheet" },
      { bn: "অবচয় হিসাব করুন", en: "Calculate depreciation" },
      { bn: "ক্রয় চালান সংগ্রহ", en: "Collect purchase invoices" },
      { bn: "বিক্রয় দলিল সংগ্রহ", en: "Get sales documentation" },
      { bn: "Schedule 24C প্রস্তুত করুন", en: "Prepare Schedule 24C" },
      { bn: "ঋণচুক্তি ও সনদ সংগ্রহ", en: "Collect loan agreements & certificates" },
      { bn: "টিডিএস সার্টিফিকেট সংগ্রহ", en: "Get TDS certificates on payments" },
      { bn: "ভ্যাট সম্মতি যাচাই করুন", en: "Verify VAT compliance" },
      { bn: "অবচয় তফসিল প্রস্তুত করুন", en: "Prepare depreciation schedule" },
      { bn: "ব্যবসায়িক আয় হিসাব করুন", en: "Calculate business income" },
      { bn: "রিটার্ন দাখিল করুন", en: "File return" },
    ],
  },
  {
    key: "audit",
    titleBn: "নিরীক্ষা প্রতিক্রিয়া চেকলিস্ট",
    titleEn: "Audit Response Checklist",
    items: [
      { bn: "এনবিআর থেকে নিরীক্ষা নোটিশ গ্রহণ", en: "Receive audit notice from NBR" },
      { bn: "সকল সহায়ক দলিল সংগ্রহ", en: "Collect all supporting documents" },
      { bn: "নিরীক্ষা ফাইল প্রস্তুত করুন (বিভাগ অনুযায়ী)", en: "Prepare audit file (organized by section)" },
      { bn: "সমন্বয়ের হিসাব করুন", en: "Calculate adjustments" },
      { bn: "নিরীক্ষা ওয়ার্কিং পেপার প্রস্তুত করুন", en: "Prepare audit working papers" },
      { bn: "নিরীক্ষা প্রশ্নের জবাব প্রস্তুত করুন", en: "Prepare response to audit queries" },
      { bn: "নিরীক্ষার সময়সীমা মেনে চলুন", en: "Meet audit deadlines" },
      { bn: "সংশোধিত রিটার্ন প্রস্তুত করুন (প্রয়োজনে)", en: "Prepare revised return (if changes)" },
      { bn: "চূড়ান্ত কর/জরিমানা পরিশোধ করুন", en: "Pay final tax/penalty" },
      { bn: "আপিল দাখিল করুন (দ্বিমত হলে)", en: "File appeal (if disagreed)" },
    ],
  },
  {
    key: "vat",
    titleBn: "ভ্যাট সম্মতি চেকলিস্ট",
    titleEn: "VAT Compliance Checklist",
    items: [
      { bn: "ভ্যাট নিবন্ধন প্রয়োজন কিনা যাচাই করুন", en: "Check if VAT registration is required" },
      { bn: "এনবিআরে নিবন্ধন করুন (বিআইএন সংগ্রহ)", en: "Register with NBR (Get BIN)" },
      { bn: "ক্রয় চালান সংগ্রহ (ইনপুট ভ্যাট)", en: "Collect purchase invoices (Input VAT)" },
      { bn: "বিক্রয় চালান সংগ্রহ (আউটপুট ভ্যাট)", en: "Collect sales invoices (Output VAT)" },
      { bn: "মাসিক/ত্রৈমাসিক ভ্যাট হিসাব করুন", en: "Calculate monthly/quarterly VAT" },
      { bn: "ভ্যাট রিটার্ন প্রস্তুত করুন", en: "Prepare VAT return" },
      { bn: "প্রাপ্য ভ্যাট পরিশোধ করুন", en: "Pay VAT amount due" },
      { bn: "সময়মত ভ্যাট রিটার্ন দাখিল করুন", en: "File VAT return on time" },
    ],
  },
];

export interface DeadlineTemplate {
  titleBn: string;
  titleEn: string;
  category: "income_tax" | "vat" | "audit" | "appeal" | "other";
  monthDay: string; // MM-DD
}

export const ANNUAL_DEADLINE_TEMPLATES: DeadlineTemplate[] = [
  { titleBn: "ব্যক্তি করদাতার ই-রিটার্ন দাখিল", titleEn: "Individual e-Return Filing", category: "income_tax", monthDay: "11-30" },
  { titleBn: "নিরীক্ষাযোগ্য কোম্পানির রিটার্ন দাখিল", titleEn: "Company (Audited) Return Filing", category: "income_tax", monthDay: "01-15" },
  { titleBn: "অগ্রিম কর - ১ম কিস্তি", titleEn: "Advance Tax - 1st Installment", category: "income_tax", monthDay: "09-15" },
  { titleBn: "অগ্রিম কর - ২য় কিস্তি", titleEn: "Advance Tax - 2nd Installment", category: "income_tax", monthDay: "12-15" },
  { titleBn: "অগ্রিম কর - ৩য় কিস্তি", titleEn: "Advance Tax - 3rd Installment", category: "income_tax", monthDay: "03-15" },
  { titleBn: "অগ্রিম কর - ৪র্থ কিস্তি", titleEn: "Advance Tax - 4th Installment", category: "income_tax", monthDay: "06-15" },
  { titleBn: "বার্ষিক ভ্যাট রিটার্ন (ক্ষুদ্র ব্যবসা)", titleEn: "Annual VAT Return (Small Business)", category: "vat", monthDay: "11-15" },
];

export interface KnowledgeArticle {
  slug: string;
  categoryBn: string;
  categoryEn: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  bodyBn: string[];
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    slug: "individual-return-guide",
    categoryBn: "শুরু করুন",
    categoryEn: "Getting Started",
    titleBn: "ব্যক্তি করদাতার রিটার্ন প্রস্তুতির সম্পূর্ণ গাইড",
    titleEn: "Complete Guide to Individual Tax Return",
    summaryBn: "IT-11 রিটার্ন প্রস্তুতির ধাপে ধাপে নির্দেশনা।",
    bodyBn: [
      "ব্যক্তি করদাতার রিটার্ন প্রস্তুতির জন্য প্রথমে করদাতার আয়ের সকল উৎস চিহ্নিত করতে হবে — বেতন, ব্যবসা, সম্পত্তি, মূলধনী মুনাফা ইত্যাদি।",
      "প্রতিটি আয়ের উৎসের জন্য সংশ্লিষ্ট প্রমাণপত্র সংগ্রহ করতে হবে এবং তা যাচাই করতে হবে।",
      "করমুক্ত সীমা করদাতার শ্রেণি অনুযায়ী প্রযোজ্য — সাধারণ পুরুষ ৳৩,৭৫,০০০, মহিলা/প্রবীণ ৳৪,২৫,০০০, প্রতিবন্ধী ৳৫,০০,০০০, মুক্তিযোদ্ধা ৳৫,২৫,০০০।",
      "বিনিয়োগ রেয়াত হিসাব করার সময় প্রকৃত বিনিয়োগ, মোট আয়ের ২০% এবং সর্বোচ্চ ৳১৫,০০,০০০ এর মধ্যে যেটি কম, তার ওপর ১৫% হারে রেয়াত প্রযোজ্য হবে।",
      "সম্পদ ও দায়ের বিবরণী (IT-10B2016) এবং জীবনযাত্রার ব্যয় বিবরণী (IT-10BB2016) সঠিকভাবে পূরণ করা অত্যাবশ্যক, অন্যথায় নিরীক্ষার ঝুঁকি বাড়ে।",
      "সকল হিসাব যাচাই করে ক্লায়েন্টের অনুমোদন নিয়ে যথাসময়ে রিটার্ন দাখিল করুন।",
    ],
  },
  {
    slug: "audit-risk-triggers",
    categoryBn: "সম্মতি",
    categoryEn: "Compliance",
    titleBn: "নিরীক্ষা ঝুঁকি মূল্যায়ন: কী কারণে তদন্ত হতে পারে?",
    titleEn: "Audit Risk Assessment: What Triggers Scrutiny?",
    summaryBn: "সাধারণ ঝুঁকিসমূহ ও তা এড়ানোর উপায়।",
    bodyBn: [
      "আয়ের তুলনায় নিট সম্পদের অস্বাভাবিক পরিবর্তন নিরীক্ষার অন্যতম প্রধান কারণ।",
      "পূর্ববর্তী বছরের তুলনায় আয়ে ৩০%-এর বেশি হ্রাস দেখা গেলে তার সন্তোষজনক ব্যাখ্যা ও প্রমাণ প্রস্তুত রাখা প্রয়োজন।",
      "প্রয়োজনীয় তফসিল (Schedule 24C, IT-10B2016) অনুপস্থিত থাকলে রিটার্ন অসম্পূর্ণ বিবেচিত হতে পারে।",
      "টিডিএস সার্টিফিকেট ছাড়া টিডিএস ক্রেডিট দাবি করলে তা যাচাইয়ের সময় প্রত্যাখ্যাত হতে পারে।",
      "ব্যবসায়িক টার্নওভার নির্দিষ্ট সীমা অতিক্রম করলে ভ্যাট নিবন্ধন ও নিরীক্ষা বাধ্যতামূলক হয়ে যায় — তা উপেক্ষা করলে ঝুঁকি বাড়ে।",
      "BTCP-এর অটোমেটেড অডিট রিস্ক ইঞ্জিন এই সকল বিষয় রিটার্ন দাখিলের পূর্বেই চিহ্নিত করে সতর্ক করে।",
    ],
  },
  {
    slug: "depreciation-guide",
    categoryBn: "বিষয়ভিত্তিক",
    categoryEn: "Topics",
    titleBn: "অবচয় (Depreciation) হিসাবের সম্পূর্ণ পদ্ধতি",
    titleEn: "How to Calculate Depreciation",
    summaryBn: "Second Schedule অনুযায়ী সম্পদভিত্তিক অবচয় হারের বিস্তারিত।",
    bodyBn: [
      "আয়কর আইনের Second Schedule অনুযায়ী বিভিন্ন শ্রেণির সম্পদের জন্য নির্দিষ্ট অবচয় হার প্রযোজ্য — যেমন দালান ৫%, আসবাবপত্র ১০%, যন্ত্রপাতি ২০%, মোটরযান ২০%, কম্পিউটার ৩৩.৩৩%।",
      "অবচয় হিসাব করা হয় হ্রাসমান জের পদ্ধতিতে (Written Down Value - WDV): বছরের শুরুর জের + সংযোজন = ভিত্তি; ভিত্তি × হার = অবচয়; ভিত্তি - অবচয় = সমাপনী জের।",
      "প্রতি বছরের সমাপনী জের পরবর্তী বছরের শুরুর জের হিসেবে ব্যবহৃত হয়।",
      "ব্যবসায়িক আয় থাকলে অবচয় তফসিল প্রস্তুত না করা একটি সাধারণ কিন্তু গুরুত্বপূর্ণ ডকুমেন্টেশন ত্রুটি যা নিরীক্ষার ঝুঁকি বাড়ায়।",
    ],
  },
  {
    slug: "net-worth-surcharge",
    categoryBn: "বিষয়ভিত্তিক",
    categoryEn: "Topics",
    titleBn: "নিট সম্পদ ও সারচার্জ ব্যাখ্যা",
    titleEn: "Net Worth & Surcharge Explained",
    summaryBn: "নিট সম্পদ ৪ কোটি টাকা অতিক্রম করলে করণীয়।",
    bodyBn: [
      "নিট সম্পদ (মোট সম্পদ - মোট দায়) ৪ কোটি টাকার বেশি হলে করদাতার প্রদেয় করের ওপর ১০% হারে সারচার্জ প্রযোজ্য হয়।",
      "সারচার্জ পরিকল্পনার জন্য বছরের শেষে সম্পদ নিষ্পত্তি বা পুনর্বিন্যাসের কৌশল বিবেচনা করা যেতে পারে, তবে তা অবশ্যই আইনানুগ হতে হবে।",
      "BTCP প্ল্যাটফর্মের নিট সম্পদ ক্যালকুলেটর ব্যবহার করে সহজেই সারচার্জ প্রযোজ্যতা যাচাই করা যায়।",
    ],
  },
  {
    slug: "vat-registration-compliance",
    categoryBn: "সম্মতি",
    categoryEn: "Compliance",
    titleBn: "ভ্যাট নিবন্ধন ও সম্মতি নির্দেশিকা",
    titleEn: "VAT Registration & Compliance",
    summaryBn: "কখন ভ্যাট নিবন্ধন বাধ্যতামূলক এবং কীভাবে সম্মতি বজায় রাখবেন।",
    bodyBn: [
      "নির্দিষ্ট টার্নওভার সীমা অতিক্রম করলে ভ্যাট ও এসডি আইন ২০১২ অনুযায়ী ব্যবসায়িক প্রতিষ্ঠানের ভ্যাট নিবন্ধন (BIN) বাধ্যতামূলক।",
      "টার্নওভার সীমা অনুযায়ী মাসিক অথবা ত্রৈমাসিক ভ্যাট রিটার্ন দাখিল করতে হয়।",
      "ইনপুট ও আউটপুট ভ্যাটের সঠিক হিসাব সংরক্ষণ ভ্যাট নিরীক্ষার সময় গুরুত্বপূর্ণ ভূমিকা রাখে।",
    ],
  },
  {
    slug: "appeal-process",
    categoryBn: "সম্মতি",
    categoryEn: "Compliance",
    titleBn: "আপিল প্রক্রিয়া: ধাপে ধাপে নির্দেশনা",
    titleEn: "Appeal Process: Step-by-Step",
    summaryBn: "নিরূপণ আদেশের বিরুদ্ধে আপিলের নিয়মাবলী।",
    bodyBn: [
      "নিরূপণ আদেশ প্রাপ্তির ৬০ দিনের মধ্যে আপিল দাখিল করতে হয়।",
      "আপিল আবেদনের সাথে যথাযথ ফি, নিরূপণ আদেশের কপি এবং সমর্থনকারী দলিলাদি সংযুক্ত করতে হবে।",
      "আপিল দাখিলের পূর্বে বিরোধীয় করের একটি অংশ (সাধারণত ১০%) পরিশোধ করার নিয়ম থাকতে পারে — সর্বশেষ বিধান যাচাই করে নিন।",
    ],
  },
];
