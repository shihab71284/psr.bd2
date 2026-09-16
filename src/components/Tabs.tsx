"use client";

import { ReactNode, useState } from "react";

export default function Tabs({
  tabs,
  initialTab,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  initialTab?: string;
}) {
  const [userSelectedTab, setUserSelectedTab] = useState<string | null>(null);
  const [prevInitialTab, setPrevInitialTab] = useState<string | undefined>(initialTab);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setUserSelectedTab(null);
  }

  const active = userSelectedTab ?? (initialTab && tabs.some((t) => t.id === initialTab) ? initialTab : tabs[0]?.id);

  return (
    <div>
      <div id="tabs-header-container" className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-btn-${t.id}`}
            onClick={() => setUserSelectedTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              active === t.id ? "bg-white text-emerald-700 shadow" : "text-slate-500 hover:text-slate-800"
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`tab-panel-${t.id}`} className={active === t.id ? "block" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
