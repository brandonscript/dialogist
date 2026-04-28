import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("layout-and-presentation/using-custom-components", async ({ page, demoPage: d }) => {
  await d.gotoCard("layout-and-presentation", "using-custom-components");
  await d.expectWindowed();
  await d.expectCardVisible("Using custom components");
  await d.clickButtonInCard("layout-and-presentation", "using-custom-components", "Show custom components dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel|Close/i);
});
