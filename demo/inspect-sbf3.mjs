import { chromium } from 'playwright';
const adapters = ['MUI', 'Base UI', 'shadcn', 'Tailwind'];
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.addInitScript(() => {
  localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
await page.goto('http://localhost:5607/layout-and-presentation/status-bar-footer');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Check what buttons are available
const buttons = await page.getByRole('button').allInnerTexts();
console.log('Buttons:', JSON.stringify(buttons.slice(0, 15)));

const cards = await page.locator('[id^="demo-card"]').allInnerTexts();
console.log('Card IDs found:', await page.locator('[id^="demo-card"]').count());

// Look for the actual card ID
const cardEls = page.locator('[id^="demo-card"]');
const count = await cardEls.count();
for (let i = 0; i < count; i++) {
  const id = await cardEls.nth(i).getAttribute('id');
  console.log('Card ID:', id);
}
await browser.close();
