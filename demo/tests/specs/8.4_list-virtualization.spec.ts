import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("dialog-orchestration/list-virtualization", async ({ page, demoPage: d }) => {
  await d.gotoCard("dialog-orchestration", "list-virtualization");
  await d.expectWindowed();
  await d.expectCardVisible("List virtualization");
  await d.cardRoot("dialog-orchestration", "list-virtualization").getByRole("button", { name: "Open dialog" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/Close/i);
});
