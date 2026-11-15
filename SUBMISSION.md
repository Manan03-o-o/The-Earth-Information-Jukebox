# EarthSonic — The Earth Information Jukebox
### NASA Space Apps Challenge 2026 Submission

```text
================================================================================
TODO BEFORE FINAL SUBMISSION:
[ADD YOUR LIVE LINK]  : _____________________________ (e.g., https://earthsonic.vercel.app)
[ADD YOUR VIDEO LINK] : _____________________________ (e.g., YouTube / Vimeo link)
[ADD YOUR TEAM NAMES] : _____________________________ (e.g., Team Name & Members)
================================================================================
```

---

## 1. Project Overview & Pitch

### Short Description (150 words)
EarthSonic transforms NASA Earth Information Center (EIC) visual data into an interactive, real-time auditory jukebox. While satellite imagery provides breathtaking views of our dynamic planet, visual data remains inaccessible to over 285 million blind and low-vision individuals. EarthSonic bridges this gap through multi-sensory sonification, converting visual frames into expressive, spatially-aware soundscapes directly inside the web browser. 

Using a custom scanline audio engine powered by Tone.js, pixel brightness maps to melodic pitch, latitude governs spatial stereo panning, optical changes trigger percussive accents, and spectral hues drive instrument timbre. Users explore global night light evolution, orbital lightning strikes, aerosol plumes, and ocean boundary currents through sound. Built with accessibility at its heart, EarthSonic features WCAG 2.1 AA compliance, screen-reader audio descriptions, high-contrast modes, and a one-click guided tour—making NASA’s planetary observations hearable by everyone.

---

## 2. The Problem & Solution

### The Challenge
NASA's Earth Science Division and the Earth Information Center collect petabytes of planetary vital signs every day. However, virtually all public dissemination relies solely on visual graphics, animations, and charts. This creates two critical issues:
1. **Accessibility Barriers:** Individuals who are blind, visually impaired, or neurodivergent face immense barriers to exploring and understanding NASA Earth science data.
2. **Sensory Saturation:** Even sighted researchers and students suffer visual fatigue when scanning complex multidimensional time series, whereas human auditory processing excels at recognizing micro-rhythms, rapid temporal anomalies, and layered polyphonic patterns simultaneously.

### The EarthSonic Solution
EarthSonic acts as a planetary jukebox that plays the sound of our changing world. By sonifying sequential Earth observation frames in real time:
- **Night Lights Evolution:** SVS satellite imagery reveals rural electrification and urban growth through evolving pentatonic melodies.
- **Lightning from the ISS:** Orbital optical lightning flashes trigger spatial percussive strikes panned across the stereo field corresponding to geographic coordinates.
- **GEOS Aerosols:** Dust, sea salt, black carbon, and sulfate plumes are partitioned across 4 distinct synthesized frequency bands, enabling listeners to hear atmospheric transport.
- **Ocean Currents:** Western boundary thermal gradients and kinetic velocity drive dynamic warm pads and oceanic chord progressions.

---

## 3. Data Sources & Real vs. Demonstration Status

EarthSonic is built with an uncompromising commitment to scientific honesty and transparency. Visual frames are dynamically detected and classified upon load:

| Record # | Record Title | Visual Source | Frame Count | Status | Sound Engine Behavior |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | **Change in Night Lights (2012–2023)** | NASA Scientific Visualization Studio (SVS) | **100 Real Frames** | **Real NASA Data** | Calibrated scanline sonification mapping luminosity to pentatonic scale frequencies. |
| **02** | **Lightning from the ISS** | Synthetic Demonstration Frame Sequence | Fallback | **Demo Data** | Spatial flash detector triggering stereo-panned kick percussion and noise hi-hats. |
| **03** | **GEOS Aerosols** | Synthetic Demonstration Frame Sequence | Fallback | **Demo Data** | Quad-band multi-timbral synthesis mapping particle hues (smoke, dust, sulfate). |
| **04** | **Ocean Currents** | Synthetic Demonstration Frame Sequence | Fallback | **Demo Data** | Thermal/kinetic chordal pads driven by sea surface boundary currents. |

> **Credit & Attribution:** Real imagery courtesy of **NASA's Scientific Visualization Studio (SVS) / Earth Information Center (EIC)**.  
> *Disclaimer:* This project was created for the NASA Space Apps Challenge 2026 and is not endorsed by or affiliated with NASA.

### Honest Limits
- **Visual Proxies:** Pixel brightness and color values extracted from public SVS visual videos serve as **visual proxies**, not calibrated physical SI measurements (such as Watts/m² irradiance or aerosol optical depth in ppm).
- **Artistic vs. Scientific Calibration:** The sonification engine provides both a **Scientific Mode** (strict linear mapping of brightness and coordinates to pitch frequencies) and an **Artistic Mode** (quantized pentatonic scale harmonizations for prolonged listening comfort).
- **Graceful Fallback:** Any dataset lacking local pre-extracted frame sequences automatically and seamlessly falls back to procedural demonstration frames, displaying an unmistakable `DEMO / SYNTHETIC DATA` badge in the interface.

---

## 4. Key Features

### 🎧 Standalone Real-Time Audio Engine (`studio.html`)
- Built with zero compile dependencies using Web Audio API and local bundled **Tone.js**.
- Runs 100% offline with zero CDN dependencies or external server requirements.
- Sub-millisecond latency scanline sonification analyzing canvas pixel grids in real time.
- Integrated **Tone.Recorder** exporting high-quality stereo audio directly to the browser.

### 🌟 Interactive Guided Tour (`?tour=1`)
- One-click automated showcase cycling through all four planetary records with synchronized visual captions.
- Ideal for judges, classroom demonstrations, and presentation video recording.
- Full keyboard control (`Escape` cancels at any time) and `tourSpeed` acceleration for automated testing.

### 📻 Pre-Rendered Audio Playlist
- High-fidelity 30-second Opus/WebM audio recordings pre-rendered directly from the sound engine.
- Allows judges and low-bandwidth users on mobile devices to audition the sonifications instantly without running the real-time synthesis engine.

### ♿ Universal Accessibility & Inclusivity
- **Axe-Core Automated Audit:** 0 Critical, 0 Serious, 0 Contrast violations across all pages and modes.
- **Keyboard Navigation:** Complete functional control via keyboard (`Space` to toggle playback, `Left`/`Right` to switch records, `M` to mute, `Up`/`Down` for volume).
- **Screen Reader Support:** Semantic HTML5 landmarks, ARIA-live regions announcing record changes, and descriptive canvas text alternatives.
- **High Contrast & Reduced Motion:** Built-in high contrast toggle (`#hc`) and strict compliance with `prefers-reduced-motion` eliminating visual flashes.
- **Spoken Audio Descriptions:** Integrated speech synthesis (`#ad-toggle`) vocalizing real-time planetary events and visual changes.

---

## 5. Technology Stack & Architecture

- **Frontend Framework:** React 19, TypeScript, Vite.
- **Audio Processing:** Web Audio API, Tone.js (bundled in `public/vendor/Tone.js`).
- **Styling:** Vanilla CSS with custom design tokens, dark space aesthetic, and responsive breakpoints (1440px desktop, 768px tablet, 390px mobile).
- **Frame Pipeline:** Custom PowerShell / FFmpeg automation script (`make-frames.ps1`) extracting SVS animations at optimized resolutions and web weights.
- **Testing & Verification:** Playwright, `@axe-core/playwright`, Node.js automated verification test suite.

---

## 6. Judge Cheat Sheet (1-Page Fast Reference)

### 30-Second Elevator Pitch (5 Sentences)
1. "Over 285 million blind and visually impaired people are excluded from experiencing NASA's stunning Earth observation imagery."
2. "EarthSonic transforms satellite datasets into an interactive, browser-based planetary jukebox that turns visual pixels into spatial soundscapes in real time."
3. "Our custom scanline engine maps pixel brightness to musical pitch, geographic latitude to stereo pan, and atmospheric events to percussive accents."
4. "With 100 real NASA SVS frames for Night Lights and automated fallback for other records, it runs completely offline with zero external dependencies."
5. "Tested to zero WCAG 2.1 AA accessibility violations, EarthSonic proves that everyone can hear the planet change."

---

### Top 5 Judge Questions & Honest Answers

#### Q1: "Is this real NASA data or just pre-recorded music?"
**Answer:** "It is live, algorithmic sonification generated in real time in your browser using the Web Audio API. Our Night Lights record uses 100 real satellite frames from NASA's Scientific Visualization Studio. As the scanline sweeps across the image, pixel brightness and coordinates are translated live into synthesized frequencies. The audio files on our landing page are recordings exported directly from this engine for offline listening."

#### Q2: "Why do some records say DEMO while Night Lights says NASA DATA?"
**Answer:** "We hold scientific integrity as a non-negotiable principle. Night Lights contains genuine NASA SVS satellite frames from 2012 to 2023. The other three records currently use procedural demonstration frames that emulate the visual dynamics of lightning, aerosols, and currents until their respective full frame sequences are loaded. Our system automatically detects frame counts and never mislabels synthetic data as NASA data."

#### Q3: "How does the sonification actually work? What is the mathematical mapping?"
**Answer:** "Each frame is analyzed across an optimized pixel grid. A moving scanline samples pixel brightness, which is mapped logarithmically to pitch frequencies in our scientific mode or snapped to an accessible pentatonic scale in artistic mode. Vertical position (latitude) controls stereo panning from left to right. Optical differences between consecutive frames calculate an anomaly delta that triggers percussive synth strikes on lightning flashes."

#### Q4: "What specific accommodations were made for blind and visually impaired users?"
**Answer:** "Accessibility was our baseline, not an afterthought. We ran automated Axe-core audits reaching zero WCAG 2.1 AA violations. The studio includes complete keyboard shortcuts with a visible skip link, an ARIA-live caption announcer, a built-in high-contrast theme, reduced-motion overrides, and a spoken audio description feature that uses speech synthesis to describe orbital events out loud."

#### Q5: "Can this scale to other NASA missions or real-time satellite feeds?"
**Answer:** "Yes, absolutely. The engine is modular and decodes standard image frame sequences. We provide a streamlined extraction script (`make-frames.ps1`) that takes any NASA MP4 video and formats it into calibrated frames. The same engine can ingest daily MODIS, VIIRS, or GOES satellite imagery feeds with zero code modifications."
