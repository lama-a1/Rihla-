import { NextRequest, NextResponse } from "next/server";
import { CITY_CENTERS, isLimitedMobility, searchMockPlaces } from "@/lib/mockData";
import { IntentFilters, RecommendedPlace, TravelDNA } from "@/lib/types";

interface Body {
  city: string;
  category?: string;
  filters?: IntentFilters;
  dna: TravelDNA;
  excludeNames?: string[];
  lang?: "en" | "ar";
  mobilityNeeds?: string;
}

// Rihla never lets Gemini invent coordinates. Real place data (name, address,
// lat/lng) always comes from Google Places when the key is configured; the
// mock catalog in lib/mockData.ts is real, hand-verified Saudi attractions
// used only as a fallback, never AI-generated.
//
// Every generated string we control (the "reason" text) is stored in BOTH
// languages on the returned object (reason/reasonAr, accessibilityInfo/
// accessibilityInfoAr) — mirroring name/nameAr — so the UI can switch
// languages instantly without re-fetching. `lang` here only affects which
// language Google itself returns the place NAME in, since that text comes
// directly from Google and isn't something we generate ourselves.

export async function POST(req: NextRequest) {
  const { city, category, filters = {}, dna, excludeNames = [], lang = "en", mobilityNeeds = "" }: Body = await req.json();
  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (serverKey) {
    try {
      const places = await searchGooglePlaces(city, category, lang, serverKey);
      if (places.length > 0) {
        return NextResponse.json(rankByDNA(places, dna, filters, excludeNames, mobilityNeeds));
      }
    } catch (err) {
      console.error("Google Places search failed, using fallback:", err);
    }
  }

  const results = searchMockPlaces(city, category, dna, filters, excludeNames, 5, mobilityNeeds);
  return NextResponse.json(results);
}

async function searchGooglePlaces(
  city: string,
  category: string | undefined,
  lang: "en" | "ar",
  key: string
): Promise<RecommendedPlace[]> {
  const query = category && category !== "general" ? `${category} attractions in ${city} Saudi Arabia` : `top attractions in ${city} Saudi Arabia`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=${lang}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !Array.isArray(data.results)) {
    throw new Error(`Places API status: ${data.status}`);
  }

  return data.results.slice(0, 8).map(
    (r: any): RecommendedPlace => ({
      id: r.place_id,
      name: r.name,
      category: category && category !== "general" ? category : "general",
      reason: "Real place from Google Places, matched to your request.",
      reasonAr: "مكان حقيقي من غوغل بليسز، يطابق طلبك.",
      lat: r.geometry?.location?.lat ?? CITY_CENTERS[city]?.lat ?? 24.7136,
      lng: r.geometry?.location?.lng ?? CITY_CENTERS[city]?.lng ?? 46.6753,
      crowdLevel: r.user_ratings_total > 2000 ? "high" : r.user_ratings_total > 500 ? "medium" : "low",
      mapQuery: r.name,
      source: "places",
    })
  );
}

// Even real Places results get re-ranked against the user's current Travel
// DNA + this request's filters, so results feel personalized either way.
// Google Places doesn't expose a walking-difficulty field, so stated
// mobility needs can only nudge toward already-quieter/less busy spots here
// (the mock catalog's per-place walkingLevel gives a much stronger signal —
// see scorePlaceForDNA in lib/mockData.ts).
function rankByDNA(
  places: RecommendedPlace[],
  dna: TravelDNA,
  filters: IntentFilters,
  excludeNames: string[],
  mobilityNeeds: string
): RecommendedPlace[] {
  const filtered = places.filter((p) => !excludeNames.includes(p.name));
  const limitedMobility = isLimitedMobility(mobilityNeeds);
  const scored = filtered.map((p) => {
    let score = 0;
    if (p.crowdLevel === "high") score -= (100 - dna.crowdTolerance) * 0.5;
    if (p.crowdLevel === "low") score += dna.quietPreference * 0.3;
    if (filters.quiet && p.crowdLevel !== "low") score -= 20;
    if (limitedMobility && p.crowdLevel === "high") score -= 15; // large busy sites tend to involve more walking
    return { p, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}
