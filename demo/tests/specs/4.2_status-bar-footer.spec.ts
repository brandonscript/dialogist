import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("layout-and-presentation/status-bar-footer", async ({ page, demoPage: d }) => {
  await d.gotoCard("layout-and-presentation", "status-bar-footer");
  await d.expectWindowed();
  await d.expectCardVisible("Status bar & footer");
  await d.clickButtonInCard("layout-and-presentation", "status-bar-footer", "Status bar & footer");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel|Close/i);
});
