import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('d:/coding/nasas space hackathon/earthsonic/_qa_backup/screens');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function verifyViewport(browser, width, height, name) {
  console.log(`\n--- Testing Viewport: ${name} (${width}x${height}) ---`);
  const context = await browser.newContext({
    viewport: { width, height }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Ignore expected 404s when probing non-existent real frame 001.jpg
      if (!txt.includes('404')) consoleErrors.push(txt);
    }
  });

  await page.goto('http://127.0.0.1:5173/studio.html#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check horizontal scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const hasHScroll = scrollWidth > clientWidth + 1;
  console.log(`Horizontal scroll: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, hasHScroll=${hasHScroll}`);

  // Check Play button visible without scrolling (in viewport)
  const playInView = await page.evaluate(() => {
    const btn = document.querySelector('#play');
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
  console.log(`Play button visible without scrolling: ${playInView}`);

  // Take screenshot
  const shotPath = path.join(outDir, `studio-${name}-${width}x${height}.png`);
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`Saved viewport screenshot: ${shotPath}`);

  // Test Play audio
  await page.click('#play');
  await page.waitForTimeout(1000);

  const audioState = await page.evaluate(() => {
    let maxDb = -Infinity;
    if (window.A && window.A.an) {
      const v = window.A.an.getValue();
      for (let i = 0; i < v.length; i++) if (isFinite(v[i]) && v[i] > maxDb) maxDb = v[i];
    }
    return {
      state: window.Tone ? window.Tone.context.state : 'none',
      maxDb: Math.round(maxDb * 10) / 10
    };
  });
  console.log(`Audio state: ${audioState.state}, maxDb: ${audioState.maxDb} dB`);

  await page.close();
  await context.close();

  return {
    name,
    width,
    height,
    hasHScroll,
    playInView,
    audioState,
    consoleErrors
  };
}

async function verifyKeyboardAndRecords(browser) {
  console.log('\n--- Testing Keyboard Shortcuts & Record Switching ---');
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:5173/studio.html#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Press Space to toggle play
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);

  const isPlaying1 = await page.evaluate(() => window.Tone && window.Tone.context.state === 'running');
  console.log('Space key started audio:', isPlaying1);

  // ArrowRight to go to next record (Record 2: Lightning)
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  const title2 = await page.textContent('#rt');
  console.log('ArrowRight switched to:', title2);

  // ArrowRight again (Record 3: Aerosols)
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  const title3 = await page.textContent('#rt');
  console.log('ArrowRight switched to:', title3);

  // ArrowLeft back to Record 2
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);
  const titleBack = await page.textContent('#rt');
  console.log('ArrowLeft switched back to:', titleBack);

  // M key for mute
  await page.keyboard.press('m');
  const isMuted = await page.evaluate(() => document.querySelector('#mute')?.getAttribute('aria-pressed') === 'true');
  console.log('M key muted audio:', isMuted);

  await page.keyboard.press('m'); // unmute

  await page.close();
  await context.close();
}

async function verifyGuidedTour(browser) {
  console.log('\n--- Testing Guided Tour (?tour=1, tourSpeed=10) ---');
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:5173/studio.html?tour=1&tourSpeed=10#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const modalVisible = await page.evaluate(() => {
    const m = document.querySelector('#tour-modal');
    return m && window.getComputedStyle(m).display !== 'none';
  });
  console.log('Tour modal visible on load:', modalVisible);

  console.log('Clicking Start Guided Tour...');
  await page.click('#start-tour-btn');
  await page.waitForTimeout(1200);

  const caption1 = await page.textContent('#tour-caption');
  console.log('Step 1 caption:', caption1);

  // Wait for step switch (at 10x speed, 2.5s per step)
  await page.waitForTimeout(3000);
  const caption2 = await page.textContent('#tour-caption');
  console.log('Step 2 caption:', caption2);

  // Test Escape key stops tour
  console.log('Pressing Escape to stop tour...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const captionVisibleAfterEsc = await page.evaluate(() => {
    const c = document.querySelector('#tour-caption');
    return c && window.getComputedStyle(c).display !== 'none';
  });
  console.log('Caption hidden after Escape:', !captionVisibleAfterEsc);

  await page.close();
  await context.close();
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const viewports = [
    { width: 1366, height: 768, name: 'desktop-laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' }
  ];

  const results = [];
  for (const vp of viewports) {
    const res = await verifyViewport(browser, vp.width, vp.height, vp.name);
    results.push(res);
  }

  await verifyKeyboardAndRecords(browser);
  await verifyGuidedTour(browser);

  console.log('\n=== PROMPT 4 & 7 VERIFICATION SUMMARY ===');
  console.table(results.map(r => ({
    Viewport: `${r.name} (${r.width}x${r.height})`,
    'No H-Scroll': !r.hasHScroll,
    'Play Visible': r.playInView,
    'Audio State': r.audioState.state,
    'Max dB': r.audioState.maxDb,
    'Errors': r.consoleErrors.length
  })));

  await browser.close();
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
