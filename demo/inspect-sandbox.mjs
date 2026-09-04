import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5607/the-basics/alert-dialog");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

// Switch to Base UI and open dialog
const combobox = page.getByRole("combobox", { name: "Render with" });
await combobox.click();
await page.getByRole("option", { name: "Base UI", exact: true }).click();
await page.waitForTimeout(300);
await page.getByText("Show alert dialog").click();
const dialog = page.getByRole("dialog");
await dialog.waitFor({ state: "visible", timeout: 5000 });
await page.waitForTimeout(400);

const info = await page.evaluate(() => {
  const sandboxId = document.body.getAttribute('data-dialog-sandbox-container');
  const sandbox = sandboxId ? document.getElementById(sandboxId) : null;
  const r = (el) => {
    const b = el?.getBoundingClientRect();
    return b ? { width: b.width, height: b.height } : null;
  };
  const gcs = (el) => {
    const s = window.getComputedStyle(el);
    return {
      position: s.position,
      display: s.display,
      height: s.height,
      maxHeight: s.maxHeight,
      overflow: s.overflow,
    };
  };
  
  const paper = document.querySelector('[role="dialog"]');
  const portalParent = paper?.parentElement;
  const portalGrandparent = portalParent?.parentElement;
  
  return {
    sandbox: { rect: r(sandbox), style: sandbox ? gcs(sandbox) : null },
    paperParent: { 
      tag: portalParent?.tagName,
      rect: r(portalParent),
      style: portalParent ? gcs(portalParent) : null,
    },
    portalGrandparent: {
      tag: portalGrandparent?.tagName,
      rect: r(portalGrandparent),
      style: portalGrandparent ? gcs(portalGrandparent) : null,
    },
    paper: { rect: r(paper), style: paper ? gcs(paper) : null },
    innerDiv: { 
      rect: r(paper?.children[0]),
      style: paper?.children[0] ? gcs(paper.children[0]) : null,
    },
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
