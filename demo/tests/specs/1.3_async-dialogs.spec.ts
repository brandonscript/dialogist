import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("getting-started/async-dialogs", async ({ page, demoPage: d }) => {
  await d.gotoCard("getting-started", "async-dialogs");
  await d.expectWindowed();
  await d.expectCardVisible("Async dialogs");
  await d.clickButtonInCard("getting-started", "async-dialogs", "Show async dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/No, cancel|Cancel/i);
});
