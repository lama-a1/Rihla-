// Core domain types shared across the app, API routes, and Gemini prompts.
//
// PHASE 3 UPDATE: TravelDNA now matches the natural-interaction field set
// (see project brief) instead of the old questionnaire-derived shape.
// Everything else that consumed the old shape (mockData scoring, DNAHelix
// labels, the feedback→DNA mapping) has been updated alongside this file.

export type Lang = "en" | "ar";

// --- Travel DNA -------------------------------------------------------

export interface TravelDNA {
  history: number;
  culture: number;
  nature: number;
  food: number;
  photography: number;
  shopping: number;
  adventure: number;
  quietPreference: number;
  crowdTolerance: number;
  walkingTolerance: number;
  budgetSensitivity: number;
  indoorPreference: number;
  hiddenGemsPreference: number;
}

// Small, capped deltas — never a full profile. Applied via lib/dna.ts.
export type DNASignals = Partial<Record<keyof TravelDNA, number>>;

export interface DNAChangeLogEntry {
  timestamp: number;
  trait: keyof TravelDNA;
  delta: number;
  reason: string;
}

// --- Chat intent (Gemini output) ---------------------------------------

export interface IntentFilters {
  quiet?: boolean;
  indoor?: boolean;
  lowWalking?: boolean;
  cheap?: boolean;
  hiddenGem?: boolean;
}

export interface IntentResult {
  intentSummary: string;
  category: "history" | "nature" | "food" | "culture" | "shopping" | "photography" | "general";
  filters: IntentFilters;
  dnaSignals: DNASignals;
  replyText: string;
}

// --- Places / recommendations ------------------------------------------

export interface RecommendedPlace {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  reason: string;
  reasonAr?: string;
  lat: number;
  lng: number;
  costSAR?: number;
  crowdLevel?: "low" | "medium" | "high";
  walkingLevel?: "low" | "moderate" | "high";
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  accessibilityInfo?: string;
  accessibilityInfoAr?: string;
  mapQuery: string;
  source: "places" | "mock";
}

// --- Directions -----------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  mode: "walking" | "driving";
  source: "google" | "estimate";
}

// --- Weather / prayer (unchanged from earlier phase) --------------------

export interface WeatherInfo {
  city: string;
  tempC: number;
  condition: string;
  feelsLikeC: number;
}

export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

// --- Feedback -----------------------------------------------------------

export type FeedbackType =
  | "loved"
  | "okay"
  | "too_crowded"
  | "too_hot"
  | "too_tired"
  | "too_much_walking"
  | "too_expensive";

export interface FeedbackEvent {
  id: string;
  placeId: string;
  type: FeedbackType;
  timestamp: number;
}
