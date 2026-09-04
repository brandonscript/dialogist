import type { Locator, Page } from "@playwright/test";

import { ADAPTERS, switchAdapter } from "./adapter-helpers";
import { expect, test } from "./windowed-fixture";
import type { DemoPage } from "./demo-page";

export interface CardTestArgs {
  page: Page;
  d: DemoPage;
  adapter: (typeof ADAPTERS)[number];
}

/**
 * Generates one Playwright test per adapter.
 * Each test navigates to the card, verifies windowed mode, switches to the adapter,
 * then runs the shared body.
 */
export const forEachAdapter = (
  title: string,
  section: string,
  card: string,
  cardTitle: string,
  body: (args: CardTestArgs) => Promise<void>,
): void => {
  for (const adapter of ADAPTERS) {
    test(`[${adapter.id}] ${title}`, async ({ page, demoPage: d }) => {
      await d.gotoCard(section, card);
      await d.expectWindowed();
      await d.expectCardVisible(cardTitle);
      await switchAdapter(page, adapter.label);
      await body({ page, d, adapter });
    });
  }
};

/**
 * Asserts the open dialog has the canonical Dialogist class hierarchy + optional content.
 * Returns the dialog locator for further assertions.
 */
export const expectDialogStructure = async (
  page: Page,
  opts: {
    title?: string | RegExp;
    message?: string | RegExp;
    hasStatusBar?: boolean;
    hasFooter?: boolean;
    actionLabels?: (string | RegExp)[];
  } = {},
): Promise<Locator> => {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // .Dialogist-base is the MUI modal root (ancestor of role="dialog" in MUI) or is
  // the role="dialog" element itself in non-MUI adapters — check from page level so
  // both cases work correctly.
  await expect(page.locator(".Dialogist-base")).toHaveCount(1);

  if (opts.title) await expect(dialog.locator(".Dialogist-title")).toContainText(opts.title);
  if (opts.message) await expect(dialog.locator(".Dialogist-content")).toContainText(opts.message);
  await expect(dialog.locator(".Dialogist-statusBar")).toHaveCount(opts.hasStatusBar ? 1 : 0);
  await expect(dialog.locator(".Dialogist-footer")).toHaveCount(opts.hasFooter ? 1 : 0);
  if (opts.actionLabels) {
    const actions = dialog.locator(".Dialogist-actionsContainer");
    await expect(actions).toBeVisible();
    for (const label of opts.actionLabels) {
      // Use exact matching for string labels to avoid substring collisions (e.g. "Save" vs "Save as draft").
      const exact = typeof label === "string";
      await expect(actions.getByRole("button", { name: label, exact })).toBeVisible();
    }
  }
  return dialog;
};

/**
 * Dismiss the open dialog by clicking an action button, then assert no dialog remains.
 * Uses exact matching for string labels to prevent "Save" from matching "Save as draft".
 */
export const dismissViaAction = async (page: Page, label: string | RegExp): Promise<void> => {
  const exact = typeof label === "string";
  await page.getByRole("dialog").getByRole("button", { name: label, exact }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

/**
 * Dismiss the open dialog via the Escape key, then assert no dialog remains.
 * Focuses the dialog element first so the key event reaches the dialog's handler
 * regardless of which adapter is used.
 */
export const dismissViaEscape = async (page: Page): Promise<void> => {
  // Focus the dialog element itself (tabIndex=-1 on all adapters) so the Escape key
  // event is dispatched from within the dialog context.
  const dialog = page.getByRole("dialog");
  await dialog.focus();
  await dialog.press("Escape");
  await expect(dialog).toHaveCount(0);
};

/**
 * Dismiss the open dialog by clicking the backdrop.
 * Gets the sandbox bounding box and clicks at the top-left corner (outside the
 * centred dialog paper) across all renderers.
 */
export const dismissViaBackdrop = async (page: Page): Promise<void> => {
  // Click the backdrop element. Use a position close to the top-left edge of the
  // sandbox which should be outside the centred dialog paper.
  const backdrop = page.locator(".Dialogist-backdrop").first();
  await expect(backdrop).toBeVisible();
  const box = await backdrop.boundingBox();
  if (!box) throw new Error("Backdrop bounding box not found");
  // Click near the top-left corner, well outside the centred paper.
  await page.mouse.click(box.x + 8, box.y + 8);
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

/**
 * Asserts the on-card result strip contains given text (and an optional MUI color class).
 * Returns the result button locator for further assertions.
 */
export const expectResultDisplay = async (
  card: Locator,
  text: string | RegExp,
  color?: "success" | "error" | "info" | "secondary",
): Promise<Locator> => {
  const resultButton = card.getByRole("button", { name: text });
  await expect(resultButton).toBeVisible();
  if (color) {
    const colorClass = color[0].toUpperCase() + color.slice(1);
    await expect(resultButton).toHaveClass(new RegExp(`MuiButton-(text|outlined|contained)${colorClass}`));
  }
  return resultButton;
};
