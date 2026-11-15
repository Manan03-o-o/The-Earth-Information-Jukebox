# EarthSonic — Production Deployment Guide

This guide provides click-by-click instructions to deploy EarthSonic onto **Vercel** or **Netlify**, followed by our post-deployment smoke test checklist.

---

## Option 1: Deploy on Vercel (Recommended)

1. **Sign in to Vercel**:
   Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. **Add New Project**:
   Click **"Add New..."** → **"Project"**.
3. **Import Git Repository**:
   Locate `The-Earth-Information-Jukebox` and click **"Import"**.
4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: Click *Edit* and select `earthsonic`.
   - **Build Command**: `npm run build` (or leave default).
   - **Output Directory**: `dist` (or leave default).
   - **Install Command**: `npm install` (or leave default).
5. **Deploy**:
   Click **"Deploy"**. Vercel will build the React landing page, bundle Tone.js, real NASA frames, and offline audio previews.
6. **Assign Custom Domain (Optional)**:
   Navigate to *Project Settings* → *Domains* to attach a custom domain.

---

## Option 2: Deploy on Netlify

1. **Sign in to Netlify**:
   Go to [netlify.com](https://www.netlify.com/) and sign in with GitHub.
2. **Add New Site**:
   Click **"Add new site"** → **"Import an existing project"** → **"GitHub"**.
3. **Select Repository**:
   Choose `The-Earth-Information-Jukebox`.
4. **Build & Deploy Settings**:
   - **Base directory**: `earthsonic`
   - **Build command**: `npm run build`
   - **Publish directory**: `earthsonic/dist` (or `dist` if base is set to earthsonic)
5. **Deploy**:
   Click **"Deploy site"**. The repository's `netlify.toml` automatically configures immutable long-term caching for frames, vendor assets, and audio.

---

## 10-Item Post-Deployment Smoke Test Checklist

Test the live deployed URL in an incognito / private browser window with headphones:

- [ ] **1. Landing Page Loads**: Opens with 0 console errors and displays the interactive Earth globe and sound frequency visualizer.
- [ ] **2. Record Modals**: Clicking each record card or "Enter Earth Jukebox" opens the selection popup with correct metadata.
- [ ] **3. Studio Launch**: Clicking "Launch" opens `/studio.html#<1-4>` with the correct record title and visual canvas.
- [ ] **4. Audio Playback**: Clicking `▶ Play` starts the Tone.js audio engine (`running`), moves the vertical scan-line, and generates audible harmonic sound within 2 seconds.
- [ ] **5. Real NASA Frames Badge**: Record 1 (Night Lights) displays the cyan **NASA EIC DATA** badge and real 2012–2023 satellite frames; records without real frames fall back smoothly to clearly labelled synthetic demonstrations.
- [ ] **6. Offline Audio Playlist**: On the landing page, the Playlist section plays 30-second pre-rendered `.webm` previews for each phenomenon.
- [ ] **7. Guided Tour (?tour=1)**: Clicking "Watch the guided tour" or visiting `/studio.html?tour=1#1` shows the tour modal, plays records sequentially with live captions, and cancels with `Escape`.
- [ ] **8. Full Keyboard Navigation**: In studio, `Space` toggles play/pause, `ArrowLeft` / `ArrowRight` switches records, `M` toggles mute, and `Up` / `Down` adjusts volume.
- [ ] **9. Accessibility & High Contrast**: Toggling High Contrast mode enforces WCAG AAA compliant pure dark styling with high-visibility accents.
- [ ] **10. Mobile Responsiveness**: Tests on mobile viewport (390px) display the player above the fold with zero horizontal scroll.
