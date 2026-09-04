import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "the-basics";
const CARD = "dialog-configuration";
const CARD_TITLE = "Dialog configuration";

forEachAdapter(
  "use all defaults opens with hook-level labels",
  SECTION, CARD, CARD_TITLE,
  async ({ page, d }) => {
    const card = d.cardRoot(SECTION, CARD);

    await card.getByRole("button", { name: "Use all defaults" }).click();
    // Title comes from the static hook config ("Default title"), not from the text fields.
    await expectDialogStructure(page, {
      title: "Default title",
      actionLabels: ["Unimpressed cancel", "Boring confirm"],
    });

    await dismissViaAction(page, "Unimpressed cancel");
  },
);

forEachAdapter(
  "override title & buttons opens with overridden labels",
  SECTION, CARD, CARD_TITLE,
  async ({ page, d }) => {
    const card = d.cardRoot(SECTION, CARD);

    await card.getByRole("button", { name: "Override title & buttons" }).click();
    await expectDialogStructure(page, {
      title: "This is the way",
      actionLabels: ["Nope", "Oh, yes!"],
    });

    await dismissViaAction(page, "Nope");
  },
);

forEachAdapter(
  "custom labels in text fields flow into the dialog",
  SECTION, CARD, CARD_TITLE,
  async ({ page, d }) => {
    const card = d.cardRoot(SECTION, CARD);

    // Fill in custom values.
    await card.getByLabel("Title").fill("My Custom Title");
    await card.getByLabel("Cancel label").fill("Nope");
    await card.getByLabel("Confirm label").fill("Yep");

    await card.getByRole("button", { name: "Override title & buttons" }).click();
    await expectDialogStructure(page, {
      title: "My Custom Title",
      actionLabels: ["Nope", "Yep"],
    });

    await dismissViaAction(page, "Nope");

    // Restore defaults so the card is clean for subsequent adapter runs.
    await card.getByLabel("Title").fill("This is the way");
    await card.getByLabel("Cancel label").fill("Nope");
    await card.getByLabel("Confirm label").fill("Oh, yes!");
  },
);
