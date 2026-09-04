import { ADAPTERS, switchAdapter } from "../helpers/adapter-helpers";
import { getCardElementId } from "../helpers/demo-nav-ids";
import { expect, test } from "../helpers/windowed-fixture";

const SECTION = "closing-dialogs";
const CARD = "preventing-dialogs-from-closing";

/**
 * Close guard tests — one per adapter.
 *
 * Workflow:
 *  1. Open the "Show close guard demo" dialog (guard starts active).
 *  2. Click Cancel — dialog must stay open (blocked by canClose).
 *  3. Flip the guard switch in the card (outside the dialog popup).
 *  4. Click Cancel again — dialog must close now.
 *
 * Why locator() for the guard switch instead of getByRole():
 *   Base UI's Dialog (which powers both the base-ui and shadcn adapters) sets
 *   aria-hidden on all elements outside the dialog while the modal is open —
 *   correct ARIA semantics for a modal dialog. Playwright's getByRole() respects
 *   aria-hidden, so it cannot find the switch even though pointer events work fine
 *   (because we use modal="trap-focus", which doesn't apply inert/pointer-events:none).
 *   CSS-based locators are not restricted by aria-hidden, so they can locate and
 *   click the switch without issue.
 */
for (const adapter of ADAPTERS) {
  test(`[${adapter.id}] close guard blocks close and unblocks when disabled`, async ({ page, demoPage: d }) => {
    await d.gotoCard(SECTION, CARD);
    await d.expectWindowed();
    await d.expectCardVisible("Preventing dialogs from closing");

    await switchAdapter(page, adapter.label);

    // Open the demo — guard starts active (allowClose=false).
    await d.clickButtonInCard(SECTION, CARD, "Show close guard demo");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The guard switch is outside the dialog popup; locate it by its card element ID
    // so we don't depend on aria-role queries that are restricted to modal content.
    //
    // MUI Switch renders a CSS-hidden <input role="switch"> (opacity:0) inside a visible
    // <label> wrapper. We scope the input locator INSIDE the guard label to avoid false
    // matches with other role="switch" inputs that may also live inside the card element.
    const cardEl = page.locator(`#${getCardElementId(SECTION, CARD)}`);
    const guardLabel = cardEl.locator("label").filter({ hasText: /close guard/i });
    const guardInput = guardLabel.locator('input[role="switch"]');

    // Guard is active — switch input should be checked.
    await expect(guardInput).toBeChecked();

    // Clicking Cancel while guard is active must NOT close the dialog.
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).toBeVisible();

    // Disable the guard by clicking the label (which is OUTSIDE the dialog popup).
    // With modal="trap-focus" this click works; modal=true would have blocked it via
    // pointer-events suppression / inert on external elements.
    await guardLabel.click();
    await expect(guardInput).not.toBeChecked();

    // Now Cancel must close the dialog.
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).not.toBeVisible();
  });
}
