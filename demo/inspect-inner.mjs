import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

const adapters = ["MUI", "Base UI"];
const results = {};

for (const adapter of adapters) {
  const combobox = page.getByRole("combobox", { name: "Render with" });
  await combobox.click();
  await page.getByRole("option", { name: adapter, exact: true }).click();
  await page.waitForTimeout(300);

  await page.getByText("Show alert dialog").click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const paper = document.querySelector('[role="dialog"]');
    const gcs = (el) => el ? window.getComputedStyle(el) : null;
    const r = (el) => el ? el.getBoundingClientRect() : null;

    // Walk the children of the paper
    const paperStyle = gcs(paper);
    const children = paper ? Array.from(paper.children) : [];
    const childInfo = children.map(c => ({
      tag: c.tagName,
      className: c.className,
      h: r(c)?.height,
      paddingTop: gcs(c)?.paddingTop,
      paddingBottom: gcs(c)?.paddingBottom,
      marginTop: gcs(c)?.marginTop,
      marginBottom: gcs(c)?.marginBottom,
      display: gcs(c)?.display,
      flexDirection: gcs(c)?.flexDirection,
      children: Array.from(c.children).map(gc => ({
        tag: gc.tagName,
        className: gc.className,
        h: r(gc)?.height,
      })),
    }));

    return {
      paperH: r(paper)?.height,
      paperPaddingTop: paperStyle?.paddingTop,
      paperPaddingBottom: paperStyle?.paddingBottom,
      paperGap: paperStyle?.gap,
      paperDisplay: paperStyle?.display,
      paperFlexDirection: paperStyle?.flexDirection,
      paperPosition: paperStyle?.position,
      parentTag: paper?.parentElement?.tagName,
      parentStyle: {
        display: gcs(paper?.parentElement)?.display,
        position: gcs(paper?.parentElement)?.position,
        h: r(paper?.parentElement)?.height,
      },
      children: childInfo,
    };
  });

  results[adapter] = info;

  await dialog.getByRole("button").click();
  await page.waitForTimeout(200);
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
