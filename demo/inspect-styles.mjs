import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: false }); // visible to use devtools
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

  const paperCS = gcs(paper);
  
  // Get the inline style string
  const inlineStyle = paper?.getAttribute('style');
  
  // Check all CSS properties that could affect height
  const heightProps = {
    height: paperCS?.height,
    minHeight: paperCS?.minHeight,
    maxHeight: paperCS?.maxHeight,
    boxSizing: paperCS?.boxSizing,
    overflow: paperCS?.overflow,
    overflowY: paperCS?.overflowY,
    position: paperCS?.position,
    display: paperCS?.display,
    flexDirection: paperCS?.flexDirection,
    paddingTop: paperCS?.paddingTop,
    paddingBottom: paperCS?.paddingBottom,
    borderTopWidth: paperCS?.borderTopWidth,
    borderBottomWidth: paperCS?.borderBottomWidth,
    outlineWidth: paperCS?.outlineWidth,
    marginTop: paperCS?.marginTop,
    marginBottom: paperCS?.marginBottom,
  };

  // Check inner div styles
  const innerDiv = paper?.children[0];
  const innerCS = gcs(innerDiv);
  const innerHeightProps = {
    height: innerCS?.height,
    flex: innerCS?.flex,
    flexBasis: innerCS?.flexBasis,
    flexGrow: innerCS?.flexGrow,
    minHeight: innerCS?.minHeight,
    boxSizing: innerCS?.boxSizing,
    paddingTop: innerCS?.paddingTop,
    paddingBottom: innerCS?.paddingBottom,
  };

  // Check if there are any sibling elements that might push height
  const parent = paper?.parentElement;
  const parentCS = gcs(parent);
  
  return {
    paperRect: r(paper),
    inlineStyle,
    paperHeightProps: heightProps,
    innerDivRect: r(innerDiv),
    innerDivHeightProps: innerHeightProps,
    parentRect: r(parent),
    parentDisplay: parentCS?.display,
    parentPosition: parentCS?.position,
    childrenSum: Array.from(innerDiv?.children ?? []).map(c => ({
      className: c.className,
      h: r(c)?.height,
      paddingTop: gcs(c)?.paddingTop,
      paddingBottom: gcs(c)?.paddingBottom,
      borderTop: gcs(c)?.borderTopWidth,
      borderBottom: gcs(c)?.borderBottomWidth,
      marginTop: gcs(c)?.marginTop,
      marginBottom: gcs(c)?.marginBottom,
      boxSizing: gcs(c)?.boxSizing,
    })),
  };
});

console.log(JSON.stringify(info, null, 2));

await page.waitForTimeout(2000); // pause to allow visual inspection
await browser.close();
