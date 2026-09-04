import {
  dismissViaAction,
  dismissViaBackdrop,
  dismissViaEscape,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "closing-dialogs";
const CARD = "dialogcloseevent-payload";
const CARD_TITLE = "DialogCloseEvent payload";

const openDialog = async (
  page: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["page"],
  d: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["d"],
) => {
  const card = d.cardRoot(SECTION, CARD);
  await card.getByRole("button", { name: "Show dialog" }).click();
  await expectDialogStructure(page, {
    title: "Close handling demo",
    message: /Try closing/i,
    actionLabels: ["Cancel", "Continue"],
  });
  return card;
};

forEachAdapter("continue action shows buttonText and action in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openDialog(page, d);
  await dismissViaAction(page, "Continue");
  // action field for ok button is "okClicked".
  await expectResultDisplay(card, /Continue \(okClicked\)/i);
});

forEachAdapter("cancel action shows buttonText and action in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openDialog(page, d);
  await dismissViaAction(page, "Cancel");
  // action field for cancel button is "cancelClicked".
  await expectResultDisplay(card, /Cancel \(cancelClicked\)/i);
});

forEachAdapter("escape key shows reason: escape in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openDialog(page, d);
  await dismissViaEscape(page);
  await expectResultDisplay(card, /Reason: escape/i, "info");
});

forEachAdapter("backdrop click shows reason: backdrop in result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = await openDialog(page, d);
  await dismissViaBackdrop(page);
  await expectResultDisplay(card, /Reason: backdrop/i, "info");
});
