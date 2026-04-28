import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-orchestration/syncing-handlers-across-components", async ({ demoPage: d }) => {
  await d.gotoCard("dialog-orchestration", "syncing-handlers-across-components");
  await d.expectWindowed();
  await d.expectCardVisible("Syncing handlers across components");
  await expect(
    d.cardRoot("dialog-orchestration", "syncing-handlers-across-components").getByText(/ownerToken|openDialog/).first(),
  ).toBeVisible();
});
