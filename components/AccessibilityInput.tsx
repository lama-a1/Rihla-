"use client";

import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Card } from "./ui/Card";

// A small, persistent field (unlike a one-off chat message) so accessibility
// needs stay in effect across the whole session — every /api/places call
// includes it, and lib/mockData.ts#scorePlaceForDNA heavily favors
// low-walking, indoor-friendly places whenever it's set. See
// lib/mockData.ts#isLimitedMobility for the keyword detection.

export function AccessibilityInput() {
  const { t, lang } = useLang();
  const { mobilityNeeds, setMobilityNeeds } = useApp();

  return (
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <label htmlFor="mobility-needs" className="text-xs text-ink-muted shrink-0 sm:w-56">
        ♿️ {t("mobility")}
      </label>
      <input
        id="mobility-needs"
        value={mobilityNeeds}
        onChange={(e) => setMobilityNeeds(e.target.value)}
        placeholder={t("mobilityPlaceholder")}
        className="flex-1 rounded-xl2 border border-night-line bg-night-soft px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-oasis"
      />
    </Card>
  );
}
