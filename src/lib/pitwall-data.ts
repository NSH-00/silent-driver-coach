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

export type LanguageCode = "IT" | "ES" | "FR" | "JA";

export const languages: { code: LanguageCode; label: string }[] = [
  { code: "IT", label: "Italian" },
  { code: "ES", label: "Spanish" },
  { code: "FR", label: "French" },
  { code: "JA", label: "Japanese" },
];

export const mockTranslations: Record<LanguageCode, string> = {
  IT: "Le gomme anteriori sono andate... sto solo gestendo ora.",
  ES: "Las gomas delanteras se han ido... solo estoy gestionando ahora.",
  FR: "Les pneus avant sont morts... je gère juste maintenant.",
  JA: "フロントタイヤがもう限界だ...今はマネジメントしている。",
};

export type Sample = {
  id: string;
  label: string;
  lap: number;
  mood: Mood;
  duration: number; // seconds of the radio clip
  transcript: string;
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
    transcript:
      "> RADIO IN // LAP 14\nDRIVER: Car feels good, balance is where I want it.\nDRIVER: I can hold this pace, no problem.\nENGINEER: Copy that. Keep it steady, target plus zero.",
    stress: 18,
    pitch: 34,
  },
    stress: 18,
    pitch: 34,
  },
  {
    id: "lap18",
    label: "Lap 18 (Stressed)",
    lap: 18,
    mood: "STRESSED",
    duration: 9.1,
    transcript:
      "> RADIO IN // LAP 18\nDRIVER: He pushed me wide! That's twice now, do something!\nDRIVER: I'm losing the rear everywhere, this is not working!\nENGINEER: Understood, breathe. We are on it.",
    translation:
      "> TRADUZIONE // GIRO 18\nPILOTA: Mi ha spinto fuori! È la seconda volta, fate qualcosa!\nPILOTA: Perdo il posteriore ovunque, così non funziona!\nINGEGNERE: Capito, respira. Ci stiamo lavorando.",
    translationLang: "IT / Italian",
    visual: visualStressed,
    visualPrompt: "hazard alert, contact incident, rear instability",
    stress: 88,
    pitch: 91,
  },
  {
    id: "lap22",
    label: "Lap 22 (Tired)",
    lap: 22,
    mood: "TIRED",
    duration: 8.2,
    transcript:
      "> RADIO IN // LAP 22\nDRIVER: Fronts are gone... I'm just managing now.\nDRIVER: How many laps left? Getting heavy in here.\nENGINEER: Four to go. Lift and coast turn nine.",
    translation:
      "> TRADUZIONE // GIRO 22\nPILOTA: Le anteriori sono finite... ora sto solo gestendo.\nPILOTA: Quanti giri restano? Si fa pesante qui dentro.\nINGEGNERE: Quattro alla fine. Lift and coast in curva nove.",
    translationLang: "IT / Italian",
    visual: visualTired,
    visualPrompt: "worn front tyre, degradation, pace drop",
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
