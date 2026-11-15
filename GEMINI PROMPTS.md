# EarthSonic: Gemini Prompt Pack

Order to run them: 1 -> download videos yourself -> 2 -> 3 -> 4 -> 5 -> 6 (optional 7) -> 8 -> 9 -> 10 -> 11 -> 12.

How to use: open the Gemini agent in your IDE, copy the PROJECT CONTEXT block, then the TASK block of ONE prompt, paste both, send. Wait for its report, then move to the next. After prompts 1, 3, 4, 5, 9 push to GitHub and tell Claude "check repo" for an independent test.


---

## PROJECT CONTEXT (paste before every prompt)

```
PROJECT CONTEXT (read first)
Project: "EarthSonic - The Earth Information Jukebox" for the NASA Space Apps Challenge 2026. The challenge: pair NASA Earth Information Center (EIC) visual frames with sonification generated in real time. Accessibility for blind and low-vision users is a core theme. Judges value impact, creativity, validity, relevance and presentation.
Folder: D:\coding\nasas space hackathon\earthsonic (Vite + React + TypeScript).
- src/App.tsx + src/App.css = landing page (dark theme, 4 record cards, popup that links to /studio.html#1 .. #4).
- public/studio.html = standalone sound engine and player (HTML + inline JS, Tone.js bundled at public/vendor/Tone.js). Records: 1 Night Lights, 2 Lightning from the ISS, 3 GEOS Aerosols, 4 Ocean Currents.
- Frame sequences live in public/frames/<slug>/001.jpg, 002.jpg ... Slugs: night-lights, lightning-from-the-iss, geos-aerosols, ocean-currents. If a record has fewer than 2 frames it falls back to built-in synthetic frames (badge says DEMO / SYNTHETIC DATA; real frames show NASA EIC DATA).
GLOBAL RULES
- Work autonomously. Run commands, test in a real browser, read console and network logs. Do not ask me questions; decide and tell me what you decided.
- Before changing a file, copy the original into _qa_backup/ (unless the task is the cleanup task).
- Do not change the landing page look or the sound mapping unless this task says so.
- Never invent facts about NASA data. Never label synthetic frames as real data.
- Do NOT run git commit or git push.
- Every claim of "works" must be backed by something you actually ran or saw.
- Finish with: files changed, what you tested (with evidence), anything unresolved.
```


---

## PROMPT 1. LIGHTNING: a drum hit for every flash (run first)

_Makes the Lightning record audible all the time. Tested by me: drum hits 22 -> 158 per 20 s._

```
TASK
In public/studio.html, in function tick, find this exact line:
if(newFrame&&ri==1){let c=0;for(let by=0;by<6;by++)for(let bx=0;bx<8;bx++){let m=0;for(let y=0;y<6;y++)for(let x=0;x<8;x++)m=Math.max(m,F.br[(by*6+y)*GW+bx*8+x]);if(m>.3)c++}ev+=c}
Replace it with:
if(newFrame&&ri==1){let c=0;const hits=[];for(let by=0;by<6;by++)for(let bx=0;bx<8;bx++){let m=0;for(let y=0;y<6;y++)for(let x=0;x<8;x++)m=Math.max(m,F.br[(by*6+y)*GW+bx*8+x]);if(m>.3){c++;hits.push({bx,by,m})}}ev+=c;
if(playing&&A&&hits.length){hits.sort((a,b)=>b.m-a.m).slice(0,3).forEach((h,i)=>{const pv=(h.bx/7)*2-1,tt=Tone.now()+.03+i*.05;A.pan2.pan.rampTo(pv,.02);const fq=Tone.Frequency(SCALE[mapToScale(1-(h.by*6+3)/GH)]).toFrequency()/2;A.kick.triggerAttackRelease(fq,'16n',tt,Math.min(1,h.m*ST.int));nodes.push({x:h.bx*8+4,y:h.by*6+3,c:'#e879f9',l:1});if(i==0)A.hat.triggerAttackRelease('32n',tt,Math.min(1,.4*ST.int))})}}
Change nothing else.
VERIFY: npm run build passes. Open /studio.html#2, press Play for 20 seconds: there must be no console errors, the "Flash events" counter must increase, and the analyser must show sound in almost every second (report how many seconds were silent).
```


---

## PROMPT 2. EXTRACT FRAMES from my downloaded videos (run after you download videos)

_Fill in the three video paths first. Needs ffmpeg and the make-frames.ps1 file I gave you in the earthsonic folder._

```
TASK
I downloaded NASA videos. Convert each into frames using the script earthsonic\make-frames.ps1 (if it does not exist, create it: it must use ffprobe to read the duration, then ffmpeg with fps = 100/duration, scale=640:-2, -q:v 4, max 120 frames, output public\frames\<slug>\001.jpg ...; deleting old jpgs in that folder first).
Run it with:
- Ocean currents video:  [PASTE FULL PATH]   slug: ocean-currents
- GEOS aerosols video:   [PASTE FULL PATH]   slug: geos-aerosols
- Lightning ISS video:   [PASTE FULL PATH]   slug: lightning-from-the-iss
If ffmpeg is missing, install it with winget (Gyan.FFmpeg) and reopen the shell. Skip any record whose path is still the placeholder.
Command form: powershell -ExecutionPolicy Bypass -File .\make-frames.ps1 -Video "<path>" -Slug <slug>
VERIFY: for each processed record report the number of frames, total MB, and image size. Open /studio.html#N with npm run dev and confirm the badge says NASA EIC DATA and the canvas shows the real frame. Keep each frame folder under about 8 MB; if larger, re-run with a smaller -Frames or -Width.
```


---

## PROMPT 3. CALIBRATE the sound for real frames (run after prompt 2)

_Real NASA frames look different from my synthetic ones, so thresholds need tuning. This keeps every record lively._

```
TASK
Calibrate the sonification of every record that has real frames in public/frames/. Do not touch records that only use synthetic frames except to confirm they still work.
Steps:
1. For each real record, look at 5 sample frames across the sequence and describe the dominant colors and brightness range.
2. Write a temporary Playwright measurement script (outside src/ and public/, e.g. scripts/measure.mjs). It opens /studio.html#N, presses Play at 1x speed for 60 seconds and logs: notes or hits per second (wrap the triggerAttackRelease methods of A.lead, A.kick, A.ch[k].s to count), the longest silent gap in seconds, number of distinct pitches, and peak level from A.an.getValue() (use isFinite, silence is -Infinity).
3. TARGETS: Night Lights, Aerosols, Ocean: average 3 to 12 notes per second, no silent gap longer than 2 seconds, at least 8 distinct pitches, no clipping (peak below -3 dB). Lightning: a hit for every visible flash (max 3 per frame).
4. Tune ONLY constants and thresholds inside the matching branch of triggerNotes (brightness thresholds, density multipliers), plus for Aerosols the HUES / classification so it matches the real colors per particle type in that video, and for Ocean the warmth formula so real colors give a useful pitch range. Keep the sound mapping logic and the musical scale unchanged.
5. Re-run the measurement before and after for each record and confirm synthetic fallback records still play.
REPORT: a before/after table per record (notes per second, longest silence, distinct pitches, peak dB) and the exact constants you changed.
Delete the temporary measurement script at the end only if it is not needed (otherwise keep it in scripts/ and say so).
```


---

## PROMPT 4. STUDIO PAGE POLISH (player first, mobile friendly)

_Judges click Launch and land on a second big hero. This puts the player on screen immediately._

```
TASK
Polish public/studio.html so it opens straight on the player:
1. Remove the large duplicate hero section ("HEAR THE PLANET CHANGE" with the globe and the intro paragraphs) OR collapse it to a one-line title. The header nav (Home, Studio, Science, Attribution) must stay.
2. The player (record list, canvas, Play/Stop/Prev/Next/Mute/Record buttons, timeline, controls) must be visible without scrolling on a 1366x768 laptop and a 390x844 phone.
3. Make the Play button very obvious (large, primary color) and add a one-line hint under it: "Press Play, or use the Space key. Use headphones for the best experience."
4. On phones (max-width 1000px) stack in this order: player, record list, audio controls, Explain this sound.
5. Keep every element ID and class that the JavaScript uses. Do not change any JavaScript logic.
VERIFY with Playwright at 1366x768, 768x1024, 390x844: no horizontal scroll, Play button visible without scrolling, zero console errors, all four records still play sound (Tone.context.state running and analyser not silent), keyboard shortcuts still work. Save screenshots to _qa_backup/screens/.
```


---

## PROMPT 5. LANDING PAGE UPGRADE (how it works, accessibility, playlist, credits)

_Adds the sections that tell the story to judges. Keeps your design._

```
TASK
Extend the React landing page (src/App.tsx and src/App.css) WITHOUT changing the existing sections' look or text. Reuse the existing dark theme, fonts and CSS variables. Add these new sections between "The Science" and the footer and add matching nav links:
A) "How it works": a 4 step visual strip: 1 NASA frame -> 2 scan-line reads brightness, color and change -> 3 snapped to a musical scale -> 4 live sound in your browser. Use simple icons from lucide-react and one small table of the mapping (brightness -> pitch, color -> instrument, position -> stereo pan, change -> urgency, flash -> percussion).
B) "Built for everyone" (accessibility): 6 short cards: keyboard control, screen-reader descriptions, spoken audio description, high contrast, reduced motion, plain-text "Explain this sound".
C) "Playlist": 4 cards (one per record) each with an <audio controls preload="none"> pointing to /audio/<slug>.webm (slugs: night-lights, lightning-from-the-iss, geos-aerosols, ocean-currents) and the record name. If an audio file fails to load (error event) hide that card; if all four fail, hide the whole Playlist section and its nav link. Give each audio element an aria-label.
D) "Data and credits": list the four NASA visualizations used (Change in Night Lights between 2012 and 2023; Lightning Events Detected from the ISS 2017-2023; GEOS Aerosols; Perpetual Ocean 2: Western Boundary Currents), credit "NASA's Scientific Visualization Studio / Earth Information Center", and the line "This project is not endorsed by NASA." Add a small note that records without real frames use clearly labelled synthetic demonstration frames. To keep the note accurate, add a constant array named REAL_RECORDS near the top of App.tsx (initially ["night-lights"]) and show "Real NASA frames" or "Demo frames" per record based on it, with a code comment telling me to update the array whenever I add real frames for another record.
Requirements: responsive at 390, 768, 1440 px with no horizontal scroll; keyboard accessible; visible focus; headings in a logical order; npm run build passes with no TypeScript or ESLint errors.
VERIFY with Playwright screenshots at the three widths (save to _qa_backup/screens/) and report any console errors.
```


---

## PROMPT 6. AUDIO PLAYLIST EXPORT script (run after frames are final)

_Creates public/audio/*.webm automatically so the Playlist section works and judges can listen without running anything._

```
TASK
Create scripts/export-audio.mjs (Node, ESM) that generates one audio file per record from the studio itself:
1. Add Playwright as a devDependency (npm i -D playwright) and use the system Chrome or Playwright Chromium.
2. Start a static server on the built site (run npm run build first, then serve dist with a tiny Node http server or vite preview on a free port).
3. For each record N = 1..4: open /studio.html#N with the launch flag --autoplay-policy=no-user-gesture-required, set speed to 1x, click #play, wait 2 seconds, click #rec to start recording (this uses the in-page Tone.Recorder), wait 30 seconds, then click #rec again and capture the download. Save to public/audio/<slug>.webm where slug is night-lights, lightning-from-the-iss, geos-aerosols, ocean-currents.
4. Print each file size. Fail loudly if a file is smaller than 100 KB (that means silence) and retry once.
5. Add an npm script "export-audio": "node scripts/export-audio.mjs".
Run it and verify four files exist and each is larger than 100 KB. Also confirm with ffprobe (if available) that each has an audio stream of about 30 seconds. Total public/audio must stay under 15 MB.
If automated recording is impossible in this environment, write clear manual steps in scripts/EXPORT_AUDIO.md (open each record, press Play, click Record & export for 30 seconds, stop, move the downloaded file into public/audio/ with the right name).
```


---

## PROMPT 7. GUIDED TOUR mode for the demo video (optional, great for presentation)

_One click plays all four records in sequence with big captions, so recording your demo video is easy._

```
TASK
Add an optional guided tour to public/studio.html, activated by the query string ?tour=1 (example: /studio.html?tour=1#1). Normal behaviour without the query string must be completely unchanged.
Tour behaviour:
1. Show a large centered button "Start the guided tour" (needed because browsers require a click to start audio). On click: initialize audio, then play the records in this order with a fixed duration each: Night Lights 25 s, Lightning 20 s, Aerosols 20 s, Ocean Currents 20 s, then show a closing card "EarthSonic. Hear the planet change." with the NASA credit.
2. During the tour show a large caption overlay at the bottom of the player canvas using the record's existing story text ("What it is" and "What to listen for"), fading in and out. Update the aria-live region too.
3. Escape stops the tour and returns to normal controls. Respect the reduce-motion setting (no fades).
4. Add a secondary button on the React landing hero: "Watch the guided tour" linking to studio.html?tour=1#1 (keep the existing hero layout and style).
VERIFY with Playwright: tour starts after click, switches records at the right times (use a time-accelerated test by temporarily shortening durations through a URL parameter tourSpeed=10), Escape stops it, no console errors, and the normal studio (no ?tour) still works.
```


---

## PROMPT 8. ACCESSIBILITY AUDIT and fixes

_Accessibility is the core theme, so prove it with an automated audit._

```
TASK
Run an automated accessibility audit and fix real problems.
1. npm i -D @axe-core/playwright. Write scripts/a11y.mjs that audits (axe, WCAG 2 A and AA) the landing page at 1440 and 390 px, the landing popup when open, and /studio.html#1 to #4 (also with high contrast mode on and after pressing Play).
2. Fix every serious and critical violation (names/labels, contrast, focus order, heading order, landmarks, ARIA misuse). Keep the visual design; adjust colors only as much as needed for contrast.
3. Manual checks to run and report: complete the whole studio flow with the keyboard only (Tab, Enter, Space, arrows); a visible focus ring everywhere; the aria-live caption updates when the record changes; prefers-reduced-motion is respected; every button has an accessible name; the canvas has a text alternative.
4. Add to the studio page a short visible keyboard help (already exists) and a "Skip to player" link that works.
REPORT: before and after violation counts per page, the list of fixes, and anything you could not fix. Do not break any sound functionality: re-run a quick sound check on all four records (Tone.context.state running and analyser not silent).
```


---

## PROMPT 9. REPO CLEANUP, READMEs and lock file

_Do this after the other prompts, just before deploying. First copy the README.md I gave you into the repo root as README.new.md._

```
TASK
Prepare the repository for submission.
1. README: the file README.new.md (repo root) is my final README. Copy it to both the repo root README.md and earthsonic/README.md (replacing the default Vite README), saving as UTF-8 without BOM. Delete README.new.md. Then update the "Real NASA frames" column of the records table so it is TRUE: for each slug, count jpg files in earthsonic/public/frames/<slug>/ (real if 2 or more). Do not invent links: leave the [ADD YOUR LINK] and [ADD NAMES] placeholders.
2. Delete clutter: earthsonic/_qa_backup/ (whole folder), earthsonic/index.backup.html, earthsonic/studio.source.backup.html, and any other *.backup.* or temporary files. List everything you deleted.
3. .gitignore: make sure node_modules, dist and *.log are ignored. Do not ignore public/frames, public/audio or public/vendor.
4. Lock file: delete node_modules and package-lock.json in earthsonic, run npm install, then npm run build, then confirm that "npm ci" also works from a clean state (run it in a temp copy). Report the result.
5. Make sure make-frames.ps1 is in the earthsonic folder.
6. Run npm run build and npm run lint; fix real errors.
7. Show me git status and the total size of the repo (excluding node_modules). Do not commit or push.
```


---

## PROMPT 10. FULL QA TEST and report (run after every big change)

_Tests everything in a real browser and gives a pass/fail report._

```
TASK
Test the whole product like a QA engineer and fix real bugs (do not redesign).
Test plan:
A. Build and code health: npm run build, npm run lint, npx tsc -b (zero errors); test the BUILT site with npm run preview, not only npm run dev.
B. Landing page (1440x900, 768x1024, 390x844): no console errors, no failed requests (ignore external font blocking), 4 record cards, popup open/close, Launch link goes to the right studio hash, nav links scroll to sections, mobile menu works, no horizontal scroll, NASA credit line visible.
C. Studio /studio.html#1..#4 and no hash: correct record opens; hash change switches record; Home link returns to landing; click Play and verify Tone.context.state is "running" and the analyser (A.an.getValue(), use isFinite because silence is -Infinity) is above -90 dB within 10 seconds on EVERY record; scan-line moves; caption updates; badge says NASA EIC DATA only for records with real frames.
D. Controls: keyboard (Space, Left, Right, M, Up, Down), volume, speed, intensity, Scientific/Artistic mode, audio description toggle, high contrast, reduce motion, Aerosol mixer mute/solo, Lightning flash counter increases, Record and export downloads a file larger than 20 KB, switching records 20 times quickly causes no errors.
E. Robustness: block ALL external network (only localhost allowed) and confirm everything still works; block /vendor/Tone.js and confirm the page stays alive with a friendly message; missing frames fall back to synthetic.
F. Performance: report page weight of / and /studio.html with frames, time until real frames finish loading, any file over 2 MB.
Fix real bugs you find (3 fix rounds max per bug), re-test, then report.
REPORT FORMAT: 1) one line verdict READY / READY WITH ISSUES / NOT READY. 2) table: ID | test | PASS/FAIL/NOT TESTED | evidence. 3) bugs found (file, line, cause). 4) fixes made. 5) unresolved. 6) screenshots saved (list paths).
```


---

## PROMPT 11. DEPLOYMENT preparation (Vercel or Netlify)

_Gets the project ready to publish; you click the final buttons on the website._

```
TASK
Prepare the project for static deployment and verify it.
1. Make sure the production build works from a clean clone: in a temp folder copy only git-tracked files, run npm install and npm run build, then serve dist with npm run preview.
2. Check that all asset paths are relative or base-aware (no hard-coded absolute URLs except none needed), that /studio.html, /vendor/Tone.js, /frames/*, /audio/* are served by the preview, and that the landing links to studio.html work.
3. Add vercel.json with long cache headers for /frames/*, /audio/* and /vendor/* (public, max-age=31536000, immutable) and no rewrites that would break /studio.html. Add netlify.toml with the same build settings (base = "earthsonic", command = "npm run build", publish = "dist") and the same cache headers.
4. Write DEPLOY.md (repo root) with exact click-by-click steps for BOTH Vercel and Netlify: import the GitHub repo, set Root Directory to earthsonic, Build Command npm run build, Output Directory dist, then open the live link and test it in a private window with headphones. Include a final 10-item smoke test checklist.
5. Report the total size of dist and warn if it is over 40 MB.
Do not deploy anything and do not commit.
```


---

## PROMPT 12. FINAL DOCS: make README and SUBMISSION text 100 percent accurate (run last)

_Put SUBMISSION.md in the repo root first. This syncs the text with what actually exists._

```
TASK
Make README.md and SUBMISSION.md (repo root) fully accurate and ready to submit.
1. Inspect the real state: which records have real frames (count jpgs in earthsonic/public/frames/<slug>), whether public/audio/*.webm exist, whether the guided tour (?tour=1) exists, and the live accessibility features in studio.html.
2. Update both documents so they only claim what exists. In the data table mark each record as real NASA frames or synthetic demonstration frames. If audio files exist, mention the Playlist; if the tour exists, mention it.
3. Fill the 150-word short description and the long description so they match the final product. Keep the tone honest and clear; keep "Honest limits".
4. List in SUBMISSION.md the exact NASA visualizations used (only those with real frames), with the credit "NASA's Scientific Visualization Studio / Earth Information Center".
5. Leave the placeholders for my live link, video link and team names, and list them at the very top as a TODO block.
6. Output a final 1-page "Judge cheat sheet" at the end of SUBMISSION.md: 5 sentences I can say in 30 seconds, plus the 5 most likely judge questions with short true answers based on the actual app.
Do not invent any statistic, link or claim. Do not commit.
```
