"use client";

import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { Card } from "./ui/Card";
import { RecommendationCard } from "./RecommendationCard";

export function RecommendationCards() {
  const { lang } = useLang();
  const { recommendations, selectedPlaceId, directions, selectPlace, ratedPlaceIds } = useApp();

  return (
    <Card className="p-5 h-full flex flex-col">
      <h2 className="font-display text-lg text-ink mb-1">{lang === "ar" ? "أماكن مقترحة" : "Recommended places"}</h2>
      <p className="text-xs text-ink-faint mb-4">
        {lang === "ar" ? "بناءً على طلبك وحمضك النووي للسفر" : "Based on your request and Travel DNA"}
      </p>

      {recommendations.length === 0 ? (
        <div className="flex-1 min-h-[160px] rounded-xl2 border border-dashed border-night-line flex items-center justify-center text-center px-6">
          <p className="text-sm text-ink-faint">
            {lang === "ar" ? "جرّب تسأل رحلة عن مكان" : "Try asking Rihla for a place"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((place) => (
            <RecommendationCard
              key={place.id}
              place={place}
              isSelected={place.id === selectedPlaceId}
              isRated={ratedPlaceIds.includes(place.id)}
              directions={place.id === selectedPlaceId ? directions : null}
              onSelect={(p) => selectPlace(p.id === selectedPlaceId ? null : p.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
