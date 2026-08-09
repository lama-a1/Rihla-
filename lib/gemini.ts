import { GoogleGenerativeAI } from "@google/generative-ai";

// Central place for all Gemini calls. Every route calls `generateJSON`, which
// always returns parsed JSON or throws — callers are expected to catch and
// fall back to lib/mockData.ts so the app never breaks during a demo.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Calls Gemini with a system + user prompt and asks for strict JSON output.
 * Throws if the API key is missing, the request fails, or the response
 * cannot be parsed as JSON — callers should catch and use a mock fallback.
 */
export async function generateJSON<T>(params: {
  system: string;
  prompt: string;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: params.system,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(params.prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}
