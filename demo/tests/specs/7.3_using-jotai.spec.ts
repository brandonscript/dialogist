import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("data-providers/using-jotai", async ({ page, demoPage: d }) => {
  await d.gotoCard("data-providers", "using-jotai");
  await d.expectWindowed();
  await d.expectCardVisible("Using Jotai");
  await d.clickButtonInCard("data-providers", "using-jotai", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/^OK$/i);
});
