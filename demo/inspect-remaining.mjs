import { chromium } from 'playwright';
const dialogs = [
  { name: 'status-bar-footer', section: '4_layout_presentation', card: 'status-bar-footer', btn: 'Open dialog' },
  { name: 'aligning-content', section: '4_layout_presentation', card: 'aligning-content', btn: 'Open dialog' },
];
const adapters = ['MUI', 'Base UI', 'shadcn', 'Tailwind'];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:5607');
await page.waitForLoadState('networkidle');

async function selectAdapter(page, adapter) {
  const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
  await combobox.click();
  await page.waitForTimeout(200);
  const option = page.locator('[role="option"]').filter({ hasText: adapter });
  await option.click();
  await page.waitForTimeout(300);
}

const results = {};
for (const dlg of dialogs) {
  results[dlg.name] = {};
  for (const adapter of adapters) {
    await selectAdapter(page, adapter);
    const card = page.locator(`[data-section="${dlg.section}"] [data-card="${dlg.card}"]`);
    await card.scrollIntoViewIfNeeded();
    await card.getByRole('button', { name: dlg.btn }).click();
    await page.waitForTimeout(500);
    const dialog = page.getByRole('dialog');
    const box = await dialog.boundingBox();
    const contentEl = dialog.locator('.Dialogist-content');
    const statusEl = dialog.locator('.Dialogist-statusBar');
    const footerEl = dialog.locator('.Dialogist-footer');
    const actionsEl = dialog.locator('.Dialogist-actions');
    const contentBox = await contentEl.boundingBox().catch(() => null);
    const statusBox = await statusEl.boundingBox().catch(() => null);
    const footerBox = await footerEl.boundingBox().catch(() => null);
    const actionsBox = await actionsEl.boundingBox().catch(() => null);
    const contentLineH = await contentEl.evaluate(el => getComputedStyle(el).lineHeight).catch(() => null);
    results[dlg.name][adapter] = {
      paperH: box?.height,
      contentH: contentBox?.height,
      contentLineH,
      statusH: statusBox?.height,
      footerH: footerBox?.height,
      actionsH: actionsBox?.height,
    };
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}
console.log(JSON.stringify(results, null, 2));
await browser.close();
