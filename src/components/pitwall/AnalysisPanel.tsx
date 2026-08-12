import { moodMeta, type Sample } from "@/lib/pitwall-data";


function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="dot-text text-[10px] text-muted-foreground">{label}</span>
        <span className="dot-text text-xs tabular-nums">{value}%</span>
      </div>
      <div className="mt-2 h-[6px] w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DotSpinner() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary animate-pulse-dot"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export function AnalysisPanel({
  sample,
  processing,
}: {
  sample: Sample;
  processing: boolean;
}) {
  const meta = moodMeta[sample.mood];
  const isEnglish = sample.detectedLang.toUpperCase() === "ENGLISH";
  const transcriptText = isEnglish ? sample.transcript : sample.translation;

  return (
    <section className="flex h-full flex-col gap-4">
      <div className="panel p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="dot-text text-xs text-muted-foreground">02 / Driver Mood</h2>
          <span className="dot-text text-[10px] text-muted-foreground">
            {sample.live ? "Live upload" : "Archive clip"} · Lap {sample.lap}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-center rounded-2xl border border-border bg-background py-8">
          {processing ? (
            <div className="flex flex-col items-center gap-4">
              <DotSpinner />
              <p className="dot-text text-[10px] text-muted-foreground">Analysing voice…</p>
            </div>
          ) : (
            <div
              className={`flex items-center gap-3 rounded-full border px-6 py-3 ${
                sample.mood === "STRESSED"
                  ? "border-stressed glow-red"
                  : sample.mood === "TIRED"
                    ? "border-tired"
                    : "border-calm"
              }`}
            >
              <span className={`size-2.5 rounded-full ${meta.dot} animate-pulse-dot`} />
              <span className={`dot-text text-2xl ${meta.text}`}>{sample.mood}</span>
            </div>
          )}
        </div>
        <div className="mt-5 grid gap-4">
          <Meter label="Stress confidence" value={processing ? 0 : sample.stress} />
          <Meter label="Voice intensity / pitch" value={processing ? 0 : sample.pitch} />
        </div>
      </div>

      <div className="panel flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <h2 className="dot-text text-xs text-muted-foreground">
            03 / {isEnglish ? "Transcript" : "Engineer-readable transcript"}
          </h2>
          <span className="dot-text text-[10px] text-primary">● LIVE</span>
        </div>
        <pre className="dot-text mt-4 min-h-48 flex-1 overflow-x-auto rounded-xl border border-border bg-background p-4 text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
          {processing ? "> DECODING RADIO STREAM ▍" : transcriptText}
        </pre>
      </div>
    </section>
  );
}

