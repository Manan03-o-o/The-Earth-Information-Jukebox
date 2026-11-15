import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  console.log('Navigating to http://127.0.0.1:5173/studio.html#2 ...');
  await page.goto('http://127.0.0.1:5173/studio.html#2', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const title = await page.textContent('#rt');
  console.log('Record title:', title);

  const initialInd = await page.textContent('#ind');
  console.log('Initial indicator:', initialInd);

  console.log('Clicking Play...');
  await page.click('#play');
  await page.waitForTimeout(500);

  const samples = [];
  let silentSeconds = 0;

  for (let sec = 1; sec <= 20; sec++) {
    await page.waitForTimeout(1000);
    const data = await page.evaluate(() => {
      const state = window.Tone ? window.Tone.context.state : 'no-tone';
      let maxDb = -Infinity;
      if (window.A && window.A.an) {
        const vals = window.A.an.getValue();
        for (let i = 0; i < vals.length; i++) {
          if (isFinite(vals[i]) && vals[i] > maxDb) {
            maxDb = vals[i];
          }
        }
      }
      const ind = document.querySelector('#ind') ? document.querySelector('#ind').textContent : '';
      return { state, maxDb, ind };
    });

    const isSilent = !isFinite(data.maxDb) || data.maxDb <= -90;
    if (isSilent) silentSeconds++;

    samples.push({
      second: sec,
      state: data.state,
      maxDb: Math.round(data.maxDb * 10) / 10,
      isSilent,
      ind: data.ind
    });
    console.log(`Sec ${sec}: state=${data.state}, maxDb=${data.maxDb.toFixed(1)}, ind="${data.ind}"`);
  }

  const finalInd = await page.textContent('#ind');
  console.log('\n--- VERIFICATION RESULT ---');
  console.log('Initial text:', initialInd);
  console.log('Final text:  ', finalInd);
  console.log(`Silent seconds count: ${silentSeconds} / 20`);
  console.log(`Active seconds count: ${20 - silentSeconds} / 20`);
  console.log(`Console errors (${consoleErrors.length}):`, consoleErrors);

  await browser.close();
  if (consoleErrors.length > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
