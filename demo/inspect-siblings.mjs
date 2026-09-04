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
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
await page.waitForTimeout(400);

const info = await page.evaluate(() => {
  const paper = document.querySelector('[role="dialog"]');
  const wrapper = paper.parentElement;
  const gcsW = window.getComputedStyle(wrapper);
  const r = (el) => { const b = el.getBoundingClientRect(); return { w: b.width, h: b.height }; };
  const gcs = (el) => {
    const s = window.getComputedStyle(el);
    return { pos: s.position, display: s.display, h: s.height, alignSelf: s.alignSelf };
  };
  
  return {
    wrapperAlignItems: gcsW.alignItems,
    wrapperH: gcsW.height,
    siblings: Array.from(wrapper.children).map((child, i) => ({
      i,
      tag: child.tagName,
      role: child.getAttribute('role'),
      tabIndex: child.getAttribute('tabindex'),
      h: r(child).h,
      style: gcs(child),
      isDialogPaper: child === paper,
    })),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
