import { toConsumableArray as _toConsumableArray, createForOfIteratorHelper as _createForOfIteratorHelper } from '../../_virtual/_rollupPluginBabelHelpers.js';

var DELIMITER = "::";
var DELIMITER_ERROR = "[Dialogist] dialogKey segments cannot contain \"".concat(DELIMITER, "\".");
var coerceDialogKeyArray = function coerceDialogKeyArray(key) {
  if (key === undefined) return undefined;
  if (Array.isArray(key)) {
    return _toConsumableArray(key);
  }
  if (typeof key === "string" && key.includes(DELIMITER)) {
    return key.split(DELIMITER).map(function (segment) {
      return segment;
    });
  }
  return [key];
};
var canonicalizeDialogKeyParts = function canonicalizeDialogKeyParts(parts) {
  var canonical = parts.map(function (segment) {
    return String(segment);
  });
  var _iterator = _createForOfIteratorHelper(canonical),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var segment = _step.value;
      if (segment.includes(DELIMITER)) {
        throw new Error(DELIMITER_ERROR);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return canonical;
};
var ensureDialogKeyArray = function ensureDialogKeyArray(key) {
  if (key === undefined) return undefined;
  var parts = coerceDialogKeyArray(key);
  if (!parts || parts.length === 0) return undefined;
  return canonicalizeDialogKeyParts(parts.slice());
};
var dialogKeyArrayToId = function dialogKeyArrayToId(segments) {
  return segments.map(function (segment) {
    return String(segment);
  }).join(DELIMITER);
};
var resolveDialogKey = function resolveDialogKey(key, options) {
  if (key === undefined && options !== null && options !== void 0 && options.autogenerate) {
    var generatedId = "dialog-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2));
    return {
      parts: [generatedId],
      str: generatedId
    };
  }
  var parts = coerceDialogKeyArray(key);
  if (!parts || parts.length === 0) {
    throw new Error("[Dialogist] dialogKey is required.");
  }
  var safeParts = canonicalizeDialogKeyParts(parts.slice());
  return {
    parts: safeParts,
    str: dialogKeyArrayToId(safeParts)
  };
};
var dialogKeyArrayEquals = function dialogKeyArrayEquals(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i += 1) {
    if (String(a[i]) !== String(b[i])) return false;
  }
  return true;
};

/**
 * Returns `true` when `key` is equal to `prefix` **or** when `key` has `prefix` as a proper
 * segment-aligned prefix (i.e. `key` starts with `prefix + "::"`).
 *
 * Used to enable root-key matching for `closeDialog` and `useDialogIsOpen` when a composite
 * flow-step key is active — e.g. `dialogKeyStartsWith("checkout-flow::step-1", "checkout-flow")`
 * returns `true`.
 */
var dialogKeyStartsWith = function dialogKeyStartsWith(key, prefix) {
  return key === prefix || key.startsWith(prefix + DELIMITER);
};

/** True when both keys share the same first segment (segment-aligned root), e.g. `a::1` and `a::2`. */
var dialogKeySameRoot = function dialogKeySameRoot(a, b) {
  var _a$split$, _b$split$;
  var ra = (_a$split$ = a.split(DELIMITER)[0]) !== null && _a$split$ !== void 0 ? _a$split$ : a;
  var rb = (_b$split$ = b.split(DELIMITER)[0]) !== null && _b$split$ !== void 0 ? _b$split$ : b;
  return String(ra) === String(rb);
};

export { coerceDialogKeyArray, dialogKeyArrayEquals, dialogKeyArrayToId, dialogKeySameRoot, dialogKeyStartsWith, ensureDialogKeyArray, resolveDialogKey };
//# sourceMappingURL=dialogKey.js.map
