# 🌍 EarthSonic — The Earth Information Jukebox
> **NASA Space Apps Challenge 2026** | *Challenge: The Earth Information Jukebox*

[![NASA Space Apps](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue.svg)](https://www.spaceappschallenge.org/)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/A11y-WCAG%202.1%20AA%20Pass-brightgreen.svg)](scripts/audit-a11y.mjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Zero External Audio CDN](https://img.shields.io/badge/Tone.js-Bundled%20Offline-orange.svg)](public/vendor/Tone.js)

```text
================================================================================
TODO FOR SUBMISSION:
[ADD YOUR LIVE LINK]  : _____________________________ (e.g., https://earthsonic.vercel.app)
[ADD YOUR VIDEO LINK] : _____________________________ (e.g., YouTube / Vimeo link)
[ADD YOUR TEAM NAMES] : _____________________________ (e.g., Team Name & Members)
================================================================================
```

---

## 📖 Short Description (150 Words)
EarthSonic transforms NASA Earth Information Center (EIC) visual data into an interactive, real-time auditory jukebox. While satellite imagery provides breathtaking views of our dynamic planet, visual data remains inaccessible to over 285 million blind and low-vision individuals. EarthSonic bridges this gap through multi-sensory sonification, converting visual frames into expressive, spatially-aware soundscapes directly inside the web browser.

Using a custom scanline audio engine powered by Tone.js, pixel brightness maps to melodic pitch, latitude governs spatial stereo panning, optical changes trigger percussive accents, and spectral hues drive instrument timbre. Users explore global night light evolution, orbital lightning strikes, aerosol plumes, and ocean boundary currents through sound. Built with accessibility at its heart, EarthSonic features WCAG 2.1 AA compliance, screen-reader audio descriptions, high-contrast modes, and a one-click guided tour—making NASA’s planetary observations hearable by everyone.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/Manan03-o-o/The-Earth-Information-Jukebox.git
cd The-Earth-Information-Jukebox/earthsonic

# Install dependencies cleanly
npm install
```

### 2. Run Locally in Development
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) to explore the React landing page, or visit [http://localhost:5173/studio.html#1](http://localhost:5173/studio.html#1) to launch the sound engine directly.

### 3. Build & Production Preview
```bash
npm run build
npm run preview
```
Visit [http://localhost:4173/](http://localhost:4173/) to verify the production bundle.

---

## 📊 Planetary Records & Frame Status

EarthSonic is built with scientific transparency. Records automatically scan their frame folder on startup: records with 2 or more frames load NASA imagery; records without local frames fall back cleanly to synthetic demonstration frames:

| # | Record Slug | Title | Frame Count | Status | Description |
| :-: | :--- | :--- | :-: | :---: | :--- |
| **1** | `night-lights` | **Change in Night Lights (2012–2023)** | **100 frames** | 🟢 **Real NASA Data** | NASA SVS satellite visualization showing decadal changes in human luminosity. |
| **2** | `lightning-from-the-iss` | **Lightning from the ISS** | 0 frames | 🟡 **Demo Data** | Procedural simulation of optical lightning flashes with spatial percussion. |
| **3** | `geos-aerosols` | **GEOS Aerosols** | 0 frames | 🟡 **Demo Data** | Multi-timbral quad-band synthesis representing dust, smoke, and sulfate plumes. |
| **4** | `ocean-currents` | **Ocean Currents** | 0 frames | 🟡 **Demo Data** | Warm ambient chord progressions driven by western boundary thermal velocity. |

> **Credit:** Real frames provided by **NASA's Scientific Visualization Studio (SVS) / Earth Information Center (EIC)**.  
> *Note:* This project is an independent submission for the NASA Space Apps Challenge 2026 and is not endorsed by NASA.

---

## 🔬 How the Sonification Works

```
┌─────────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│   NASA Frame    │ ───► │  Pixel Grid Scanline    │ ───► │ Quantized Pitch Map  │ ───► │ Web Audio Engine   │
│ (Satellite JPG) │      │ Brightness, Hue, Coordinates│  │ Pentatonic / Linear  │      │ Live Tone.js Synth │
└─────────────────┘      └─────────────────────────┘      └──────────────────────┘      └────────────────────┘
```

1. **Brightness $\to$ Pitch:** Luminosity of pixels under the scanline dictates frequency. High brightness yields higher octaves; dark regions produce deep bass drones.
2. **Y-Coordinate (Latitude) $\to$ Stereo Pan:** Spatial position on the globe maps across the stereo field from -1 (far left) to +1 (far right).
3. **Temporal Delta $\to$ Percussion:** Sudden optical changes between consecutive frames (such as lightning flashes) trigger membrane kicks and high-frequency noise transients.
4. **Color & Hue $\to$ Timbre:** In aerosol and ocean modes, particle colors determine which instrument voice triggers (e.g. orange dust $\to$ marimba, blue sea salt $\to$ cello pad).
5. **Scientific vs. Artistic Modes:** 
   - *Scientific Mode:* Linear mathematical mapping of raw visual proxies to Hz.
   - *Artistic Mode:* Quantized to a harmonious pentatonic scale for musical comfort.

---

## ♿ Universal Accessibility

- **Zero Axe-Core Violations:** Audited with `@axe-core/playwright` across landing, studio, and high-contrast modes with 0 Critical, 0 Serious, and 0 Contrast issues.
- **Full Keyboard Navigation:**
  - `Space`: Play / Pause toggle
  - `Left` / `Right`: Previous / Next frame
  - `Up` / `Down`: Volume control
  - `M`: Mute / Unmute
  - `Tab` / `Enter`: Fully reachable focus ring with visible skip-to-player link.
- **Spoken Audio Descriptions:** Integrated speech synthesis reads planetary events out loud.
- **Screen Reader Announcements:** Dynamic `aria-live` region announces active record, frame index, and sound interpretations.
- **High Contrast & Motion Reductions:** Supports `prefers-reduced-motion` and one-click high-contrast mode toggle (`#hc`).

---

## 🌟 Guided Tour & Offline Playlist

- **Guided Tour (`studio.html?tour=1`):** An automated multi-record demonstration with synchronized on-canvas captions. Cycles through all four records automatically with one click.
- **Audio Playlist (`/audio/*.webm`):** Pre-rendered 30-second high-fidelity stereo audio files for judges and low-bandwidth users to audition immediately on the landing page without initializing the Web Audio context.

---

## 🛠️ Tooling & Scripts

- **`make-frames.ps1`:** Automated PowerShell script that probes any NASA video with `ffprobe`, scales to 640px wide, and extracts up to 120 zero-padded JPG frames (`001.jpg`, etc.).
  ```powershell
  .\make-frames.ps1 -Video "path\to\svs_video.mp4" -Slug "ocean-currents"
  ```
- **`scripts/export-audio.mjs`:** Playwright script that records live audio output from the studio using `Tone.Recorder` and saves to `public/audio/<slug>.webm`.
  ```bash
  npm run export-audio
  ```
- **`scripts/audit-a11y.mjs`:** Runs automated Axe-core accessibility audits on all pages.
- **`scripts/full-qa-test.mjs`:** Comprehensive 11-step end-to-end QA validation suite.

---

## 🌐 Deployment

For step-by-step instructions and a 10-item smoke test checklist for **Vercel** or **Netlify**, refer to [`DEPLOY.md`](DEPLOY.md).

---

## ⚖️ Honest Limits
- **Visual Proxies:** Pixel values extracted from SVS videos are visual proxies rendered for human viewing, not raw calibrated physical measurements (e.g. Watts/m²).
- **Offline Reliability:** All audio synths, scripts, and fonts run locally without external CDNs to guarantee zero runtime failures during judging.
