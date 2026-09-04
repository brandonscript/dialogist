import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-state-and-data-flow";
const CARD = "exposing-dialog-state-imperatively";
const CARD_TITLE = "Exposing dialog state imperatively";

forEachAdapter("save path shows success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show imperative dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    title: "Enter a value",
    actionLabels: ["Cancel", "Save"],
  });

  // Type a valid value (7-42 chars).
  await dialog.getByPlaceholder(/Share your thoughts/i).fill("Hello world!");
  await expect(page.getByRole("dialog")).toBeVisible();

  await dismissViaAction(page, "Save");
  await expectResultDisplay(card, "Save", "success");
});

forEachAdapter("cancel path shows error result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show imperative dialog" }).click();
  await expectDialogStructure(page, {
    title: "Enter a value",
    actionLabels: ["Cancel", "Save"],
  });

  await dismissViaAction(page, "Cancel");
  await expectResultDisplay(card, "Cancel", "error");
});
