import { chromium } from 'playwright';

const RECORD_NAMES = [
  'Night Lights',
  'Lightning from the ISS',
  'GEOS Aerosols',
  'Ocean Currents'
];

async function measureRecord(context, recordIndex, durationSec = 60) {
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser error - ${RECORD_NAMES[recordIndex]}]:`, msg.text());
  });

  const url = `http://127.0.0.1:5173/studio.html#${recordIndex + 1}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // Click play button to start audio
  await page.click('#play');
  await page.waitForTimeout(800);

  // Setup metrics collection
  await page.evaluate(() => {
    window.__metrics = {
      noteEvents: [],
      distinctPitches: new Set(),
      peakDb: -Infinity,
      volumeSamples: []
    };

    const recordPitch = (pitch) => {
      try {
        let pStr = 'hit';
        if (typeof pitch === 'string') {
          pStr = pitch;
        } else if (typeof pitch === 'number') {
          pStr = `${Math.round(pitch)}Hz`;
        } else if (pitch && typeof pitch.toNote === 'function') {
          pStr = pitch.toNote();
        } else if (pitch && typeof pitch.toFrequency === 'function') {
          pStr = `${Math.round(pitch.toFrequency())}Hz`;
        } else if (Array.isArray(pitch)) {
          pStr = pitch.join('/');
        }
        window.__metrics.distinctPitches.add(pStr);
        window.__metrics.noteEvents.push({ time: performance.now(), pitch: pStr });
      } catch (e) {}
    };

    const hookSynth = (synth, defaultName) => {
      if (!synth || synth.__instrumented) return;
      synth.__instrumented = true;
      const orig = synth.triggerAttackRelease;
      synth.triggerAttackRelease = function(...args) {
        recordPitch(args[0] !== undefined ? args[0] : defaultName);
        return orig.apply(this, args);
      };
    };

    if (window.A) {
      hookSynth(window.A.lead, 'lead');
      hookSynth(window.A.kick, 'kick');
      hookSynth(window.A.hat, 'hat');
      hookSynth(window.A.pad, 'pad');
      if (Array.isArray(window.A.ch)) {
        window.A.ch.forEach((ch, idx) => {
          if (ch && ch.s) hookSynth(ch.s, `ch${idx}`);
        });
      }
    }

    window.__samplingInterval = setInterval(() => {
      if (window.A && window.A.an) {
        const vals = window.A.an.getValue();
        let maxDb = -Infinity;
        for (let i = 0; i < vals.length; i++) {
          if (isFinite(vals[i]) && vals[i] > maxDb) {
            maxDb = vals[i];
          }
        }
        if (maxDb > window.__metrics.peakDb) {
          window.__metrics.peakDb = maxDb;
        }
        window.__metrics.volumeSamples.push({
          time: performance.now(),
          maxDb: maxDb
        });
      }
    }, 100);
  });

  console.log(`Measuring ${RECORD_NAMES[recordIndex]} for ${durationSec}s at 1x speed...`);
  await page.waitForTimeout(durationSec * 1000);

  const results = await page.evaluate(() => {
    clearInterval(window.__samplingInterval);
    const m = window.__metrics;
    const noteCount = m.noteEvents.length;
    const distinctPitchCount = m.distinctPitches.size;
    const distinctPitchList = Array.from(m.distinctPitches);
    const peakDb = m.peakDb;

    let longestSilentGapMs = 0;
    let currentSilentStart = null;
    const samples = m.volumeSamples;

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const isSilent = !isFinite(s.maxDb) || s.maxDb <= -85;
      if (isSilent) {
        if (currentSilentStart === null) {
          currentSilentStart = s.time;
        }
      } else {
        if (currentSilentStart !== null) {
          const gap = s.time - currentSilentStart;
          if (gap > longestSilentGapMs) longestSilentGapMs = gap;
          currentSilentStart = null;
        }
      }
    }
    if (currentSilentStart !== null && samples.length > 0) {
      const gap = samples[samples.length - 1].time - currentSilentStart;
      if (gap > longestSilentGapMs) longestSilentGapMs = gap;
    }

    return {
      noteCount,
      distinctPitchCount,
      distinctPitchList: distinctPitchList.slice(0, 15),
      peakDb,
      longestSilentGapSec: Math.round(longestSilentGapMs / 100) / 10,
      sampleCount: samples.length
    };
  });

  await page.close();

  const notesPerSec = Math.round((results.noteCount / durationSec) * 10) / 10;
  return {
    recordIndex,
    name: RECORD_NAMES[recordIndex],
    durationSec,
    notesPerSec,
    totalNotes: results.noteCount,
    distinctPitchCount: results.distinctPitchCount,
    distinctPitchList: results.distinctPitchList,
    longestSilentGapSec: results.longestSilentGapSec,
    peakDb: Math.round(results.peakDb * 10) / 10
  };
}

async function inspectSampleFrames(page) {
  console.log('\n--- Inspecting 5 Sample Frames for Night Lights ---');
  await page.goto('http://127.0.0.1:5173/studio.html#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const frameIndices = [0, 24, 49, 74, 99];
  const analysis = await page.evaluate((indices) => {
    const rf = window.getRealFrames ? window.getRealFrames(0) : null;
    if (!rf || rf.length === 0) return { error: 'No real frames found' };

    const results = [];
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 36;
    const ctx = canvas.getContext('2d');

    indices.forEach(idx => {
      const img = rf[idx] || rf[rf.length - 1];
      ctx.drawImage(img, 0, 0, 64, 36);
      const id = ctx.getImageData(0, 0, 64, 36).data;
      let minBr = 1, maxBr = 0, sumBr = 0;
      let totalR = 0, totalG = 0, totalB = 0;
      const count = 64 * 36;

      for (let i = 0; i < id.length; i += 4) {
        const r = id[i] / 255;
        const g = id[i + 1] / 255;
        const b = id[i + 2] / 255;
        totalR += r;
        totalG += g;
        totalB += b;
        const br = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (br < minBr) minBr = br;
        if (br > maxBr) maxBr = br;
        sumBr += br;
      }

      results.push({
        frameNumber: String(idx + 1).padStart(3, '0') + '.jpg',
        minBrightness: Math.round(minBr * 1000) / 1000,
        maxBrightness: Math.round(maxBr * 1000) / 1000,
        avgBrightness: Math.round((sumBr / count) * 1000) / 1000,
        dominantRgb: `rgb(${Math.round((totalR / count) * 255)}, ${Math.round((totalG / count) * 255)}, ${Math.round((totalB / count) * 255)})`
      });
    });

    return results;
  }, frameIndices);

  return analysis;
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const context = await browser.newContext();

  // Step 1: Inspect 5 sample frames
  const inspectPage = await context.newPage();
  const frameStats = await inspectSampleFrames(inspectPage);
  await inspectPage.close();
  console.log('Frame Sample Analysis:');
  console.table(frameStats);

  // Step 2: Measure records
  console.log('\n--- Running Calibration Measurements ---');
  let duration = 60;
  if (process.argv.includes('--short')) duration = 15;
  const durIdx = process.argv.indexOf('--duration');
  if (durIdx !== -1 && process.argv[durIdx + 1]) {
    duration = parseInt(process.argv[durIdx + 1], 10);
  }

  let targetRecords = [0, 1, 2, 3];
  const recIdx = process.argv.indexOf('--record');
  if (recIdx !== -1 && process.argv[recIdx + 1]) {
    targetRecords = [parseInt(process.argv[recIdx + 1], 10)];
  }

  const records = [];
  for (const ri of targetRecords) {
    const res = await measureRecord(context, ri, duration);
    records.push(res);
    console.log(`[Result] ${res.name}: ${res.notesPerSec} notes/s, longest silence: ${res.longestSilentGapSec}s, distinct pitches: ${res.distinctPitchCount}, peak: ${res.peakDb} dB`);
  }

  console.log('\n=== CALIBRATION MEASUREMENT SUMMARY ===');
  console.table(records.map(r => ({
    Record: r.name,
    'Notes / sec': r.notesPerSec,
    'Longest Silence (s)': r.longestSilentGapSec,
    'Distinct Pitches': r.distinctPitchCount,
    'Peak (dB)': r.peakDb
  })));

  await browser.close();
}

main().catch(err => {
  console.error('Measurement failed:', err);
  process.exit(1);
});
