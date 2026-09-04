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

    const gcs = (el) => el ? window.getComputedStyle(el) : null;
    const r = (el) => el ? el.getBoundingClientRect() : null;
    
    const cs = gcs(content);

    // Also check html/root font size
    const htmlFontSize = window.getComputedStyle(document.documentElement).fontSize;
    const rootFontSize = parseFloat(htmlFontSize);
    
    return {
      contentH: r(content)?.height,
      contentFontSize: cs?.fontSize,
      contentFontSizePx: parseFloat(cs?.fontSize ?? '0'),
      contentLineHeight: cs?.lineHeight,
      contentLineHeightPx: parseFloat(cs?.lineHeight ?? '0'),
      contentPaddingTop: cs?.paddingTop,
      contentPaddingBottom: cs?.paddingBottom,
      rootFontSize: htmlFontSize,
      onePxRem: rootFontSize,
      // Content inner text height (content height - padding)
      innerH: r(content)?.height - parseFloat(cs?.paddingTop ?? '0') - parseFloat(cs?.paddingBottom ?? '0'),
    };
  });

  results[adapter] = dims;

  await dialog.getByRole("button", { name: /Cancel/ }).click();
  await page.waitForTimeout(200);
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
