import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.addInitScript(() => {
  window.localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

const combobox = page.getByRole("combobox", { name: "Render with" });
await combobox.click();
await page.getByRole("option", { name: "shadcn", exact: true }).click();
await page.waitForTimeout(300);

await page.getByText("Show alert dialog").click();
const dialog = page.getByRole("dialog");
await dialog.waitFor({ state: "visible", timeout: 5000 });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const paper = document.querySelector('[role="dialog"]');
  const gcs = window.getComputedStyle(paper);
  return {
    transform: gcs.transform,
    translate: gcs.translate,
    cssTransform: paper.style.transform,
    cssTranslate: paper.style.translate,
    position: gcs.position,
    top: gcs.top,
    left: gcs.left,
    // Check custom properties that Tailwind v4 might use
    twTranslateX: gcs.getPropertyValue('--tw-translate-x'),
    twTranslateY: gcs.getPropertyValue('--tw-translate-y'),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
