import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildInsight,
  formatDelta,
  formatLapTime,
  moodAverages,
  moodMeta,
  type Lap,
  type Mood,
} from "@/lib/pitwall-data";

const moodVar: Record<Mood, string> = {
  CALM: "var(--calm)",
  TIRED: "var(--tired)",
  STRESSED: "var(--stressed)",
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Lap }[] }) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;

  return (
    <div className="panel px-3 py-2">
      <p className="dot-text text-[10px] text-muted-foreground">
        Lap {d.lap}
        {d.live ? " · live" : ""}
      </p>
      <p className="dot-text text-sm">{formatLapTime(d.time)}</p>
      <p className={`dot-text text-[10px] ${moodMeta[d.mood].text}`}>{d.mood}</p>
    </div>
  );
}

export function TelemetryPanel({
  laps,
  activeLap,
  onSelectLap,
}: {
  laps: Lap[];
  activeLap: number;
  onSelectLap: (lap: number) => void;
}) {
  const active = laps.find((l) => l.lap === activeLap);
  const avgs = moodAverages(laps);
  const calmAvg = avgs.CALM.avg;
  const times = laps.map((l) => l.time);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const best = laps.reduce((a, l) => (l.time < a.time ? l : a), laps[0]!);
  const delta = active && calmAvg != null ? active.time - calmAvg : null;
  const insight = buildInsight(laps);

  return (
    <section className="panel flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="dot-text text-xs text-muted-foreground">04 / Telemetry</h2>
        <span className="dot-text text-[10px] text-muted-foreground">Lap time vs mood</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {laps.map((l) => (
          <button
            key={l.lap}
            type="button"
            onClick={() => onSelectLap(l.lap)}
            aria-pressed={l.lap === activeLap}
            className={`dot-text rounded-md border px-2 py-1 text-[9px] tabular-nums transition-colors ${
              l.lap === activeLap
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {l.lap}
            {l.live ? "•" : ""}
          </button>
        ))}
      </div>

      <div className="mt-5 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={laps} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="lap"
              stroke="var(--muted-foreground)"
              tick={{ fontFamily: "var(--font-dot)", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              domain={[Math.floor((min - 0.4) * 10) / 10, Math.ceil((max + 0.4) * 10) / 10]}
              stroke="var(--muted-foreground)"
              tick={{ fontFamily: "var(--font-dot)", fontSize: 10 }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Line
              type="monotone"
              dataKey="time"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              activeDot={false}
              dot={(props: { cx?: number; cy?: number; payload?: Lap; index?: number }) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null || !payload) return <g key={`e-${index}`} />;
                const isActive = payload.lap === activeLap;
                return (
                  <Dot
                    key={`dot-${payload.lap}`}
                    cx={cx}
                    cy={cy}
                    r={isActive ? 7 : 3.5}
                    fill={moodVar[payload.mood]}
                    stroke={isActive ? "var(--foreground)" : "none"}
                    strokeWidth={isActive ? 2 : 0}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4">
        {(["CALM", "TIRED", "STRESSED"] as Mood[]).map((m) => (
          <div key={m} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${moodMeta[m].dot}`} />
            <span className="dot-text text-[10px] text-muted-foreground">
              {m} · {avgs[m].avg != null ? formatLapTime(avgs[m].avg!) : "—"} ({avgs[m].count})
            </span>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="dot-text text-[10px] text-muted-foreground">Active lap</dt>
          <dd className="dot-text mt-1 text-xl tabular-nums">{activeLap}</dd>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="dot-text text-[10px] text-muted-foreground">Lap time</dt>
          <dd className="dot-text mt-1 text-base tabular-nums">
            {active ? formatLapTime(active.time) : "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="dot-text text-[10px] text-muted-foreground">Δ vs calm</dt>
          <dd
            className={`dot-text mt-1 text-base tabular-nums ${
              delta == null ? "" : delta > 0.05 ? "text-stressed" : "text-calm"
            }`}
          >
            {delta == null ? "—" : formatDelta(delta)}
          </dd>
        </div>
      </dl>

      <p className="dot-text mt-3 text-[10px] text-muted-foreground">
        Best lap {best.lap} · {formatLapTime(best.time)} · {laps.length} laps classified
      </p>

      <div
        className={`mt-4 rounded-2xl border bg-background p-4 ${
          insight.level === "CRITICAL"
            ? "border-stressed glow-red"
            : insight.level === "WATCH"
              ? "border-tired"
              : "border-border"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full animate-pulse-dot ${
              insight.level === "CRITICAL"
                ? "bg-stressed"
                : insight.level === "WATCH"
                  ? "bg-tired"
                  : "bg-muted-foreground"
            }`}
            aria-hidden
          />
          <h3
            className={`dot-text text-[10px] ${
              insight.level === "CRITICAL"
                ? "text-stressed"
                : insight.level === "WATCH"
                  ? "text-tired"
                  : "text-muted-foreground"
            }`}
          >
            Insights / Impact Summary
          </h3>
        </div>
        <p className="dot-text mt-3 text-[11px] leading-relaxed text-foreground">{insight.text}</p>
      </div>
    </section>
  );
}
