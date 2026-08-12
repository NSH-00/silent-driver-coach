export type Mood = "CALM" | "TIRED" | "STRESSED";

export type Lap = {
  lap: number;
  time: number; // seconds
  mood: Mood;
  live?: boolean;
};

export const baseLaps: Lap[] = [
  { lap: 10, time: 90.412, mood: "CALM" },
  { lap: 11, time: 90.128, mood: "CALM" },
  { lap: 12, time: 89.874, mood: "CALM" },
  { lap: 13, time: 90.031, mood: "CALM" },
  { lap: 14, time: 89.652, mood: "CALM" },
  { lap: 15, time: 89.998, mood: "CALM" },
  { lap: 16, time: 90.544, mood: "TIRED" },
  { lap: 17, time: 90.981, mood: "TIRED" },
  { lap: 18, time: 91.734, mood: "STRESSED" },
  { lap: 19, time: 91.402, mood: "STRESSED" },
  { lap: 20, time: 90.887, mood: "TIRED" },
  { lap: 21, time: 90.615, mood: "TIRED" },
  { lap: 22, time: 91.126, mood: "TIRED" },
  { lap: 23, time: 90.402, mood: "CALM" },
  { lap: 24, time: 90.219, mood: "CALM" },
  { lap: 25, time: 89.941, mood: "CALM" },
];

/** Kept for compatibility with existing imports. */
export const laps = baseLaps;

export type Sample = {
  id: string;
  label: string;
  lap: number;
  mood: Mood;
  duration: number; // seconds of the radio clip
  detectedLang: string; // auto-detected source language
  transcript: string; // raw detected speech (foreign)
  translation: string; // auto-translated English
  stress: number; // 0-100
  pitch: number; // 0-100
  live?: boolean;
};

export const samples: Sample[] = [
  {
    id: "lap14",
    label: "Lap 14 (Calm)",
    lap: 14,
    mood: "CALM",
    duration: 7.4,
    detectedLang: "ITALIAN",
    transcript:
      "> RADIO IN // GIRO 14\n> LA MACCHINA VA BENE, IL BILANCIAMENTO È DOVE LO VOGLIO.\n> POSSO MANTENERE QUESTO RITMO, NESSUN PROBLEMA.",
    translation:
      "> CAR FEELS GOOD, BALANCE IS WHERE I WANT IT.\n> I CAN HOLD THIS PACE, NO PROBLEM.",
    stress: 18,
    pitch: 34,
  },
  {
    id: "lap18",
    label: "Lap 18 (Stressed)",
    lap: 18,
    mood: "STRESSED",
    duration: 9.1,
    detectedLang: "ITALIAN",
    transcript:
      "> RADIO IN // GIRO 18\n> MI HA SPINTO FUORI! È LA SECONDA VOLTA, FATE QUALCOSA!\n> PERDO IL POSTERIORE OVUNQUE, COSÌ NON FUNZIONA!",
    translation:
      "> HE PUSHED ME WIDE! THAT'S TWICE NOW, DO SOMETHING!\n> I'M LOSING THE REAR EVERYWHERE, THIS IS NOT WORKING!",
    stress: 88,
    pitch: 91,
  },
  {
    id: "lap22",
    label: "Lap 22 (Tired)",
    lap: 22,
    mood: "TIRED",
    duration: 8.2,
    detectedLang: "ITALIAN",
    transcript: "> LE GOMME ANTERIORI SONO ANDATE... STO SOLO GESTENDO ORA.",
    translation: "> FRONTS ARE GONE... I'M JUST MANAGING NOW.",
    stress: 52,
    pitch: 46,
  },
];

export const moodMeta: Record<Mood, { dot: string; text: string; icon: string }> = {
  CALM: { dot: "bg-calm", text: "text-calm", icon: "🟢" },
  TIRED: { dot: "bg-tired", text: "text-tired", icon: "🟡" },
  STRESSED: { dot: "bg-stressed", text: "text-stressed", icon: "🔴" },
};

export const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds * 100) % 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

export const formatLapTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const rest = seconds - m * 60;
  return `${m}:${rest.toFixed(3).padStart(6, "0")}`;
};

export const formatDelta = (delta: number) =>
  `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(3)}s`;

export type MoodAverages = Record<Mood, { avg: number | null; count: number }>;

export function moodAverages(data: Lap[]): MoodAverages {
  const out: MoodAverages = {
    CALM: { avg: null, count: 0 },
    TIRED: { avg: null, count: 0 },
    STRESSED: { avg: null, count: 0 },
  };
  (["CALM", "TIRED", "STRESSED"] as Mood[]).forEach((m) => {
    const rows = data.filter((l) => l.mood === m);
    out[m] = {
      count: rows.length,
      avg: rows.length ? rows.reduce((a, l) => a + l.time, 0) / rows.length : null,
    };
  });
  return out;
}

/** Insight text derived from the current lap set, not hardcoded. */
export function buildInsight(data: Lap[]) {
  const avgs = moodAverages(data);
  const calm = avgs.CALM.avg;
  const stressed = avgs.STRESSED.avg;
  const tired = avgs.TIRED.avg;

  if (calm == null || (stressed == null && tired == null)) {
    return {
      level: "INFO" as const,
      text: "Baseline building: not enough classified laps yet to link driver mood with pace. Analyse more radio calls to unlock the impact summary.",
    };
  }

  const worstMood: Mood = (stressed ?? -Infinity) >= (tired ?? -Infinity) ? "STRESSED" : "TIRED";
  const worst = worstMood === "STRESSED" ? stressed! : tired!;
  const delta = worst - calm;
  const label = worstMood === "STRESSED" ? "stressed" : "tired";

  if (delta <= 0.15) {
    return {
      level: "INFO" as const,
      text: `During ${label} laps, average pace is within ${Math.abs(delta).toFixed(3)}s of calm laps (calm average ${formatLapTime(calm)}). No stress-driven pace loss detected in this stint.`,
    };
  }

  return {
    level: delta >= 0.6 ? ("CRITICAL" as const) : ("WATCH" as const),
    text: `${delta >= 0.6 ? "CRITICAL" : "WATCH"}: During ${label} laps, average pace is +${delta.toFixed(3)}s slower than calm laps (${formatLapTime(worst)} vs calm average ${formatLapTime(calm)}). Tire degradation alone does not account for this pace drop.`,
  };
}


/** Deterministic mock of the audio analysis pipeline for an uploaded file. */
export function buildLiveSample(file: File, lap: number): { sample: Sample; lapRow: Lap } {
  const seed = [...file.name].reduce((a, c) => a + c.charCodeAt(0), file.size) % 3;
  const preset: Array<{
    mood: Mood;
    stress: number;
    pitch: number;
    detectedLang: string;
    transcript: string;
    translation: string;
    time: number;
  }> = [
    {
      mood: "STRESSED",
      stress: 84,
      pitch: 89,
      detectedLang: "ITALIAN",
      transcript: "> NON POSSO GUIDARE COSÌ! IL POSTERIORE SI MUOVE IN OGNI CURVA!",
      translation: "> I CAN'T DRIVE LIKE THIS! THE REAR MOVES IN EVERY CORNER!",
      time: 91.58,
    },
    {
      mood: "TIRED",
      stress: 49,
      pitch: 43,
      detectedLang: "SPANISH",
      transcript: "> LOS NEUMÁTICOS ESTÁN ACABADOS... SOLO ESTOY GESTIONANDO.",
      translation: "> THE TYRES ARE DONE... I'M JUST MANAGING.",
      time: 90.94,
    },
    {
      mood: "CALM",
      stress: 21,
      pitch: 31,
      detectedLang: "FRENCH",
      transcript: "> LA VOITURE EST BONNE, JE PEUX TENIR CE RYTHME.",
      translation: "> CAR IS GOOD, I CAN HOLD THIS PACE.",
      time: 89.86,
    },
  ];
  const p = preset[seed]!;
  const duration = Math.min(24, Math.max(4, Math.round((file.size / 32000) * 10) / 10));

  return {
    sample: {
      id: `live-${lap}-${Date.now()}`,
      label: `Lap ${lap} (Live)`,
      lap,
      mood: p.mood,
      duration,
      detectedLang: p.detectedLang,
      transcript: p.transcript,
      translation: p.translation,
      stress: p.stress,
      pitch: p.pitch,
      live: true,
    },
    lapRow: { lap, time: p.time, mood: p.mood, live: true },
  };
}
