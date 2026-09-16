import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Globe, Lock, Shield } from "lucide-react";
import PsrLogo from "@/components/PsrLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/80 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <PsrLogo variant="full" size="md" />

            <p className="mt-3 text-xs leading-relaxed text-slate-600 max-w-sm">
              <strong className="text-slate-900">psr.bd</strong> (বাংলাদেশ ট্যাক্স কমপ্লায়েন্স ও রিটার্ন ভেরিফিকেশন প্ল্যাটফর্ম) হলো আয়কর আইন ২০২৩, অডিট গাইডলাইন ২০২৫ এবং আয়কর নির্দেশিকা ২০২৬-২০২৭ এর ওপর ভিত্তি করে নির্মিত শীর্ষস্থানীয় আইনি ও প্রযুক্তিগত ইকোসিস্টেম।
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-mono font-bold text-emerald-950">psr.bd</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-800 font-medium">অফিসিয়াল ডোমেইন ও এসএসএল সুরক্ষিত</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <span>নির্মাতা: লিগ্যাল-টেক ডেভেলপার ও আইনজীবী প্যানেল</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">উন্মুক্ত পিএসআর হাব</span>
            </div>
          </div>

          {/* Quick Links: Legal Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              আইনি মডিউল
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/calculators" className="hover:text-emerald-700 transition-colors">
                  ধারা ১০৪ ১৫% গ্রোথ শিল্ড
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-emerald-700 transition-colors">
                  ধারা ১৬৬ হিসাব খাতা অডিট
                </Link>
              </li>
              <li>
                <Link href="/gifts" className="hover:text-emerald-700 transition-colors">
                  দানকর আইন ১৯৯০ ট্র্যাকিং
                </Link>
              </li>
              <li>
                <Link href="/deadlines" className="hover:text-emerald-700 transition-colors">
                  জাতীয় কর সময়সীমা ক্যালেন্ডার
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Community & Publicity */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              কমিউনিটি ও প্রচার
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#blog-section" className="hover:text-emerald-700 transition-colors">
                  ডেভেলপার ও ক্লায়েন্ট ব্লগ
                </a>
              </li>
              <li>
                <a href="#viral-tool" className="hover:text-emerald-700 transition-colors">
                  ফ্রি অডিট রিস্ক চেকার
                </a>
              </li>
              <li>
                <Link href="/lawyers" className="hover:text-emerald-700 transition-colors">
                  আইনজীবী ডিরেক্টরি
                </Link>
              </li>
              <li>
                <Link href="/knowledge-base" className="hover:text-emerald-700 transition-colors">
                  ট্যাক্স আইন নলেজবেস
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              পোর্টাল এক্সেস
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                >
                  আইনজীবী ড্যাশবোর্ড <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-emerald-700 transition-colors">
                  ক্লায়েন্ট ফাইল ব্যবস্থাপনা
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-emerald-700 transition-colors">
                  পিএসআর ট্যাক্স ক্যালকুলেটর
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-700 transition-colors">
                  লগইন ও সাইনআপ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} psr.bd (BTCP). সর্বস্বত্ব সংরক্ষিত। আয়কর আইন ২০২৩ ও অডিট নির্দেশিকা অনুযায়ী প্রস্তুত।</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              psr.bd
            </span>
            <span>Proof of Submission of Return</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
