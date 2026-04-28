import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("getting-started/confirmation-dialog", async ({ page, demoPage: d }) => {
  await d.gotoCard("getting-started", "confirmation-dialog");
  await d.expectWindowed();
  await d.expectCardVisible("Confirmation dialog");
  await d.clickButtonInCard("getting-started", "confirmation-dialog", "Show confirmation dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel|No/i);
});
