"use client";

import { useState, FormEvent } from "react";
import { Zap, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import PsrLogo from "@/components/PsrLogo";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("demo@btcp.bd");
  const [password, setPassword] = useState("demo1234");
  const [name, setName] = useState("");

  async function performLogin(loginEmail: string, loginPass: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ভুল ইমেইল অথবা পাসওয়ার্ড");
        setLoading(false);
        return;
      }
      // Full document reload to ensure cookie is cleanly attached in iframe / browser
      window.location.href = "/dashboard";
    } catch {
      setError("সার্ভারে সংযোগ করতে সমস্যা হয়েছে");
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      await performLogin(email, password);
      return;
    }

    // Register flow
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "partner" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "একটি সমস্যা হয়েছে");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("সার্ভারে সংযোগ করতে সমস্যা হয়েছে");
      setLoading(false);
    }
  }

  return (
    <main id="login-main-container" className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-slate-50/70">
      {/* Modern Light Smart Left Showcase */}
      <section className="relative hidden flex-col justify-between border-r border-slate-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-12 text-slate-900 lg:flex">
        <div>
          <div className="flex items-center justify-between">
            <PsrLogo variant="header" size="lg" />
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-950 shadow-2xs">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>psr.bd</span>
            </div>
          </div>

          <h1 className="mt-14 max-w-lg text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            কর আইনজীবীদের জন্য স্মার্ট ট্যাক্স ফাইল, পিএসআর ভেরিফিকেশন ও অডিট শিল্ড সমাধান
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-600 leading-relaxed">
            আয়কর আইন ২০২৩ এর ধারা ২৬৪ (PSR), ধারা ১০৪ (১৫% গ্রোথ শিল্ড) ও ধারা ১৬৬ হিসাব খাতা অডিট — সব এক প্ল্যাটফর্মে পরিচালিত।
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>ধারা ২৬৪ অনুসারে ৪৩+ সেবায় তাৎক্ষণিক PSR প্রস্তুতি ও ট্র্যাকিং</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>অটোমেটেড অডিট রিস্ক স্কোরিং ও কুইক-ফিক্স অপশন</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>দানকর আইন ১৯৯০ এবং আয়কর নির্দেশিকা ২০২৫-২৬ কমপ্লায়েন্ট</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm pt-8 border-t border-slate-200/80">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-2xl font-extrabold text-slate-900">৫০+</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">এনবিআর অডিট ঝুঁকি নির্দেশক পরীক্ষা</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-2xl font-extrabold text-emerald-700">১০+</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">ট্যাক্স ও লিগ্যাল ক্যালকুলেটর</p>
          </div>
        </div>
      </section>

      {/* Right Column: Form Container */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <PsrLogo variant="compact" size="md" />
            <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              psr.bd
            </span>
          </div>

          <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-sm font-medium shadow-2xs">
            <button
              id="tab-mode-login"
              className={`flex-1 rounded-lg py-2 transition ${mode === "login" ? "bg-white text-emerald-800 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              type="button"
            >
              লগইন
            </button>
            <button
              id="tab-mode-register"
              className={`flex-1 rounded-lg py-2 transition ${mode === "register" ? "bg-white text-emerald-800 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              type="button"
            >
              নতুন ফার্ম নিবন্ধন
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "login" ? "আপনার একাউন্টে প্রবেশ করুন" : "ফার্মের জন্য একাউন্ট তৈরি করুন"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {mode === "login" ? "ডেমো ক্রিডেনশিয়াল নিচে প্রস্তুত রয়েছে" : "প্রধান পার্টনার হিসেবে অ্যাকাউন্ট তৈরি হবে"}
          </p>

          {mode === "login" && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold">সরাসরি অ্যাক্সেস:</span>
                <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 font-mono text-[11px] font-bold">ডেমো সক্রিয়</span>
              </div>
              <p className="mt-1 font-mono text-slate-700">
                আইডি: <strong className="text-emerald-950">demo@btcp.bd</strong> | পাসওয়ার্ড: <strong className="text-emerald-950">demo1234</strong>
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  id="btn-direct-dashboard-open"
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    performLogin("demo@btcp.bd", "demo1234");
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>সরাসরি ড্যাশবোর্ড ওপেন করুন</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="input-register-name" className="mb-1 block text-xs font-semibold text-slate-700">পুরো নাম</label>
                <input
                  id="input-register-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="যেমন: ব্যারিস্টার রহিম উদ্দিন"
                />
              </div>
            )}
            <div>
              <label htmlFor="input-login-email" className="mb-1 block text-xs font-semibold text-slate-700">ইমেইল</label>
              <input
                id="input-login-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="you@firm.com"
              />
            </div>
            <div>
              <label htmlFor="input-login-password" className="mb-1 block text-xs font-semibold text-slate-700">পাসওয়ার্ড</label>
              <input
                id="input-login-password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p id="login-error-msg" className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              id="btn-submit-auth"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 shadow-2xs"
            >
              {loading ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "একাউন্ট তৈরি করুন"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
