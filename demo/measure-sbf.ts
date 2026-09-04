import { chromium } from 'playwright';

const adapters = ['MUI', 'Base UI'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5607/layout-and-presentation/status-bar-footer', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const results: Record<string, Record<string, unknown>> = {};

  for (const adapter of adapters) {
    // Switch adapter
    const combobox = page.locator('[role="combobox"][aria-label="Render with"]');
    await combobox.click();
    await page.waitForTimeout(200);
    const option = page.locator('[role="option"]').filter({ hasText: new RegExp(`^${adapter}$`) });
    await option.click();
    await page.waitForTimeout(300);

    // Find the card root
    const cardId = 'demo-card-layout-and-presentation-status-bar-footer';
    const root = page.locator(`#${cardId}`);
    await root.scrollIntoViewIfNeeded();

    // List all buttons
    const btns = root.getByRole('button');
    const btnCount = await btns.count();
    const btnTexts: string[] = [];
    for (let i = 0; i < btnCount; i++) {
      btnTexts.push(await btns.nth(i).textContent() ?? '');
    }
    
    // Try to find a "Show dialog" button
    const showBtn = root.getByRole('button', { name: 'Show dialog' });
    const showBtnCount = await showBtn.count();
    
    results[adapter] = { btnTexts, showBtnCount };
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
