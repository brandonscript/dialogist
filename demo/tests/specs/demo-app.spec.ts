import { test, expect } from "@playwright/test";

import { DemoPage } from "../helpers/demo-page";

test.describe("Demo app shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#sandbox-header")).toBeVisible();
  });

  test("fullscreen toggle updates mode and body sandbox attribute", async ({ page }) => {
    const mode = page.locator("[data-dialog-mode]");
    const initial = await mode.getAttribute("data-dialog-mode");
    expect(initial === "fullscreen" || initial === "windowed").toBeTruthy();

    const fullscreenSwitch = page.getByRole("switch", { name: /^Fullscreen$/i });
    await fullscreenSwitch.scrollIntoViewIfNeeded();
    await fullscreenSwitch.click();

    const after = await mode.getAttribute("data-dialog-mode");
    expect(after).not.toBe(initial);

    if (after === "windowed") {
      await expect(page.locator("body")).toHaveAttribute("data-dialog-sandbox-container", /.+/);
    } else {
      await expect(page.locator("body")).not.toHaveAttribute("data-dialog-sandbox-container");
    }

    await fullscreenSwitch.click();
    await expect(mode).toHaveAttribute("data-dialog-mode", initial!);
  });

  test("sandbox paper toggles fullscreen with keyboard", async ({ page }) => {
    const mode = page.locator("[data-dialog-mode]");
    const before = await mode.getAttribute("data-dialog-mode");

    await page.locator("#sandbox-info").focus();
    await page.keyboard.press(" ");
    await expect(mode).not.toHaveAttribute("data-dialog-mode", before!);

    await page.keyboard.press(" ");
    await expect(mode).toHaveAttribute("data-dialog-mode", before!);
  });

  test("render tracking toggle shows and hides tracker badges", async ({ page }) => {
    // Scope to the banner so the locator stays stable across re-renders that
    // remove the RenderTracker badge next to the switch.
    const trackingSwitch = page.getByRole("banner").getByRole("switch");
    await trackingSwitch.scrollIntoViewIfNeeded();

    await expect(trackingSwitch).toBeChecked();
    await expect(page.locator(".render-tracker")).not.toHaveCount(0);

    await trackingSwitch.click();
    await expect(page.locator(".render-tracker")).toHaveCount(0);

    await page.getByRole("banner").getByRole("switch").click();
    await expect(page.locator(".render-tracker")).not.toHaveCount(0);
  });

  test("render tracking reset is clickable when tracking is on", async ({ page }) => {
    const trackingSwitch = page.getByRole("switch", { name: /render tracking/i });
    // Ensure tracking is on before clicking Reset
    if (!(await trackingSwitch.isChecked())) {
      await trackingSwitch.click();
    }
    // Scope Reset to the top app bar to avoid card-level Reset buttons
    await page.getByRole("banner").getByRole("button", { name: "Reset" }).click();
    await expect(page.locator(".render-tracker")).not.toHaveCount(0);
  });
});

test.describe("Demo design tokens (windowed)", () => {
  test("Alert card primary button matches theme", async ({ page }) => {
    await page.addInitScript(DemoPage.windowedStorageInitScript());
    await page.goto("/the-basics/alert-dialog", { waitUntil: "networkidle" });
    await expect(page.locator("[data-dialog-mode]")).toHaveAttribute("data-dialog-mode", "windowed");

    await page.getByRole("heading", { name: "Alert dialog", exact: true }).scrollIntoViewIfNeeded();
    const button = page.getByRole("button", { name: /Show alert dialog/i }).first();
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS("background-color", "rgb(171, 220, 216)");
    await expect(button).toHaveCSS("border-radius", "5px");
    await expect(button).toHaveCSS("height", "32px");
    await expect(button).toHaveCSS("font-size", "13.6px");
  });
});
