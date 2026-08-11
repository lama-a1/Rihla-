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
     <img
        src="/hero-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-night) 0%, transparent 30%, transparent 70%, var(--color-night) 100%)",
        }}
      />

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
