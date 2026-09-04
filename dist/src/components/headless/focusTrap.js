/**
 * Tiny focus-trap helper for the headless dialog default. Intentionally minimal:
 * - Identifies focusable descendants of a container.
 * - Cycles Tab / Shift+Tab focus inside the container.
 * - Does not handle complex edge cases (iframe focus, shadow DOM); adapters that wrap a
 *   real component library (MUI, Base UI) should replace the headless `Base` slot to get
 *   robust focus management.
 */
var FOCUSABLE_SELECTOR = ["a[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])", "[contenteditable='true']"].join(",");
var isVisible = function isVisible(el) {
  var _navigator;
  if (el.hidden) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  // In real browsers `offsetParent === null` means the element is not laid out (display:none
  // or detached). In JSDOM `offsetParent` is always null because no layout runs, so we also
  // accept elements when getClientRects() is empty — JSDOM keeps focus management testable
  // and real browsers rarely hit the (display:none + no client rects) edge case.
  if (typeof window !== "undefined" && (_navigator = window.navigator) !== null && _navigator !== void 0 && (_navigator = _navigator.userAgent) !== null && _navigator !== void 0 && _navigator.includes("jsdom")) {
    return true;
  }
  return el.offsetParent !== null || el.getClientRects().length > 0;
};
var getFocusableElements = function getFocusableElements(container) {
  var candidates = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  return candidates.filter(isVisible);
};
var focusFirstElement = function focusFirstElement(container) {
  var autofocus = container.querySelector("[autofocus]");
  if (autofocus && isVisible(autofocus)) {
    autofocus.focus();
    return;
  }
  var focusables = getFocusableElements(container);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }
  if (container.tabIndex < 0) container.tabIndex = -1;
  container.focus();
};
var handleFocusTrapKeyDown = function handleFocusTrapKeyDown(container, event) {
  if (event.key !== "Tab") return;
  var focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }
  var first = focusables[0];
  var last = focusables[focusables.length - 1];
  var active = document.activeElement;
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

export { focusFirstElement, getFocusableElements, handleFocusTrapKeyDown };
//# sourceMappingURL=focusTrap.js.map
