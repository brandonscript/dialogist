import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "the-basics";
const CARD = "confirmation-dialog";
const CARD_TITLE = "Confirmation dialog";

forEachAdapter("cancel path resolves with error result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show confirmation dialog" }).click();
  await expectDialogStructure(page, {
    title: "Confirm action",
    message: "Are you sure you want to proceed with this action?",
    actionLabels: ["Cancel", "Yes, continue"],
  });

  await dismissViaAction(page, "Cancel");
  await expectResultDisplay(card, "Cancel", "error");
});

forEachAdapter("confirm path resolves with success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show confirmation dialog" }).click();
  await expectDialogStructure(page, {
    title: "Confirm action",
    actionLabels: ["Cancel", "Yes, continue"],
  });

  await dismissViaAction(page, "Yes, continue");
  await expectResultDisplay(card, "Yes, continue", "success");
});
