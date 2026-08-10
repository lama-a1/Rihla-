import { NextRequest, NextResponse } from "next/server";
import { generateJSON, isGeminiConfigured } from "@/lib/gemini";
import { IntentResult, TravelDNA } from "@/lib/types";

interface Body {
  message: string;
  dna: TravelDNA;
  city: string;
  lang?: "en" | "ar";
}

export async function POST(req: NextRequest) {
  const { message, dna, city, lang = "en" }: Body = await req.json();

  if (isGeminiConfigured()) {
    try {
      const result = await generateJSON<IntentResult>({
        system:
          "You are Rihla's intent engine for a Saudi tourism assistant. The user does NOT fill out a " +
          "questionnaire — you learn their Travel DNA gradually from natural messages like this one. " +
          "Rihla ONLY recommends real places/attractions in Saudi Arabia — it does NOT book hotels, " +
          "flights, cars, restaurants tables, or anything else, and it doesn't have live crowd/event data. " +
          "\n\nStep 1: decide if this message is actually asking for a place recommendation. " +
          "If it's a greeting or small talk (e.g. 'hi', 'how are you'), or a request for something Rihla " +
          "doesn't do (booking a hotel, flight, table, etc.), set noSearch: true, leave dnaSignals and " +
          "filters empty, and write a SPECIFIC honest replyText addressing exactly what they said (for a " +
          "greeting, greet them back and invite a request; for an unsupported request, say plainly Rihla " +
          "suggests places to visit but doesn't handle bookings, and ask what kind of place they'd like). " +
          "\n\nStep 2 (only if it IS a place request): extract (1) their tourism intent, (2) SMALL preference " +
          "signals to nudge their DNA (never large jumps — a single message should only move any trait by " +
          "roughly 3 to 8 points, and only traits actually implied by the message), and write a replyText " +
          "that reflects what they specifically asked for (don't reuse a generic template).\n\n" +
          "Respond with ONLY valid JSON matching this exact shape: " +
          "{ noSearch: boolean, intentSummary: string (one short phrase, e.g. 'quiet historical place'), " +
          "category: 'history'|'nature'|'food'|'culture'|'shopping'|'photography'|'general', " +
          "filters: { quiet?: boolean, indoor?: boolean, lowWalking?: boolean, cheap?: boolean, hiddenGem?: boolean }, " +
          "dnaSignals: { <any of: history,culture,nature,food,photography,shopping,adventure,quietPreference," +
          "crowdTolerance,walkingTolerance,budgetSensitivity,indoorPreference,hiddenGemsPreference>: number (-8 to 8) }, " +
          `replyText: string (a specific, friendly sentence actually addressing their message, written in ${
            lang === "ar" ? "formal Modern Standard Arabic (no colloquial dialect)" : "English"
          } regardless of what language the user's message was in) }. ` +
          "No prose outside the JSON.",
        prompt: `City: ${city}\nCurrent Travel DNA: ${JSON.stringify(dna)}\nUser message: ${message}`,
      });
      return NextResponse.json(result);
    } catch (err) {
      console.error("Gemini intent extraction failed, using fallback:", err);
    }
  }

  return NextResponse.json(fallbackIntent(message, lang));
}

// --- Deterministic fallback: simple keyword matching (EN + AR) -----------

const GREETING_WORDS = [
  "hi", "hello", "hey", "yo", "good morning", "good evening",
  "مرحبا", "مرحباً", "هلا", "هاي", "السلام عليكم", "صباح الخير", "مساء الخير", "أهلا", "اهلا",
];

const UNSUPPORTED_WORDS = [
  "book a hotel", "hotel booking", "reserve a hotel", "book a flight", "flight ticket",
  "book a table", "rent a car", "car rental",
  "احجز فندق", "حجز فندق", "احجز طيران", "تذكرة طيران", "احجز طاولة", "أجر سيارة", "استئجار سيارة",
];

function fallbackIntent(message: string, lang: "en" | "ar"): IntentResult {
  const text = message.toLowerCase().trim();
  const tokens = text.split(/[\s,.!?؟،]+/).filter(Boolean);

  // Substring match for longer/multi-word phrases, but EXACT token match
  // for short words (avoids false positives like "hi" matching inside
  // "historical", or "eat" matching inside "heat").
  const has = (...keywords: string[]) =>
    keywords.some((k) => (k.length <= 3 && !k.includes(" ") ? tokens.includes(k) : text.includes(k)));

  // Greetings and small talk — don't pretend to search, just greet back.
  if (has(...GREETING_WORDS) && text.length < 30) {
    return {
      noSearch: true,
      intentSummary: "greeting",
      category: "general",
      filters: {},
      dnaSignals: {},
      replyText:
        lang === "ar"
          ? "أهلاً بك! أخبرني عن نوع المكان الذي تبحث عنه (تاريخي، طبيعي، مطاعم...) وسأقترح عليك أماكن تناسبك."
          : "Hey there! Tell me what kind of place you're after (history, nature, food...) and I'll suggest some spots.",
    };
  }

  // Requests Rihla genuinely can't do — say so honestly instead of
  // silently returning unrelated tourist attractions.
  if (has(...UNSUPPORTED_WORDS) || has("hotel", "فندق") || has("flight", "طيران")) {
    return {
      noSearch: true,
      intentSummary: "unsupported request",
      category: "general",
      filters: {},
      dnaSignals: {},
      replyText:
        lang === "ar"
          ? "رحلة تقترح أماكن للزيارة فقط، ولا تقوم بحجز الفنادق أو تذاكر الطيران. هل ترغب أن أقترح عليك أماكن سياحية بدلاً من ذلك؟"
          : "Rihla suggests places to visit, but doesn't book hotels or flights. Want me to suggest some attractions instead?",
    };
  }

  const filters: IntentResult["filters"] = {};
  const dnaSignals: IntentResult["dnaSignals"] = {};
  let category: IntentResult["category"] = "general";

  if (has("quiet", "peaceful", "هادئ", "هادي")) {
    filters.quiet = true;
    dnaSignals.quietPreference = 6;
    dnaSignals.crowdTolerance = -4;
  }
  if (has("history", "historical", "heritage", "تاريخ", "تاريخي")) {
    category = "history";
    dnaSignals.history = 6;
  }
  if (has("nature", "outdoor", "hike", "طبيعة")) {
    category = "nature";
    dnaSignals.nature = 6;
  }
  if (has("photo", "photography", "instagram", "تصوير")) {
    category = "photography";
    dnaSignals.photography = 6;
  }
  if (has("food", "eat", "restaurant", "طعام", "مطعم", "أكل")) {
    category = "food";
    dnaSignals.food = 5;
  }
  if (has("shopping", "souq", "mall", "تسوق", "سوق")) {
    category = "shopping";
    dnaSignals.shopping = 5;
  }
  if (has("culture", "art", "museum", "ثقافة", "متحف")) {
    category = category === "general" ? "culture" : category;
    dnaSignals.culture = 5;
  }
  if (has("cheap", "budget", "inexpensive", "رخيص", "اقتصادي")) {
    filters.cheap = true;
    dnaSignals.budgetSensitivity = 6;
  }
  if (has("don't want to walk", "not much walking", "low walking", "no walking", "مشي قليل", "ما أبي أمشي")) {
    filters.lowWalking = true;
    dnaSignals.walkingTolerance = -6;
  }
  if (has("indoor", "inside", "داخلي", "مغلق")) {
    filters.indoor = true;
    dnaSignals.indoorPreference = 6;
  }
  if (has("hidden gem", "not crowded", "less crowded", "off the beaten path", "مكان غير مزدحم", "أماكن خفية")) {
    filters.hiddenGem = true;
    dnaSignals.hiddenGemsPreference = 5;
    dnaSignals.crowdTolerance = (dnaSignals.crowdTolerance ?? 0) - 4;
  }

  const matchedSomething = category !== "general" || Object.keys(filters).length > 0;

  return {
    noSearch: false,
    intentSummary: category !== "general" ? category : "a place to visit",
    category,
    filters,
    dnaSignals,
    replyText: buildFallbackReply(category, lang, matchedSomething),
  };
}

const CATEGORY_LABEL_AR: Record<string, string> = {
  history: "تاريخية",
  nature: "طبيعية",
  food: "طعام",
  culture: "ثقافية",
  shopping: "تسوق",
  photography: "تصوير",
  general: "",
};

function buildFallbackReply(category: string, lang: "en" | "ar", matchedSomething: boolean): string {
  if (!matchedSomething) {
    return lang === "ar"
      ? "لست متأكدًا تمامًا مما تبحث عنه — إليك بعض الأماكن الشائعة يمكنك البدء بها، أو صف لي أكثر ما يعجبك."
      : "Not sure exactly what you're after — here are some popular spots to start, or tell me more about what you like.";
  }
  if (lang === "ar") {
    const label = CATEGORY_LABEL_AR[category] ?? "";
    return label ? `إليك بعض الأماكن ${label} التي قد تناسب طلبك.` : "إليك بعض الأماكن التي قد تناسب طلبك.";
  }
  return `Here are a few ${category !== "general" ? category + " " : ""}spots that might fit what you're looking for.`;
}
