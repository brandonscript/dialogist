import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("actions-and-results/action-events", async ({ demoPage: d }) => {
  await d.gotoCard("actions-and-results", "action-events");
  await d.expectWindowed();
  await d.expectCardVisible("Action events");
  await expect(
    d
      .cardRoot("actions-and-results", "action-events")
      .getByText(/onOkClick|onCancelClick/)
      .first(),
  ).toBeVisible();
});
