import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AudioPanel } from "@/components/pitwall/AudioPanel";
import { AnalysisPanel } from "@/components/pitwall/AnalysisPanel";
import { TelemetryPanel } from "@/components/pitwall/TelemetryPanel";
import {
  baseLaps,
  buildLiveSample,
  samples as seedSamples,
  type Lap,
  type Sample,
} from "@/lib/pitwall-data";

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

const STAGES = [
  "Uploading radio clip…",
  "Denoising · isolating driver channel…",
  "Transcribing speech…",
  "Detecting language · translating…",
  "Scoring stress & vocal intensity…",
  "Correlating with lap telemetry…",
];

const ACCEPTED = /\.(wav|mp3)$/i;

function Index() {
  const [sampleList, setSampleList] = useState<Sample[]>(seedSamples);
  const [laps, setLaps] = useState<Lap[]>(baseLaps);
  const [sample, setSample] = useState<Sample>(
    seedSamples.find((s) => s.id === "lap22") ?? seedSamples[0]!,
  );
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0]!);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const runPipeline = useCallback(
    (durationMs: number, onDone: () => void) => {
      clearAll();
      setProcessing(true);
      setProgress(0);
      setStage(STAGES[0]!);

      const start = Date.now();
      interval.current = setInterval(() => {
        const ratio = Math.min(1, (Date.now() - start) / durationMs);
        setProgress(ratio * 100);
        setStage(STAGES[Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length))]!);
      }, 120);

      timers.current.push(
        setTimeout(() => {
          clearAll();
          setProgress(100);
          setProcessing(false);
          onDone();
        }, durationMs),
      );
    },
    [clearAll],
  );

  const handleSelect = (next: Sample) => {
    runPipeline(1600, () => setSample(next));
  };

  const handleSelectLap = (lap: number) => {
    const match = sampleList.find((s) => s.lap === lap);
    if (!match) {
      toast.info(`No radio call captured on lap ${lap}`, {
        description: "Upload a clip for this lap to classify driver mood.",
      });
      return;
    }
    if (match.id === sample.id) return;
    handleSelect(match);
  };

  const handleUpload = (file: File) => {
    if (!ACCEPTED.test(file.name)) {
      toast.error("Unsupported audio format", {
        description: "Radio clips must be .wav or .mp3.",
      });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Clip too large", { description: "Keep radio uploads under 20MB." });
      return;
    }

    const nextLap = Math.max(...laps.map((l) => l.lap)) + 1;
    const { sample: live, lapRow } = buildLiveSample(file, nextLap);

    runPipeline(4200, () => {
      setLaps((prev) => [...prev, lapRow]);
      setSampleList((prev) => [...prev, live]);
      setSample(live);
      toast.success(`Analysis complete · Lap ${live.lap}`, {
        description: `${live.mood} · stress ${live.stress}% · pitch ${live.pitch}%`,
      });
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <span className="size-3 rounded-full bg-primary animate-pulse-dot" aria-hidden />
          <h1 className="dot-text text-xl font-bold md:text-3xl">Silent Co-Driver</h1>
          <span className="dot-text rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground">
            Pit wall
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden h-6 w-20 dot-grid sm:block" aria-hidden />
          <p className="dot-text text-[10px] text-muted-foreground">
            Telemetry active · Stint 2 · {laps.length} laps · Driver mood engine v0.9
          </p>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-3">
        <AudioPanel
          sample={sample}
          samples={sampleList}
          onSelect={handleSelect}
          onUpload={handleUpload}
          processing={processing}
          progress={progress}
          stage={stage}
        />
        <AnalysisPanel sample={sample} processing={processing} />
        <TelemetryPanel laps={laps} activeLap={sample.lap} onSelectLap={handleSelectLap} />
      </div>

      <footer className="dot-text mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[10px] text-muted-foreground">
        <span>FIA-safe: pit-wall analysis only, no automated car control.</span>
        <span>Prototype · simulated analysis · no radio data leaves this device</span>
      </footer>
    </main>
  );
}
