import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-orchestration";
const CARD = "handling-open-conflicts";
const CARD_TITLE = "Handling open conflicts";

forEachAdapter("block policy keeps active dialog when same-root is opened", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  // Default policy is "Block" — open the primary dialog.
  await card.getByRole("button", { name: "Open primary dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    title: "Conflict demo",
    actionLabels: [/Close/i],
  });

  // Try to open same-root key — policy is "block" so dialog title should stay "Conflict demo".
  // Use a CSS locator because base-ui/shadcn set aria-hidden on card elements while modal is open.
  await card.locator("button").filter({ hasText: "Same root key" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".Dialogist-title")).toContainText("Conflict demo");

  await dismissViaAction(page, /Close/i);
  await expectResultDisplay(card, /Primary closed/i, "info");
});

forEachAdapter("replaceAny policy replaces the active dialog with same-root opener", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  // Switch to "Replace any" policy.
  await card.getByLabel(/Active dialog conflict policy/i).click();
  await page.getByRole("option", { name: "Replace any" }).click();

  // Open primary then open same-root key — dialog should replace.
  await card.getByRole("button", { name: "Open primary dialog" }).click();
  await expectDialogStructure(page, { title: "Conflict demo" });

  // Use a CSS locator because base-ui/shadcn set aria-hidden on card elements while modal is open.
  await card.locator("button").filter({ hasText: "Same root key" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".Dialogist-title")).toContainText("Same-root dialog");

  await dismissViaAction(page, /Close/i);

  // Restore default policy.
  await card.getByLabel(/Active dialog conflict policy/i).click();
  await page.getByRole("option", { name: "Block" }).click();
});
