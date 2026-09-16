"use client";

import { useState } from "react";
import {
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Scale,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
} from "lucide-react";

interface CategoryGuide {
  id: string;
  titleBn: string;
  titleEn: string;
  badge: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  nbrStandard: string;
  interpretation: string;
  triggers: string[];
  tipsForLawyers: string[];
}

const CATEGORY_GUIDES: CategoryGuide[] = [
  {
    id: "compliance",
    titleBn: "সম্মতি ঝুঁকি (Compliance Risk)",
    titleEn: "Compliance Risk",
    badge: "ধারা ১০৪, ১৬৬ ও ৩",
    iconColor: "text-emerald-700",
    bgColor: "bg-emerald-50/70",
    borderColor: "border-emerald-200",
    nbrStandard: "আয়কর আইন ২০২৩ এর ধারা ১০৪, ১৬৬ এবং আয়কর নির্দেশিকা ২০২৬-২০২৭",
    interpretation:
      "করদাতা আয়কর আইনের সংবিধিবদ্ধ মৌলিক বিধিবিধান ও বাধ্যতামূলক প্রশাসনিক শর্তাবলী অনুসরণ করেছেন কি না তা এই ক্যাটাগরিতে মূল্যায়ন করা হয়। বিশেষ করে ধারা ১০৪ অনুযায়ী ব্যাংকিং চ্যানেলের বাইরে ৫ লক্ষাধিক ঋণ গ্রহণ এবং ধারা ১৬৬ অনুযায়ী ব্যবসায়িক হিসাব খাতা (Books of Accounts) সংরক্ষণ না করা অডিট নিরীক্ষার প্রধান নির্ণায়ক।",
    triggers: [
      "ব্যাংকিং চ্যানেল ব্যতিরেকে ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক ঋণ গ্রহণ (ধারা ১০৪)।",
      "ব্যবসায়িক কার্যক্রম থাকা সত্ত্বেও ক্যাশ বুক, সেলস রেজিস্টার বা লেজার সংরক্ষণ না করা (ধারা ১৬৬)।",
      "যথাযথ দালিলিক প্রমাণ ছাড়া কর অব্যাহতিপ্রাপ্ত বা করমুক্ত আয়ের দাবি (ধারা ৩)।",
      "পূর্ববর্তী বছরের তুলনায় ১৫% আয় প্রবৃদ্ধি নিয়ম পূরণ না হওয়া (ধারা ১০৪ অডিট শিল্ড অনুপস্থিত)।",
    ],
    tipsForLawyers: [
      "অডিট শিল্ড সুবিধা নিশ্চিত করুন: পূর্ববর্তী কর বছরের তুলনায় করযোগ্য আয় ১৫% বা তার বেশি দেখালে ধারা ১০৪ অনুযায়ী ফাইলটি অডিট নিরীক্ষা থেকে সুরক্ষিত থাকে।",
      "ঋণদাতার টিআইএন ও ব্যাংক স্টেটমেন্ট সংগ্রহ করুন: কোনো ঋণ থাকলে তা ব্যাংকের অ্যাকাউন্ট পেয়ী চেক বা আরটিজিএসের মাধ্যমে এসেছে কি না নিশ্চিত করুন।",
      "ধারা ১৬৬ কমপ্লায়েন্স নিশ্চিতকরণ: ব্যবসার লাভ-ক্ষতি হিসাব ও ব্যালেন্স শিটের সাথে ক্যাশ বইয়ের রিকনসিলিয়েশন নোট ফাইলে সংযুক্ত রাখুন।",
    ],
  },
  {
    id: "regulatory",
    titleBn: "নিয়ন্ত্রক ঝুঁকি (Regulatory Risk)",
    titleEn: "Regulatory Risk",
    badge: "ধারা ৭৩, ভ্যাট আইন ২০১২ ও আরজেএসসি",
    iconColor: "text-purple-700",
    bgColor: "bg-purple-50/70",
    borderColor: "border-purple-200",
    nbrStandard: "আয়কর আইন ২০২৩ এর ধারা ৭৩, ভ্যাট আইন ২০১২ ও আইসিএবি অডিট ফ্রেমওয়ার্ক",
    interpretation:
      "অন্যান্য সংবিধিবদ্ধ নিয়ন্ত্রক সংস্থা (যেমন: NBR এর ভ্যাট অনুবিভাগ, ICAB, রেজিস্টার অব জয়েন্ট স্টক কোম্পানিজ) কর্তৃক নির্দেশিত বিধিবদ্ধ শর্তাবলী করদাতা যথাযথভাবে পালন করেছেন কি না তা এই ক্যাটাগরিতে পরিমাপ করা হয়। এখানে ত্রুটি থাকলে এনবিআরের সেন্ট্রাল ইন্টেলিজেন্স সেল (CIC) বা অডিট উইংয়ের স্বয়ংক্রিয় সিলেকশনে ফাইলটি চলে আসে।",
    triggers: [
      "বাধ্যতামূলক টার্নওভার অতিক্রম সত্ত্বেও ১৩ ডিজিটের ভ্যাট নিবন্ধন (BIN) গ্রহণ বা রিটার্নে উল্লেখ না করা।",
      "কোম্পানি বা নির্দিষ্ট সীমার ব্যবসায়ের ক্ষেত্রে আইসিএবি অনুমোদিত চার্টার্ড অ্যাকাউন্ট্যান্টস নিরীক্ষা প্রতিবেদন ও DVC (Document Verification Code) অনুপস্থিতি (ধারা ৭৩)।",
      "ভুল রিটার্ন ফর্ম নির্বাচন: যেমন ব্যবসা বা পেশাগত আয় থাকা সত্ত্বেও শুধুমাত্র চাকরিজীবীদের সংক্ষিপ্ত ফর্ম IT-11S ব্যবহার করা।",
    ],
    tipsForLawyers: [
      "সঠিক ফর্ম যাচাই: ব্যবসায়িক আয় বা সম্পদ ৪০ লক্ষের বেশি হলে পূর্ণাঙ্গ IT-11GA ফর্ম ও তফসিলসমূহ বাধ্যতামূলকভাবে পূরণ করুন।",
      "ভ্যাট ও ট্যাক্স টার্নওভার ক্রস-ম্যাচ: ভ্যাট রিটার্নে (মূসক ৯.১) প্রদর্শিত বার্ষিক বিক্রয়ের সাথে আয়কর রিটার্নের গ্রস টার্নওভার মিলিয়ে নিন; অমিল থাকলে আগাম ব্যাখ্যা প্রস্তুত রাখুন।",
      "বৈধ DVC নিশ্চিতকরণ: অডিট রিপোর্টের প্রতিটি পাতায় সিএ ফার্মের বৈধ DVC কোড এনবিআর পোর্টালে যাচাই করে রিটার্নে কোডটি উল্লেখ করুন।",
    ],
  },
  {
    id: "financial",
    titleBn: "আর্থিক ঝুঁকি (Financial Risk)",
    titleEn: "Financial Risk",
    badge: "আয়কর ম্যানুয়াল পার্ট-২ ও অডিট ২০২৫",
    iconColor: "text-amber-700",
    bgColor: "bg-amber-50/70",
    borderColor: "border-amber-200",
    nbrStandard: "এনবিআর অডিট সিলেকশন গাইডলাইন ২০২৫ ও ঝুঁকিভিত্তিক নিরীক্ষা পদ্ধতি (Risk-based Audit)",
    interpretation:
      "করদাতার প্রদর্শিত আর্থিক উপাত্তে কোনো অস্বাভাবিক বা সন্দেহজনক অসঙ্গতি রয়েছে কি না তা পরীক্ষা করা হয়। যেমন: আয়ের আকস্মিক পতন, অস্বাভাবিক উচ্চ দেনা কিংবা সম্পদ বৃদ্ধির সাথে ঘোষিত আয়ের গরমিল সরাসরি অডিট স্ক্যানারের নজরে পড়ে।",
    triggers: [
      "পূর্ববর্তী বছরের তুলনায় মোট আয়ে ৩০% বা ততোধিক অযৌক্তিক পতন।",
      "মোট সম্পদের তুলনায় মোট দায়ের পরিমাণ অস্বাভাবিক বেশি হওয়া (Debt-to-Asset ratio >৭০%)।",
      "জীবনযাত্রার পারিবারিক ব্যয় (IT-10BB) করদাতার ঘোষিত নিট আয়ের সাথে বাস্তবসম্মত না হওয়া।",
    ],
    tipsForLawyers: [
      "আয় হ্রাসের ব্যাখ্যামূলক নোট: ব্যবসায়িক লোকসান বা আয় কমার সুনির্দিষ্ট কারণ (অর্ডার বাতিল, স্বাস্থ্যগত কারণ ইত্যাদি) সহ ক্লায়েন্টের স্বাক্ষরিত নোট রিটার্নের সাথে ট্যাগ করুন।",
      "আইটি-১০বি২০১৬ সম্পদ বিবরণী সমন্বয়: তহবিলের উৎস (করমুক্ত আয়, উত্তরাধিকার বা সঞ্চয় রিডেম্পশন) স্পষ্ট করুন যাতে অনুমিত আয় (Unexplained Cash/Wealth) হিসেবে গণ্য না হয়।",
    ],
  },
  {
    id: "documentation",
    titleBn: "ডকুমেন্টেশন ঝুঁকি (Documentation Risk)",
    titleEn: "Documentation Risk",
    badge: "ধারা ১৩৮-১৪৬ ও তফসিল ২৪বি/২৪ডি",
    iconColor: "text-blue-700",
    bgColor: "bg-blue-50/70",
    borderColor: "border-blue-200",
    nbrStandard: "আয়কর আইন ২০২৩ এর ধারা ১৩৮ থেকে ১৪৬ (TDS কর্তন ও চালান সংযুক্তি)",
    interpretation:
      "রিটার্নে দাবিকৃত কর কর্তন, অগ্রিম কর এবং বিনিয়োগ রেয়াতের স্বপক্ষে প্রয়োজনীয় প্রমাণক ও চালান সংযুক্ত আছে কি না তা এই ক্যাটাগরিতে দেখা হয়। দালিলিক প্রমাণের অভাবে কর সুবিধা বাতিল ও জরিমানা আরোপ হতে পারে।",
    triggers: [
      "উৎসে কর কর্তন (TDS) ক্লেইমের বিপরীতে সরকারি চালান বা প্রতিষ্ঠানের প্রত্যয়নপত্র অনুপস্থিত থাকা।",
      "বাড়ি ভাড়া আয়ের বিপরীতে রেজিস্টার্ড ভাড়া চুক্তিপত্র বা ব্যাংকিং জমার রসিদ না থাকা।",
      "বিনিয়োগ রেয়াতের স্বপক্ষে জীবন বীমা প্রিমিয়াম রসিদ বা সরকারি ট্রেজারি সঞ্চয়পত্রের সনদ না থাকা।",
    ],
    tipsForLawyers: [
      "সকল TDS সনদের চালান নম্বর ও কোড রিটার্নের নির্ধারিত কলামে লিখুন।",
      "ব্যাংক হিসাব বিবরণী (১ জুলাই থেকে ৩০ জুন) ক্লায়েন্টের ফাইল আর্কাইভে বাধ্যতামূলকভাবে সংরক্ষণ করুন।",
    ],
  },
];

export default function AuditRiskHelpSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("compliance");

  const currentGuide = CATEGORY_GUIDES.find((g) => g.id === activeTab) || CATEGORY_GUIDES[0];

  return (
    <div
      id="audit-risk-help-tips-section"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Top Header Toggle Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white">
                সহায়িকা ও টিপস: NBR অডিট ঝুঁকি ক্যাটাগরি নির্দেশিকা
              </h3>
              <span className="hidden rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/30 sm:inline">
                এনবিআর মানদণ্ড
              </span>
            </div>
            <p className="text-xs text-slate-300">
              আয়কর আইন ২০২৩ ও অডিট নির্দেশিকা ২০২৫ অনুযায়ী সম্মতি ও নিয়ন্ত্রক ঝুঁকির বিশ্লেষণ
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-toggle-audit-risk-help"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "লুকান" : "বিস্তারিত টিপস দেখুন"}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-emerald-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-emerald-300" />
          )}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-6">
          {/* Quick Intro Banner */}
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs leading-relaxed text-emerald-900">
            <Info className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
            <div>
              <span className="font-bold">বিজ্ঞ আইনজীবীদের জন্য নির্দেশিকা: </span>
              জাতীয় রাজস্ব বোর্ড (NBR) প্রধানত চারটি মূল স্তম্ভের ওপর ভিত্তি করে ঝুঁকিভিত্তিক নিরীক্ষা (Risk-based Audit) পরিচালনা করে। নিচে <strong>সম্মতি (Compliance)</strong> এবং <strong>নিয়ন্ত্রক (Regulatory)</strong> সহ সকল ক্যাটাগরির সুনির্দিষ্ট আইনি ব্যাখ্যা ও প্রস্তুতিমূলক টিপস দেওয়া হলো।
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {CATEGORY_GUIDES.map((guide) => {
              const isSelected = activeTab === guide.id;
              return (
                <button
                  key={guide.id}
                  id={`tab-risk-guide-${guide.id}`}
                  type="button"
                  onClick={() => setActiveTab(guide.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{guide.titleBn}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? "bg-white/20 text-emerald-300"
                        : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    {guide.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="mt-5 space-y-5 animate-in fade-in duration-150">
            {/* Header of Active Category */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {currentGuide.titleBn}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({currentGuide.titleEn})
                </span>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                আইনি ভিত্তি: {currentGuide.nbrStandard}
              </span>
            </div>

            {/* Core Interpretation */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                <span>এনবিআর অডিট মানদণ্ডে কীভাবে ব্যাখ্যা করবেন (How to Interpret):</span>
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {currentGuide.interpretation}
              </p>
            </div>

            {/* Two-column layout: Triggers vs Lawyer Tips */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left Column: Common Triggers */}
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <AlertOctagon className="h-4 w-4 text-rose-600" />
                  <span>অডিট নিরীক্ষায় যেসব কারণে ঝুঁকি বাড়ে (Triggers):</span>
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-700">
                  {currentGuide.triggers.map((trigger, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="leading-relaxed">{trigger}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Practical Tips for Lawyers */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>আইনজীবীর জন্য প্রস্তুতিমূলক টিপস (Actionable Tips):</span>
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-700">
                  {currentGuide.tipsForLawyers.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Reference Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-700" />
                <span className="font-semibold text-slate-900">অডিট ফলাফল সারসংক্ষেপ:</span>
                <span>
                  সর্বমোট ঝুঁকি স্কোর <strong>৫০ এর নিচে</strong> থাকলে স্বাভাবিক প্রক্রিয়াকরণ হয়, <strong>৭৫ বা তদূর্ধ্বে</strong> থাকলে সংবিধিবদ্ধ অডিট নোটিশ জারি হতে পারে।
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                উৎস: এনবিআর পরিপত্র ও অডিট ম্যানুয়াল নির্দেশিকা ২০২৫-২০২৬
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
