import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

const adapters = ["MUI", "Base UI", "shadcn", "Tailwind"];
const results = {};

for (const adapter of adapters) {
  const combobox = page.getByRole("combobox", { name: "Render with" });
  await combobox.click();
  await page.getByRole("option", { name: adapter, exact: true }).click();
  await page.waitForTimeout(300);

  // Open dialog
  await page.getByText("Show alert dialog").click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(400);

  const dims = await page.evaluate(() => {
    const paper = document.querySelector('[role="dialog"]');
    const title = paper?.querySelector('.Dialogist-title');
    const content = paper?.querySelector('.Dialogist-content');
    const actions = paper?.querySelector('.Dialogist-actionsContainer');
    const button = paper?.querySelector('.Dialogist-actionsContainer button');
    
    const gcs = (el) => el ? window.getComputedStyle(el) : null;
    const r = (el) => el ? el.getBoundingClientRect() : null;
    
    const titleStyle = gcs(title);
    const contentStyle = gcs(content);
    const buttonStyle = gcs(button);
    
    return {
      paperW: r(paper)?.width,
      paperH: r(paper)?.height,
      titleH: r(title)?.height,
      titleLineH: titleStyle?.lineHeight,
      contentH: r(content)?.height,
      contentLineH: contentStyle?.lineHeight,
      actionsH: r(actions)?.height,
      buttonH: r(button)?.height,
      buttonFontSize: buttonStyle?.fontSize,
      buttonFont: buttonStyle?.fontFamily?.split(',')[0],
      buttonPadding: buttonStyle?.padding,
    };
  });

  results[adapter] = dims;

  // Close dialog  
  await dialog.getByRole("button").click();
  await page.waitForTimeout(200);
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
