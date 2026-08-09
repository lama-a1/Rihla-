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
          "Given their message and current Travel DNA (0-100 scores), extract: (1) their immediate " +
          "tourism intent, (2) SMALL preference signals to nudge their DNA (never large jumps — a single " +
          "message should only move any trait by roughly 3 to 8 points, and only traits actually implied " +
          "by the message). Respond with ONLY valid JSON matching this exact shape: " +
          "{ intentSummary: string (one short phrase, e.g. 'quiet historical place'), " +
          "category: 'history'|'nature'|'food'|'culture'|'shopping'|'photography'|'general', " +
          "filters: { quiet?: boolean, indoor?: boolean, lowWalking?: boolean, cheap?: boolean, hiddenGem?: boolean }, " +
          "dnaSignals: { <any of: history,culture,nature,food,photography,shopping,adventure,quietPreference," +
          "crowdTolerance,walkingTolerance,budgetSensitivity,indoorPreference,hiddenGemsPreference>: number (-8 to 8) }, " +
          `replyText: string (one short, friendly sentence replying to the user, written in ${
            lang === "ar" ? "Arabic" : "English"
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

function fallbackIntent(message: string, lang: "en" | "ar"): IntentResult {
  const text = message.toLowerCase();
  const has = (...keywords: string[]) => keywords.some((k) => text.includes(k));

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

  return {
    intentSummary: category !== "general" ? category : "a place to visit",
    category,
    filters,
    dnaSignals,
    replyText: buildFallbackReply(category, lang),
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

function buildFallbackReply(category: string, lang: "en" | "ar"): string {
  if (lang === "ar") {
    const label = CATEGORY_LABEL_AR[category] ?? "";
    return label ? `هذي بعض الأماكن ${label} اللي ممكن تناسب طلبك.` : "هذي بعض الأماكن اللي ممكن تناسب طلبك.";
  }
  return `Here are a few ${category !== "general" ? category + " " : ""}spots that might fit what you're looking for.`;
}
