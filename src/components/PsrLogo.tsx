import React from "react";
import Link from "next/link";

interface PsrLogoProps {
  variant?: "header" | "full" | "compact" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  showDomain?: boolean;
  clickable?: boolean;
  className?: string;
}

export function PsrEmblemIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dimensionClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  }[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-1.5 text-white shadow-xs shadow-emerald-800/20 ring-1 ring-emerald-500/30 ${dimensionClasses} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Subtle geometric grid background */}
        <circle cx="50" cy="50" r="44" stroke="#34d399" strokeWidth="2" strokeOpacity="0.25" strokeDasharray="3 3" />
        
        {/* Stylized "P" Stem / Document Pillar */}
        <path
          d="M26 24C23.7909 24 22 25.7909 22 28V72C22 74.2091 23.7909 76 26 76H32C34.2091 76 36 74.2091 36 72V28C36 25.7909 34.2091 24 32 24H26Z"
          fill="#ffffff"
        />

        {/* Dynamic Curved Loop of P & Tax Shield Arc */}
        <path
          d="M36 24H52C64.1503 24 74 33.8497 74 46C74 58.1503 64.1503 68 52 68H36V56H52C57.5228 56 62 51.5228 62 46C62 40.4772 57.5228 36 52 36H36V24Z"
          fill="#34d399"
        />

        {/* Verification Checkmark (Proof of Submission - PSR) */}
        <path
          d="M44 64L54 74L78 50"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dot Accent */}
        <circle cx="78" cy="24" r="4" fill="#a7f3d0" />
      </svg>
    </div>
  );
}

export default function PsrLogo({
  variant = "header",
  size = "md",
  theme = "light",
  showDomain = true,
  clickable = true,
  className = "",
}: PsrLogoProps) {
  const isDark = theme === "dark";

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <PsrEmblemIcon size={size} />

      {variant !== "icon" && (
        <div className="flex flex-col text-left">
          {/* Main Brand Title with Domain */}
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                size === "sm"
                  ? "text-sm"
                  : size === "lg"
                  ? "text-2xl"
                  : size === "xl"
                  ? "text-3xl"
                  : "text-lg"
              } ${isDark ? "text-white" : "text-slate-900"}`}
            >
              psr
              <span className="text-emerald-600 font-extrabold">.bd</span>
            </span>

            {showDomain && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide transition-colors ${
                  isDark
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                }`}
              >
                ট্যাক্স ও অডিট
              </span>
            )}
          </div>

          {/* Subtitle / Description */}
          {variant === "header" && (
            <p
              className={`mt-1 text-[10px] font-medium tracking-tight ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Proof of Submission of Return · আয়কর আইন ২০২৩
            </p>
          )}

          {variant === "full" && (
            <p
              className={`mt-1 text-[11px] font-medium leading-tight ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              বাংলাদেশ ট্যাক্স কমপ্লায়েন্স ও পিএসআর ভেরিফিকেশন সিস্টেম
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        href="/"
        className="group inline-flex items-center transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {content}
      </Link>
    );
  }

  return content;
}
