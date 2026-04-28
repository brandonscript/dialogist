import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("actions-and-results/action-groups", async ({ page, demoPage: d }) => {
  await d.gotoCard("actions-and-results", "action-groups");
  await d.expectWindowed();
  await d.expectCardVisible("Action groups");
  await d.clickButtonInCard("actions-and-results", "action-groups", "Show grouped actions");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel/i);
});
