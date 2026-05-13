"use client";
import { useMemo, useRef, useEffect } from 'react';
import { dialogistStyles } from '../theme/dialogTheme.js';
import { serializeStylesToCss } from '../utils/cssSerialize.js';

var STYLE_TAG_ID = "dialogist-global-styles";
var REGISTRY_KEY = "__dialogistStyleRegistry__";
var getRegistry = function getRegistry() {
  if (typeof document === "undefined") return undefined;
  var target = document;
  return target[REGISTRY_KEY];
};
var setRegistry = function setRegistry(registry) {
  if (typeof document === "undefined") return;
  var target = document;
  if (registry === undefined) {
    delete target[REGISTRY_KEY];
  } else {
    target[REGISTRY_KEY] = registry;
  }
};

/**
 * Inject the static `dialogistStyles` block once per document. Re-mounted providers share
 * a refcount so the `<style>` tag stays in the DOM until the last provider unmounts.
 *
 * Pass `mode="external"` to skip injection entirely (consumers import a CSS file via
 * `import "dialogist/styles.css"` instead). Pass `mode="none"` to opt out completely (an
 * adapter such as the MUI adapter may render its own MUI `GlobalStyles` if preferred).
 */

var DialogistGlobalStyles = function DialogistGlobalStyles(_ref) {
  var _ref$mode = _ref.mode,
    mode = _ref$mode === void 0 ? "inject" : _ref$mode;
  var css = useMemo(function () {
    return serializeStylesToCss(dialogistStyles);
  }, []);
  var acquiredRef = useRef(false);
  useEffect(function () {
    if (mode !== "inject") return;
    if (typeof document === "undefined") return;
    var registry = getRegistry();
    if (!registry) {
      var existing = document.getElementById(STYLE_TAG_ID);
      var element = existing !== null && existing !== void 0 ? existing : document.createElement("style");
      if (!existing) {
        element.id = STYLE_TAG_ID;
        element.setAttribute("data-dialogist", "global");
        element.appendChild(document.createTextNode(css));
        document.head.appendChild(element);
      } else if (existing.textContent !== css) {
        existing.textContent = css;
      }
      registry = {
        count: 0,
        element: element
      };
      setRegistry(registry);
    }
    registry.count += 1;
    acquiredRef.current = true;
    return function () {
      var current = getRegistry();
      if (!current) return;
      if (!acquiredRef.current) return;
      acquiredRef.current = false;
      current.count -= 1;
      if (current.count <= 0) {
        current.element.remove();
        setRegistry(undefined);
      }
    };
  }, [mode, css]);
  return null;
};

export { DialogistGlobalStyles };
//# sourceMappingURL=DialogistGlobalStyles.js.map
