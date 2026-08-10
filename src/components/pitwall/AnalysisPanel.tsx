import {
  languages,
  mockTranslations,
  moodMeta,
  type LanguageCode,
  type Sample,
} from "@/lib/pitwall-data";

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
  lang,
  translating,
  onLangChange,
}: {
  sample: Sample;
  processing: boolean;
  lang: LanguageCode;
  translating: boolean;
  onLangChange: (lang: LanguageCode) => void;
}) {
  const meta = moodMeta[sample.mood];

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-5">
        <h2 className="dot-text text-xs text-muted-foreground">02 / Driver Mood</h2>
        <div className="mt-5 flex items-center justify-center rounded-2xl border border-border bg-background py-10">
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
          <Meter label="Vocal pitch" value={processing ? 0 : sample.pitch} />
        </div>
      </div>

      <div className="panel flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <h2 className="dot-text text-xs text-muted-foreground">03 / Transcript</h2>
          <span className="dot-text text-[10px] text-primary">● LIVE</span>
        </div>
        <pre className="dot-text mt-4 min-h-48 flex-1 overflow-x-auto rounded-xl border border-border bg-background p-4 text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
          {processing ? "> DECODING RADIO STREAM ▍" : sample.transcript}
        </pre>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="dot-text text-[10px] text-muted-foreground">
            03b / Translated · Neural MT
          </h3>
          <span className="dot-text text-[10px] text-muted-foreground">
            {languages.find((l) => l.code === lang)?.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onLangChange(l.code)}
              aria-pressed={lang === l.code}
              className={`dot-text rounded-full border px-3 py-1.5 text-[10px] transition-colors ${
                lang === l.code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="dot-text mt-3 min-h-32 flex-1 rounded-xl border border-border border-dashed bg-muted/40 p-4 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {processing || translating ? (
            <div className="flex h-full flex-col items-start gap-3">
              <DotSpinner />
              <span className="text-[10px]">Translating…</span>
            </div>
          ) : (
            mockTranslations[lang]
          )}
        </div>
      </div>
    </section>
  );
}

