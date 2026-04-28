import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("closing-dialogs/dialogcloseevent-payload", async ({ page, demoPage: d }) => {
  await d.gotoCard("closing-dialogs", "dialogcloseevent-payload");
  await d.expectWindowed();
  await d.expectCardVisible("DialogCloseEvent payload");
  await d.clickButtonInCard("closing-dialogs", "dialogcloseevent-payload", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Cancel/i);
});
