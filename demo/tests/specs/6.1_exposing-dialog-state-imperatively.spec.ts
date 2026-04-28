import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-state-and-data-flow/exposing-dialog-state-imperatively", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-state-and-data-flow", "exposing-dialog-state-imperatively");
  await d.expectWindowed();
  await d.expectCardVisible("Exposing dialog state imperatively");
  await d.clickButtonInCard("dialog-state-and-data-flow", "exposing-dialog-state-imperatively", "Show imperative dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel|Close/i);
});
