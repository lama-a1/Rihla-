"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackType } from "@/lib/types";
import { isSpeechRecognitionSupported, matchVoiceFeedback } from "@/lib/voiceCommands";
import { useLang } from "@/lib/i18n";

type Status = "idle" | "listening" | "no-match" | "matched" | "unsupported";

export function VoiceFeedbackButton({
  onDetected,
  disabled,
}: {
  onDetected: (type: FeedbackType, transcript: string) => void;
  disabled?: boolean;
}) {
  const { lang } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) setStatus("unsupported");
  }, []);

  const startListening = () => {
    if (disabled || status === "unsupported") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ar" ? "ar-SA" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript as string;
      setTranscript(text);
      const match = matchVoiceFeedback(text);
      if (match) {
        setStatus("matched");
        onDetected(match, text);
      } else {
        setStatus("no-match");
      }
    };

    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (status === "unsupported") {
    return (
      <p className="text-xs text-ink-faint text-center">
        {lang === "ar"
          ? "الأوامر الصوتية غير مدعومة في هذا المتصفح — جرّب Chrome."
          : "Voice commands aren't supported in this browser — try Chrome."}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={startListening}
        disabled={disabled || status === "listening"}
        className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all disabled:opacity-50 ${
          status === "listening"
            ? "border-oasis bg-oasis/10 text-oasis-bright animate-pulseSlow"
            : "border-night-line text-ink-muted hover:border-oasis hover:text-ink"
        }`}
      >
        <span>{status === "listening" ? "🎙️" : "🎤"}</span>
        <span>
          {status === "listening"
            ? lang === "ar"
              ? "يستمع..."
              : "Listening..."
            : lang === "ar"
            ? "قل رأيك بالمكان"
            : "Say how it went"}
        </span>
      </button>
      {status === "no-match" && (
        <p className="text-xs text-clay text-center">
          {lang === "ar" ? `لم أفهم: "${transcript}" — جرّب مرة أخرى` : `Didn't catch that: "${transcript}" — try again`}
        </p>
      )}
    </div>
  );
}
