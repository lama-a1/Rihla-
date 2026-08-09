import { FeedbackType } from "./types";

// Simple, dependency-free keyword matcher for voice feedback. Works on the
// raw transcript from the browser's SpeechRecognition API. Order matters —
// more specific phrases are checked before generic ones.

interface Rule {
  type: FeedbackType;
  keywords: string[];
}

const RULES: Rule[] = [
  { type: "too_crowded", keywords: ["crowded", "too many people", "busy", "مزدحم", "زحمة", "ازدحام"] },
  { type: "too_hot", keywords: ["too hot", "hot", "heat", "حار", "سخون", "حرارة"] },
  { type: "too_much_walking", keywords: ["too much walking", "too far", "long walk", "مشي كثير", "مشيت كثير", "بعيد"] },
  { type: "too_tired", keywords: ["tired", "exhausted", "need rest", "تعبان", "تعب", "مرهق"] },
  { type: "too_expensive", keywords: ["expensive", "too pricey", "costly", "غالي", "مكلف", "غاليه"] },
  { type: "loved", keywords: ["loved it", "love it", "amazing", "beautiful", "great", "أحببته", "حلو", "رائع", "جميل"] },
  { type: "okay", keywords: ["okay", "ok", "fine", "not bad", "مقبول", "عادي", "تمام"] },
];

/**
 * Matches a spoken transcript to a feedback type, or null if nothing matched
 * confidently enough. Case-insensitive, substring-based — deliberately
 * simple so it works offline with no extra AI call for the common case.
 */
export function matchVoiceFeedback(transcript: string): FeedbackType | null {
  const text = transcript.toLowerCase().trim();
  if (!text) return null;
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k.toLowerCase()))) {
      return rule.type;
    }
  }
  return null;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}
