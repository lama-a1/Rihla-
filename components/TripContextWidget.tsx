"use client";

import { useEffect, useState } from "react";
import { PrayerTimes, WeatherInfo } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { Card } from "./ui/Card";

const PRAYER_LABELS: { key: keyof PrayerTimes; en: string; ar: string }[] = [
  { key: "fajr", en: "Fajr", ar: "الفجر" },
  { key: "dhuhr", en: "Dhuhr", ar: "الظهر" },
  { key: "asr", en: "Asr", ar: "العصر" },
  { key: "maghrib", en: "Maghrib", ar: "المغرب" },
  { key: "isha", en: "Isha", ar: "العشاء" },
];

// Weather condition text comes from lib/mockData.ts in English only (it's
// demo/mock data). Translate the known set here for the Arabic UI rather
// than storing duplicate strings in the mock data itself.
const CONDITION_AR: Record<string, string> = {
  Sunny: "مشمس",
  Humid: "رطب",
  Clear: "صافٍ",
  "Mild, cloudy": "معتدل وغائم",
  "Mostly clear": "صافٍ في الغالب",
  "Partly cloudy": "غائم جزئيًا",
  Cloudy: "غائم",
  Foggy: "ضبابي",
  Drizzle: "رذاذ",
  Rainy: "ممطر",
  Snowy: "ثلجي",
  "Rain showers": "زخات مطر",
  Thunderstorm: "عاصفة رعدية",
};

function translateCondition(condition: string, lang: "en" | "ar"): string {
  if (lang !== "ar") return condition;
  return CONDITION_AR[condition] ?? condition;
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nextPrayerKey(prayerTimes: PrayerTimes): keyof PrayerTimes | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const p of PRAYER_LABELS) {
    if (toMinutes(prayerTimes[p.key]) >= nowMinutes) return p.key;
  }
  return null; // all passed for today
}

export function TripContextWidget({ city }: { city: string }) {
  const { lang, dir } = useLang();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/trip-context?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setWeather(data.weather);
          setPrayerTimes(data.prayerTimes);
        }
      })
      .catch(() => {
        /* widget is non-critical, fail silently */
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (!weather || !prayerTimes) return null;

  const upcoming = nextPrayerKey(prayerTimes);

  return (
    <Card className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between" dir={dir}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{weather.tempC >= 38 ? "☀️" : weather.tempC >= 25 ? "🌤️" : "⛅"}</span>
        <div>
          <div className="text-ink text-sm font-medium">
            {weather.tempC}°C · {translateCondition(weather.condition, lang)}
          </div>
          <div className="text-ink-faint text-xs">
            {lang === "ar" ? "الإحساس الفعلي" : "Feels like"} {weather.feelsLikeC}°C
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {PRAYER_LABELS.map((p) => (
          <div
            key={p.key}
            className={`flex flex-col items-center rounded-xl2 px-3 py-1.5 shrink-0 border ${
              p.key === upcoming ? "border-oasis bg-oasis/10 text-oasis-bright" : "border-night-line text-ink-muted"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide">{lang === "ar" ? p.ar : p.en}</span>
            <span className="font-mono-num text-xs">{prayerTimes[p.key]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
