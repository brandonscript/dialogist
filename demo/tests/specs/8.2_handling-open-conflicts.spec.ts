import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-orchestration/handling-open-conflicts", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-orchestration", "handling-open-conflicts");
  await d.expectWindowed();
  await d.expectCardVisible("Handling open conflicts");
  await d.clickButtonInCard("dialog-orchestration", "handling-open-conflicts", "Open primary dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Close/i);
});
