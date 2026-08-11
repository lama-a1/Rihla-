"use client";

import { useState } from "react";
import { Heart, Camera, Leaf, Users, ThermometerSun, BatteryLow, Footprints, Wallet, Minus } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { FeedbackType, RecommendedPlace } from "@/lib/types";
import { feedbackToDNASignals, mergeDNASignals, ratingToDNASignals } from "@/lib/dna";
import { Card } from "./ui/Card";
import { FeedbackBar, FeedbackOption } from "./FeedbackBar";
import { VoiceFeedbackButton } from "./VoiceFeedbackButton";
import { StarRating } from "./StarRating";

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
    ratePlace,
    mobilityNeeds,
  } = useApp();
  const { lang, t } = useLang();
  const [rating, setRating] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<FeedbackType | null>(null);
  const [busy, setBusy] = useState(false);

  const targetPlace: RecommendedPlace | undefined =
    recommendations.find((p) => p.id === selectedPlaceId) ?? recommendations[0];

  const alreadyRated = targetPlace ? ratedPlaceIds.includes(targetPlace.id) : false;

  const REASON_LABELS: Record<FeedbackType, string> = {
    loved: t("loved"),
    okay: t("okay"),
    too_crowded: t("tooCrowded"),
    too_hot: t("tooHot"),
    too_tired: t("tooTired"),
    too_much_walking: t("tooMuchWalking"),
    too_expensive: t("tooExpensive"),
    great_for_photography: t("greatForPhotography"),
    quiet_and_relaxing: t("quietAndRelaxing"),
  };

  const positiveOptions: FeedbackOption[] = [
    { type: "loved", label: REASON_LABELS.loved, Icon: Heart },
    { type: "great_for_photography", label: REASON_LABELS.great_for_photography, Icon: Camera },
    { type: "quiet_and_relaxing", label: REASON_LABELS.quiet_and_relaxing, Icon: Leaf },
  ];
  const negativeOptions: FeedbackOption[] = [
    { type: "too_crowded", label: REASON_LABELS.too_crowded, Icon: Users },
    { type: "too_hot", label: REASON_LABELS.too_hot, Icon: ThermometerSun },
    { type: "too_much_walking", label: REASON_LABELS.too_much_walking, Icon: Footprints },
    { type: "too_expensive", label: REASON_LABELS.too_expensive, Icon: Wallet },
    { type: "too_tired", label: REASON_LABELS.too_tired, Icon: BatteryLow },
  ];
  const neutralOptions: FeedbackOption[] = [{ type: "okay", label: REASON_LABELS.okay, Icon: Minus }];

  const visibleOptions: FeedbackOption[] =
    rating === null
      ? []
      : rating === 3
      ? [...neutralOptions, ...positiveOptions, ...negativeOptions]
      : rating >= 3.5
      ? positiveOptions
      : negativeOptions;

  const contextualHeader =
    rating === null ? "" : rating === 3 ? t("tellUsMore") : rating >= 3.5 ? t("whatDidYouLikeMost") : t("whatDidntWorkForYou");

  const submitFeedback = async (type: FeedbackType | undefined, transcript?: string) => {
    if (!targetPlace || alreadyRated || rating === null) return;
    setLastFeedback(type ?? null);
    setBusy(true);

    const ratingSignals = ratingToDNASignals(rating, targetPlace);
    const reasonSignals = type ? feedbackToDNASignals(type, targetPlace) : {};
    const signals = mergeDNASignals(ratingSignals, reasonSignals);

    const changeLog = nudgeDNA(signals, `Rated ${targetPlace.name}: ${rating}/5${type ? ` (${type})` : ""}`);
    markPlaceRated(targetPlace.id);
    ratePlace(targetPlace.id, { rating, feedbackType: type, timestamp: Date.now() });

    const traitSummary = changeLog
      .map((c) => `${t(c.trait as any)} ${c.delta > 0 ? "+" : ""}${c.delta}`)
      .join(lang === "ar" ? "، " : ", ");

    const evolvedText =
      changeLog.length > 0
        ? lang === "ar"
          ? `تطور حمضك النووي للسفر: ${traitSummary}`
          : `Your Travel DNA evolved: ${traitSummary}`
        : lang === "ar"
        ? "تم تسجيل التقييم."
        : "Rating logged.";

    const reasonText = type ? REASON_LABELS[type] : null;
    addMessage({
      role: "assistant",
      text: `${rating}/5${reasonText ? ` — ${reasonText}` : ""}${transcript ? ` ("${transcript}")` : ""} — ${evolvedText}`,
    });

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
            mobilityNeeds,
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
    setRating(null);
  };

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg text-ink mb-1">{t("howWasYourExperience")}</h2>
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
        <p className="text-sm text-oasis-bright text-center py-4">{t("alreadyRatedThisPlace")}</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 mb-2">
            <p className="text-sm text-ink-muted">{t("rateYourExperience")}</p>
            <StarRating value={rating} onChange={setRating} disabled={busy || !targetPlace} />
          </div>

          {rating !== null && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-ink-faint text-center">{contextualHeader}</p>
              <FeedbackBar options={visibleOptions} onSelect={(type) => submitFeedback(type)} disabled={busy} />
              <div className="flex flex-col items-center gap-2 pt-1">
                <VoiceFeedbackButton onDetected={(type, transcript) => submitFeedback(type, transcript)} disabled={busy} />
                <button
                  onClick={() => submitFeedback(undefined)}
                  disabled={busy}
                  className="text-xs text-ink-faint underline hover:text-ink disabled:opacity-40"
                >
                  {t("submitRating")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {lastFeedback && (
        <p className="mt-3 text-center text-xs text-oasis-bright">
          {lang === "ar" ? "آخر ملاحظة: " : "Last feedback: "}
          {REASON_LABELS[lastFeedback]}
        </p>
      )}
    </Card>
  );
}

function applyDeltas(dna: Record<string, any>, changeLog: { trait: string; delta: number }[]) {
  const patch: Record<string, number> = {};
  for (const c of changeLog) {
    const current = dna[c.trait];
    if (typeof current === "number") patch[c.trait] = Math.max(0, Math.min(100, current + c.delta));
  }
  return patch;
}
