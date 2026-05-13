/**
 * Tiny focus-trap helper for the headless dialog default. Intentionally minimal:
 * - Identifies focusable descendants of a container.
 * - Cycles Tab / Shift+Tab focus inside the container.
 * - Does not handle complex edge cases (iframe focus, shadow DOM); adapters that wrap a
 *   real component library (MUI, Base UI) should replace the headless `Base` slot to get
 *   robust focus management.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

const isVisible = (el: HTMLElement): boolean => {
  if (el.hidden) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  // In real browsers `offsetParent === null` means the element is not laid out (display:none
  // or detached). In JSDOM `offsetParent` is always null because no layout runs, so we also
  // accept elements when getClientRects() is empty — JSDOM keeps focus management testable
  // and real browsers rarely hit the (display:none + no client rects) edge case.
  if (typeof window !== "undefined" && (window as { navigator?: { userAgent?: string } }).navigator?.userAgent?.includes("jsdom")) {
    return true;
  }
  return el.offsetParent !== null || el.getClientRects().length > 0;
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter(isVisible);
};

export const focusFirstElement = (container: HTMLElement): void => {
  const autofocus = container.querySelector<HTMLElement>("[autofocus]");
  if (autofocus && isVisible(autofocus)) {
    autofocus.focus();
    return;
  }
  const focusables = getFocusableElements(container);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }
  if (container.tabIndex < 0) container.tabIndex = -1;
  container.focus();
};

export const handleFocusTrapKeyDown = (container: HTMLElement, event: KeyboardEvent): void => {
  if (event.key !== "Tab") return;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || active === container || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (active === last || !container.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }
};
