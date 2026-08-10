export type Mood = "CALM" | "TIRED" | "STRESSED";

export type Lap = {
  lap: number;
  time: number; // seconds
  mood: Mood;
};

export const laps: Lap[] = [
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
