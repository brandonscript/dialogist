import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "the-basics";
const CARD = "async-dialogs";
const CARD_TITLE = "Async dialogs";

forEachAdapter("cancel path resolves with error result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show async dialog" }).click();
  await expectDialogStructure(page, {
    title: "Async confirmation",
    message: /Do you want to proceed/i,
    actionLabels: ["No, cancel", "Yes, proceed"],
  });

  await dismissViaAction(page, "No, cancel");
  await expectResultDisplay(card, "No, cancel", "error");
});

forEachAdapter("confirm path resolves with success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show async dialog" }).click();
  await expectDialogStructure(page, {
    title: "Async confirmation",
    actionLabels: ["No, cancel", "Yes, proceed"],
  });

  await dismissViaAction(page, "Yes, proceed");
  await expectResultDisplay(card, "Yes, proceed", "success");
});
