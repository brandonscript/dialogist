import { expect } from "@playwright/test";

import {
  expectDialogStructure,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-state-and-data-flow";
const CARD = "high-frequency-state-sync";
const CARD_TITLE = "High-frequency state sync";

forEachAdapter("opens dialog with slider and closes via Done", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show high-frequency sync demo" }).click();
  const dialog = await expectDialogStructure(page, {
    actionLabels: [/Done/i],
  });

  // Slider should be present inside the dialog content.
  const slider = dialog.getByRole("slider", { name: /Adjust border radius/i });
  await expect(slider).toBeVisible();

  // Move slider with arrow key — local state should update.
  await slider.focus();
  await page.keyboard.press("ArrowRight");

  await dialog.getByRole("button", { name: /Done/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
