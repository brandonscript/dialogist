import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-state-and-data-flow/two-way-state-sync", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-state-and-data-flow", "two-way-state-sync");
  await d.expectWindowed();
  await d.expectCardVisible("Two-way state sync");
  await d.clickButtonInCard("dialog-state-and-data-flow", "two-way-state-sync", "Show two-way sync demo");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Done|Cancel|Close/i);
});
