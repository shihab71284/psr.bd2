"use client";

import { useState, useRef, useEffect } from "react";
import {
  Wrench,
  ChevronDown,
  UploadCloud,
  FileCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { AuditIssue } from "@/lib/taxEngine";

interface QuickFixAction {
  documentsToUpload: {
    name: string;
    description: string;
  }[];
  nextReturnAdjustments: {
    fieldOrSection: string;
    action: string;
  }[];
  statutoryRule: string;
}

/**
 * Returns specific document upload recommendations and next return adjustments
 * tailored to the identified high / critical severity audit issue.
 */
export function getQuickFixRecommendations(issue: AuditIssue): QuickFixAction {
  const title = (issue.title || "").toLowerCase();
  const desc = (issue.description || "").toLowerCase();

  // 1. Non-institutional loan > 5 Lakh without bank statement (S. 104)
  if (title.includes("loan > 5") || title.includes("non-institutional loan") || desc.includes("৫ লক্ষ")) {
    return {
      documentsToUpload: [
        {
          name: "ব্যাংক হিসাব বিবরণী (Bank Statement)",
          description: "ঋণ গ্রহণের অ্যাকাউন্ট ট্রান্সফার অথবা একাউন্ট পেয়ী চেকের স্পষ্ট কপি।",
        },
        {
          name: "ঋণদাতার টিআইএন ও নোটারি এগ্রিমেন্ট",
          description: "ঋণ প্রদানকারীর TIN কপি, ব্যাংক সলভেন্সি ও স্ট্যাম্পকৃত ঋণচুক্তি।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "আইটি-১০বি২০১৬ (Schedule 24D / Liabilities)",
          action: "অপ্রাতিষ্ঠানিক ঋণ কলাম থেকে ব্যাংকিং চ্যানেলের প্রামাণ্য রেফারেন্স ও ঋণদাতার TIN অন্তর্ভুক্ত করুন।",
        },
        {
          fieldOrSection: "আয়ের বিবরণী (Income Statement)",
          action: "ধারা ১০৪ প্রযোজ্যতা নিশ্চিতে কোনো নগদ লেনদেন প্রদর্শিত থাকলে পরবর্তী রিটার্নে তা ব্যাংক রিকনসিলিয়েশনের মাধ্যমে সমন্বয় করুন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ১০৪ ও ধারা ১৬৬",
    };
  }

  // 2. Books of Accounts not maintained (S. 166)
  if (title.includes("books of accounts") || title.includes("হিসাব খাতা") || desc.includes("১৬৬")) {
    return {
      documentsToUpload: [
        {
          name: "ক্যাশ বুক ও জেনারেল লেজার কপি",
          description: "বাধ্যতামূলক দৈনিক নগদ জমা-খরচের বহি ও হিসাবের সারসংক্ষেপ।",
        },
        {
          name: "স্টক ও সেলস রেজিস্টার",
          description: "ব্যবসায়িক ক্রয়ের ভ্যাট চালান (মূসক ৬.৩) ও বিক্রয় ভাউচার বান্ডিল।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "ব্যবসায়িক লাভ-ক্ষতি হিসাব (P&L Account)",
          action: "অননুমোদিত আনুমানিক খরচ বাদ দিয়ে লেজার সমর্থিত প্রকৃত খরচের তালিকা দাখিল করুন।",
        },
        {
          fieldOrSection: "ধারা ১৬৬ কমপ্লায়েন্স চেকবক্স",
          action: "পরবর্তী রিটার্নে 'হিসাব বহি যথাযথভাবে সংরক্ষিত আছে' নিশ্চিত করুন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ১৬৬",
    };
  }

  // 3. TDS certificates missing
  if (title.includes("tds") || desc.includes("tds") || desc.includes("উৎস")) {
    return {
      documentsToUpload: [
        {
          name: "টিডিএস কর্তন চালান ও সার্টিফিকেট",
          description: "নিয়োগকর্তা বা ব্যাংক কর্তৃক ইস্যুকৃত ধারা ১৩৮/১৪০ কর্তন সনদ ও চালান কপি।",
        },
        {
          name: "ব্যাংক ইন্টারেস্ট স্টেটমেন্ট (Tax Withholding Statement)",
          description: "সঞ্চয়পত্র বা এফডিআর-এর কর কর্তন সংক্রান্ত সংশ্লিষ্ট ব্যাংকের সনদপত্র।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "কর কর্তন তফসিল (TDS Schedule)",
          action: "সনদের চালানের সাথে রিটার্নের ট্যাক্স ক্লেইম সুনির্দিষ্টভাবে ক্রস-ম্যাচ করান।",
        },
        {
          fieldOrSection: "অগ্রিম কর (Advance Tax)",
          action: "অনুপস্থিত চালানের সমপরিমাণ অর্থ দাবিমুক্ত রাখুন যাতে পেনাল্টি চার্জ না হয়।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ১৩৮-১৪৬",
    };
  }

  // 4. Missing TIN
  if (title.includes("tin") || desc.includes("tin")) {
    return {
      documentsToUpload: [
        {
          name: "ই-টিআইএন সার্টিফিকেট (E-TIN Copy)",
          description: "NBR এর ই-ট্যাক্স পোর্টাল থেকে প্রাপ্ত ১২ সংখ্যার ইলেকট্রনিক টিআইএন সনদ।",
        },
        {
          name: "জাতীয় পরিচয়পত্র (NID) কপি",
          description: "টিআইএন ভেরিফিকেশনের জন্য জাতীয় পরিচয়পত্রের উভয় পিঠের স্ক্যান।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "মূল পরিচিতি অংশ (Part I: Basic Info)",
          action: "ক্লায়েন্টের সক্রিয় ই-টিআইএন নম্বর বাধ্যতামূলকভাবে যুক্ত করে রিটার্ন জেনারেট করুন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ১৬৬-১৭৬",
    };
  }

  // 5. Assets & Liabilities Statement missing (IT-10B2016)
  if (title.includes("it-10b") || title.includes("assets & liabilities") || desc.includes("সম্পদ")) {
    return {
      documentsToUpload: [
        {
          name: "সম্পত্তির ক্রয় দলিল / পরচা / খতিয়ান",
          description: "স্থাবর সম্পত্তির নামজারি পরচা ও নিবন্ধিত দলিল কপি।",
        },
        {
          name: "ব্যাংক ব্যালেন্স কনফার্মেশন ও ডিপিএস স্টেটমেন্ট",
          description: "৩০ জুন তারিখের ক্লোজিং ব্যাংক ব্যালেন্সের সনদপত্র।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "তফসিল আইটি-১০বি২০১৬ (Wealth Statement)",
          action: "পরবর্তী কর বর্ষের শুরুতেই সম্পূর্ণ সম্পদ ও দায়ের কলামভিত্তিক এন্ট্রি প্রস্তুত করে প্রি-পপুলেট করুন।",
        },
        {
          fieldOrSection: "পারিবারিক ব্যয় ও জীবনযাত্রা (IT-10BB)",
          action: "বার্ষিক পারিবারিক ব্যয়ের বিস্তারিত বিভাজন অবশ্যই ব্যালান্স করুন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ২১৪ ও আইটি-১০বি২০১৬ নির্দেশিকা",
    };
  }

  // 6. Return Type mismatch
  if (title.includes("return type") || desc.includes("return type") || desc.includes("mismatch")) {
    return {
      documentsToUpload: [
        {
          name: "ট্রেড লাইসেন্স ও ব্যবসার ব্যাংক স্টেটমেন্ট",
          description: "হালনাগাদ ট্রেড লাইসেন্স ও বাণিজ্যিক হিসাব বিবরণী।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "রিটার্ন ফর্ম সিলেকশন (Return Type)",
          action: "IT-11S (শুধু বেতনভোগী) পরিবর্তন করে পূর্ণাঙ্গ IT-11GA ফর্ম নির্বাচন করুন।",
        },
        {
          fieldOrSection: "উদ্বৃত্তপত্র ও আর্থিক বিবরণী",
          action: "ব্যবসায়িক ব্যালেন্স শিট ও তফসিল-২৪বি সঠিকভাবে সংযুক্ত করুন।",
        },
      ],
      statutoryRule: "আয়কর বিধিমালা ও নির্দেশিকা ২০২৬-২০২৭",
    };
  }

  // 7. Unexplained wealth growth / Net worth too low
  if (title.includes("wealth") || desc.includes("wealth") || title.includes("সম্পদ")) {
    return {
      documentsToUpload: [
        {
          name: "উত্তরাধিকার বা হেবানামা দলিল (Gift / Inheritance)",
          description: "পূর্ববর্তী করবর্ষের দানপ্রাপ্তি বা পৈতৃক সম্পত্তি অর্জনের রেজিস্টার্ড দলিল।",
        },
        {
          name: "মূলধনী মুনাফা বা বিনিয়োগ রিডেম্পশন সনদ",
          description: "শেয়ার, সঞ্চয়পত্র বা জমি বিক্রির আনুষ্ঠানিক পেমেন্ট স্লিপ।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "তহবিলের উৎস (Sources of Fund - IT-10B)",
          action: "সম্পদ বৃদ্ধির সমপরিমাণ বৈধ উৎসের (করমুক্ত আয়, কৃষি আয়, ঋণ) পুঙ্খানুপুঙ্খ বিবরণ দিন।",
        },
        {
          fieldOrSection: "জীবনযাত্রা ব্যয় বিবরণী (IT-10BB)",
          action: "বাস্তবধর্মী পারিবারিক ব্যয় প্রদর্শন করে নিট ওয়েলথ অ্যাক্রুয়াল সমন্বয় করুন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ২১৩-২১৪",
    };
  }

  // 8. Revenue decline > 30%
  if (title.includes("decline") || desc.includes("drop") || title.includes("হ্রাস")) {
    return {
      documentsToUpload: [
        {
          name: "ব্যবসা মন্দা বা অর্ডার বাতিলের লিখিত ব্যাখ্যা",
          description: "আইনজীবীর স্বাক্ষরিত অডিট এক্সপ্লানেশন লেটার ও চুক্তি বাতিলের প্রমাণক।",
        },
        {
          name: "তুলনামূলক ব্যাংক টার্নওভার স্টেটমেন্ট",
          description: "পূর্ববর্তী দুই কর বছরের ১২ মাসের তুলনামূলক ব্যাংক স্টেটমেন্ট।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "ব্যাখ্যামূলক টীকা (Explanatory Note to Accounts)",
          action: "আয় হ্রাসের যৌক্তিক কারণ (বাজার পরিস্থিতি, অসুস্থতা ইত্যাদি) লিখিতভাবে রিটার্নের সাথে ট্যাগ করুন।",
        },
      ],
      statutoryRule: "আয়কর ম্যানুয়াল পার্ট-২ ও অডিট নির্দেশিকা ২০২৫",
    };
  }

  // 9. Statutory audit required
  if (title.includes("audit") || desc.includes("statutory audit") || desc.includes("নিরীক্ষা")) {
    return {
      documentsToUpload: [
        {
          name: "আইসিএবি সার্টিফাইড নিরীক্ষা প্রতিবেদন (Audit Report)",
          description: "চার্টার্ড অ্যাকাউন্ট্যান্ট ফার্ম কর্তৃক প্রস্তুতকৃত দ্বৈত স্বাক্ষরিত অডিট রিপোর্ট।",
        },
        {
          name: "ডকুমেন্ট ভেরিফিকেশন কোড (DVC) স্লিপ",
          description: "ICAB সিস্টেম থেকে জেনারেটকৃত বৈধ DVC ডকুমেন্ট।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "নিরীক্ষিত আর্থিক বিবরণী সংযুক্তি",
          action: "টার্নওভার ও করযোগ্য আয় অডিট রিপোর্টের সাথে শতভাগ সামঞ্জস্যপূর্ণ রাখুন।",
        },
        {
          fieldOrSection: "ধারা ৭৩ কমপ্লায়েন্স",
          action: "DVC নম্বর রিটার্ন ফর্মের নির্ধারিত বক্সে এন্ট্রি দিন।",
        },
      ],
      statutoryRule: "আয়কর আইন ২০২৩ এর ধারা ৭৩ ও আইসিএবি গাইডলাইন",
    };
  }

  // 10. VAT registration required
  if (title.includes("vat") || desc.includes("ভ্যাট") || desc.includes("bin")) {
    return {
      documentsToUpload: [
        {
          name: "ভ্যাট নিবন্ধন সনদ (BIN Certificate)",
          description: "১৩ ডিজিটের বিজনেস আইডেন্টিফিকেশন নম্বর সনদপত্র।",
        },
        {
          name: "ভ্যাট রিটার্ন দাখিল রসিদ (মূসক ৯.১ চালান)",
          description: "সর্বশেষ ১২ মাসের ভ্যাট রিটার্নের অনুলিপি।",
        },
      ],
      nextReturnAdjustments: [
        {
          fieldOrSection: "ভ্যাট রেজিস্ট্রেশন তথ্য (VAT/BIN Information)",
          action: "রিটার্নে ১৩ ডিজিটের BIN উল্লেখ করুন এবং আয়কর টার্নওভারের সাথে ভ্যাট টার্নওভার সমন্বয় করুন।",
        },
      ],
      statutoryRule: "মূল্য সংযোজন কর ও সম্পূরক শুল্ক আইন, ২০১২",
    };
  }

  // Default fallback for any other high/critical issue
  return {
    documentsToUpload: [
      {
        name: "প্রাসঙ্গিক ব্যাংক হিসাব বিবরণী ও চালান কপি",
        description: "সম্পর্কিত আয়ের বা লেনদেনের স্বপক্ষে পূর্ণাঙ্গ ব্যাংক ট্রানজ্যাকশন নথি।",
      },
      {
        name: "লিখিত স্পষ্টীকরণ দলিল (Written Clarification Note)",
        description: "উক্ত অসঙ্গতির বিষয়ে আইনজীবীর স্বাক্ষরিত ব্যাখ্যামূলক নোট।",
      },
    ],
    nextReturnAdjustments: [
      {
        fieldOrSection: "সংশোধিত বিবরণী ও পরবর্তী কর বছর রিটার্ন",
        action: `${issue.recommendation} — এই সুপারিশ অনুযায়ী পরবর্তী রিটার্নে সংশোধন নিশ্চিত করুন।`,
      },
      {
        fieldOrSection: "আইনি রেফারেন্স সমন্বয়",
        action: issue.section ? `${issue.section} এর শর্তাবলী পূরণ করে ফাইলটি দাখিল করুন।` : "সংশ্লিষ্ট আইনি তফসিল পূরণ করুন।",
      },
    ],
    statutoryRule: issue.section || "আয়কর আইন ২০২৩",
  };
}

interface QuickFixDropdownProps {
  issue: AuditIssue;
  clientId?: string;
}

export default function QuickFixDropdown({ issue, clientId }: QuickFixDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHighSeverity = issue.severity === "critical" || issue.severity === "high";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isHighSeverity) {
    return null;
  }

  const fix = getQuickFixRecommendations(issue);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Quick Fix Trigger Button */}
      <button
        type="button"
        id={`quick-fix-btn-${issue.category}-${issue.points}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-xs transition-all ${
          isOpen
            ? "border-emerald-600 bg-emerald-700 text-white ring-2 ring-emerald-400/30"
            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100/90"
        }`}
        title="কুইক ফিক্স পরামর্শ: প্রয়োজনীয় দলিল ও পরবর্তী রিটার্নে সমন্বয় দেখুন"
      >
        <Wrench className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-45 text-emerald-100" : "text-emerald-700"}`} />
        <span>কুইক ফিক্স (Quick Fix)</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown / Tooltip Flyout Menu */}
      {isOpen && (
        <div
          id={`quick-fix-menu-${issue.category}`}
          role="dialog"
          aria-label="কুইক ফিক্স পরামর্শ"
          className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-emerald-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">কুইক ফিক্স পরামর্শ গাইড</p>
                <p className="text-[11px] text-slate-500">ঝুঁকি নিরসনে নির্দিষ্ট কর প্রস্তুতি ও দলিল</p>
              </div>
            </div>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
              জরুরি সমাধান
            </span>
          </div>

          {/* Section 1: Documents to upload */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
              <span>আপলোড করার জন্য নির্দিষ্ট ডকুমেন্টস:</span>
            </div>
            <ul className="mt-2 space-y-2">
              {fix.documentsToUpload.map((doc, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs"
                >
                  <div className="flex items-start gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Next Return Adjustments */}
          <div className="mt-3.5 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <FileCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>পরবর্তী রিটার্নে প্রয়োজনীয় সমন্বয় (Next Return):</span>
            </div>
            <ul className="mt-2 space-y-2">
              {fix.nextReturnAdjustments.map((adj, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-amber-100/80 bg-amber-50/40 p-2 text-xs"
                >
                  <p className="font-semibold text-amber-900 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 text-amber-700 shrink-0" />
                    <span>{adj.fieldOrSection}</span>
                  </p>
                  <p className="mt-0.5 pl-4 text-[11px] text-slate-600 leading-snug">
                    {adj.action}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Statutory Reference Footer & Client link */}
          <div className="mt-3.5 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-slate-400" />
              <span className="truncate max-w-[200px]" title={fix.statutoryRule}>
                {fix.statutoryRule}
              </span>
            </div>
            {clientId ? (
              <a
                href={`/clients/${clientId}`}
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>ডকুমেন্টস সংযুক্ত করুন</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </a>
            ) : (
              <span className="text-emerald-700 font-medium">আইনজীবী অ্যাকশন প্ল্যান</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
