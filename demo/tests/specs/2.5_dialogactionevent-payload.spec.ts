import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("actions-and-results/dialogactionevent-payload", async ({ page, demoPage: d }) => {
  await d.gotoCard("actions-and-results", "dialogactionevent-payload");
  await d.expectWindowed();
  await d.expectCardVisible("DialogActionEvent payload");
  await d.clickButtonInCard("actions-and-results", "dialogactionevent-payload", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Not now|Cancel|Close/i);
});
