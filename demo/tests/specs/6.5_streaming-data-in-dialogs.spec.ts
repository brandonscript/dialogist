import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-state-and-data-flow/streaming-data-in-dialogs", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-state-and-data-flow", "streaming-data-in-dialogs");
  await d.expectWindowed();
  await d.expectCardVisible("Streaming data in dialogs");
  await d.clickButtonInCard("dialog-state-and-data-flow", "streaming-data-in-dialogs", "Show polling data dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Close|Close & stop/i);
});
