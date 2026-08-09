"use client";

import { DirectionsResult, RecommendedPlace } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const CATEGORY_COLOR: Record<string, string> = {
  history: "text-sand-bright border-sand/40",
  nature: "text-oasis-bright border-oasis/40",
  food: "text-clay border-clay/40",
  culture: "text-sand-bright border-sand/40",
  photography: "text-oasis-bright border-oasis/40",
  shopping: "text-ink-muted border-night-line",
  general: "text-ink-muted border-night-line",
};

export function RecommendationCard({
  place,
  isSelected,
  isRated,
  directions,
  onSelect,
  onFeedback,
}: {
  place: RecommendedPlace;
  isSelected?: boolean;
  isRated?: boolean;
  directions?: DirectionsResult | null;
  onSelect: (place: RecommendedPlace) => void;
  onFeedback?: (place: RecommendedPlace) => void;
}) {
  const { t, lang } = useLang();
  const name = lang === "ar" && place.nameAr ? place.nameAr : place.name;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}`;

  return (
    <Card
      className={`p-4 transition-all ${isSelected ? "border-oasis shadow-[0_0_0_1px_rgba(47,184,166,0.4)]" : ""} ${
        isRated ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-display text-base text-ink">{name}</h4>
        <div className="flex items-center gap-1.5 shrink-0">
          {isRated && (
            <span className="text-[10px] uppercase tracking-wide rounded-full border border-oasis/40 text-oasis-bright px-2 py-0.5">
              {lang === "ar" ? "مُقيَّم" : "Rated"}
            </span>
          )}
          <span
            className={`text-[10px] uppercase tracking-wide rounded-full border px-2 py-0.5 ${
              CATEGORY_COLOR[place.category] ?? "text-ink-muted border-night-line"
            }`}
          >
            {place.category === "general" ? "" : t(place.category as any)}
          </span>
        </div>
      </div>
      <p className="text-xs text-ink-muted leading-relaxed mb-3">{place.reason}</p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faint mb-3">
        {place.crowdLevel && <span>{t("crowd")}: {t(place.crowdLevel as any)}</span>}
        {place.walkingLevel && <span>{t("walking")}: {t(place.walkingLevel as any)}</span>}
        {typeof place.costSAR === "number" && (
          <span>{place.costSAR === 0 ? t("free") : `${place.costSAR} ${lang === "ar" ? "ريال" : "SAR"}`}</span>
        )}
      </div>

      {isSelected && directions && (
        <div className="mb-3 rounded-xl2 border border-oasis/40 bg-oasis/5 px-3 py-2 text-xs text-oasis-bright flex justify-between">
          <span>{t("distance")}: {directions.distanceText}</span>
          <span>{t("travelTime")}: {directions.durationText}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant={isSelected ? "primary" : "outline"} onClick={() => onSelect(place)} className="px-4 py-2 text-xs">
          {isSelected ? t("showRoute") : t("selectDestination")}
        </Button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-4 py-2 text-xs text-sand-bright hover:text-sand transition-colors"
        >
          {t("openMap")} →
        </a>
      </div>
    </Card>
  );
}
