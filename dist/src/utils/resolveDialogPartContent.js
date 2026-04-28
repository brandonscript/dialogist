import { typeof as _typeof } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { isValidElement, createElement } from 'react';

var REACT_FORWARD_REF_TYPE = Symbol["for"]("react.forward_ref");
var REACT_MEMO_TYPE = Symbol["for"]("react.memo");

/**
 * Turns `DialogPartContent` (React node or component type) into a `ReactNode` for rendering.
 * When `value` is a component type, optional `componentProps` are spread onto it.
 */
var resolveDialogPartContent = function resolveDialogPartContent(value, componentProps) {
  if (value == null || value === false) return null;
  if (/*#__PURE__*/isValidElement(value)) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") return value;
  if (Array.isArray(value)) return value;
  if (typeof value === "function") {
    return /*#__PURE__*/createElement(value, componentProps !== null && componentProps !== void 0 ? componentProps : {});
  }
  if (_typeof(value) === "object" && value !== null) {
    var t = value.$$typeof;
    if (t === REACT_FORWARD_REF_TYPE || t === REACT_MEMO_TYPE) {
      return /*#__PURE__*/createElement(value, componentProps !== null && componentProps !== void 0 ? componentProps : {});
    }
  }
  return value;
};

export { resolveDialogPartContent };
//# sourceMappingURL=resolveDialogPartContent.js.map
