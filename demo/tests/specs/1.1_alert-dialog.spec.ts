import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "the-basics";
const CARD = "alert-dialog";
const CARD_TITLE = "Alert dialog";

forEachAdapter("opens, shows correct content, and dismisses", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show alert dialog" }).click();
  await expectDialogStructure(page, {
    title: "Alert",
    message: "This is an important alert message that you should read!",
    actionLabels: [/Got it!/i],
  });

  await dismissViaAction(page, /Got it!/i);
  await expectResultDisplay(card, /Got it!/i, "info");
});
