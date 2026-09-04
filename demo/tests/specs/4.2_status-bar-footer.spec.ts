import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "layout-and-presentation";
const CARD = "status-bar-footer";
const CARD_TITLE = "Status bar & footer";

forEachAdapter("status bar & footer shows both panels", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Status bar & footer" }).click();
  await expectDialogStructure(page, {
    title: "Confirm action",
    hasStatusBar: true,
    hasFooter: true,
    actionLabels: ["Cancel", "Yes, continue"],
  });

  await dismissViaAction(page, "Cancel");
  await expectResultDisplay(card, "Cancel", "error");
});

forEachAdapter("status bar only shows status bar but no footer", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Status bar only" }).click();
  await expectDialogStructure(page, {
    title: "Confirm action",
    hasStatusBar: true,
    hasFooter: false,
    actionLabels: ["Cancel", "Yes, continue"],
  });

  await dismissViaAction(page, "Cancel");
});

forEachAdapter("footer only shows footer but no status bar", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Footer only" }).click();
  await expectDialogStructure(page, {
    title: "Confirm action",
    hasStatusBar: false,
    hasFooter: true,
    actionLabels: ["Cancel", "Yes, continue"],
  });

  await dismissViaAction(page, "Cancel");
});
