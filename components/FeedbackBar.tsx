"use client";

import { FeedbackType } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const options: { type: FeedbackType; emoji: string; labelKey: string }[] = [
  { type: "loved", emoji: "❤️", labelKey: "loved" },
  { type: "okay", emoji: "😐", labelKey: "okay" },
  { type: "too_crowded", emoji: "👥", labelKey: "tooCrowded" },
  { type: "too_hot", emoji: "🥵", labelKey: "tooHot" },
  { type: "too_tired", emoji: "😴", labelKey: "tooTired" },
  { type: "too_much_walking", emoji: "🚶", labelKey: "tooMuchWalking" },
  { type: "too_expensive", emoji: "💰", labelKey: "tooExpensive" },
];

export function FeedbackBar({
  onSelect,
  disabled,
}: {
  onSelect: (type: FeedbackType) => void;
  disabled?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((o) => (
        <button
          key={o.type}
          disabled={disabled}
          onClick={() => onSelect(o.type)}
          className="flex flex-col items-center gap-1 rounded-xl2 border border-night-line bg-night-panel px-3 py-3 text-xs text-ink-muted transition-all hover:border-oasis hover:text-ink hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <span className="text-xl">{o.emoji}</span>
          <span>{t(o.labelKey as any)}</span>
        </button>
      ))}
    </div>
  );
}
