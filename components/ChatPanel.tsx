"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { IntentResult, RecommendedPlace } from "@/lib/types";
import { detectCityMention } from "@/lib/mockData";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

// The core "natural interaction" loop:
//   user message -> /api/intent (Gemini, JSON mode, mock fallback)
//     -> small DNA nudge applied locally via lib/dna.ts
//     -> /api/places (Google Places, mock fallback) using the intent + DNA
//     -> recommendations rendered in RecommendationCards + as map pins

export function ChatPanel() {
  const { messages, addMessage, dna, city, nudgeDNA, setRecommendations, setLastIntent, recommendations, mobilityNeeds, setCity } =
    useApp();
  const { lang } = useLang();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    addMessage({ role: "user", text });
    setDraft("");
    setSending(true);

    // An explicitly named city (e.g. "somewhere in Jeddah") always overrides
    // the auto-detected location, per lib/store.tsx#setCity's `manual` flag.
    const mentionedCity = detectCityMention(text);
    const effectiveCity = mentionedCity ?? city;
    if (mentionedCity) setCity(mentionedCity, true);

    try {
      const intentRes = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, dna, city: effectiveCity, lang }),
      });
      const intent: IntentResult = await intentRes.json();

      // Greetings / unsupported requests (e.g. "book a hotel") skip the
      // places search entirely — Rihla replies honestly instead of
      // returning unrelated tourist attractions as if it understood.
      if (intent.noSearch) {
        addMessage({ role: "assistant", text: intent.replyText });
        setSending(false);
        return;
      }

      const changeLog = nudgeDNA(intent.dnaSignals, `Asked: "${text}"`);
      setLastIntent({ category: intent.category, filters: intent.filters });

      const placesRes = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: effectiveCity,
          category: intent.category,
          filters: intent.filters,
          dna,
          excludeNames: recommendations.map((p) => p.name),
          lang,
          mobilityNeeds,
          count: intent.requestedCount,
        }),
      });
      const places: RecommendedPlace[] = await placesRes.json();
      setRecommendations(places);

      const evolvedNote =
        changeLog.length > 0
          ? lang === "ar"
            ? " (تطور حمضك النووي للسفر قليلاً بناءً على هذا)"
            : " (your Travel DNA shifted a little based on this)"
          : "";
      addMessage({ role: "assistant", text: `${intent.replyText}${evolvedNote}` });
    } catch (err) {
      addMessage({
        role: "assistant",
        text: lang === "ar" ? "حصل خطأ، حاول مرة أخرى." : "Something went wrong — try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-5 flex flex-col h-full min-h-[300px]">
      <h2 className="font-display text-lg text-ink mb-1">{lang === "ar" ? "اسأل رحلة" : "Ask Rihla"}</h2>
      <p className="text-xs text-ink-faint mb-4">
        {lang === "ar"
          ? 'مثال: "أرغب في زيارة مكان تاريخي هادئ بالقرب مني" أو "أبحث عن مكان مناسب للتصوير"'
          : 'e.g. "I want a quiet historical place nearby" or "somewhere good for photography"'}
      </p>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 mb-4 min-h-[130px]">
        {messages.length === 0 && (
          <p className="text-sm text-ink-faint italic">
            {lang === "ar" ? "لا توجد رسائل بعد ، جرّب تكتب طلبك." : "No messages yet , try typing a request."}
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl2 px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-oasis text-night" : "bg-night-soft text-ink-muted border border-night-line"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-oasis-bright animate-pulseSlow">{lang === "ar" ? "يفكر..." : "Thinking..."}</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={lang === "ar" ? "اكتب طلبك هنا..." : "Type your request..."}
          className="flex-1 rounded-xl2 border border-night-line bg-night-soft px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-oasis"
        />
        <Button onClick={send} disabled={!draft.trim() || sending} className="px-5 py-2.5 text-sm">
          {lang === "ar" ? "إرسال" : "Send"}
        </Button>
      </div>
    </Card>
  );
}
