import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1500);

const combobox = page.getByRole("combobox", { name: "Render with" });
await combobox.click();
await page.getByRole("option", { name: "Base UI", exact: true }).click();
await page.waitForTimeout(500);
await page.getByText("Show alert dialog").click();
const dialog = page.getByRole("dialog");
await dialog.waitFor({ state: "visible", timeout: 5000 });
await page.waitForTimeout(400);

const info = await page.evaluate(() => {
  const paper = document.querySelector('[role="dialog"]');
  const gcs = window.getComputedStyle(paper);
  const parent = paper.parentElement;
  const gcsP = window.getComputedStyle(parent);
  return {
    paperPosition: gcs.position,
    paperDisplay: gcs.display,
    paperH: gcs.height,
    parentTag: parent.tagName,
    parentPosition: gcsP.position,
    parentDisplay: gcsP.display,
    parentH: gcsP.height,
    parentChildren: parent.children.length,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
