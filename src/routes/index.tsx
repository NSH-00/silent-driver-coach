import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AudioPanel } from "@/components/pitwall/AudioPanel";
import { AnalysisPanel } from "@/components/pitwall/AnalysisPanel";
import { TelemetryPanel } from "@/components/pitwall/TelemetryPanel";
import { samples, type Sample } from "@/lib/pitwall-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Silent Co-Driver — Radio Stress Detection Pit Wall" },
      {
        name: "description",
        content:
          "Pit-wall dashboard for race engineers: detect driver stress from team radio calls with mood analysis, transcripts and lap-time telemetry.",
      },
      { property: "og:title", content: "Silent Co-Driver — Radio Stress Detection Pit Wall" },
      {
        property: "og:description",
        content:
          "Analyse team radio for driver stress, fatigue and calm, mapped against lap time telemetry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [sample, setSample] = useState<Sample>(samples[0]!);
  const [processing, setProcessing] = useState(false);
  const [lang, setLang] = useState<LanguageCode>("IT");
  const [translating, setTranslating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (langTimer.current) clearTimeout(langTimer.current);
    };
  }, []);

  const handleSelect = (next: Sample) => {
    if (timer.current) clearTimeout(timer.current);
    setProcessing(true);
    timer.current = setTimeout(() => {
      setSample(next);
      setProcessing(false);
    }, 2000);
  };

  const handleLangChange = (next: LanguageCode) => {
    if (langTimer.current) clearTimeout(langTimer.current);
    setLang(next);
    setTranslating(true);
    langTimer.current = setTimeout(() => setTranslating(false), 500);
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <span className="size-3 rounded-full bg-primary animate-pulse-dot" aria-hidden />
          <h1 className="dot-text text-2xl font-bold md:text-4xl">Silent Co-Driver</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden h-6 w-24 dot-grid sm:block" aria-hidden />
          <p className="dot-text text-[10px] text-muted-foreground">
            Telemetry active · Stint 2 · Laps 10–25
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <AudioPanel
          sample={sample}
          samples={samples}
          onSelect={handleSelect}
          processing={processing}
        />
        <AnalysisPanel sample={sample} processing={processing} />
        <TelemetryPanel activeLap={sample.lap} />
      </div>

      <footer className="dot-text mt-10 border-t border-border pt-5 text-[10px] text-muted-foreground">
        Prototype · simulated analysis · no radio data leaves this device
      </footer>
    </main>
  );
}
