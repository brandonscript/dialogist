import { chromium } from 'playwright';
const adapters = ['MUI', 'Base UI', 'shadcn', 'Tailwind'];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.addInitScript(() => {
  localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
await page.goto('http://localhost:5607/layout-and-presentation/status-bar-footer');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);

async function selectAdapter(page, adapter) {
  const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
  await combobox.click();
  await page.waitForTimeout(200);
  const option = page.locator('[role="option"]').filter({ hasText: new RegExp(`^${adapter}$`) });
  await option.click();
  await page.waitForTimeout(300);
}

const results = {};
for (const adapter of adapters) {
  await selectAdapter(page, adapter);
  const card = page.locator('#demo-card-layout-and-presentation-status-bar-footer');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  // Click first action button in card (not the toggle buttons - find the trigger)
  const btn = card.getByRole('button', { name: /Status bar|Open dialog|Show/i }).first();
  await btn.click();
  await page.waitForTimeout(500);
  const dialog = page.getByRole('dialog');
  const visible = await dialog.isVisible();
  if (!visible) {
    results[adapter] = { error: 'dialog not visible' };
    await page.keyboard.press('Escape');
    continue;
  }
  const box = await dialog.boundingBox();
  const els = {
    statusBar: '.Dialogist-statusBar',
    footer: '.Dialogist-footer',
    content: '.Dialogist-content',
    title: '.Dialogist-title',
    actions: '.Dialogist-actions',
  };
  const data = { paperH: box?.height };
  for (const [name, sel] of Object.entries(els)) {
    const el = dialog.locator(sel);
    const elBox = await el.boundingBox().catch(() => null);
    const styles = await el.evaluate(e => {
      const cs = getComputedStyle(e);
      return { lineHeight: cs.lineHeight, fontSize: cs.fontSize };
    }).catch(() => null);
    data[name] = { h: elBox?.height, ...styles };
  }
  results[adapter] = data;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}
console.log(JSON.stringify(results, null, 2));
await browser.close();
