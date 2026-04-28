import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("closing-dialogs/preventing-dialogs-from-closing", async ({ page, demoPage: d }) => {
  await d.gotoCard("closing-dialogs", "preventing-dialogs-from-closing");
  await d.expectWindowed();
  await d.expectCardVisible("Preventing dialogs from closing");
  await d.clickButtonInCard("closing-dialogs", "preventing-dialogs-from-closing", "Show close guard demo");
  await expect(page.getByRole("dialog")).toBeVisible();
  const guard = page.getByRole("switch", { name: /close guard/i });
  await expect(guard).toBeVisible();
  if (await guard.isChecked()) await guard.click();
  await d.dismissDialog(/Cancel/i);
});
