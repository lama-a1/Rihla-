"use client";

import { useState } from "react";

// Custom SVG half-star rating (0.5–5, in 0.5 steps) — no emoji, no images.
// Each star is one <svg> with a clipPath fill at 0/50/100%, overlaid by two
// invisible left/right hit-zones for click, hover-preview, and touch.
//
// RTL note: the row is forced dir="ltr" internally regardless of the app's
// current language, so Arabic layouts never reverse which half of which
// star means what — star 1 is always the leftmost, exactly as in English.

const STAR_PATH =
  "M12 2.5l2.9 6.02 6.6.79-4.86 4.5 1.28 6.55L12 16.9l-5.92 3.46 1.28-6.55-4.86-4.5 6.6-.79L12 2.5z";

function Star({ fillPercent, size }: { fillPercent: number; size: number }) {
  const clipId = `star-clip-${Math.round(fillPercent * 100)}-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="pointer-events-none">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * (fillPercent / 100)} height="24" />
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
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;

  const setFromHalf = (starIndex: number, half: "left" | "right") => {
    const v = starIndex + (half === "left" ? 0.5 : 1);
    return v;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const current = value ?? 0;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onChange(Math.min(5, current + 0.5));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(0.5, current - 0.5));
    }
  };

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
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const starValue = starIndex + 1;
        const fillPercent =
          displayValue >= starValue ? 100 : displayValue >= starValue - 0.5 ? 50 : 0;

        return (
          <div key={starIndex} className="relative" style={{ width: size, height: size }}>
            <Star fillPercent={fillPercent} size={size} />
            {!disabled && (
              <>
                <button
                  type="button"
                  aria-label={`${starIndex + 0.5}`}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHoverValue(setFromHalf(starIndex, "left"))}
                  onClick={() => onChange(setFromHalf(starIndex, "left"))}
                />
                <button
                  type="button"
                  aria-label={`${starIndex + 1}`}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHoverValue(setFromHalf(starIndex, "right"))}
                  onClick={() => onChange(setFromHalf(starIndex, "right"))}
                />
              </>
            )}
          </div>
        );
      })}
      {value !== null && (
        <span className="ms-2 text-sm font-medium text-ink" dir="ltr">
          {value} / 5
        </span>
      )}
    </div>
  );
}
