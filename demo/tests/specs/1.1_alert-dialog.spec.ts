import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("getting-started/alert-dialog", async ({ page, demoPage: d }) => {
  await d.gotoCard("getting-started", "alert-dialog");
  await d.expectWindowed();
  await d.expectCardVisible("Alert dialog");
  await d.clickButtonInCard("getting-started", "alert-dialog", "Show alert dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Got it|OK/i);
});
