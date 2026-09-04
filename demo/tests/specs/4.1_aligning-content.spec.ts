import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "layout-and-presentation";
const CARD = "aligning-content";
const CARD_TITLE = "Aligning content";

forEachAdapter("opens dialog with default alignment and dismisses via Cancel", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show dialog" }).click();
  await expectDialogStructure(page, {
    title: "Aligning content",
    actionLabels: ["Cancel", "Save as draft", "Save"],
    hasFooter: true,
  });

  await dismissViaAction(page, "Cancel");
  // Cancel uses "text.secondary" color which maps to MuiButton-colorText, not a named theme color.
  await expectResultDisplay(card, "Cancel");
});

forEachAdapter("dialog stays open when alignment radio changes while open", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    title: "Aligning content",
    hasFooter: true,
  });

  // Change an alignment radio while the dialog is open — it should stay mounted.
  // Use evaluate to click the radio via JavaScript, bypassing viewport constraints (the card
  // controls may be scrolled out of view when the windowed dialog covers the viewport).
  await card.locator('input[type="radio"][value="end"]').first().evaluate((el) => (el as HTMLInputElement).click());
  await expect(dialog).toBeVisible();

  await dismissViaAction(page, "Cancel");
});
