"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { FeedbackType, RecommendedPlace } from "@/lib/types";
import { feedbackToDNASignals } from "@/lib/dna";
import { Card } from "./ui/Card";
import { FeedbackBar } from "./FeedbackBar";
import { VoiceFeedbackButton } from "./VoiceFeedbackButton";

const LABELS_EN: Record<FeedbackType, string> = {
  loved: "Loved it",
  okay: "It was okay",
  too_crowded: "Too crowded",
  too_hot: "Too hot",
  too_tired: "I'm tired",
  too_much_walking: "Too much walking",
  too_expensive: "Too expensive",
};

const LABELS_AR: Record<FeedbackType, string> = {
  loved: "أحببته",
  okay: "كان مقبولًا",
  too_crowded: "مزدحم جدًا",
  too_hot: "حار جدًا",
  too_tired: "أشعر بالتعب",
  too_much_walking: "مشي كثير",
  too_expensive: "مكلف جدًا",
};

// Phase 7: feedback about the selected (or most recent) place nudges the
// same Travel DNA the chat updates, then re-fetches recommendations for the
// last request so the *next* suggestions reflect what was just learned —
// the "feedback -> DNA update -> better recommendation" loop from the brief.
//
// Each place can only be rated ONCE per session (tracked via ratedPlaceIds
// in lib/store.tsx). Without this, repeatedly tapping e.g. "Too crowded" on
// the same place would let a single place drag a trait to 0 or 100 — the
// brief calls for gradual evolution across DIFFERENT interactions, not
// unlimited weight from one.

export function FeedbackSection() {
  const {
    addMessage,
    dna,
    city,
    recommendations,
    selectedPlaceId,
    lastIntent,
    nudgeDNA,
    appendRecommendations,
    ratedPlaceIds,
    markPlaceRated,
  } = useApp();
  const { lang, t } = useLang();
  const [lastFeedback, setLastFeedback] = useState<FeedbackType | null>(null);
  const [busy, setBusy] = useState(false);

  const LABELS = lang === "ar" ? LABELS_AR : LABELS_EN;

  const targetPlace: RecommendedPlace | undefined =
    recommendations.find((p) => p.id === selectedPlaceId) ?? recommendations[0];

  const alreadyRated = targetPlace ? ratedPlaceIds.includes(targetPlace.id) : false;

  const handleFeedback = async (type: FeedbackType, transcript?: string) => {
    if (!targetPlace || alreadyRated) return;
    setLastFeedback(type);
    setBusy(true);

    const signals = feedbackToDNASignals(type, targetPlace);
    const changeLog = nudgeDNA(signals, `Feedback on ${targetPlace.name}: ${type}`);
    markPlaceRated(targetPlace.id);

    const traitSummary = changeLog
      .map((c) => `${t(c.trait as any)} ${c.delta > 0 ? "+" : ""}${c.delta}`)
      .join(lang === "ar" ? "، " : ", ");

    const evolvedText =
      changeLog.length > 0
        ? lang === "ar"
          ? `تطور حمضك النووي للسفر: ${traitSummary}`
          : `Your Travel DNA evolved: ${traitSummary}`
        : lang === "ar"
        ? "تم تسجيل الملاحظة."
        : "Feedback logged.";

    addMessage({
      role: "assistant",
      text: `${LABELS[type]}${transcript ? ` ("${transcript}")` : ""} — ${evolvedText}`,
    });

    // Fetch new recommendations reflecting the just-updated DNA and ADD them
    // to the panel — the place just rated stays visible (now shown as
    // already-rated) instead of disappearing.
    if (lastIntent) {
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city,
            category: lastIntent.category,
            filters: lastIntent.filters,
            dna: { ...dna, ...applyDeltas(dna, changeLog) },
            excludeNames: recommendations.map((p) => p.name),
            lang,
          }),
        });
        const places = await res.json();
        appendRecommendations(places);
        addMessage({
          role: "assistant",
          text: lang === "ar" ? "أضفت توصيات جديدة بناءً على ملاحظتك." : "Added new recommendations based on your feedback.",
        });
      } catch {
        // non-critical — DNA still updated even if re-fetch fails
      }
    }
    setBusy(false);
  };

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg text-ink mb-1">{lang === "ar" ? "كيف كانت تجربتك؟" : "How was your experience?"}</h2>
      <p className="text-xs text-ink-faint mb-4">
        {targetPlace
          ? lang === "ar"
            ? `عن: ${lang === "ar" && targetPlace.nameAr ? targetPlace.nameAr : targetPlace.name}`
            : `About: ${targetPlace.name}`
          : lang === "ar"
          ? "اطلب مكانًا أولًا لتترك ملاحظة عليه"
          : "Ask for a place first to leave feedback on it"}
      </p>

      {alreadyRated ? (
        <p className="text-sm text-oasis-bright text-center py-4">
          {lang === "ar" ? "قيّمت هذا المكان قبل كذا — جرّب اطلب مكان ثاني." : "You already rated this place — ask for another one."}
        </p>
      ) : (
        <>
          <FeedbackBar onSelect={handleFeedback} disabled={busy || !targetPlace} />
          <div className="mt-4 flex justify-center">
            <VoiceFeedbackButton onDetected={handleFeedback} disabled={busy || !targetPlace} />
          </div>
        </>
      )}

      {lastFeedback && (
        <p className="mt-3 text-center text-xs text-oasis-bright">
          {lang === "ar" ? "آخر ملاحظة: " : "Last feedback: "}
          {LABELS[lastFeedback]}
        </p>
      )}
    </Card>
  );
}

// Small helper: the DNA in context updates asynchronously via setState, so
// for the immediate re-fetch we apply the same deltas locally to avoid a
// stale read on the very next call.
function applyDeltas(dna: Record<string, any>, changeLog: { trait: string; delta: number }[]) {
  const patch: Record<string, number> = {};
  for (const c of changeLog) {
    const current = dna[c.trait];
    if (typeof current === "number") patch[c.trait] = Math.max(0, Math.min(100, current + c.delta));
  }
  return patch;
}
