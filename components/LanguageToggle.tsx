"use client";

import { useLang } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center rounded-full border border-night-line bg-night-panel p-1 text-xs font-mono-num">
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en" ? "bg-oasis text-night" : "text-ink-muted hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "ar" ? "bg-oasis text-night" : "text-ink-muted hover:text-ink"
        }`}
      >
        عربي
      </button>
    </div>
  );
}
