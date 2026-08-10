"use client";

import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { describeDNA } from "@/lib/dna";
import { Card } from "./ui/Card";
import { DNAHelix } from "./DNAHelix";

// Renders the existing DNAHelix visual against the live profile from
// lib/store.tsx. Updates automatically whenever Phase 2 (chat) or Phase 7
// (feedback) call `nudgeDNA` — no changes needed here for that to work,
// since this component just reads from context.

export function DNAPanel() {
  const { dna, lastDNAChange } = useApp();
  const { lang, t } = useLang();

  return (
    <Card className="p-5 h-full">
      <div className="flex items-start justify-between mb-1">
        <h2 className="font-display text-lg text-ink">{t("dnaTitle")}</h2>
        {lastDNAChange && lastDNAChange.length > 0 && (
          <span className="text-[10px] uppercase tracking-wide rounded-full bg-clay/20 text-clay px-2 py-0.5 animate-pulseSlow">
            {t("dnaEvolvedShort")}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-faint mb-4">{describeDNA(dna, lang)}</p>
      <DNAHelix dna={dna} />
      <p className="mt-4 text-[11px] text-ink-faint border-t border-night-line pt-3">
        {lang === "ar"
          ? "يتطور تلقائيًا مع كل رسالة وملاحظة"
          : "Evolves automatically with every message and piece of feedback"}
      </p>
    </Card>
  );
}
