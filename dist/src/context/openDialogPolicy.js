import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { resolveOnConflictHandler } from '../state/DialogHandlers.js';
import { dialogKeySameRoot } from '../utils/dialogKey.js';

/** Derives {@link DialogConflictKeyRelation} from attempted vs active resolved keys. */
var dialogConflictKeyRelation = function dialogConflictKeyRelation(attemptedDialogKey, activeDialogKey) {
  if (activeDialogKey == null) return "unrelated";
  if (attemptedDialogKey === activeDialogKey) return "sameKey";
  if (dialogKeySameRoot(attemptedDialogKey, activeDialogKey)) return "sameRoot";
  return "unrelated";
};
var isDialogConflictPolicy = function isDialogConflictPolicy(value) {
  return value === "block" || value === "replaceAny" || value === "replaceSameRoot" || value === "replaceSameKey";
};

/**
 * Conflict policy implied only by string `onConflict` literals (active then provider), else `block`.
 * Does not invoke `onConflict` functions.
 */
var resolveLiteralOnlyConflictPolicy = function resolveLiteralOnlyConflictPolicy(activeDialogConfig, providerOnConflict) {
  var _ref;
  var activeRaw = activeDialogConfig === null || activeDialogConfig === void 0 ? void 0 : activeDialogConfig.onConflict;
  var activeLit = typeof activeRaw === "string" ? activeRaw : undefined;
  var provRaw = providerOnConflict;
  var provLit = typeof provRaw === "string" ? provRaw : undefined;
  return (_ref = activeLit !== null && activeLit !== void 0 ? activeLit : provLit) !== null && _ref !== void 0 ? _ref : "block";
};

/**
 * Builds {@link DialogConflictResolver} for a conflicting `open()` from attempted vs active keys and the stack row key
 * (`targetRowKey`) used to evaluate replace eligibility ({@link DialogConflictKeyRelation} is derived from the keys).
 */
var createOpenDialogConflict = function createOpenDialogConflict(options) {
  var attemptedDialogKey = options.attemptedDialogKey,
    activeDialogKey = options.activeDialogKey,
    targetRowKey = options.targetRowKey,
    activeDialogConfig = options.activeDialogConfig,
    providerOnConflict = options.providerOnConflict;
  var keyRelation = dialogConflictKeyRelation(attemptedDialogKey, activeDialogKey);
  var activePolicy = resolveLiteralOnlyConflictPolicy(activeDialogConfig, providerOnConflict);
  var decision = isOpenReplaceAllowed(activePolicy, attemptedDialogKey, targetRowKey) ? "replace" : "block";
  return {
    attemptedDialogKey: attemptedDialogKey,
    activeDialogKey: activeDialogKey,
    keyRelation: keyRelation,
    activePolicy: activePolicy,
    decision: decision
  };
};

/** Human-readable error when a conflicting `open()` throws (`throwOnConflict`). */
var formatBlockedOpenConflictError = function formatBlockedOpenConflictError(conflict) {
  var attemptedDialogKey = conflict.attemptedDialogKey,
    activeDialogKey = conflict.activeDialogKey,
    keyRelation = conflict.keyRelation,
    activePolicy = conflict.activePolicy,
    decision = conflict.decision;
  var active = activeDialogKey == null ? "(none)" : "\"".concat(activeDialogKey, "\"");
  return "[Dialogist] Blocked open: attempted \"".concat(attemptedDialogKey, "\", active ").concat(active, ", keyRelation=").concat(keyRelation, ", activePolicy=").concat(activePolicy, ", decision=").concat(decision, ".");
};
var resolveOnConflictContribution = function resolveOnConflictContribution(value, conflict, reactiveHandlersContext) {
  var effective = reactiveHandlersContext !== undefined ? resolveOnConflictHandler(reactiveHandlersContext.key, reactiveHandlersContext.internalId, value) : value;
  if (effective === undefined) return undefined;
  if (typeof effective === "function") {
    var out = effective(conflict);
    return isDialogConflictPolicy(out) ? out : conflict.activePolicy;
  }
  return effective;
};

/**
 * Resolved `onConflict` for a conflicting `open()`: active literal or function (valid return or
 * {@link DialogConflictResolver.activePolicy}), else provider the same way, else `block`.
 */
var resolveOpenConflictPolicy = function resolveOpenConflictPolicy(options) {
  var activeDialogConfig = options.activeDialogConfig,
    providerOnConflict = options.providerOnConflict,
    conflict = options.conflict,
    reactiveHandlersContext = options.reactiveHandlersContext;
  var fromActive = resolveOnConflictContribution(activeDialogConfig === null || activeDialogConfig === void 0 ? void 0 : activeDialogConfig.onConflict, conflict, reactiveHandlersContext);
  if (fromActive !== undefined) return fromActive;
  var fromProvider = resolveOnConflictContribution(providerOnConflict, conflict);
  return fromProvider !== null && fromProvider !== void 0 ? fromProvider : "block";
};

/**
 * Whether `incomingResolvedKey` may replace/update a row keyed by `targetRowKey` under `policy`.
 * Used for same-key in-place opens and for superseding the active row when keyRelation is not `sameKey` (then
 * `targetRowKey` is the active dialog key).
 */
var openConflictReplaceAllowedForKeys = function openConflictReplaceAllowedForKeys(policy, incomingResolvedKey, targetRowKey) {
  if (policy === "block") return false;
  if (policy === "replaceAny") return true;
  if (policy === "replaceSameKey") return incomingResolvedKey === targetRowKey;
  return dialogKeySameRoot(incomingResolvedKey, targetRowKey);
};
var isOpenReplaceAllowed = function isOpenReplaceAllowed(policy, incomingResolvedKey, targetRowKey) {
  return openConflictReplaceAllowedForKeys(policy, incomingResolvedKey, targetRowKey);
};

/**
 * After {@link resolveOpenConflictPolicy}, align {@link DialogConflictResolver.decision} with the resolved policy
 * and keys (the preliminary `decision` on the object is literal-baseline only).
 */
var attachResolvedOpenConflictDecision = function attachResolvedOpenConflictDecision(conflict, resolvedPolicy, incomingResolvedKey, targetRowKey) {
  return _objectSpread2(_objectSpread2({}, conflict), {}, {
    decision: isOpenReplaceAllowed(resolvedPolicy, incomingResolvedKey, targetRowKey) ? "replace" : "block"
  });
};

export { attachResolvedOpenConflictDecision, createOpenDialogConflict, dialogConflictKeyRelation, formatBlockedOpenConflictError, isDialogConflictPolicy, isOpenReplaceAllowed, openConflictReplaceAllowedForKeys, resolveLiteralOnlyConflictPolicy, resolveOpenConflictPolicy };
//# sourceMappingURL=openDialogPolicy.js.map
