"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang } from "./types";

const dict = {
  en: {
    appName: "Rihla",
    tagline: "Your trip shouldn't just be planned. It should learn from you.",
    subtag: "An AI travel companion that learns how you travel — not just what you like.",
    ctaStart: "Discover My Travel DNA",
    step: "Step",
    of: "of",
    next: "Next",
    back: "Back",
    seeMyDNA: "See My Travel DNA",
    dnaTitle: "Your Travel DNA",
    dnaEvolved: "Your Travel DNA has evolved",
    planTrip: "Plan My Trip",
    city: "City",
    days: "Days",
    hoursPerDay: "Hours per day",
    budget: "Budget",
    mobility: "Mobility / accessibility needs",
    mobilityPlaceholder: "e.g. none, wheelchair accessible, limited walking",
    generateItinerary: "Generate My Itinerary",
    startTrip: "Start My Trip",
    itineraryTitle: "Your Smart Itinerary",
    activeTripTitle: "Active Trip",
    upNext: "Up next",
    howWasIt: "How was this place?",
    loved: "Loved it",
    okay: "It was okay",
    tooCrowded: "Too crowded",
    tooHot: "Too hot",
    tooTired: "I'm tired",
    tooMuchWalking: "Too much walking",
    tooExpensive: "Too expensive",
    replanning: "Adapting your trip...",
    tripReplanned: "Rihla replanned the rest of your trip",
    swappedFrom: "Replaced",
    swappedTo: "With",
    whyChanged: "Why this changed",
    markVisited: "Mark as visited",
    walking: "Walking",
    cost: "Cost",
    weather: "Weather",
    accessibility: "Accessibility",
    crowd: "Crowd level",
    openMap: "Open in Maps",
    low: "Low",
    medium: "Medium",
    high: "High",
    moderate: "Moderate",
    loading: "Thinking with Gemini...",
    restart: "Start over",
    history: "History",
    nature: "Nature",
    food: "Food",
    adventure: "Adventure",
    relaxation: "Relaxation",
    crowdTolerance: "Crowd tolerance",
    hiddenGems: "Hidden gems",
    photography: "Photography",
    culture: "Culture",
    shopping: "Shopping",
    explorer: "Explorer score",
    walkingPreference: "Walking preference",
    day: "Day",
    quietPreference: "Quiet preference",
    walkingTolerance: "Walking tolerance",
    budgetSensitivity: "Budget sensitivity",
    indoorPreference: "Indoor preference",
    hiddenGemsPreference: "Hidden gems",
    askRihla: "Ask Rihla",
    dnaEvolvedShort: "Travel DNA evolved",
    useMyLocation: "Use my location",
    showRoute: "Show route",
    selectDestination: "Select a destination",
    distance: "Distance",
    travelTime: "Travel time",
    free: "Free",
    sourceRealPlaces: "Google Places",
    sourceDemoData: "Demo data",
  },
  ar: {
    appName: "رحلة",
    tagline: "رحلتك لا يجب أن تُخطَّط فقط. يجب أن تتعلّم منك.",
    subtag: "رفيق سفر ذكي يتعلّم كيف تسافر — لا فقط ما الذي تحبّه.",
    ctaStart: "اكتشف حمضي النووي للسفر",
    step: "خطوة",
    of: "من",
    next: "التالي",
    back: "رجوع",
    seeMyDNA: "عرض حمضي النووي للسفر",
    dnaTitle: "حمضك النووي للسفر",
    dnaEvolved: "تطوّر حمضك النووي للسفر",
    planTrip: "خطّط رحلتي",
    city: "المدينة",
    days: "عدد الأيام",
    hoursPerDay: "الساعات يوميًا",
    budget: "الميزانية",
    mobility: "احتياجات الحركة وإمكانية الوصول",
    mobilityPlaceholder: "مثال: لا يوجد، كرسي متحرك، مشي محدود",
    generateItinerary: "أنشئ برنامج رحلتي",
    startTrip: "ابدأ رحلتي",
    itineraryTitle: "برنامجك الذكي",
    activeTripTitle: "الرحلة النشطة",
    upNext: "التالي",
    howWasIt: "كيف كان هذا المكان؟",
    loved: "أحببته",
    okay: "كان مقبولًا",
    tooCrowded: "مزدحم جدًا",
    tooHot: "حار جدًا",
    tooTired: "أشعر بالتعب",
    tooMuchWalking: "مشي كثير",
    tooExpensive: "مكلف جدًا",
    replanning: "جاري تعديل رحلتك...",
    tripReplanned: "أعادت رحلة تخطيط بقية رحلتك",
    swappedFrom: "تم استبدال",
    swappedTo: "بـ",
    whyChanged: "سبب التغيير",
    markVisited: "تمييز كزيارة",
    walking: "المشي",
    cost: "التكلفة",
    weather: "الطقس",
    accessibility: "إمكانية الوصول",
    crowd: "مستوى الازدحام",
    openMap: "افتح في الخرائط",
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
    moderate: "متوسط",
    loading: "جاري التفكير مع Gemini...",
    restart: "البدء من جديد",
    history: "التاريخ",
    nature: "الطبيعة",
    food: "الطعام",
    adventure: "المغامرة",
    relaxation: "الاسترخاء",
    crowdTolerance: "تحمل الازدحام",
    hiddenGems: "الأماكن الخفية",
    photography: "التصوير",
    culture: "الثقافة",
    shopping: "التسوق",
    explorer: "درجة الاستكشاف",
    walkingPreference: "تفضيل المشي",
    day: "اليوم",
    quietPreference: "تفضيل الهدوء",
    walkingTolerance: "تحمل المشي",
    budgetSensitivity: "حساسية الميزانية",
    indoorPreference: "تفضيل الأماكن المغلقة",
    hiddenGemsPreference: "الأماكن الخفية",
    askRihla: "اسأل رحلة",
    dnaEvolvedShort: "تطور حمضك النووي",
    useMyLocation: "استخدم موقعي",
    showRoute: "أظهر المسار",
    selectDestination: "اختر وجهة",
    distance: "المسافة",
    travelTime: "وقت السفر",
    free: "مجاني",
    sourceRealPlaces: "غوغل بليسز",
    sourceDemoData: "بيانات تجريبية",
  },
} as const;

type DictKey = keyof typeof dict.en;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("rihla_lang") as Lang | null) : null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("rihla_lang", l);
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [dir, lang]);

  const t = (key: DictKey) => dict[lang][key] ?? dict.en[key] ?? key;

  return <LangContext.Provider value={{ lang, setLang, t, dir }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
