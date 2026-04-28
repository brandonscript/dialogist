import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-state-and-data-flow/high-frequency-state-sync", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-state-and-data-flow", "high-frequency-state-sync");
  await d.expectWindowed();
  await d.expectCardVisible("High-frequency state sync");
  await d.clickButtonInCard("dialog-state-and-data-flow", "high-frequency-state-sync", "Show high-frequency sync demo");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Done|Cancel|Close/i);
});
