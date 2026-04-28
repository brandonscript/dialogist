import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("closing-dialogs/ways-to-close-dialogs", async ({ demoPage: d }) => {
  await d.gotoCard("closing-dialogs", "ways-to-close-dialogs");
  await d.expectWindowed();
  await d.expectCardVisible("Ways to close dialogs");
  await expect(
    d.cardRoot("closing-dialogs", "ways-to-close-dialogs").getByText(/dialog\.close/).first(),
  ).toBeVisible();
});
