/**
 * One-off screenshots for README. Expects the Next.js demo at BASE_URL (default :5607).
 * Run: node scripts/capture-readme-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "assets", "readme");
const BASE_URL = process.env.README_SCREENSHOT_BASE_URL ?? "http://localhost:5607";

const shots = [
  {
    name: "getting-started-alert.png",
    path: "/getting-started/alert-dialog",
    click: { name: "Show alert dialog" },
    waitMs: 800,
  },
  {
    name: "getting-started-confirm.png",
    path: "/getting-started/confirmation-dialog",
    click: { name: "Show confirmation dialog" },
    waitMs: 800,
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await mkdir(OUT_DIR, { recursive: true });
  for (const shot of shots) {
    const url = new URL(shot.path, BASE_URL).href;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.getByRole("button", { name: shot.click.name }).click();
    await delay(shot.waitMs);
    await page.screenshot({
      path: join(OUT_DIR, shot.name),
      fullPage: false,
    });
  }
} finally {
  await browser.close();
}
