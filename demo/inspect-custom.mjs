import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/actions-and-results/custom-actions");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

const adapters = ["MUI", "Base UI", "Tailwind"];
const results = {};

for (const adapter of adapters) {
  const combobox = page.getByRole("combobox", { name: "Render with" });
  await combobox.click();
  await page.getByRole("option", { name: adapter, exact: true }).click();
  await page.waitForTimeout(300);

  await page.getByText("Show custom actions").click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(400);

  const dims = await page.evaluate(() => {
    const paper = document.querySelector('[role="dialog"]');
    const content = paper?.querySelector('.Dialogist-content');
    const actions = paper?.querySelector('.Dialogist-actionsContainer');
    const title = paper?.querySelector('.Dialogist-title');
    
    const gcs = (el) => el ? window.getComputedStyle(el) : null;
    const r = (el) => el ? el.getBoundingClientRect() : null;
    
    const contentStyle = gcs(content);
    const titleStyle = gcs(title);
    
    return {
      paperH: r(paper)?.height,
      paperW: r(paper)?.width,
      titleH: r(title)?.height,
      titleLineH: titleStyle?.lineHeight,
      titleFontSize: titleStyle?.fontSize,
      contentH: r(content)?.height,
      contentLineH: contentStyle?.lineHeight,
      contentFontSize: contentStyle?.fontSize,
      actionsH: r(actions)?.height,
    };
  });

  results[adapter] = dims;

  await dialog.getByRole("button", { name: /Cancel/ }).click();
  await page.waitForTimeout(200);
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
