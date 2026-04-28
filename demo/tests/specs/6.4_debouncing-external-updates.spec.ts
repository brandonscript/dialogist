import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-state-and-data-flow/debouncing-external-updates", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-state-and-data-flow", "debouncing-external-updates");
  await d.expectWindowed();
  await d.expectCardVisible("Debouncing external updates");
  await d.clickButtonInCard("dialog-state-and-data-flow", "debouncing-external-updates", "Open debounced text dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel|Close/i);
});
