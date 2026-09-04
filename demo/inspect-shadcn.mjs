import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
// Set windowed mode via localStorage
await page.addInitScript(() => {
  window.localStorage.setItem('dialogist-demo-fullscreen', JSON.stringify(false));
});
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

// Switch to shadcn
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
  const gcs = (el) => el ? window.getComputedStyle(el) : null;
  const r = (el) => el ? el.getBoundingClientRect() : null;

  const paperCS = gcs(paper);
  
  // Get the DOM parent chain
  const chain = [];
  let el = paper;
  for (let i = 0; i < 8 && el; i++) {
    const cs = gcs(el);
    const rect = r(el);
    chain.push({
      tag: el.tagName,
      id: el.id,
      className: el.className?.substring(0, 80),
      position: cs?.position,
      top: cs?.top,
      left: cs?.left,
      width: rect?.width,
      height: rect?.height,
      x: rect?.x,
      y: rect?.y,
    });
    el = el.parentElement;
  }

  return {
    paperPosition: paperCS?.position,
    paperRect: r(paper),
    inlineStyle: paper?.getAttribute('style')?.substring(0, 200),
    classes: paper?.className?.substring(0, 150),
    domChain: chain,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
