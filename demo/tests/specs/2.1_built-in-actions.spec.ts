import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("actions-and-results/built-in-actions", async ({ page, demoPage: d }) => {
  await d.gotoCard("actions-and-results", "built-in-actions");
  await d.expectWindowed();
  await d.expectCardVisible("Built-in actions");
  await d.clickButtonInCard("actions-and-results", "built-in-actions", "Show alert");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Approve|OK/i);
});
