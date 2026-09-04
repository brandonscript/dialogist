import { chromium } from 'playwright';

const adapters = ['MUI', 'Base UI'];

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
  const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
  await combobox.click();
  await page.waitForTimeout(200);
  const option = page.locator('[role="option"]').filter({ hasText: new RegExp(`^${adapter}$`) });
  await option.click();
  await page.waitForTimeout(300);

  const cardId = 'demo-card-layout-and-presentation-status-bar-footer';
  const root = page.locator(`#${cardId}`);
  await root.scrollIntoViewIfNeeded();

  const btns = root.getByRole('button');
  const btnCount = await btns.count();
  const btnTexts = [];
  for (let i = 0; i < btnCount; i++) {
    btnTexts.push((await btns.nth(i).textContent())?.trim() ?? '');
  }
  
  const showBtnCount = await root.getByRole('button', { name: 'Show dialog' }).count();
  
  results[adapter] = { btnTexts, showBtnCount };
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
