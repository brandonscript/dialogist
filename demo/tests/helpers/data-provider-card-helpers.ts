import { expect } from "@playwright/test";

import { dismissViaAction, expectDialogStructure, forEachAdapter } from "./card-test-helpers";

/**
 * Shared behavioral test for all Section 7 data-provider cards.
 * Each card has the same structure:
 *   - "Add todo" button (adds a checkbox item to the card list)
 *   - "Reset" button (restores the original list)
 *   - "Show dialog" button (opens a todo-list alert dialog)
 *   - Inside the dialog: "Add random todo" button + a list of checkboxes
 *   - Dialog closes via default "OK" action
 */
export const runDataProviderTest = (section: string, card: string, cardTitle: string): void => {
  forEachAdapter("data provider card behaviour", section, card, cardTitle, async ({ d, page }) => {
    const root = d.cardRoot(section, card);

    // Add a new todo item via the card button.
    const initialCount = await root.getByRole("checkbox").count();
    await root.getByRole("button", { name: "Add todo" }).click();
    await expect(root.getByRole("checkbox")).toHaveCount(initialCount + 1);

    // Reset restores the original list.
    await root.getByRole("button", { name: "Reset" }).click();
    await expect(root.getByRole("checkbox")).toHaveCount(initialCount);

    // Open the dialog and verify structure.
    await root.getByRole("button", { name: "Show dialog" }).click();
    const dialog = await expectDialogStructure(page, { hasStatusBar: false, hasFooter: false });

    // "Add random todo" appends a new item to the dialog's list.
    const before = await dialog.getByRole("checkbox").count();
    await dialog.getByRole("button", { name: "Add random todo" }).click();
    await expect(dialog.getByRole("checkbox")).toHaveCount(before + 1);

    // Dismiss via the default alert "OK" button.
    await dismissViaAction(page, /^OK$/i);
  });
};
