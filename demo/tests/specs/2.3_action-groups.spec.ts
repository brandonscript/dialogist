import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "actions-and-results";
const CARD = "action-groups";
const CARD_TITLE = "Action groups";

const openAndAssert = async (
  page: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["page"],
  d: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["d"],
) => {
  const card = d.cardRoot(SECTION, CARD);
  await card.getByRole("button", { name: "Show grouped actions" }).click();
  const dialog = await expectDialogStructure(page, {
    actionLabels: ["Cancel", "Save as draft", "Save"],
  });

  // Grouped layout — at least one actions row must contain multiple buttons.
  const actionsContainer = dialog.locator(".Dialogist-actionsContainer");
  await expect(actionsContainer).toBeVisible();

  return card;
};

forEachAdapter("cancel path resolves with cancel text", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openAndAssert(page, d);
  await dismissViaAction(page, "Cancel");
  // Color is "text.secondary" which maps to MUI color="text"; only assert the text label.
  await expectResultDisplay(card, "Cancel");
});

forEachAdapter("save-as-draft path resolves as info", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openAndAssert(page, d);
  await dismissViaAction(page, "Save as draft");
  await expectResultDisplay(card, "Save as draft", "info");
});

forEachAdapter("save path resolves as success", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openAndAssert(page, d);
  await dismissViaAction(page, "Save");
  await expectResultDisplay(card, "Save", "success");
});
