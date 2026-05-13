import { expect, test } from "@playwright/test";

import { test as windowedTest } from "../helpers/windowed-fixture";

const ADAPTERS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "mui", label: "MUI" },
  { id: "base-ui", label: "Base UI" },
  { id: "shadcn", label: "shadcn" },
  { id: "tailwind", label: "Tailwind" },
];

/**
 * Smoke-test the adapter switcher by opening the same demo dialog through each adapter.
 * The dialog content + actions are identical across adapters — only the underlying slot
 * components change. Proves the agnostic core wires through to all four supported UI
 * libraries end-to-end.
 */
for (const adapter of ADAPTERS) {
  windowedTest(`adapters/${adapter.id} renders alert dialog`, async ({ page, demoPage: d }) => {
    await d.gotoCard("getting-started", "alert-dialog");
    await d.expectWindowed();
    await d.expectCardVisible("Alert dialog");

    await page.getByRole("combobox", { name: "Rendered with" }).click();
    await page.getByRole("option", { name: adapter.label, exact: true }).click();

    await d.clickButtonInCard("getting-started", "alert-dialog", "Show alert dialog");
    await expect(page.getByText("This is an alert dialog")).toBeVisible();

    await page.getByRole("button", { name: /Got it|OK/i }).click();
    await expect(page.getByText("This is an alert dialog")).toBeHidden();
  });
}

test.describe("adapter switcher", () => {
  test("persists adapter choice in localStorage", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Rendered with" }).click();
    await page.getByRole("option", { name: "Base UI", exact: true }).click();

    const stored = await page.evaluate(() => window.localStorage.getItem("dialogist:demoAdapter"));
    expect(stored).toBe("base-ui");

    await page.reload();
    await expect(page.getByRole("combobox", { name: "Rendered with" })).toHaveText(/Base UI/);
  });
});
