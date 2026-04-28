import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("updating-dialog-content/using-imperative-setters", async ({ demoPage: d }) => {
  await d.gotoCard("updating-dialog-content", "using-imperative-setters");
  await d.expectWindowed();
  await d.expectCardVisible("Using imperative setters");
  await expect(
    d
      .cardRoot("updating-dialog-content", "using-imperative-setters")
      .getByText(/setTitle|setMessage/)
      .first(),
  ).toBeVisible();
});
