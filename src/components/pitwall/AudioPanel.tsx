import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Upload } from "lucide-react";
import { formatTimer, type Sample } from "@/lib/pitwall-data";

const BAR_COUNT = 44;

export function AudioPanel({
  sample,
  samples,
  onSelect,
  processing,
}: {
  sample: Sample;
  samples: Sample[];
  onSelect: (s: Sample) => void;
  processing: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [sample.id]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setElapsed((prev) => {
        const next = prev + dt;
        if (next >= sample.duration) {
          setPlaying(false);
          return sample.duration;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, sample.duration]);

  const heights = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => 0.28 + Math.abs(Math.sin(i * 1.7 + sample.lap)) * 0.72),
    [sample.lap],
  );

  const progress = elapsed / sample.duration;

  return (
    <section className="panel flex flex-col gap-6 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="dot-text text-xs text-muted-foreground">01 / Radio Input</h2>
        <span className="dot-text text-[10px] text-muted-foreground">.wav</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) setFileName(f.name);
        }}
        className={`flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <Upload className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <p className="dot-text text-[11px]">{fileName ?? "Drop radio .wav"}</p>
        <p className="text-xs text-muted-foreground">or pick a quick sample below</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {samples.map((s) => {
          const active = s.id === sample.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={processing}
              onClick={() => onSelect(s)}
              className={`dot-text rounded-full border px-3 py-1.5 text-[10px] transition-colors disabled:opacity-50 ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <span className="dot-text text-3xl tabular-nums animate-flicker">{formatTimer(elapsed)}</span>
          <span className="dot-text text-[10px] text-muted-foreground">
            / {formatTimer(sample.duration)}
          </span>
        </div>

        <div className="mt-5 flex h-24 items-center gap-[3px]">
          {heights.map((h, i) => {
            const played = i / BAR_COUNT <= progress;
            return (
              <span
                key={i}
                style={{
                  height: `${h * 100}%`,
                  animationDelay: `${(i % 9) * 0.08}s`,
                }}
                className={`flex-1 origin-center rounded-full ${
                  played ? "bg-primary" : "bg-muted-foreground/40"
                } ${playing ? "animate-bar" : ""}`}
              />
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (elapsed >= sample.duration) setElapsed(0);
              setPlaying((p) => !p);
            }}
            aria-label={playing ? "Pause radio call" : "Play radio call"}
            className={`grid size-14 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 ${
              playing ? "glow-red animate-pulse-dot" : ""
            }`}
          >
            {playing ? (
              <Pause className="size-5" fill="currentColor" />
            ) : (
              <Play className="size-5 translate-x-[1px]" fill="currentColor" />
            )}
          </button>
          <div className="flex-1">
            <div className="h-[3px] w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-100"
                style={{ width: `${Math.min(progress, 1) * 100}%` }}
              />
            </div>
            <p className="dot-text mt-2 text-[10px] text-muted-foreground">
              Lap {sample.lap} · Team radio · 48kHz mono
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
