import { expect } from "@playwright/test";

import {
  expectDialogStructure,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-state-and-data-flow";
const CARD = "streaming-data-in-dialogs";
const CARD_TITLE = "Streaming data in dialogs";

forEachAdapter("opens dialog with polling and closes via Close & stop polling", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show polling data dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    title: "Streaming data example",
  });

  // Polling toggle and close buttons should be present inside the dialog.
  await expect(dialog.getByRole("button", { name: /Close & stop polling/i })).toBeVisible();
  await expect(dialog.getByRole("button", { name: /^Close$/i })).toBeVisible();

  // Close the dialog using the stop-polling button.
  await dialog.getByRole("button", { name: /Close & stop polling/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

forEachAdapter("close button closes dialog and shows info result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show polling data dialog" }).click();
  const dialog = await expectDialogStructure(page, {});

  await dialog.getByRole("button", { name: /^Close$/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Result should be visible on the card.
  await expect(card.getByRole("button", { name: /close/i }).first()).toBeVisible();
});
