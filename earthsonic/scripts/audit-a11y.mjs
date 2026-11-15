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

  const severe = violations.filter(v => v.impact === 'critical' || v.impact === 'serious' || v.id === 'color-contrast');

  if (severe.length > 0) {
    console.log(`\nDetailed Issues to Address (${severe.length}):`);
    severe.forEach((v, i) => {
      console.log(`\n[${i + 1}] ID: ${v.id} (${v.impact}) - ${v.help}`);
      console.log(`    Help URL: ${v.helpUrl}`);
      v.nodes.forEach(n => {
        console.log(`    Target: ${n.target.join(' ')}`);
        console.log(`    Summary: ${n.failureSummary}`);
      });
    });
  } else {
    console.log(`✓ Zero critical, serious, or color-contrast violations found!`);
  }

  return {
    name,
    total: violations.length,
    critical: critical.length,
    serious: serious.length,
    moderate: moderate.length,
    minor: minor.length,
    colorContrast: colorContrast.length,
    severeCount: severe.length,
    severe
  };
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const reports = [];

  // 1. Landing page
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  reports.push(await auditPage(page, 'Landing Page (http://127.0.0.1:5173/)'));

  // 2. Studio (default)
  await page.goto('http://127.0.0.1:5173/studio.html#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  reports.push(await auditPage(page, 'Studio Default (http://127.0.0.1:5173/studio.html#1)'));

  // 3. Studio (High Contrast)
  await page.goto('http://127.0.0.1:5173/studio.html#1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  reports.push(await auditPage(page, 'Studio High Contrast Mode', async (p) => {
    await p.click('#hc');
  }));

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

  const totalSevere = reports.reduce((sum, r) => sum + r.critical + r.serious, 0);
  if (totalSevere > 0) {
    console.error(`\nFound ${totalSevere} critical/serious accessibility violations across audited pages.`);
    process.exit(1);
  } else {
    console.log(`\nAll audited pages have 0 critical and 0 serious accessibility violations!`);
  }
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
