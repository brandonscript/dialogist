import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import type { DemoPage } from "./demo-page";

export const ADAPTERS = [
  { id: "mui", label: "MUI" },
  { id: "base-ui", label: "Base UI" },
  { id: "shadcn", label: "shadcn" },
  { id: "tailwind", label: "Tailwind" },
] as const;

export type AdapterConfig = (typeof ADAPTERS)[number];

export const NON_MUI_ADAPTERS = ADAPTERS.filter((a) => a.id !== "mui");

/**
 * Switch to the given adapter via the "Render with" combobox.
 * Waits for the combobox value to update before returning.
 */
export const switchAdapter = async (page: Page, label: string): Promise<void> => {
  const combobox = page.getByRole("combobox", { name: "Render with" });
  await combobox.click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(combobox).toHaveText(new RegExp(label, "i"));
};

/**
 * Open a dialog by clicking a card button, wait for `role="dialog"` to appear,
 * then settle any CSS transitions before returning the locator.
 */
export const openCardDialog = async (
  page: Page,
  d: DemoPage,
  section: string,
  card: string,
  buttonName: string | RegExp,
): Promise<Locator> => {
  await d.clickButtonInCard(section, card, buttonName);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  // Allow CSS transitions to settle
  await page.waitForTimeout(350);
  return dialog;
};

/**
 * Returns a locator for the sandbox container element.
 *
 * The sandbox element's ID is stored in `body[data-dialog-sandbox-container]`.
 * Screenshotting the sandbox gives a fixed-size capture that contains the full
 * dialog (paper + backdrop) so that MUI and non-MUI adapter screenshots can be
 * compared on equal footing, regardless of per-adapter paper dimensions.
 */
export const getSandboxLocator = async (page: Page): Promise<Locator> => {
  const sandboxId = await page.locator("body").getAttribute("data-dialog-sandbox-container");
  if (!sandboxId) throw new Error("sandbox container not found — is the page in windowed mode?");
  return page.locator(`#${sandboxId}`);
};

/**
 * Open a dialog by clicking a test-id trigger, wait for `role="dialog"` to appear.
 */
export const openCardDialogByTestId = async (
  page: Page,
  testId: string,
): Promise<Locator> => {
  await page.getByTestId(testId).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(350);
  return dialog;
};

/**
 * Close the open dialog by clicking a button matching `buttonName`.
 * Waits until no dialogs are visible.
 */
export const closeDialog = async (page: Page, buttonName: string | RegExp): Promise<void> => {
  await page.getByRole("dialog").getByRole("button", { name: buttonName }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

/**
 * Shared dialog definitions for parity tests.
 *
 * Each entry describes:
 * - `section` / `card`: URL path segments for `d.gotoCard()`
 * - `openButton`: name/RegExp of the trigger button inside the card
 * - `closeButton`: name/RegExp of the dismiss button inside the dialog
 * - `slug`: short identifier used in snapshot file names
 */
export const PARITY_DIALOGS = [
  {
    slug: "alert-dialog",
    section: "the-basics",
    card: "alert-dialog",
    openButton: "Show alert dialog",
    closeButton: /Got it|OK/i,
  },
  {
    slug: "confirmation-dialog",
    section: "the-basics",
    card: "confirmation-dialog",
    openButton: "Show confirmation dialog",
    closeButton: /Cancel/i,
  },
  {
    slug: "built-in-actions",
    section: "actions-and-results",
    card: "built-in-actions",
    openButton: "Show alert",
    closeButton: /Approve|OK/i,
  },
  {
    slug: "custom-actions",
    section: "actions-and-results",
    card: "custom-actions",
    openButton: "Show custom actions",
    closeButton: /Cancel/i,
  },
  {
    slug: "action-groups",
    section: "actions-and-results",
    card: "action-groups",
    openButton: "Show grouped actions",
    closeButton: /Cancel/i,
  },
  {
    slug: "aligning-content",
    section: "layout-and-presentation",
    card: "aligning-content",
    openButton: "Show dialog",
    closeButton: /Close|Cancel/i,
  },
  {
    slug: "status-bar-footer",
    section: "layout-and-presentation",
    card: "status-bar-footer",
    openButton: "Status bar & footer",
    closeButton: /Cancel|Close/i,
  },
] as const;
