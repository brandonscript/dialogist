import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("updating-dialog-content/understanding-dialog-slots", async ({ page, demoPage: d }) => {
  await d.gotoCard("updating-dialog-content", "understanding-dialog-slots");
  await d.expectWindowed();
  await d.expectCardVisible("Understanding dialog slots");
  await d.clickButtonInCard("updating-dialog-content", "understanding-dialog-slots", "Show slots example dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Close/i);
});
