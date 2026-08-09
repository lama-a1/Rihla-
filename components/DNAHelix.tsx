"use client";

import { TravelDNA } from "@/lib/types";
import { useLang } from "@/lib/i18n";

interface TraitRow {
  key: keyof TravelDNA;
  labelKey: string;
  value: number;
  changed?: boolean;
}

const TRAIT_ORDER: { key: keyof TravelDNA; labelKey: string }[] = [
  { key: "history", labelKey: "history" },
  { key: "culture", labelKey: "culture" },
  { key: "nature", labelKey: "nature" },
  { key: "food", labelKey: "food" },
  { key: "photography", labelKey: "photography" },
  { key: "shopping", labelKey: "shopping" },
  { key: "adventure", labelKey: "adventure" },
  { key: "quietPreference", labelKey: "quietPreference" },
  { key: "crowdTolerance", labelKey: "crowdTolerance" },
  { key: "walkingTolerance", labelKey: "walkingTolerance" },
  { key: "budgetSensitivity", labelKey: "budgetSensitivity" },
  { key: "indoorPreference", labelKey: "indoorPreference" },
  { key: "hiddenGemsPreference", labelKey: "hiddenGemsPreference" },
];

export function DNAHelix({ dna, prevDna }: { dna: TravelDNA; prevDna?: TravelDNA | null }) {
  const { t } = useLang();

  const rows: TraitRow[] = TRAIT_ORDER.map((r) => {
    const value = dna[r.key];
    return {
      ...r,
      value,
      changed: prevDna ? Math.abs(prevDna[r.key] - value) >= 2 : false,
    };
  });

  return (
    <div className="relative">
      <div className="absolute start-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-oasis/50 via-night-line to-sand/40" aria-hidden />
      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => {
          const leftSide = i % 2 === 0;
          const pct = Math.max(4, row.value);
          const barColor = row.changed ? "bg-clay" : leftSide ? "bg-oasis" : "bg-sand";
          const dotColor = row.changed ? "bg-clay" : "bg-ink";

          const label = (
            <span className="text-xs text-ink-muted whitespace-nowrap font-body">{t(row.labelKey as any)}</span>
          );
          const bar = (
            <div className="h-2 flex-1 rounded-full bg-night-soft overflow-hidden max-w-[110px]">
              <div
                className={`h-full rounded-full ${barColor} ${row.changed ? "animate-pulseSlow" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          );
          const value = (
            <span className={`font-mono-num text-xs w-9 text-end ${row.changed ? "text-clay" : "text-ink-faint"}`}>
              {row.value}%
            </span>
          );

          return (
            <div
              key={row.key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 animate-rise"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {leftSide ? (
                <>
                  <div className="flex items-center gap-2 justify-end">
                    {label}
                    {bar}
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full border-2 border-night ${dotColor}`} />
                  <div className="flex items-center gap-2">{value}</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-end">{value}</div>
                  <div className={`h-2.5 w-2.5 rounded-full border-2 border-night ${dotColor}`} />
                  <div className="flex items-center gap-2">
                    {bar}
                    {label}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
