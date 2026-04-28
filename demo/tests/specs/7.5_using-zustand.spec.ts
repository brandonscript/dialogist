import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("data-providers/using-zustand", async ({ page, demoPage: d }) => {
  await d.gotoCard("data-providers", "using-zustand");
  await d.expectWindowed();
  await d.expectCardVisible("Using Zustand");
  await d.clickButtonInCard("data-providers", "using-zustand", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/^OK$/i);
});
