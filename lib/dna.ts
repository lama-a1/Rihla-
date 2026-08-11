import { DNAChangeLogEntry, DNASignals, FeedbackType, RecommendedPlace, TravelDNA } from "./types";

// Caps how much any single interaction can move a trait. This is the crux of
// "do not let one message completely change the profile" — signals from
// Gemini (or the fallback keyword extractor) are always small nudges that
// accumulate over a session, never a full rewrite.
const MAX_NUDGE_PER_INTERACTION = 8;

export const DEFAULT_DNA: TravelDNA = {
  history: 50,
  culture: 50,
  nature: 50,
  food: 50,
  photography: 50,
  shopping: 50,
  adventure: 50,
  quietPreference: 50,
  crowdTolerance: 50,
  walkingTolerance: 50,
  budgetSensitivity: 50,
  indoorPreference: 50,
  hiddenGemsPreference: 50,
};

/**
 * Applies a set of small trait deltas to a Travel DNA profile, clamping each
 * delta to +/-MAX_NUDGE_PER_INTERACTION and each resulting trait to 0-100.
 * Returns the updated profile plus a change log entry per trait that moved,
 * so the UI can show "Your Travel DNA evolved" with the specifics.
 */
export function applyDNASignals(
  dna: TravelDNA,
  signals: DNASignals,
  reason: string
): { dna: TravelDNA; changeLog: DNAChangeLogEntry[] } {
  const next = { ...dna };
  const changeLog: DNAChangeLogEntry[] = [];
  const now = Date.now();

  (Object.keys(signals) as (keyof TravelDNA)[]).forEach((key) => {
    const raw = signals[key];
    if (typeof raw !== "number" || raw === 0) return;
    const capped = Math.max(-MAX_NUDGE_PER_INTERACTION, Math.min(MAX_NUDGE_PER_INTERACTION, raw));
    const current = next[key];
    const updated = Math.max(0, Math.min(100, current + capped));
    if (updated === current) return;
    next[key] = updated;
    changeLog.push({ timestamp: now, trait: key, delta: updated - current, reason });
  });

  return { dna: next, changeLog };
}

/**
 * Maps a quick feedback tap/voice command to DNA signals. Feedback is tied
 * to whichever place it's about, so category-specific traits (history,
 * photography, etc.) move too, not just the generic trait.
 */
export function feedbackToDNASignals(type: FeedbackType, place?: RecommendedPlace | null): DNASignals {
  const categoryTrait = categoryToTrait(place?.category);

  switch (type) {
    case "loved":
      return categoryTrait ? { [categoryTrait]: 6 } : {};
    case "okay":
      return {};
    case "too_crowded":
      return { crowdTolerance: -8, quietPreference: 5 };
    case "too_hot":
      return { indoorPreference: 5 };
    case "too_tired":
      return { walkingTolerance: -6, adventure: -3 };
    case "too_much_walking":
      return { walkingTolerance: -8 };
   case "too_expensive":
      return { budgetSensitivity: 8 };
    case "great_for_photography":
      return { photography: 6 };
    case "quiet_and_relaxing":
      return { quietPreference: 6 };
    default:
      return {};
  }
}

export function ratingToDNASignals(rating: number, place?: RecommendedPlace | null): DNASignals {
  const categoryTrait = categoryToTrait(place?.category);
  if (!categoryTrait) return {};

  if (rating >= 4.5) return { [categoryTrait]: 8 };
  if (rating >= 3.5) return { [categoryTrait]: 4 };
  if (rating === 3) return {};
  if (rating >= 2) return { [categoryTrait]: -4 };
  return { [categoryTrait]: -8 };
}

export function mergeDNASignals(a: DNASignals, b: DNASignals): DNASignals {
  const merged: DNASignals = { ...a };
  (Object.keys(b) as (keyof TravelDNA)[]).forEach((key) => {
    merged[key] = (merged[key] ?? 0) + (b[key] ?? 0);
  });
  return merged;
}
function categoryToTrait(category?: string): keyof TravelDNA | null {
  switch (category) {
    case "history":
      return "history";
    case "culture":
      return "culture";
    case "nature":
      return "nature";
    case "food":
      return "food";
    case "photography":
      return "photography";
    case "shopping":
      return "shopping";
    default:
      return null;
  }
}

/** A short human-readable label derived live from the current DNA scores. */
export function describeDNA(dna: TravelDNA, lang: "en" | "ar" = "en"): string {
  const entries = Object.entries(dna) as [keyof TravelDNA, number][];
  const [topTrait] = [...entries].sort((a, b) => b[1] - a[1]);

  const labelsEn: Record<keyof TravelDNA, string> = {
    history: "history and heritage",
    culture: "culture and the arts",
    nature: "nature and open landscapes",
    food: "local food",
    photography: "photography",
    shopping: "shopping",
    adventure: "adventure",
    quietPreference: "quiet places",
    crowdTolerance: "lively, busy spots",
    walkingTolerance: "long walks",
    budgetSensitivity: "budget-friendly options",
    indoorPreference: "indoor spaces",
    hiddenGemsPreference: "hidden gems",
  };

  const labelsAr: Record<keyof TravelDNA, string> = {
    history: "التاريخ والتراث",
    culture: "الثقافة والفنون",
    nature: "الطبيعة والمساحات المفتوحة",
    food: "الطعام المحلي",
    photography: "التصوير",
    shopping: "التسوق",
    adventure: "المغامرة",
    quietPreference: "الأماكن الهادئة",
    crowdTolerance: "الأماكن الحيوية والمزدحمة",
    walkingTolerance: "المشي لمسافات طويلة",
    budgetSensitivity: "الخيارات الاقتصادية",
    indoorPreference: "الأماكن المغلقة",
    hiddenGemsPreference: "الأماكن الخفية",
  };

  if (lang === "ar") {
    return `يميل حاليًا نحو ${labelsAr[topTrait[0]]} ، وسيصبح أوضح كل ما تحدثت أكثر.`;
  }
  return `Leaning toward ${labelsEn[topTrait[0]]} so far , this will sharpen as you chat more.`;
}
