"use client";
import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { createContext, useContext, useMemo } from 'react';
import { jsx } from 'react/jsx-runtime';

var DEFAULT_RESOLVE_SPACING = function DEFAULT_RESOLVE_SPACING(value, fallback) {
  var v = value === undefined ? fallback : value;
  return typeof v === "number" ? "".concat(v * 8, "px") : v;
};
var DEFAULT_DIALOGIST_ADAPTER = {
  resolveSpacing: DEFAULT_RESOLVE_SPACING,
  transitionDuration: 150,
  transitionEasing: "cubic-bezier(0.4, 0, 0.2, 1)"
};
var DialogistAdapterContext = /*#__PURE__*/createContext(null);
DialogistAdapterContext.displayName = "DialogistAdapterContext";

/**
 * Read the active adapter (or fall back to defaults if no adapter is mounted). Adapters
 * mount via `<DialogistAdapterProvider value={...}>`.
 */
var useDialogistAdapter = function useDialogistAdapter() {
  var adapter = useContext(DialogistAdapterContext);
  return adapter !== null && adapter !== void 0 ? adapter : DEFAULT_DIALOGIST_ADAPTER;
};
var DialogistAdapterProvider = function DialogistAdapterProvider(_ref) {
  var value = _ref.value,
    children = _ref.children;
  var merged = useMemo(function () {
    return _objectSpread2(_objectSpread2({}, DEFAULT_DIALOGIST_ADAPTER), value);
  }, [value]);
  return /*#__PURE__*/jsx(DialogistAdapterContext.Provider, {
    value: merged,
    children: children
  });
};

export { DEFAULT_DIALOGIST_ADAPTER, DialogistAdapterProvider, useDialogistAdapter };
//# sourceMappingURL=DialogistAdapterContext.js.map
