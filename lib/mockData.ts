import {
  DirectionsResult,
  IntentFilters,
  LatLng,
  PrayerTimes,
  RecommendedPlace,
  TravelDNA,
  WeatherInfo,
} from "./types";

// ---------------------------------------------------------------------------
// Realistic Saudi tourism demo data. Used as a safety net if Gemini/Places/
// Directions keys are missing or a request fails, so the demo never breaks.
// ---------------------------------------------------------------------------

export interface PlaceSeed {
  name: string;
  nameAr: string;
  category: "history" | "nature" | "food" | "culture" | "shopping" | "photography";
  crowdLevel: "low" | "medium" | "high";
  indoorOutdoor: "indoor" | "outdoor" | "mixed";
  walkingLevel: "low" | "moderate" | "high";
  costSAR: number;
  durationMinutes: number;
  mapQuery: string;
  lat: number;
  lng: number;
  quietAlternativeOf?: string; // name of the busier place this can replace
}

export const CITIES = ["Riyadh", "Jeddah", "AlUla", "Diriyah", "Abha", "Madinah"];

export const CITY_CENTERS: Record<string, LatLng> = {
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Jeddah: { lat: 21.5433, lng: 39.1728 },
  AlUla: { lat: 26.6094, lng: 37.9236 },
  Diriyah: { lat: 24.7386, lng: 46.575 },
  Abha: { lat: 18.2465, lng: 42.5117 },
  Madinah: { lat: 24.5247, lng: 39.5692 },
};

export const PLACES: Record<string, PlaceSeed[]> = {
  Riyadh: [
    { name: "At-Turaif District", nameAr: "حي الطريف", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 45, durationMinutes: 120, mapQuery: "At-Turaif District Diriyah Riyadh", lat: 24.7333, lng: 46.575 },
    { name: "National Museum of Saudi Arabia", nameAr: "المتحف الوطني السعودي", category: "history", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 10, durationMinutes: 90, mapQuery: "National Museum of Saudi Arabia Riyadh", lat: 24.6408, lng: 46.7099, quietAlternativeOf: "At-Turaif District" },
    { name: "Edge of the World", nameAr: "حافة العالم", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 180, mapQuery: "Edge of the World Riyadh", lat: 24.9756, lng: 45.9114 },
    { name: "Wadi Namar", nameAr: "وادي نمار", category: "nature", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Wadi Namar Riyadh", lat: 24.5735, lng: 46.7247 },
    { name: "Kingdom Centre Sky Bridge", nameAr: "جسر مركز المملكة", category: "photography", crowdLevel: "high", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 70, durationMinutes: 45, mapQuery: "Kingdom Centre Sky Bridge Riyadh", lat: 24.7116, lng: 46.6753 },
    { name: "Riyadh Calligraphy House", nameAr: "بيت الرياض للخط", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Riyadh Calligraphy House", lat: 24.6877, lng: 46.6857, quietAlternativeOf: "Kingdom Centre Sky Bridge" },
    { name: "Souq Al Zal", nameAr: "سوق الزل", category: "shopping", crowdLevel: "medium", indoorOutdoor: "mixed", walkingLevel: "moderate", costSAR: 0, durationMinutes: 75, mapQuery: "Souq Al Zal Riyadh", lat: 24.6274, lng: 46.7136 },
    { name: "Najd Village Restaurant", nameAr: "قرية نجد", category: "food", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 90, durationMinutes: 75, mapQuery: "Najd Village Restaurant Riyadh", lat: 24.6913, lng: 46.6851 },
  ],
  Jeddah: [
    { name: "Al-Balad Historic District", nameAr: "البلد التاريخية", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 150, mapQuery: "Al-Balad Jeddah", lat: 21.4839, lng: 39.1827 },
    { name: "Naseef House Museum", nameAr: "بيت نصيف", category: "history", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 15, durationMinutes: 60, mapQuery: "Naseef House Jeddah", lat: 21.4846, lng: 39.1839, quietAlternativeOf: "Al-Balad Historic District" },
    { name: "Jeddah Corniche", nameAr: "كورنيش جدة", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "Jeddah Corniche", lat: 21.5433, lng: 39.0996 },
    { name: "King Fahd Fountain", nameAr: "نافورة الملك فهد", category: "photography", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 30, mapQuery: "King Fahd Fountain Jeddah", lat: 21.5624, lng: 39.1 },
    { name: "Al Shallal Theme Park", nameAr: "الشلال", category: "photography", crowdLevel: "low", indoorOutdoor: "mixed", walkingLevel: "low", costSAR: 50, durationMinutes: 60, mapQuery: "Al Shallal Jeddah", lat: 21.573, lng: 39.15, quietAlternativeOf: "King Fahd Fountain" },
    { name: "Baik Fahad", nameAr: "بيك فهد", category: "food", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 35, durationMinutes: 45, mapQuery: "Baik Fahad Jeddah", lat: 21.5433, lng: 39.1728 },
  ],
  AlUla: [
    { name: "Hegra (Madain Salih)", nameAr: "الحِجر (مدائن صالح)", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 150, durationMinutes: 180, mapQuery: "Hegra AlUla", lat: 26.7944, lng: 37.9542 },
    { name: "AlUla Old Town", nameAr: "بلدة العلا القديمة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "AlUla Old Town", lat: 26.61, lng: 37.92, quietAlternativeOf: "Hegra (Madain Salih)" },
    { name: "Elephant Rock", nameAr: "صخرة الفيل", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Elephant Rock AlUla", lat: 26.6294, lng: 37.88 },
    { name: "Maraya Concert Hall", nameAr: "مرايا", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 45, mapQuery: "Maraya AlUla", lat: 26.6103, lng: 37.9247 },
  ],
  Diriyah: [
    { name: "Bujairi Terrace", nameAr: "شرفة البجيري", category: "food", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 100, durationMinutes: 90, mapQuery: "Bujairi Terrace Diriyah", lat: 24.7386, lng: 46.575 },
    { name: "Diriyah Art Futures", nameAr: "مستقبل الفن بالدرعية", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Diriyah Art Futures", lat: 24.735, lng: 46.573, quietAlternativeOf: "Bujairi Terrace" },
  ],
  Abha: [
    { name: "Al Soudah Park", nameAr: "متنزه السودة", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 20, durationMinutes: 120, mapQuery: "Al Soudah Park Abha", lat: 18.27, lng: 42.36 },
    { name: "Habala Village", nameAr: "قرية حبالة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 30, durationMinutes: 90, mapQuery: "Habala Village Abha", lat: 18.12, lng: 42.47 },
  ],
  Madinah: [
    { name: "Quba Mosque", nameAr: "مسجد قباء", category: "history", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Quba Mosque Madinah", lat: 24.4392, lng: 39.6172 },
    { name: "Al-Baqi Cemetery View", nameAr: "البقيع", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 30, mapQuery: "Al Baqi Madinah", lat: 24.47, lng: 39.6117 },
  ],
};

export function getWeatherMock(city: string): WeatherInfo {
  const table: Record<string, WeatherInfo> = {
    Riyadh: { city, tempC: 41, condition: "Sunny", feelsLikeC: 44 },
    Jeddah: { city, tempC: 36, condition: "Humid", feelsLikeC: 39 },
    AlUla: { city, tempC: 38, condition: "Clear", feelsLikeC: 37 },
    Diriyah: { city, tempC: 40, condition: "Sunny", feelsLikeC: 43 },
    Abha: { city, tempC: 24, condition: "Mild, cloudy", feelsLikeC: 23 },
    Madinah: { city, tempC: 39, condition: "Sunny", feelsLikeC: 41 },
  };
  return table[city] ?? { city, tempC: 35, condition: "Sunny", feelsLikeC: 37 };
}

export const CITY_NAMES_AR: Record<string, string> = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  AlUla: "العلا",
  Diriyah: "الدرعية",
  Abha: "أبها",
  Madinah: "المدينة المنورة",
};

export function getPrayerTimesMock(): PrayerTimes {
  return { fajr: "04:35", dhuhr: "12:15", asr: "15:40", maghrib: "18:50", isha: "20:20" };
}

// --- DNA-aware place scoring (Places API fallback) -----------------------

/**
 * Scores how well a place fits the current Travel DNA + this request's
 * filters. Higher is better. Used both to rank the mock Places fallback and
 * as a plain-language basis for the `reason` shown on each recommendation.
 */
export function scorePlaceForDNA(place: PlaceSeed, dna: TravelDNA, filters: IntentFilters): number {
  let score = 0;
  const traitByCategory: Record<string, number> = {
    history: dna.history,
    culture: dna.culture,
    nature: dna.nature,
    food: dna.food,
    photography: dna.photography,
    shopping: dna.shopping,
  };
  score += traitByCategory[place.category] ?? 0;

  if (place.crowdLevel === "high") score -= (100 - dna.crowdTolerance) * 0.5;
  if (place.crowdLevel === "low") score += dna.quietPreference * 0.3;
  if (place.walkingLevel === "high") score -= (100 - dna.walkingTolerance) * 0.3;
  if (place.indoorOutdoor === "indoor") score += dna.indoorPreference * 0.15;
  if (place.costSAR === 0) score += dna.budgetSensitivity * 0.15;
  else score -= (dna.budgetSensitivity / 100) * place.costSAR * 0.1;

  if (filters.quiet && place.crowdLevel !== "low") score -= 20;
  if (filters.indoor && place.indoorOutdoor === "outdoor") score -= 20;
  if (filters.lowWalking && place.walkingLevel === "high") score -= 20;
  if (filters.cheap && place.costSAR > 40) score -= 20;
  if (filters.hiddenGem && place.crowdLevel === "high") score -= 15;

  return score;
}

function reasonForPlace(place: PlaceSeed, dna: TravelDNA, filters: IntentFilters, lang: "en" | "ar" = "en"): string {
  if (lang === "ar") {
    if (filters.quiet && place.crowdLevel === "low") return "مكان هادئ يناسب اللي طلبته.";
    if (filters.indoor && place.indoorOutdoor === "indoor") return "مكان مغلق، حسب طلبك.";
    if (filters.cheap && place.costSAR === 0) return "مجاني — يناسب الميزانية المحدودة.";
    if (place.category === "history" && dna.history >= 60) return "يناسب اهتمامك المتزايد بالتاريخ.";
    if (place.category === "photography" && dna.photography >= 60) return "فرصة تصوير رائعة، حسب حمضك النووي للسفر حاليًا.";
    if (place.crowdLevel === "low" && dna.crowdTolerance < 45) return "ازدحام قليل — يناسب تفضيلك حاليًا.";
    return "يطابق حمضك النووي للسفر الحالي بشكل جيد.";
  }
  if (filters.quiet && place.crowdLevel === "low") return "A quiet spot that matches what you asked for.";
  if (filters.indoor && place.indoorOutdoor === "indoor") return "Indoors, as requested.";
  if (filters.cheap && place.costSAR === 0) return "Free — fits a tighter budget.";
  if (place.category === "history" && dna.history >= 60) return "Matches your growing interest in history.";
  if (place.category === "photography" && dna.photography >= 60) return "Great photo opportunity, based on your DNA so far.";
  if (place.crowdLevel === "low" && dna.crowdTolerance < 45) return "Low crowds — fits your preference so far.";
  return "A solid match for your current Travel DNA.";
}

/**
 * Mock stand-in for the Google Places API. Ranks the local catalog by DNA
 * fit and returns it in the same RecommendedPlace shape the real API route
 * returns, so callers never need to know which source served the result.
 */
export function searchMockPlaces(
  city: string,
  category: string | undefined,
  dna: TravelDNA,
  filters: IntentFilters,
  excludeNames: string[] = [],
  limit = 5,
  lang: "en" | "ar" = "en"
): RecommendedPlace[] {
  const pool = (PLACES[city] ?? PLACES.Riyadh).filter((p) => !excludeNames.includes(p.name));
  const scoped = category && category !== "general" ? pool.filter((p) => p.category === category) : pool;
  const candidates = scoped.length > 0 ? scoped : pool;

  return candidates
    .map((p) => ({ p, score: scorePlaceForDNA(p, dna, filters) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => placeToRecommendation(p, dna, filters, lang));
}

function placeToRecommendation(p: PlaceSeed, dna: TravelDNA, filters: IntentFilters, lang: "en" | "ar" = "en"): RecommendedPlace {
  return {
    id: p.name.replace(/\s+/g, "-").toLowerCase(),
    name: p.name,
    nameAr: p.nameAr,
    category: p.category,
    reason: reasonForPlace(p, dna, filters, lang),
    lat: p.lat,
    lng: p.lng,
    costSAR: p.costSAR,
    crowdLevel: p.crowdLevel,
    walkingLevel: p.walkingLevel,
    indoorOutdoor: p.indoorOutdoor,
    mapQuery: p.mapQuery,
    source: "mock",
  };
}

// --- Directions fallback (no Google Directions key) ----------------------

/** Great-circle distance in meters between two coordinates. */
export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Straight-line distance + a rough speed-based ETA. Real routes are longer
 * than straight lines, so we pad distance by ~35% to approximate road/path
 * routing without calling any API.
 */
export function estimateDirections(
  origin: LatLng,
  destination: LatLng,
  mode: "walking" | "driving",
  lang: "en" | "ar" = "en"
): DirectionsResult {
  const straightLine = haversineDistanceMeters(origin, destination);
  const distanceMeters = Math.round(straightLine * 1.35);
  const speedMetersPerSecond = mode === "walking" ? 1.3 : 11; // ~4.7 km/h walking, ~40 km/h urban driving
  const durationSeconds = Math.round(distanceMeters / speedMetersPerSecond);

  return {
    distanceMeters,
    durationSeconds,
    distanceText: formatDistance(distanceMeters, lang),
    durationText: formatDuration(durationSeconds, lang),
    mode,
    source: "estimate",
  };
}

function formatDistance(distanceMeters: number, lang: "en" | "ar"): string {
  if (distanceMeters >= 1000) {
    const km = (distanceMeters / 1000).toFixed(1);
    return lang === "ar" ? `${km} كم` : `${km} km`;
  }
  return lang === "ar" ? `${distanceMeters} م` : `${distanceMeters} m`;
}

function formatDuration(totalSeconds: number, lang: "en" | "ar"): string {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) {
    return lang === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (lang === "ar") {
    return rem === 0 ? `${hours} ساعة` : `${hours} ساعة ${rem} دقيقة`;
  }
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}
