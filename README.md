# Silent Driver Coach

Create a single-page pit-wall web app called "THE SILENT CO-DRIVER" designed for race engineers to detect driver stress from radio calls.

### Design Theme & Aesthetic (Nothing OS / Nothing Recorder Style):

- Palette: Pitch black background (#000000), stark white text (#FFFFFF), dark charcoal for cards (#121212), subtle borders (#262626), and vibrant Nothing Red (#FF2B2B) for accents, recording indicators, and alert states.

- Typography: Clean minimalist sans-serif (Inter/Geist) paired with dot-matrix text (use a font like 'Space Mono' or a dot-matrix fallback) for titles, timers, and metrics.

- Layout: Modern grid of clean widgets (rounded-xl or 2xl) with subtle 1px gray borders. Minimalist, tactile, high-contrast, technical.

### Page Header:

- Title: "SILENT CO-DRIVER" in a bold dot-matrix font with a pulsing red status dot (indicating active telemetry).

### Main Layout (3-Column Dashboard):

1. Left Column: Nothing-Style Audio Player & Upload

   - A drag-and-drop zone for .wav files styled with dashed borders.

   - 3 "Quick Sample" chips: "Lap 14 (Calm)", "Lap 18 (Stressed)", "Lap 22 (Tired)". Clicking these should instantly update the dashboard's state.

   - An audio player explicitly styled like the Nothing Recorder App:

     * High-contrast dot-matrix timer (00:00.00).

     * Prominent, pulsing Nothing-Red play/record button.

     * Dynamic, animated audio waveform bars (glowing red and white).

2. Center Column: AI Processing & Emotion Detection

   - Driver Mood Indicator Card: A prominent badge showing the detected state.

     * 🟢 CALM (Green/White outline)

     * 🟡 TIRED (Muted Amber)

     * 🔴 STRESSED (Glowing Nothing Red)

   - Transcript Box: A retro, terminal-style block displaying the transcribed radio call text.

   - Voice Metrics: Simple minimalist progress bars showing "Stress Confidence" and "Vocal Pitch".

3. Right Column: Telemetry Chart

   - An interactive line chart (use Recharts) plotting Lap Number (X-axis) vs. Lap Time in seconds (Y-axis).

   - Keep the data strictly focused on Lap Time vs. Mood.

   - Data points on the graph must be color-coded by the driver's detected mood on that lap (e.g., a red dot for a stressed lap, green for calm).

### State & Interactivity (No Backend Yet):

- Do NOT connect to a real backend.

- Build this as a fully interactive prototype using React state.

- Create a mock dataset for laps 10 through 25 with lap times hovering around 90 seconds (1:30.000). 

- When a user clicks one of the "Quick Sample" chips, simulate a 2-second "AI Processing" loading state (with a dot-matrix spinner), then update the Transcript, the Mood Indicator, and highlight that specific lap on the Recharts graph.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0a6e0f79-45dc-4b8e-a94a-ea8e3e730759).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
