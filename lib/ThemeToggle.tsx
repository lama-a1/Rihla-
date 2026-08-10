"use client";

import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLang();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-night-line bg-night-panel text-ink-muted hover:text-ink hover:border-oasis transition-colors"
      title={lang === "ar" ? (theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن") : theme === "dark" ? "Light mode" : "Dark mode"}
      aria-label="Toggle dark/light mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
