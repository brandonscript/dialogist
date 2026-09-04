import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-state-and-data-flow";
const CARD = "two-way-state-sync";
const CARD_TITLE = "Two-way state sync";

forEachAdapter("card note flows into dialog and dialog edit flows back out", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  const cardField = card.getByLabel("Shared note (caller)");
  await cardField.fill("Typed in card");

  await card.getByRole("button", { name: "Show two-way sync demo" }).click();
  const dialog = await expectDialogStructure(page, {
    actionLabels: [/Done/i],
  });

  // Dialog field should reflect the note typed into the card.
  const dialogField = dialog.locator("textarea").first();
  await expect(dialogField).toHaveValue(/Typed in card/i, { timeout: 3000 });

  // Edit inside the dialog and close — the card field should update.
  await dialogField.fill("Edited in dialog");
  await dismissViaAction(page, /Done/i);
  await expectResultDisplay(card, /Dialog closed/i, "success");
});

forEachAdapter("simulate external updates toggle changes field without user input", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  const cardField = card.getByLabel("Shared note (caller)");
  await cardField.fill("Starting value");
  const before = await cardField.inputValue();

  // Toggle on "Simulate external updates".
  // The switch renders as <input role="switch" name="..."> inside a FlexBox row (no <label> wrapping).
  const toggleInput = card.locator('input[role="switch"][name="Simulate external updates (replaces note on an interval)"]');
  await toggleInput.click();

  // Wait for at least one external update to arrive (~1.8 s interval).
  await page.waitForTimeout(2200);
  const after = await cardField.inputValue();
  expect(after).not.toBe(before);

  // Toggle off to stop the interval.
  await toggleInput.click();
});
