import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("data-providers/using-react-context", async ({ page, demoPage: d }) => {
  await d.gotoCard("data-providers", "using-react-context");
  await d.expectWindowed();
  await d.expectCardVisible("Using React context");
  await d.clickButtonInCard("data-providers", "using-react-context", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/^OK$/i);
});
