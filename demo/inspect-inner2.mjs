import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

// Switch to Base UI
const combobox = page.getByRole("combobox", { name: "Render with" });
await combobox.click();
await page.getByRole("option", { name: "Base UI", exact: true }).click();
await page.waitForTimeout(300);

await page.getByText("Show alert dialog").click();
const dialog = page.getByRole("dialog");
await dialog.waitFor({ state: "visible", timeout: 5000 });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const paper = document.querySelector('[role="dialog"]');
  const gcs = (el) => el ? window.getComputedStyle(el) : null;
  const r = (el) => el ? el.getBoundingClientRect() : null;

  const innerDiv = paper?.children[0];
  const innerDivStyle = gcs(innerDiv);

  return {
    paperH: r(paper)?.height,
    innerDivH: r(innerDiv)?.height,
    innerDivFlex: innerDivStyle?.flex,
    innerDivFlexGrow: innerDivStyle?.flexGrow,
    innerDivFlexShrink: innerDivStyle?.flexShrink,
    innerDivFlexBasis: innerDivStyle?.flexBasis,
    innerDivHeight: innerDivStyle?.height,
    innerDivMinHeight: innerDivStyle?.minHeight,
    parentH: r(paper?.parentElement)?.height,
    parentOverflow: gcs(paper?.parentElement)?.overflow,
    parentMaxHeight: gcs(paper?.parentElement)?.maxHeight,
    // Sum of children heights
    childrenH: Array.from(innerDiv?.children ?? []).reduce((s, c) => s + r(c)?.height, 0),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
