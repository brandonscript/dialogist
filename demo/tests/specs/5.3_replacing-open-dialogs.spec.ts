import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("updating-dialog-content/replacing-open-dialogs", async ({ demoPage: d }) => {
  await d.gotoCard("updating-dialog-content", "replacing-open-dialogs");
  await d.expectWindowed();
  await d.expectCardVisible("Replacing open dialogs");
  await expect(
    d.cardRoot("updating-dialog-content", "replacing-open-dialogs").getByText(/replaceIfOpen|onConflict/).first(),
  ).toBeVisible();
});
