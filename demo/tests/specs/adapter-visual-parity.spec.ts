/**
 * Adapter visual parity tests.
 *
 * ── Strategy ────────────────────────────────────────────────────────────────
 *
 * MUI is the canonical look for the demo. For each representative dialog, the
 * MUI test captures a shared baseline snapshot (e.g. `alert-dialog.mui.png`).
 * Each non-MUI adapter test then compares its own screenshot against that same
 * baseline file with a pixel-ratio tolerance of 0.05 (5%).
 *
 * ── Updating baselines ──────────────────────────────────────────────────────
 *
 * When the MUI dialog look intentionally changes (e.g. theme update):
 *   npx playwright test -c demo/tests/playwright.config.ts adapter-visual-parity \
 *     --update-snapshots --grep "baseline"
 *
 * This regenerates ONLY the MUI baseline files. Non-MUI tests re-compare against
 * the new baselines on the next run.
 *
 * ── Test surface ────────────────────────────────────────────────────────────
 *
 * 7 representative dialogs × 4 adapters = 28 windowed tests.
 * 1 fullscreen alert dialog × 4 adapters = 4 more tests.
 * Plus structural tests (same assertions across all adapters).
 * Total: ~40 tests.
 *
 * Cards chosen to cover all visually-distinct structural variations:
 *   - alert-dialog            single button
 *   - confirmation-dialog     two buttons (contained + outlined)
 *   - built-in-actions        primary + outline button variants
 *   - custom-actions          multiple custom buttons
 *   - action-groups           multi-row layout
 *   - aligning-content        content alignment
 *   - status-bar-footer       extra slots top + bottom
 *
 * Run all:
 *   npx playwright test -c demo/tests/playwright.config.ts adapter-visual-parity
 */

import { expect } from "@playwright/test";

import { test } from "../helpers/windowed-fixture";
import {
  ADAPTERS,
  NON_MUI_ADAPTERS,
  PARITY_DIALOGS,
  closeDialog,
  openCardDialog,
  switchAdapter,
} from "../helpers/adapter-helpers";

// ─── Structural parity ───────────────────────────────────────────────────────
// These tests verify that every adapter produces a semantically equivalent dialog.

test.describe("structural parity — alert dialog", () => {
  for (const adapter of ADAPTERS) {
    test(`${adapter.id}: has dialog role, title, body, and dismiss button`, async ({ page, demoPage: d }) => {
      await d.gotoCard("the-basics", "alert-dialog");
      await d.expectWindowed();
      await switchAdapter(page, adapter.label);

      const dialog = await openCardDialog(page, d, "the-basics", "alert-dialog", "Show alert dialog");

      await expect(dialog.getByRole("heading")).toBeVisible();
      await expect(dialog.getByText("This is an important alert message")).toBeVisible();
      await expect(dialog.getByRole("button", { name: /Got it|OK/i })).toBeVisible();

      await closeDialog(page, /Got it|OK/i);
    });
  }
});

test.describe("structural parity — confirmation dialog", () => {
  for (const adapter of ADAPTERS) {
    test(`${adapter.id}: has cancel and confirm buttons`, async ({ page, demoPage: d }) => {
      await d.gotoCard("the-basics", "confirmation-dialog");
      await d.expectWindowed();
      await switchAdapter(page, adapter.label);

      const dialog = await openCardDialog(
        page,
        d,
        "the-basics",
        "confirmation-dialog",
        "Show confirmation dialog",
      );

      await expect(dialog.getByRole("button", { name: /Cancel/i })).toBeVisible();
      await expect(dialog.getByRole("button", { name: /Confirm|Yes|OK/i })).toBeVisible();

      await closeDialog(page, /Cancel/i);
    });
  }
});

// ─── Visual parity (windowed) ────────────────────────────────────────────────
// MUI test captures the canonical baseline; non-MUI tests compare to that baseline.
//
// We screenshot the dialog paper (role="dialog") rather than the sandbox container
// to avoid dependency on the subnav's highlighted state (which varies between runs).
// All adapters expose role="dialog" on the paper element, and paper widths are
// standardised across adapters in windowed mode via DemoAdapterBases slotProps.

for (const dialog of PARITY_DIALOGS) {
  test.describe(`visual parity — ${dialog.slug}`, () => {
    // MUI baseline — screenshots the dialog paper to establish the canonical look.
    test(`mui: baseline (${dialog.slug})`, async ({ page, demoPage: d }) => {
      await d.gotoCard(dialog.section, dialog.card);
      await d.expectWindowed();
      await switchAdapter(page, "MUI");

      await openCardDialog(page, d, dialog.section, dialog.card, dialog.openButton);

      await expect(page.getByRole("dialog")).toHaveScreenshot(`${dialog.slug}.mui.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.03, // allow minor rendering jitter across re-runs
      });

      await closeDialog(page, dialog.closeButton);
    });

    // Non-MUI adapters compare their dialog paper screenshot to the MUI baseline.
    for (const adapter of NON_MUI_ADAPTERS) {
      test(`${adapter.id} matches mui baseline (${dialog.slug})`, async ({ page, demoPage: d }) => {
        await d.gotoCard(dialog.section, dialog.card);
        await d.expectWindowed();
        await switchAdapter(page, adapter.label);

        await openCardDialog(page, d, dialog.section, dialog.card, dialog.openButton);

        await expect(page.getByRole("dialog")).toHaveScreenshot(`${dialog.slug}.mui.png`, {
          animations: "disabled",
          // 5% tolerance: accounts for minor rendering differences between
          // adapters (anti-aliasing, box-model rounding, font hinting, etc.).
          // Tighten to 0.02 once all adapters are visually stable.
          maxDiffPixelRatio: 0.05,
        });

        await closeDialog(page, dialog.closeButton);
      });
    }
  });
}

// ─── Visual parity (fullscreen) ──────────────────────────────────────────────
// Verify alert dialog in fullscreen mode — dialogs escape the sandbox and render
// in the full viewport. This exercises a different code path from windowed mode.

test.describe("visual parity — alert dialog fullscreen", () => {
  test("mui: baseline fullscreen", async ({ page, demoPage: d }) => {
    await d.gotoCard("the-basics", "alert-dialog");
    await d.setFullscreen(true);
    await switchAdapter(page, "MUI");

    const dlg = await openCardDialog(page, d, "the-basics", "alert-dialog", "Show alert dialog");

    await expect(dlg).toHaveScreenshot("alert-dialog-fullscreen.mui.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.03,
    });

    await closeDialog(page, /Got it|OK/i);
  });

  for (const adapter of NON_MUI_ADAPTERS) {
    test(`${adapter.id} matches mui baseline fullscreen`, async ({ page, demoPage: d }) => {
      await d.gotoCard("the-basics", "alert-dialog");
      await d.setFullscreen(true);
      await switchAdapter(page, adapter.label);

      const dlg = await openCardDialog(page, d, "the-basics", "alert-dialog", "Show alert dialog");

      await expect(dlg).toHaveScreenshot("alert-dialog-fullscreen.mui.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.05,
      });

      await closeDialog(page, /Got it|OK/i);
    });
  }
});
