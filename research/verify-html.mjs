import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const html = resolve('2026-07-10-自动化写作排版与选题采集升级研究.html');
const url = pathToFileURL(html).href;
const browser = await chromium.launch({ headless: true });
const errors = [];

async function verifyPage(context, screenshot, label) {
  const page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`${label}:console:${msg.text()}`); });
  page.on('pageerror', err => errors.push(`${label}:page:${err.message}`));
  await page.goto(url, { waitUntil: 'load' });
  const h1 = await page.locator('h1').innerText();
  const sectionCount = await page.locator('main section').count();
  const sourceRows = await page.locator('#sourceTable tbody tr').count();
  const detailsCount = await page.locator('details').count();

  if (!h1.includes('可验证的选题资产')) errors.push(`${label}:unexpected h1`);
  if (sectionCount !== 10) errors.push(`${label}:section count ${sectionCount}`);
  if (sourceRows < 14) errors.push(`${label}:source rows ${sourceRows}`);

  await page.getByRole('button', { name: '隔离试点' }).click();
  const visiblePilotRows = await page.locator('#sourceTable tbody tr:not(.hide)').count();
  if (visiblePilotRows < 4) errors.push(`${label}:pilot filter ${visiblePilotRows}`);

  await page.locator('#sourceSearch').fill('OpenAlex');
  const visibleSearchRows = await page.locator('#sourceTable tbody tr:not(.hide)').count();
  if (visibleSearchRows !== 1) errors.push(`${label}:source search ${visibleSearchRows}`);

  await page.locator('#sourceSearch').fill('');
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await page.locator('[data-task="p0-1"]').check();
  const stored = await page.evaluate(() => localStorage.getItem('content-upgrade:p0-1'));
  if (stored !== '1') errors.push(`${label}:localStorage checklist`);

  await page.locator('#toggleDetails').evaluate(el => el.click());
  const openDetails = await page.locator('details[open]').count();
  if (openDetails !== detailsCount) errors.push(`${label}:details ${openDetails}/${detailsCount}`);

  await page.screenshot({ path: screenshot, fullPage: true });
  return { label, h1, sectionCount, sourceRows, detailsCount, visiblePilotRows };
}

const desktop = await verifyPage(
  await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 }),
  'research/report-desktop.png',
  'desktop'
);
const mobile = await verifyPage(
  await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }),
  'research/report-mobile.png',
  'mobile'
);

await browser.close();
console.log(JSON.stringify({ desktop, mobile, errors }, null, 2));
if (errors.length) process.exit(1);
