import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("actions-and-results/custom-actions", async ({ page, demoPage: d }) => {
  await d.gotoCard("actions-and-results", "custom-actions");
  await d.expectWindowed();
  await d.expectCardVisible("Custom actions");
  await d.clickButtonInCard("actions-and-results", "custom-actions", "Show custom actions");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel/i);
});
