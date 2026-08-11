"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ChatPanel } from "@/components/ChatPanel";
import { MapPanel } from "@/components/MapPanel";
import { RecommendationCards } from "@/components/RecommendationCards";
import { DNAPanel } from "@/components/DNAPanel";
import { FeedbackSection } from "@/components/FeedbackSection";
import { TripContextWidget } from "@/components/TripContextWidget";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IntroSplash } from "@/components/IntroSplash";
import { AutoLocateCity } from "@/components/AutoLocateCity";

// Single-page layout. Every section is an independent, context-driven
// component so it can be restyled or repositioned freely without touching
// the AI (lib/gemini.ts, lib/dna.ts), Maps, or Places logic behind it.

export default function HomePage() {
  const { t, lang } = useLang();
  const { city, reset } = useApp();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <AutoLocateCity />
      {showIntro && <IntroSplash onDone={() => setShowIntro(false)} />}
      <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Rihla" className="h-9 w-9 object-contain shrink-0" />
          <div>
            <span className="font-display text-3xl text-ink block leading-none">{t("appName")}</span>
            <span className="text-[14px] text-ink-faint">
              {lang === "ar" ? "رحلة لا تسألك عن نوع المسافر اللي فيك.. تتعلّمه." : "Rihla doesn't ask what kind of traveler you are.. It learns it."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm(lang === "ar" ? "مسح الجلسة والبدء من جديد؟" : "Clear session and start over?")) {
                reset();
              }
            }}
            className="px-3 py-1.5 text-xs"
          >
            {lang === "ar" ? "🔄 ابدأ من جديد" : "🔄 Start over"}
          </Button>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <div className="mb-6">
        <TripContextWidget city={city} />
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <MapPanel />
          </div>

          <div className="lg:col-span-2">
            <ChatPanel />
          </div>
          <div>
            <DNAPanel />
          </div>

          <div className="lg:col-span-3">
            <RecommendationCards />
          </div>

          <div className="lg:col-span-3">
            <FeedbackSection />
          </div>
        </div>
    </main>
    </>
  );
}
