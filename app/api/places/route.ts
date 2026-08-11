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
  count?: number;
}

export async function POST(req: NextRequest) {
  const {
    city,
    category,
    filters = {},
    dna,
    excludeNames = [],
    lang = "en",
    mobilityNeeds = "",
    count = 4,
  }: Body = await req.json();
  const requestedCount = Math.max(1, Math.min(8, count));
  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (serverKey) {
    try {
      const places = await searchGooglePlaces(city, category, lang, serverKey, requestedCount);
      if (places.length > 0) {
        return NextResponse.json(rankByDNA(places, dna, filters, excludeNames, mobilityNeeds, requestedCount));
      }
    } catch (err) {
      console.error("[places] Google Places FAILED — falling back:", err);
    }
  }

  if (isGeminiConfigured()) {
    try {
      const places = await searchGeminiPlaces(city, category, filters, dna, mobilityNeeds, excludeNames, requestedCount);
      if (places.length > 0) {
        console.log(`[places] Using Gemini-suggested real places for ${city}/${category ?? "general"} (count: ${requestedCount}).`);
        return NextResponse.json(places);
      }
    } catch (err) {
      console.error("[places] Gemini place suggestions FAILED — falling back to mock catalog:", err);
    }
  }

  const results = searchMockPlaces(city, category, dna, filters, excludeNames, requestedCount, mobilityNeeds);
  return NextResponse.json(results);
}

async function searchGooglePlaces(
  city: string,
  category: string | undefined,
  lang: "en" | "ar",
  key: string,
  count: number
): Promise<RecommendedPlace[]> {
  const query = category && category !== "general" ? `${category} attractions in ${city} Saudi Arabia` : `top attractions in ${city} Saudi Arabia`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=${lang}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !Array.isArray(data.results)) {
    throw new Error(`Places API status: ${data.status}`);
  }

  return data.results.slice(0, Math.max(count, 8)).map(
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
  excludeNames: string[],
  count: number
): Promise<RecommendedPlace[]> {
  const result = await generateJSON<{ places: GeminiPlaceSuggestion[] }>({
    system:
      `You are a knowledgeable Saudi tourism guide. Suggest exactly ${count} REAL, currently-existing, well-known ` +
      "places to visit in the given Saudi city that match the requested category and the traveler's " +
      "Travel DNA. NEVER invent a fictional place — only suggest real attractions you're confident " +
      "actually exist. For coordinates, give your best genuine estimate of the real latitude/longitude " +
      "(you may know these from general geography) — do not guess wildly or use placeholder numbers. " +
      "If the traveler stated mobility/accessibility needs, prioritize places that would genuinely be " +
      "easier to access and say so honestly in accessibilityInfo. IMPORTANT: name and nameAr must be SHORT " +
      "— just the actual place name (a few words), never a sentence or description. " +
      "Respond with ONLY valid JSON: " +
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

  const looksLikeAName = (s: string | undefined) => Boolean(s) && s!.length <= 60 && s!.split(" ").length <= 8;

  return (result.places || [])
    .filter((p) => !excludeNames.includes(p.name) && looksLikeAName(p.name) && p.reasonEn && p.reasonAr)
    .slice(0, count)
    .map(
      (p): RecommendedPlace => ({
        id: p.name.replace(/\s+/g, "-").toLowerCase(),
        name: p.name,
        nameAr: looksLikeAName(p.nameAr) ? p.nameAr : undefined,
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

function rankByDNA(
  places: RecommendedPlace[],
  dna: TravelDNA,
  filters: IntentFilters,
  excludeNames: string[],
  mobilityNeeds: string,
  count: number
): RecommendedPlace[] {
  const filtered = places.filter((p) => !excludeNames.includes(p.name));
  const limitedMobility = isLimitedMobility(mobilityNeeds);
  const scored = filtered.map((p) => {
    let score = 0;
    if (p.crowdLevel === "high") score -= (100 - dna.crowdTolerance) * 0.5;
    if (p.crowdLevel === "low") score += dna.quietPreference * 0.3;
    if (filters.quiet && p.crowdLevel !== "low") score -= 20;
    if (limitedMobility && p.crowdLevel === "high") score -= 15;
    return { p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.p);
}
