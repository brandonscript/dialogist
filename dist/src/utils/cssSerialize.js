import { slicedToArray as _slicedToArray, typeof as _typeof, createForOfIteratorHelper as _createForOfIteratorHelper } from '../../_virtual/_rollupPluginBabelHelpers.js';

/**
 * Minimal serializer that converts a JSS-like style object (the same shape used by
 * `dialogistStyles`) into a plain CSS string suitable for an HTML `<style>` tag or a
 * CSS file written to disk.
 *
 * Supports:
 * - Top-level selectors (e.g. `".Dialogist-base"`, `"@keyframes name"`).
 * - Nested selectors using `&` (the parent placeholder) and direct nesting like
 *   `"& .child"`, `"& .a, & .b"`, `":has(.x) .y"`.
 * - CSS custom properties (`"--dialogist-spacing": "32px"`).
 * - Values may be `string | number`. Numbers without a unit get `px` for known
 *   length-y properties; otherwise they are stringified verbatim.
 *
 * This is intentionally tiny — it only needs to handle the static shape of
 * `dialogistStyles`, not arbitrary user input.
 */

var UNITLESS_PROPS = new Set(["opacity", "z-index", "font-weight", "line-height", "flex", "flex-grow", "flex-shrink", "order", "tab-size", "columns", "column-count"]);
var camelToKebab = function camelToKebab(key) {
  if (key.startsWith("--")) return key;
  return key.replace(/[A-Z]/g, function (m) {
    return "-".concat(m.toLowerCase());
  });
};
var formatValue = function formatValue(prop, value) {
  if (typeof value === "number" && value !== 0 && !UNITLESS_PROPS.has(prop)) {
    return "".concat(value, "px");
  }
  return String(value);
};
var isStyleObject = function isStyleObject(value) {
  return value !== null && _typeof(value) === "object" && !Array.isArray(value);
};

/**
 * Resolves a nested selector against its parent. Mirrors the subset of nesting we use:
 * - Selectors containing `&` are interpolated against the parent.
 * - Selectors starting with `&` (e.g. `"& .child"`) are joined with a space.
 * - Selectors starting with `:` (e.g. `":has(...)"`) are concatenated to the parent.
 * - Comma-separated lists are split, resolved per-part, then re-joined.
 */
var resolveSelector = function resolveSelector(parent, child) {
  var parts = child.split(",").map(function (p) {
    return p.trim();
  });
  var resolved = parts.map(function (part) {
    if (part.includes("&")) return part.replace(/&/g, parent);
    if (part.startsWith(":")) return "".concat(parent).concat(part);
    if (part.startsWith("&")) return part.replace(/^&/, parent);
    return "".concat(parent, " ").concat(part);
  });
  return resolved.join(", ");
};
var writeBlock = function writeBlock(selector, declarations, out) {
  if (declarations.length === 0) return;
  out.push("".concat(selector, " {"));
  var _iterator = _createForOfIteratorHelper(declarations),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        prop = _step$value[0],
        value = _step$value[1];
      out.push("  ".concat(prop, ": ").concat(value, ";"));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  out.push("}");
};
var writeKeyframes = function writeKeyframes(name, frames, out) {
  out.push("".concat(name, " {"));
  for (var _i = 0, _Object$entries = Object.entries(frames); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      frame = _Object$entries$_i[0],
      decls = _Object$entries$_i[1];
    if (!isStyleObject(decls)) continue;
    var declStrings = [];
    for (var _i2 = 0, _Object$entries2 = Object.entries(decls); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        k = _Object$entries2$_i[0],
        v = _Object$entries2$_i[1];
      if (v == null || isStyleObject(v)) continue;
      declStrings.push("    ".concat(camelToKebab(k), ": ").concat(formatValue(camelToKebab(k), v), ";"));
    }
    out.push("  ".concat(frame, " {"));
    out.push.apply(out, declStrings);
    out.push("  }");
  }
  out.push("}");
};
var _visit = function visit(selector, block, out) {
  var declarations = [];
  var nested = [];
  for (var _i3 = 0, _Object$entries3 = Object.entries(block); _i3 < _Object$entries3.length; _i3++) {
    var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
      _key = _Object$entries3$_i[0],
      value = _Object$entries3$_i[1];
    if (value == null) continue;
    if (isStyleObject(value)) {
      nested.push([_key, value]);
      continue;
    }
    var prop = camelToKebab(_key);
    declarations.push([prop, formatValue(prop, value)]);
  }
  writeBlock(selector, declarations, out);
  for (var _i4 = 0, _nested = nested; _i4 < _nested.length; _i4++) {
    var _nested$_i = _slicedToArray(_nested[_i4], 2),
      childSelector = _nested$_i[0],
      childBlock = _nested$_i[1];
    if (childSelector.startsWith("@keyframes")) {
      writeKeyframes(childSelector, childBlock, out);
      continue;
    }
    if (childSelector.startsWith("@")) {
      out.push("".concat(childSelector, " {"));
      _visit("&", childBlock, out);
      out.push("}");
      continue;
    }
    _visit(resolveSelector(selector, childSelector), childBlock, out);
  }
};

/**
 * Serialize a JSS-like style object (the same shape as `dialogistStyles`) into a CSS
 * string. Top-level keys are treated as selectors (or `@keyframes` blocks).
 */
var serializeStylesToCss = function serializeStylesToCss(styles) {
  var out = [];
  for (var _i5 = 0, _Object$entries4 = Object.entries(styles); _i5 < _Object$entries4.length; _i5++) {
    var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i5], 2),
      selector = _Object$entries4$_i[0],
      block = _Object$entries4$_i[1];
    if (block == null || _typeof(block) !== "object") continue;
    if (selector.startsWith("@keyframes")) {
      writeKeyframes(selector, block, out);
      continue;
    }
    _visit(selector, block, out);
  }
  return out.join("\n");
};

export { serializeStylesToCss };
//# sourceMappingURL=cssSerialize.js.map
