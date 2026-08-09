import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Rihla — AI Tourism Assistant",
  description: "An AI travel companion that learns how you travel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-night bg-helix-glow bg-sand-glow">
        <LangProvider>
          <AppProvider>{children}</AppProvider>
        </LangProvider>
      </body>
    </html>
  );
}
