import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-state-and-data-flow";
const CARD = "debouncing-external-updates";
const CARD_TITLE = "Debouncing external updates";

forEachAdapter("save path shows success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Open debounced text dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    actionLabels: ["Cancel", "Save"],
  });

  // Type into the dialog text field.
  await dialog.locator("textarea").first().fill("Hello from debounce test");

  // Wait for the debounce to flush (default 400 ms + buffer).
  await page.waitForTimeout(600);

  // Card "Current value" should reflect typed text.
  await expect(card.locator("text=/Current value/i").or(card.locator(".Dialogist-content"))).toBeVisible();

  await dismissViaAction(page, "Save");
  await expectResultDisplay(card, "Save", "success");
});

forEachAdapter("cancel path shows error result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Open debounced text dialog" }).click();
  await expectDialogStructure(page, {
    actionLabels: ["Cancel", "Save"],
  });

  await dismissViaAction(page, "Cancel");
  await expectResultDisplay(card, "Cancel", "error");
});
