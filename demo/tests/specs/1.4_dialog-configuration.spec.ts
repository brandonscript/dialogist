import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("getting-started/dialog-configuration", async ({ page, demoPage: d }) => {
  await d.gotoCard("getting-started", "dialog-configuration");
  await d.expectWindowed();
  await d.expectCardVisible("Dialog configuration");
  await d.clickButtonInCard("getting-started", "dialog-configuration", "Use all defaults");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Nope|Cancel|Unimpressed cancel/i);
});
