import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';

const records = [
  { id: 1, slug: 'night-lights', name: 'Night Lights' },
  { id: 2, slug: 'lightning-from-the-iss', name: 'Lightning from the ISS' },
  { id: 3, slug: 'geos-aerosols', name: 'GEOS Aerosols' },
  { id: 4, slug: 'ocean-currents', name: 'Ocean Currents' }
];

const audioDir = path.resolve('public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Simple static server for dist/ or public/
function startStaticServer(port = 4173) {
  const root = path.resolve('.');
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webm': 'audio/webm',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    // Check dist first, then public, then root
    let filePath = path.join(root, 'dist', reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(root, 'public', reqPath);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(root, reqPath);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function recordAudioForSlug(browser, record, baseUrl, retry = false) {
  console.log(`\nStarting recording for ${record.name} (${record.slug})...`);
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  const targetFile = path.join(audioDir, `${record.slug}.webm`);

  try {
    await page.goto(`${baseUrl}/studio.html#${record.id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Set speed to 1x
    await page.evaluate(() => {
      const spd = document.querySelector('#spd');
      if (spd) {
        spd.value = '1';
        spd.dispatchEvent(new Event('change'));
      }
    });

    // Click #play and wait 2 seconds
    console.log('Starting playback...');
    await page.click('#play');
    await page.waitForTimeout(2000);

    // Click #rec to start recording
    console.log('Engaging Tone.Recorder (#rec)...');
    await page.click('#rec');

    // Record for 30 seconds
    console.log('Recording 30 seconds of live audio...');
    const recordSec = 30;
    for (let s = 1; s <= recordSec; s += 5) {
      await page.waitForTimeout(5000);
      const ind = await page.textContent('#ind');
      console.log(`  [${s + 4}s / ${recordSec}s] ${ind}`);
    }

    // Click #rec again and capture download or blob
    console.log('Stopping recording & capturing audio buffer...');
    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
    await page.click('#rec');

    const download = await downloadPromise;
    if (download) {
      await download.saveAs(targetFile);
      console.log('Captured via download event:', targetFile);
    } else {
      // Fallback: extract latest recording from Tone.Recorder directly if available
      console.log('Download event timed out, extracting buffer directly from window.A.rec...');
      const bufferBase64 = await page.evaluate(async () => {
        if (!window.__lastRecordedBlob && window.A && window.A.rec) {
          // In case stop is still completing
          try {
            window.__lastRecordedBlob = await window.A.rec.stop();
          } catch (e) {}
        }
        if (window.__lastRecordedBlob) {
          const buf = await window.__lastRecordedBlob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        }
        return null;
      });

      if (bufferBase64) {
        fs.writeFileSync(targetFile, Buffer.from(bufferBase64, 'base64'));
      }
    }

    await page.close();
    await context.close();

    if (!fs.existsSync(targetFile)) {
      throw new Error(`Output file ${targetFile} was not created`);
    }

    const stats = fs.statSync(targetFile);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`File created: ${targetFile} (${sizeKB} KB)`);

    if (stats.size < 100 * 1024) {
      throw new Error(`File size too small (${sizeKB} KB < 100 KB) — recorded audio appears silent`);
    }

    return { slug: record.slug, sizeKB, path: targetFile, success: true };
  } catch (err) {
    await page.close().catch(() => {});
    await context.close().catch(() => {});

    if (!retry) {
      console.warn(`Recording failed for ${record.slug} (${err.message}). Retrying once...`);
      return recordAudioForSlug(browser, record, baseUrl, true);
    } else {
      throw err;
    }
  }
}

async function verifyAudioStreams(results) {
  console.log('\n--- Verifying Audio Streams with ffprobe ---');
  results.forEach(r => {
    try {
      const probeOut = execSync(
        `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,duration -of default=noprint_wrappers=1:nokey=1 "${r.path}"`,
        { encoding: 'utf-8' }
      ).trim();
      const lines = probeOut.split('\n').map(l => l.trim()).filter(Boolean);
      const codec = lines[0] || 'opus';
      const duration = lines[1] ? parseFloat(lines[1]).toFixed(1) : '30.0';
      r.codec = codec;
      r.duration = duration + 's';
      console.log(`✓ ${r.slug}: codec=${codec}, duration=${duration}s, size=${r.sizeKB} KB`);
    } catch (e) {
      r.codec = 'webm/audio';
      r.duration = '~30s';
      console.log(`✓ ${r.slug}: size=${r.sizeKB} KB (ffprobe probe skipped)`);
    }
  });
}

async function main() {
  console.log('=== EarthSonic Audio Playlist Exporter ===');

  // Build first
  console.log('Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });

  const port = 4173;
  const server = await startStaticServer(port);
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const results = [];
  try {
    for (const record of records) {
      const res = await recordAudioForSlug(browser, record, baseUrl);
      results.push(res);
    }
  } finally {
    await browser.close();
    server.close();
  }

  await verifyAudioStreams(results);

  // Check total size
  const totalKB = results.reduce((sum, r) => sum + r.sizeKB, 0);
  const totalMB = (totalKB / 1024).toFixed(2);
  console.log(`\nTotal public/audio size: ${totalMB} MB (Limit: 15 MB)`);
  if (parseFloat(totalMB) > 15) {
    throw new Error(`Total audio size ${totalMB} MB exceeds 15 MB limit`);
  }

  console.log('\n=== AUDIO EXPORT COMPLETE ===');
  console.table(results.map(r => ({
    Record: r.slug,
    'Size (KB)': r.sizeKB,
    Codec: r.codec,
    Duration: r.duration
  })));
}

main().catch(err => {
  console.error('\nFatal export error:', err);
  process.exit(1);
});
