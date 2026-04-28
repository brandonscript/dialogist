import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-orchestration/multi-step-dialog-flows", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-orchestration", "multi-step-dialog-flows");
  await d.expectWindowed();
  await d.expectCardVisible("Multi-step dialog flows");
  await d.clickButtonInCard("dialog-orchestration", "multi-step-dialog-flows", "Start dialog flow");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(/Welcome to the flow|Step 1/i);
  await page.getByRole("dialog").getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog")).toContainText(/Step 2/i);
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
