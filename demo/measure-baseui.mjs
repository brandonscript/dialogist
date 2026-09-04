import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
const page = await context.newPage();
await page.goto('http://localhost:5607/layout-and-presentation/status-bar-footer', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

async function selectAdapter(adapter) {
  const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
  await combobox.click();
  await page.waitForTimeout(200);
  await page.locator('[role="option"]').filter({ hasText: new RegExp(`^${adapter}$`) }).click();
  await page.waitForTimeout(300);
}

const results = {};
for (const adapter of ['MUI', 'Base UI', 'Tailwind']) {
  await selectAdapter(adapter);
  const card = page.locator('#demo-card-layout-and-presentation-status-bar-footer');
  await card.scrollIntoViewIfNeeded();
  const btn = card.getByRole('button', { name: 'Status bar & footer', exact: false }).first();
  await btn.click();
  await page.waitForTimeout(500);
  const dialog = page.getByRole('dialog');
  if (!await dialog.isVisible()) { results[adapter] = { error: 'no dialog' }; continue; }
  const box = await dialog.boundingBox();
  
  const measure = async (sel) => {
    const el = dialog.locator(sel);
    if (!await el.count()) return null;
    const b = await el.boundingBox().catch(() => null);
    const cs = await el.evaluate(e => {
      const s = getComputedStyle(e);
      return { lineHeight: s.lineHeight, fontSize: s.fontSize, h: s.height };
    }).catch(() => null);
    return { h: b?.height, ...cs };
  };

  results[adapter] = {
    paperH: box?.height,
    statusBar: await measure('.Dialogist-statusBar'),
    footer: await measure('.Dialogist-footer'),
    content: await measure('.Dialogist-content'),
  };
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}
console.log(JSON.stringify(results, null, 2));
await browser.close();
