import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "layout-and-presentation";
const CARD = "using-custom-components";
const CARD_TITLE = "Using custom components";

forEachAdapter("confirm path shows status bar, footer, and success result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show custom components dialog" }).click();
  await expectDialogStructure(page, {
    title: "Using custom components",
    hasStatusBar: true,
    hasFooter: true,
    actionLabels: ["Cancel", "Confirm"],
  });

  await dismissViaAction(page, "Confirm");
  await expectResultDisplay(card, "Confirm", "success");
});

forEachAdapter("cancel path resolves with error result", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show custom components dialog" }).click();
  await expectDialogStructure(page, {
    title: "Using custom components",
    hasStatusBar: true,
    hasFooter: true,
    actionLabels: ["Cancel", "Confirm"],
  });

  await dismissViaAction(page, "Cancel");
  await expectResultDisplay(card, "Cancel", "error");
});
