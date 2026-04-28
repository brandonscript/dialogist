import { expect } from "@playwright/test";
import { test } from "../helpers/windowed-fixture";

test("data-providers/using-react-query", async ({ page, demoPage: d }) => {
  await d.gotoCard("data-providers", "using-react-query");
  await d.expectWindowed();
  await d.expectCardVisible("Using React Query");
  await d.clickButtonInCard("data-providers", "using-react-query", "Show dialog");
  await expect(page.getByRole("dialog")).toBeVisible();
  await d.dismissDialog(/^OK$/i);
});
