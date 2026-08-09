import { NextRequest, NextResponse } from "next/server";
import { getPrayerTimesMock, getWeatherMock } from "@/lib/mockData";

// Real-data upgrade path (kept simple for the hackathon):
// - Weather: swap getWeatherMock() for a call to an API like OpenWeatherMap,
//   using the city's lat/lng from CITY_CENTERS in lib/mockData.ts.
// - Prayer times: swap getPrayerTimesMock() for the free Aladhan API, e.g.
//   https://api.aladhan.com/v1/timingsByCity?city={city}&country=SA&method=4

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "Riyadh";
  const weather = getWeatherMock(city);
  const prayerTimes = getPrayerTimesMock();
  return NextResponse.json({ weather, prayerTimes });
}
