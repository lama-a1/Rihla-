import { NextRequest, NextResponse } from "next/server";
import { CITY_CENTERS, getPrayerTimesMock, getWeatherMock } from "@/lib/mockData";
import { PrayerTimes, WeatherInfo } from "@/lib/types";

// Real, free, no-API-key-required data sources:
// - Prayer times: Aladhan API, method 4 (Umm Al-Qura, Makkah) — the standard
//   calculation method used across Saudi Arabia. Queried by each city's real
//   coordinates (not by city name) so it's precise and always returns
//   TODAY's times for wherever the site is opened.
// - Weather: Open-Meteo, also by real coordinates, live current conditions.
// Both fall back to lib/mockData.ts if the request fails for any reason
// (network issue, API downtime, etc.) so the page never breaks.

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "Riyadh";
  const center = CITY_CENTERS[city] ?? CITY_CENTERS.Riyadh;

  const [weather, prayerTimes] = await Promise.all([
    fetchWeather(city, center.lat, center.lng),
    fetchPrayerTimes(center.lat, center.lng),
  ]);

  return NextResponse.json({ weather, prayerTimes });
}

async function fetchWeather(city: string, lat: number, lng: number): Promise<WeatherInfo> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 600 } }); // cache 10 min
    const data = await res.json();
    const current = data?.current;
    if (!current || typeof current.temperature_2m !== "number") throw new Error("Unexpected Open-Meteo response");

    return {
      city,
      tempC: Math.round(current.temperature_2m),
      feelsLikeC: Math.round(current.apparent_temperature),
      condition: weatherCodeToCondition(current.weather_code),
    };
  } catch (err) {
    console.error("Open-Meteo fetch failed, using mock weather:", err);
    return getWeatherMock(city);
  }
}

async function fetchPrayerTimes(lat: number, lng: number): Promise<PrayerTimes> {
  try {
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
    const data = await res.json();
    const timings = data?.data?.timings;
    if (!timings) throw new Error("Unexpected Aladhan response");

    return {
      fajr: cleanTime(timings.Fajr),
      dhuhr: cleanTime(timings.Dhuhr),
      asr: cleanTime(timings.Asr),
      maghrib: cleanTime(timings.Maghrib),
      isha: cleanTime(timings.Isha),
    };
  } catch (err) {
    console.error("Aladhan fetch failed, using mock prayer times:", err);
    return getPrayerTimesMock();
  }
}

// Aladhan sometimes appends a timezone note like "04:35 (+03)" — keep just "HH:mm".
function cleanTime(raw: string): string {
  const match = typeof raw === "string" ? raw.match(/^(\d{1,2}:\d{2})/) : null;
  return match ? match[1] : raw;
}

// WMO weather codes, as returned by Open-Meteo's weather_code field.
function weatherCodeToCondition(code: number): string {
  const map: Record<number, string> = {
    0: "Sunny",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rainy",
    63: "Rainy",
    65: "Rainy",
    71: "Snowy",
    73: "Snowy",
    75: "Snowy",
    80: "Rain showers",
    81: "Rain showers",
    82: "Rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  };
  return map[code] ?? "Sunny";
}
