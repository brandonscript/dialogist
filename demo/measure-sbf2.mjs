import { chromium } from 'playwright';

const adapters = ['MUI', 'Base UI', 'Tailwind'];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
const page = await context.newPage();
await page.goto('http://localhost:5607/layout-and-presentation/status-bar-footer', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const results = {};

for (const adapter of adapters) {
  // switch adapter
  const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
  await combobox.click();
  await page.waitForTimeout(200);
  await page.locator('[role="option"]').filter({ hasText: new RegExp(`^${adapter}$`) }).click();
  await page.waitForTimeout(300);

  const cardId = 'demo-card-layout-and-presentation-status-bar-footer';
  const root = page.locator(`#${cardId}`);
  await root.scrollIntoViewIfNeeded();

  // Click the first action button in the card (Status bar & footer)
  const btn = root.getByRole('button').first();
  await btn.click();
  await page.waitForTimeout(500);
  
  const dialog = page.getByRole('dialog');
  const visible = await dialog.isVisible().catch(() => false);
  if (!visible) { results[adapter] = { error: 'no dialog' }; continue; }

  const box = await dialog.boundingBox();
  const measure = async (sel) => {
    const el = dialog.locator(sel);
    const cnt = await el.count();
    if (cnt === 0) return null;
    const b = await el.boundingBox().catch(() => null);
    const styles = await el.evaluate(e => {
      const cs = getComputedStyle(e);
      return { 
        lineHeight: cs.lineHeight, 
        fontSize: cs.fontSize,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        borderTopWidth: cs.borderTopWidth,
        minHeight: cs.minHeight,
      };
    }).catch(() => null);
    return { h: b?.height, ...styles };
  };

  results[adapter] = {
    paperH: box?.height,
    title: await measure('.Dialogist-title'),
    statusBar: await measure('.Dialogist-statusBar'),
    content: await measure('.Dialogist-content'),
    actions: await measure('.Dialogist-actions'),
    footer: await measure('.Dialogist-footer'),
  };
  
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
