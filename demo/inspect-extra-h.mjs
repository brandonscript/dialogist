import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

for (const adapter of ["Base UI", "shadcn", "Tailwind"]) {
  const combobox = page.getByRole("combobox", { name: "Render with" });
  await combobox.click();
  await page.getByRole("option", { name: adapter, exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByText("Show alert dialog").click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(400);

  const info = await page.evaluate(() => {
    const paper = document.querySelector('[role="dialog"]');
    const children = Array.from(paper?.children || []);
    const r = (el) => el?.getBoundingClientRect();
    const gcs = (el) => window.getComputedStyle(el);
    
    return {
      paperH: r(paper)?.height,
      childCount: children.length,
      children: children.map((child, i) => ({
        index: i,
        tag: child.tagName,
        className: child.className.substring(0, 80),
        height: r(child)?.height,
        display: gcs(child).display,
        flexDir: gcs(child).flexDirection,
        overflow: gcs(child).overflow,
        paddingTop: gcs(child).paddingTop,
        paddingBottom: gcs(child).paddingBottom,
        marginTop: gcs(child).marginTop,
        marginBottom: gcs(child).marginBottom,
      })),
      // Also measure the inner wrapper's children (grandchildren of paper)
      grandchildrenH: children[0] ? Array.from(children[0].children).map(gc => ({
        className: gc.className.substring(0, 60),
        height: r(gc)?.height,
      })) : [],
    };
  });
  
  console.log(`\n=== ${adapter} ===`);
  console.log(JSON.stringify(info, null, 2));
  
  await dialog.getByRole("button").click();
  await page.waitForTimeout(200);
}

await browser.close();
