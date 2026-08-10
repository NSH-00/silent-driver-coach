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
import { formatLapTime, laps, moodMeta, type Lap, type Mood } from "@/lib/pitwall-data";

const moodVar: Record<Mood, string> = {
  CALM: "var(--calm)",
  TIRED: "var(--tired)",
  STRESSED: "var(--stressed)",
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Lap }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="panel px-3 py-2">
      <p className="dot-text text-[10px] text-muted-foreground">Lap {d.lap}</p>
      <p className="dot-text text-sm">{formatLapTime(d.time)}</p>
      <p className={`dot-text text-[10px] ${moodMeta[d.mood].text}`}>{d.mood}</p>
    </div>
  );
}

export function TelemetryPanel({ activeLap }: { activeLap: number }) {
  return (
    <section className="panel flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="dot-text text-xs text-muted-foreground">04 / Telemetry</h2>
        <span className="dot-text text-[10px] text-muted-foreground">Lap time vs mood</span>
      </div>

      <div className="mt-6 h-72">
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
              domain={[89, 92.5]}
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

      <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4">
        {(["CALM", "TIRED", "STRESSED"] as Mood[]).map((m) => (
          <div key={m} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${moodMeta[m].dot}`} />
            <span className="dot-text text-[10px] text-muted-foreground">{m}</span>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="dot-text text-[10px] text-muted-foreground">Active lap</dt>
          <dd className="dot-text mt-1 text-xl tabular-nums">{activeLap}</dd>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="dot-text text-[10px] text-muted-foreground">Lap time</dt>
          <dd className="dot-text mt-1 text-xl tabular-nums">
            {formatLapTime(laps.find((l) => l.lap === activeLap)?.time ?? 90)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
