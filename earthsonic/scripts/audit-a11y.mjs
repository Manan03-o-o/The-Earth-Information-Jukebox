import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

async function auditPage(page, name, setupFn) {
  console.log(`\n========================================`);
  console.log(`Auditing: ${name}`);
  console.log(`========================================`);

  if (setupFn) {
    await setupFn(page);
    await page.waitForTimeout(500);
  }

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const violations = results.violations;
  const critical = violations.filter(v => v.impact === 'critical');
  const serious = violations.filter(v => v.impact === 'serious');
  const moderate = violations.filter(v => v.impact === 'moderate');
  const minor = violations.filter(v => v.impact === 'minor');
  const colorContrast = violations.filter(v => v.id === 'color-contrast');

  console.log(`Total Violations: ${violations.length}`);
  console.log(`  Critical: ${critical.length}`);
  console.log(`  Serious:  ${serious.length}`);
  console.log(`  Moderate: ${moderate.length}`);
  console.log(`  Minor:    ${minor.length}`);

  if (violations.length > 0) {
    console.log(`\nDetailed Issues to Address (${violations.length}):`);
    violations.forEach((v, i) => {
      console.log(`\n[${i + 1}] ID: ${v.id} (${v.impact}) - ${v.help}`);
      console.log(`    Help URL: ${v.helpUrl}`);
      v.nodes.forEach(n => {
        console.log(`    Target: ${n.target.join(' ')}`);
        console.log(`    Summary: ${n.failureSummary}`);
      });
    });
  } else {
    console.log(`✓ Zero violations found!`);
  }

  return {
    name,
    total: violations.length,
    critical: critical.length,
    serious: serious.length,
    moderate: moderate.length,
    minor: minor.length,
    colorContrast: colorContrast.length,
    violations
  };
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const reports = [];

  // 1. Landing page at 1440x900
  const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1440 = await context1440.newPage();
  await page1440.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page1440.waitForTimeout(1000);
  reports.push(await auditPage(page1440, 'Landing Page (1440x900)'));
  await context1440.close();

  // 2. Landing page at 390x844 (Mobile)
  const context390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page390 = await context390.newPage();
  await page390.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page390.waitForTimeout(1000);
  reports.push(await auditPage(page390, 'Landing Page (390x844 Mobile)'));
  await context390.close();

  // 3-6. Studio #1 to #4
  const studioContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const studioPage = await studioContext.newPage();

  for (let r = 1; r <= 4; r++) {
    await studioPage.goto(`http://127.0.0.1:5173/studio.html#${r}`, { waitUntil: 'domcontentloaded' });
    await studioPage.waitForTimeout(1000);
    reports.push(await auditPage(studioPage, `Studio Record #${r} (/studio.html#${r})`));
  }

  // 7. Studio High Contrast Mode
  reports.push(await auditPage(studioPage, 'Studio High Contrast Mode', async (p) => {
    await p.click('#hc');
    await p.waitForTimeout(500);
  }));

  await studioContext.close();
  await browser.close();

  console.log('\n========================================');
  console.log('=== AXE-CORE ACCESSIBILITY SUMMARY ===');
  console.log('========================================');
  console.table(reports.map(r => ({
    Page: r.name,
    'Critical': r.critical,
    'Serious': r.serious,
    'Color Contrast': r.colorContrast,
    'Total Violations': r.total
  })));

  const totalViolations = reports.reduce((sum, r) => sum + r.total, 0);
  if (totalViolations > 0) {
    console.error(`\nFound ${totalViolations} accessibility violations across audited pages.`);
    process.exit(1);
  } else {
    console.log(`\nAll audited pages have 0 accessibility violations across all WCAG 2.1 AA rules!`);
  }
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
