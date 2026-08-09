import { NextRequest, NextResponse } from "next/server";
import { CITY_CENTERS, searchMockPlaces } from "@/lib/mockData";
import { IntentFilters, RecommendedPlace, TravelDNA } from "@/lib/types";

interface Body {
  city: string;
  category?: string;
  filters?: IntentFilters;
  dna: TravelDNA;
  excludeNames?: string[];
  lang?: "en" | "ar";
}

// Rihla never lets Gemini invent coordinates. Real place data (name, address,
// lat/lng) always comes from Google Places when the key is configured; the
// mock catalog in lib/mockData.ts is real, hand-verified Saudi attractions
// used only as a fallback, never AI-generated.

export async function POST(req: NextRequest) {
  const { city, category, filters = {}, dna, excludeNames = [], lang = "en" }: Body = await req.json();
  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (serverKey) {
    try {
      const places = await searchGooglePlaces(city, category, lang, serverKey);
      if (places.length > 0) {
        return NextResponse.json(rankByDNA(places, dna, filters, excludeNames));
      }
    } catch (err) {
      console.error("Google Places search failed, using fallback:", err);
    }
  }

  const results = searchMockPlaces(city, category, dna, filters, excludeNames, 5, lang);
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

  const reasonText = lang === "ar" ? "مكان حقيقي من غوغل بليسز، يطابق طلبك." : "Real place from Google Places, matched to your request.";

  return data.results.slice(0, 8).map(
    (r: any): RecommendedPlace => ({
      id: r.place_id,
      name: r.name,
      category: category && category !== "general" ? category : "general",
      reason: reasonText,
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
function rankByDNA(places: RecommendedPlace[], dna: TravelDNA, filters: IntentFilters, excludeNames: string[]): RecommendedPlace[] {
  const filtered = places.filter((p) => !excludeNames.includes(p.name));
  const scored = filtered.map((p) => {
    let score = 0;
    if (p.crowdLevel === "high") score -= (100 - dna.crowdTolerance) * 0.5;
    if (p.crowdLevel === "low") score += dna.quietPreference * 0.3;
    if (filters.quiet && p.crowdLevel !== "low") score -= 20;
    return { p, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}
