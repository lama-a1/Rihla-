"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

// Shows briefly on load, then fades out on its own — no button, no click
// required. Tapping anywhere skips it immediately for people who don't
// want to wait. The main page renders underneath the whole time so there's
// no layout shift when it disappears, just a cross-fade.

const DESCRIPTION_AR =
  "رحلة رفيق سفر ذكي لاستكشاف المملكة العربية السعودية. أخبرها بما يدور في ذهنك، وهي تتعلّم أسلوبك في السفر، وتقترح لك أماكن على خريطة حقيقية، مع المسار والمسافة والوقت المتوقع، وتزداد ذكاءً مع كل رحلة.";

const DESCRIPTION_EN =
  "Rihla is an AI travel companion for exploring Saudi Arabia. Tell it what you're in the mood for and it learns your travel style then suggests places on a real map, with routes, distance and estimated time, getting sharper with every trip.";

// Subtle earthy-toned silhouette scene (dunes, palm, dome + minaret, rock
// arch) — a faint hint of Saudi tourism, deliberately low-opacity so it
// never competes with the text on top.
function BackgroundArt() {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      style={{ color: "var(--color-sand)" }}
    >
      {/* rolling dunes */}
      <path d="M0,300 Q80,235 160,255 T320,250 T480,265 T640,240 T800,260 L800,300 Z" fill="currentColor" />
      <path d="M0,300 Q100,270 220,285 T440,280 T660,290 T800,278 L800,300 Z" fill="currentColor" opacity="0.6" />

      {/* AlUla-style rock arch */}
      <path
        d="M110,260 C108,195 138,148 180,148 C222,148 252,195 250,260 L232,260 C232,208 212,170 180,170 C148,170 128,208 128,260 Z"
        fill="currentColor"
      />

      {/* Najdi mud-brick tower, with its signature triangular parapet
          (seen throughout Diriyah / At-Turaif) */}
      <g>
        <rect x="430" y="150" width="90" height="110" fill="currentColor" />
        <path
          d="M430,150 L441,132 L452,150 L463,132 L474,150 L485,132 L496,150 L507,132 L519,150 Z"
          fill="currentColor"
        />
        <rect x="455" y="190" width="14" height="20" fill="var(--color-night)" opacity="0.5" />
        <rect x="480" y="190" width="14" height="20" fill="var(--color-night)" opacity="0.5" />
      </g>

      {/* palm tree */}
      <g>
        <path d="M640,260 C636,220 642,185 652,160" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M652,160 C630,150 612,155 598,168" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M652,160 C636,142 616,138 600,144" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M652,160 C660,138 678,128 698,128" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M652,160 C668,144 688,140 706,148" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M652,160 C650,138 656,120 668,106" fill="none" stroke="currentColor" strokeWidth="3" />
      </g>

      {/* scattered stars */}
      <circle cx="90" cy="60" r="2" fill="currentColor" />
      <circle cx="700" cy="45" r="2" fill="currentColor" />
      <circle cx="380" cy="30" r="1.5" fill="currentColor" />
      <circle cx="250" cy="70" r="1.5" fill="currentColor" />
      <circle cx="560" cy="55" r="2" fill="currentColor" />
    </svg>
  );
}

export function IntroSplash({ onDone }: { onDone: () => void }) {
  const { lang } = useLang();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 4000);
    const doneTimer = setTimeout(() => onDone(), 4500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      style={{ backgroundColor: "var(--color-night, #12141c)" }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 px-6 cursor-pointer transition-opacity duration-500 overflow-hidden ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <BackgroundArt />
      <img src="/logo.png" alt="Rihla" className="relative h-20 w-20 object-contain animate-rise" />
      <h1 className="relative font-display text-3xl text-ink">{lang === "ar" ? "رحلة" : "Rihla"}</h1>
      <p className="relative text-sm text-ink-faint">{lang === "ar" ? "رحلة لا تسألك عن نوع المسافر اللي فيك.. تتعلّمه." : "Rihla doesn't ask what kind of traveler you are.. It learns it."}</p>

      <div className="relative max-w-md rounded-xl2 border border-night-line bg-night-panel px-5 py-4 mt-2">
        <p className="text-xs leading-relaxed text-ink-muted text-center">
          {lang === "ar" ? DESCRIPTION_AR : DESCRIPTION_EN}
        </p>
      </div>
    </div>
  );
}
