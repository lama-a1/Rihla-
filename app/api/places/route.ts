import { NextRequest, NextResponse } from "next/server";
import { generateJSON, isGeminiConfigured } from "@/lib/gemini";
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

// Three-tier source, tried in order:
//   1. Google Places (real, live) — used when GOOGLE_MAPS_SERVER_KEY is set.
//   2. Gemini-suggested real places — used when Places isn't configured but
//      Gemini is. Gemini draws on its general knowledge of real, well-known
//      Saudi attractions (never invents fictional ones), with an explicit
//      instruction not to fabricate coordinates it doesn't actually know.
//      Marked source: "gemini" so the distinction from verified map data is
//      never hidden.
//   3. The hand-curated mock catalog in lib/mockData.ts — always available,
//      guarantees the demo never breaks even with zero API keys configured.
//
// Every generated string we control (the "reason" text) is stored in BOTH
// languages on the returned object (reason/reasonAr, accessibilityInfo/
// accessibilityInfoAr) — mirroring name/nameAr — so the UI can switch
// languages instantly without re-fetching.

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
      console.error("[places] Google Places FAILED — falling back:", err);
    }
  }

  if (isGeminiConfigured()) {
    try {
      const places = await searchGeminiPlaces(city, category, filters, dna, mobilityNeeds, excludeNames);
      if (places.length > 0) {
        console.log(`[places] Using Gemini-suggested real places for ${city}/${category ?? "general"}.`);
        return NextResponse.json(places);
      }
    } catch (err) {
      console.error("[places] Gemini place suggestions FAILED — falling back to mock catalog:", err);
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

// Asks Gemini to suggest REAL, currently-existing, well-known attractions —
// not to invent anything — using its own general knowledge, since a live
// Places lookup isn't available. Coordinates here are Gemini's best-effort
// recollection, not verified map data, so this is only used when Google
// Places itself isn't configured.
interface GeminiPlaceSuggestion {
  name: string;
  nameAr?: string;
  category: string;
  reasonEn: string;
  reasonAr: string;
  lat: number;
  lng: number;
  costSAR?: number;
  crowdLevel?: "low" | "medium" | "high";
  walkingLevel?: "low" | "moderate" | "high";
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  accessibilityInfoEn?: string;
  accessibilityInfoAr?: string;
  mapQuery: string;
}

async function searchGeminiPlaces(
  city: string,
  category: string | undefined,
  filters: IntentFilters,
  dna: TravelDNA,
  mobilityNeeds: string,
  excludeNames: string[]
): Promise<RecommendedPlace[]> {
  const result = await generateJSON<{ places: GeminiPlaceSuggestion[] }>({
    system:
      "You are a knowledgeable Saudi tourism guide. Suggest 4 REAL, currently-existing, well-known " +
      "places to visit in the given Saudi city that match the requested category and the traveler's " +
      "Travel DNA. NEVER invent a fictional place — only suggest real attractions you're confident " +
      "actually exist. For coordinates, give your best genuine estimate of the real latitude/longitude " +
      "(you may know these from general geography) — do not guess wildly or use placeholder numbers. " +
      "If the traveler stated mobility/accessibility needs, prioritize places that would genuinely be " +
      "easier to access and say so honestly in accessibilityInfo. Respond with ONLY valid JSON: " +
      "{ places: [{ name: string, nameAr: string, category: string, reasonEn: string, reasonAr: string, " +
      "lat: number, lng: number, costSAR: number, crowdLevel: 'low'|'medium'|'high', " +
      "walkingLevel: 'low'|'moderate'|'high', indoorOutdoor: 'indoor'|'outdoor'|'mixed', " +
      "accessibilityInfoEn: string, accessibilityInfoAr: string, mapQuery: string (good Google Maps search text) }] }. " +
      "No prose outside the JSON.",
    prompt:
      `City: ${city}\nRequested category: ${category ?? "general"}\nFilters: ${JSON.stringify(filters)}\n` +
      `Traveler's Travel DNA: ${JSON.stringify(dna)}\nStated mobility/accessibility needs: ${mobilityNeeds || "none"}\n` +
      `Places to exclude (already shown): ${excludeNames.join(", ") || "none"}`,
  });

  return (result.places || [])
    .filter((p) => !excludeNames.includes(p.name))
    .map(
      (p): RecommendedPlace => ({
        id: p.name.replace(/\s+/g, "-").toLowerCase(),
        name: p.name,
        nameAr: p.nameAr,
        category: p.category || category || "general",
        reason: p.reasonEn,
        reasonAr: p.reasonAr,
        lat: p.lat,
        lng: p.lng,
        costSAR: p.costSAR,
        crowdLevel: p.crowdLevel,
        walkingLevel: p.walkingLevel,
        indoorOutdoor: p.indoorOutdoor,
        accessibilityInfo: p.accessibilityInfoEn,
        accessibilityInfoAr: p.accessibilityInfoAr,
        mapQuery: p.mapQuery || p.name,
        source: "gemini",
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
