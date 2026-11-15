import { chromium } from 'playwright';
import path from 'path';

const outDir = path.resolve('d:/coding/nasas space hackathon/earthsonic/_qa_backup/screens');

async function testLandingPage(browser, width, height, name) {
  console.log(`\n--- Testing Landing Page at ${width}px (${name}) ---`);
  const context = await browser.newContext({
    viewport: { width, height }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Notice audio files might 404 until Prompt 6 export script is run, which is handled gracefully by onError
      if (!txt.includes('404')) consoleErrors.push(txt);
    }
  });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check horizontal scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const hasHScroll = scrollWidth > clientWidth + 1;
  console.log(`Horizontal scroll check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, hasHScroll=${hasHScroll}`);

  // Check presence of new sections
  const sections = await page.evaluate(() => {
    return {
      howItWorks: !!document.querySelector('#how-it-works'),
      accessibility: !!document.querySelector('#accessibility'),
      credits: !!document.querySelector('#credits'),
      playlist: !!document.querySelector('#playlist'),
      tourLink: !!document.querySelector('.tour-link')
    };
  });
  console.log('Sections present:', sections);

  // Take full page screenshot
  const shotPath = path.join(outDir, `landing-${name}-${width}x${height}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(`Screenshot saved to: ${shotPath}`);

  await page.close();
  await context.close();

  return {
    width,
    name,
    hasHScroll,
    sections,
    consoleErrors
  };
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const widths = [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' }
  ];

  const results = [];
  for (const w of widths) {
    const res = await testLandingPage(browser, w.width, w.height, w.name);
    results.push(res);
  }

  console.log('\n=== PROMPT 5 LANDING PAGE VERIFICATION SUMMARY ===');
  console.table(results.map(r => ({
    Width: `${r.width}px (${r.name})`,
    'No H-Scroll': !r.hasHScroll,
    'How It Works': r.sections.howItWorks,
    'Accessibility': r.sections.accessibility,
    'Credits': r.sections.credits,
    'Tour Button': r.sections.tourLink,
    'Console Errors': r.consoleErrors.length
  })));

  await browser.close();
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
