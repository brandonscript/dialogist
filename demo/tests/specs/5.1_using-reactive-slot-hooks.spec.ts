import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("updating-dialog-content/using-reactive-slot-hooks", async ({ demoPage: d }) => {
  await d.gotoCard("updating-dialog-content", "using-reactive-slot-hooks");
  await d.expectWindowed();
  await d.expectCardVisible("Using reactive slot hooks");
  await expect(
    d
      .cardRoot("updating-dialog-content", "using-reactive-slot-hooks")
      .getByText(/useDialogContent|useDialogTitle/)
      .first(),
  ).toBeVisible();
});
