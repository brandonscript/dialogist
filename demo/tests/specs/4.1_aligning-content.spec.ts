import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("layout-and-presentation/aligning-content", async ({ page, demoPage: d }) => {
  await d.gotoCard("layout-and-presentation", "aligning-content");
  await d.expectWindowed();
  await d.expectCardVisible("Aligning content");
  await d.clickByTestId("aligning-content-show-dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Close|Cancel/i);
});
