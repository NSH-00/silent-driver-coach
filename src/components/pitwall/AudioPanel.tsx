import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Upload, Mic, Radio } from "lucide-react";
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
  const [vad, setVad] = useState(false);
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
  const standby = vad && !playing;

  const trigger = () => {
    setVad(true);
    setElapsed(0);
    setPlaying(true);
  };

  return (
    <section className="panel flex h-full flex-col gap-6 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="dot-text text-xs text-muted-foreground">01 / Radio Input</h2>
        <span className="dot-text text-[10px] text-muted-foreground">.wav</span>
      </div>

      <button
        type="button"
        onClick={() => {
          setVad((v) => !v);
          setPlaying(false);
          setElapsed(0);
        }}
        aria-pressed={vad}
        className={`dot-text flex items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-[10px] transition-all duration-150 ${
          vad
            ? "border-primary bg-primary/10 text-primary glow-red"
            : "border-border bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <Mic className={`size-3.5 ${vad ? "animate-pulse-dot" : ""}`} strokeWidth={1.5} />
          Auto-detect (VAD)
        </span>
        <span
          className={`relative h-4 w-8 rounded-full transition-colors duration-150 ${
            vad ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 size-3 rounded-full bg-background transition-all duration-150 ${
              vad ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
      </button>

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

      <div
        className={`rounded-2xl border bg-background p-5 transition-all duration-150 ${
          standby ? "border-primary/40" : "border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          {standby ? (
            <span className="dot-text animate-blink text-xl text-primary tabular-nums">
              &gt; Listening...
            </span>
          ) : (
            <span className="dot-text text-3xl tabular-nums animate-flicker">{formatTimer(elapsed)}</span>
          )}
          <span className="dot-text text-[10px] text-muted-foreground">
            {standby ? "VAD armed" : `/ ${formatTimer(sample.duration)}`}
          </span>
        </div>

        <div className="mt-5 flex h-24 items-center gap-[3px]">
          {heights.map((h, i) => {
            const played = i / BAR_COUNT <= progress;
            return (
              <span
                key={i}
                style={{
                  height: standby ? "6%" : `${h * 100}%`,
                  animationDelay: `${(i % 9) * 0.08}s`,
                }}
                className={`flex-1 origin-center rounded-full transition-[height,background-color] duration-150 ${
                  standby
                    ? "bg-muted-foreground/30 animate-ambient"
                    : played
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
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
                style={{ width: `${standby ? 0 : Math.min(progress, 1) * 100}%` }}
              />
            </div>
            <p className="dot-text mt-2 text-[10px] text-muted-foreground">
              {standby
                ? "Mic hot · threshold -42dB · ambient"
                : `Lap ${sample.lap} · Team radio · 48kHz mono`}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={trigger}
        className="dot-text flex items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Radio className="size-3.5" strokeWidth={1.5} />
        Simulate voice trigger
      </button>
    </section>
  );
}
