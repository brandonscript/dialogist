import { expect } from "@playwright/test";

import {
  dismissViaAction,
  expectDialogStructure,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "updating-dialog-content";
const CARD = "understanding-dialog-slots";
const CARD_TITLE = "Understanding dialog slots";

forEachAdapter("body re-render counter increments only when typing", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show slots example dialog" }).click();
  const dialog = await expectDialogStructure(page, {
    actionLabels: [/Close/i],
  });

  // Capture initial render count.
  const counterText = dialog.locator("text=/Body re-renders:/");
  await expect(counterText).toBeVisible();
  const initial = await counterText.textContent();
  const initialCount = Number((initial ?? "").replace(/\D/g, "").slice(-2) || "0");

  // Type 5 characters — the body render count must increase.
  await dialog.getByLabel("Your comment").fill("Hello");
  const updated = await counterText.textContent();
  const updatedCount = Number((updated ?? "").replace(/\D/g, "").slice(-2) || "0");
  expect(updatedCount).toBeGreaterThan(initialCount);

  await dismissViaAction(page, /Close/i);
});

forEachAdapter("title ticks every second independently of body", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);

  await card.getByRole("button", { name: "Show slots example dialog" }).click();
  const dialog = await expectDialogStructure(page, {});

  // Wait for title to update (ticks every second).
  const title = dialog.locator(".Dialogist-title");
  await expect(title).toContainText(/Add a comment/i);
  await page.waitForTimeout(1200);
  // After ~1 s the ticker should have appended " (1s elapsed)".
  await expect(title).toContainText(/elapsed/i);

  await dismissViaAction(page, /Close/i);
});
