import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-orchestration";
const CARD = "list-virtualization";
const CARD_TITLE = "List virtualization";

forEachAdapter("replaceSameKey: opening a second row updates the same dialog in place", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  // The "replaceSameKey" list appears first; click its first "Open dialog" button.
  const sameKeyList = card.locator('[data-testid="replace-same-key-list"]').or(
    card.locator("text=/replaceSameKey virtual list/i").locator("..").locator(".."),
  );

  // Use CSS-based locator: base-ui/shadcn set aria-hidden on card elements while the modal is open,
  // which makes getByRole("button") return 0 elements for the second click.
  const openButtons = card.locator("button").filter({ hasText: "Open dialog" });
  await openButtons.first().click();

  await expectDialogStructure(page, {
    title: /Row \d+/,
    actionLabels: [/Close/i],
  });

  const firstTitle = await page.getByRole("dialog").locator(".Dialogist-title").textContent();

  // Click a different row's "Open dialog" while the dialog is still open.
  // replaceSameKey allows in-place update — the dialog stays but title changes.
  const secondButton = openButtons.nth(3);
  await secondButton.scrollIntoViewIfNeeded();
  await secondButton.click();

  // Dialog should still be visible (not closed and reopened).
  await expect(page.getByRole("dialog")).toBeVisible();

  // Title should have changed to the new row.
  const secondTitle = await page.getByRole("dialog").locator(".Dialogist-title").textContent();
  expect(secondTitle).not.toBe(firstTitle);

  await dismissViaAction(page, /Close/i);
});

forEachAdapter("opens dialog for first visible row and dismisses", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  // Click the first "Open dialog" button in the card.
  await card.locator("button").filter({ hasText: "Open dialog" }).first().click();

  await expectDialogStructure(page, {
    title: /Row \d+/,
    actionLabels: [/Close/i],
  });

  await dismissViaAction(page, /Close/i);
});
