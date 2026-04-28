import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("data-providers/using-redux-toolkit-rtk", async ({ page, demoPage: d }) => {
  await d.gotoCard("data-providers", "using-redux-toolkit-rtk");
  await d.expectWindowed();
  await d.expectCardVisible("Using Redux Toolkit (RTK)");
  await d.clickButtonInCard("data-providers", "using-redux-toolkit-rtk", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/^OK$/i);
});
