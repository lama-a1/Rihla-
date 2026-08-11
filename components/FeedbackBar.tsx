"use client";

import { LucideIcon } from "lucide-react";
import { FeedbackType } from "@/lib/types";

export interface FeedbackOption {
  type: FeedbackType;
  label: string;
  Icon: LucideIcon;
}

export function FeedbackBar({
  options,
  onSelect,
  disabled,
}: {
  options: FeedbackOption[];
  onSelect: (type: FeedbackType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.type}
          disabled={disabled}
          onClick={() => onSelect(o.type)}
          className="flex flex-col items-center gap-1.5 rounded-xl2 border border-night-line bg-night-panel px-3 py-3 text-xs text-ink-muted transition-all hover:border-oasis hover:text-ink hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <o.Icon size={20} strokeWidth={1.75} />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
