import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "actions-and-results";
const CARD = "built-in-actions";
const CARD_TITLE = "Built-in actions";

forEachAdapter("alert shows one action and success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show alert" }).click();
  await expectDialogStructure(page, {
    title: "One action",
    message: "This dialog uses one default action button.",
    actionLabels: [/^Approve$|^OK$/i],
  });

  await dismissViaAction(page, /^Approve$|^OK$/i);
  await expectResultDisplay(card, /Approve|OK/, "success");
});

forEachAdapter("confirm shows two actions and cancel resolves with error", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show confirm" }).click();
  await expectDialogStructure(page, {
    title: "Two actions",
    message: "This dialog uses two default action buttons.",
  });

  await dismissViaAction(page, /^Not now$|^Cancel$/i);
  await expectResultDisplay(card, /Not now|Cancel/, "error");
});

forEachAdapter("custom labels flow through to the dialog buttons", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByLabel("Cancel label").fill("Nope");
  await card.getByLabel(/OK label/).fill("Yep");

  await card.getByRole("button", { name: "Show confirm" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".Dialogist-actionsContainer").getByRole("button", { name: "Nope" })).toBeVisible();
  await expect(dialog.locator(".Dialogist-actionsContainer").getByRole("button", { name: "Yep" })).toBeVisible();

  await dismissViaAction(page, "Nope");

  // Restore defaults.
  await card.getByLabel("Cancel label").fill("Not now");
  await card.getByLabel(/OK label/).fill("Approve");
});
