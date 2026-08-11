"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

// Custom SVG half-star rating (0.5–5, in 0.5 steps) — no emoji, no images.
// Each star is one <svg> with a clipPath fill at 0/50/100%, overlaid by two
// invisible hit-zones for click, hover-preview, and touch.
//
// RTL: in Arabic, the whole rating mirrors naturally — star 1 sits on the
// far right, fill grows right-to-left as the rating increases, and each
// star's own half-fill grows from its right edge. Everything is driven by
// explicit JS mapping (not the browser's automatic bidi reordering), so the
// value <-> visual-position relationship stays fully predictable.

const STAR_PATH =
  "M12 2.5l2.9 6.02 6.6.79-4.86 4.5 1.28 6.55L12 16.9l-5.92 3.46 1.28-6.55-4.86-4.5 6.6-.79L12 2.5z";

function Star({ fillPercent, size, isRTL }: { fillPercent: number; size: number; isRTL: boolean }) {
  const clipId = `star-clip-${Math.round(fillPercent * 100)}-${size}-${isRTL ? "r" : "l"}`;
  const fillWidth = 24 * (fillPercent / 100);
  const rectX = isRTL ? 24 - fillWidth : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="pointer-events-none">
      <defs>
        <clipPath id={clipId}>
          <rect x={rectX} y="0" width={fillWidth} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
      <path d={STAR_PATH} fill="var(--color-sand)" clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  disabled,
  size = 32,
}: {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: number;
}) {
  const { lang } = useLang();
  const isRTL = lang === "ar";
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const current = value ?? 0;
    const incrementKey = isRTL ? "ArrowLeft" : "ArrowRight";
    const decrementKey = isRTL ? "ArrowRight" : "ArrowLeft";
    if (e.key === incrementKey) {
      e.preventDefault();
      onChange(Math.min(5, current + 0.5));
    } else if (e.key === decrementKey) {
      e.preventDefault();
      onChange(Math.max(0.5, current - 0.5));
    }
  };

  const posSequence = isRTL ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
  const startSideClass = isRTL ? "right-0" : "left-0";
  const endSideClass = isRTL ? "left-0" : "right-0";

  const label = value !== null && (
    <span className="text-sm font-medium text-ink" dir="ltr">
      {value} / 5
    </span>
  );

  return (
    <div
      dir="ltr"
      role="slider"
      aria-label="Star rating"
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value ?? 0}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-oasis rounded-lg p-1"
      onMouseLeave={() => setHoverValue(null)}
    >
      {isRTL && label && <span className="me-1">{label}</span>}
      {posSequence.map((pos) => {
        const starValue = pos + 1;
        const fillPercent = displayValue >= starValue ? 100 : displayValue >= starValue - 0.5 ? 50 : 0;
        const startHalfValue = pos + 0.5;
        const endHalfValue = pos + 1;

        return (
          <div key={pos} className="relative" style={{ width: size, height: size }}>
            <Star fillPercent={fillPercent} size={size} isRTL={isRTL} />
            {!disabled && (
              <>
                <button
                  type="button"
                  aria-label={`${startHalfValue}`}
                  className={`absolute inset-y-0 ${startSideClass} w-1/2 cursor-pointer`}
                  onMouseEnter={() => setHoverValue(startHalfValue)}
                  onClick={() => onChange(startHalfValue)}
                />
                <button
                  type="button"
                  aria-label={`${endHalfValue}`}
                  className={`absolute inset-y-0 ${endSideClass} w-1/2 cursor-pointer`}
                  onMouseEnter={() => setHoverValue(endHalfValue)}
                  onClick={() => onChange(endHalfValue)}
                />
              </>
            )}
          </div>
        );
      })}
      {!isRTL && label && <span className="ms-1">{label}</span>}
    </div>
  );
}
