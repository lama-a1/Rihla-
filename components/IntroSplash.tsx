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
      <path
        d="M0,300 Q80,235 160,255 T320,250 T480,265 T640,240 T800,260 L800,300 Z"
        fill="currentColor"
      />
      <path
        d="M0,300 Q100,270 220,285 T440,280 T660,290 T800,278 L800,300 Z"
        fill="currentColor"
        opacity="0.6"
      />

      {/* rock arch, evoking AlUla's Elephant Rock */}
      <path
        d="M120,260 C118,190 150,140 195,140 C240,140 272,190 270,260 L250,260 C250,205 228,165 195,165 C162,165 140,205 140,260 Z"
        fill="currentColor"
      />

      {/* palm tree */}
      <g>
        <path d="M620,260 C616,220 622,185 632,160" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M632,160 C610,150 592,155 578,168" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M632,160 C616,142 596,138 580,144" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M632,160 C640,138 658,128 678,128" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M632,160 C648,144 668,140 686,148" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M632,160 C630,138 636,120 648,106" fill="none" stroke="currentColor" strokeWidth="3" />
      </g>

      {/* mosque dome + minaret */}
      <g>
        <rect x="420" y="240" width="70" height="20" fill="currentColor" />
        <path d="M425,240 C425,210 485,210 485,240 Z" fill="currentColor" />
        <circle cx="455" cy="205" r="4" fill="currentColor" />
        <rect x="500" y="180" width="10" height="80" fill="currentColor" />
        <path d="M497,180 L513,180 L505,164 Z" fill="currentColor" />
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
