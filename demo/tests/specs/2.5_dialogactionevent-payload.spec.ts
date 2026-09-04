import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "actions-and-results";
const CARD = "dialogactionevent-payload";
const CARD_TITLE = "DialogActionEvent payload";

forEachAdapter("approve path shows buttonText and action in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show dialog" }).click();
  await expectDialogStructure(page, {
    title: "Action callbacks",
    message: /Click a button/i,
    actionLabels: ["Not now", "Approve"],
  });

  await dismissViaAction(page, "Approve");
  // action field for the ok button is "okClicked".
  await expectResultDisplay(card, /Approve \(okClicked\)/i, "success");
});

forEachAdapter("cancel path shows buttonText and action in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show dialog" }).click();
  await expectDialogStructure(page, {
    actionLabels: ["Not now", "Approve"],
  });

  await dismissViaAction(page, "Not now");
  // action field for the cancel button is "cancelClicked".
  await expectResultDisplay(card, /Not now \(cancelClicked\)/i, "error");
});
