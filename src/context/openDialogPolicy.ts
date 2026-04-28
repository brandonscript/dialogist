import { resolveOnConflictHandler } from "../state/DialogHandlers";
import type {
  BaseDialogConfig,
  DialogConflictDecision,
  DialogConflictKeyRelation,
  DialogConflictPolicy,
  DialogConflictResolver,
  DialogOpenConfig,
  DialogStoredConfig,
} from "../types";
import { dialogKeySameRoot } from "../utils/dialogKey";

/** Derives {@link DialogConflictKeyRelation} from attempted vs active resolved keys. */
export const dialogConflictKeyRelation = (
  attemptedDialogKey: string,
  activeDialogKey: string | null,
): DialogConflictKeyRelation => {
  if (activeDialogKey == null) return "unrelated";
  if (attemptedDialogKey === activeDialogKey) return "sameKey";
  if (dialogKeySameRoot(attemptedDialogKey, activeDialogKey)) return "sameRoot";
  return "unrelated";
};

export const isDialogConflictPolicy = (value: unknown): value is DialogConflictPolicy =>
  value === "block" || value === "replaceAny" || value === "replaceSameRoot" || value === "replaceSameKey";

/**
 * Conflict policy implied only by string `onConflict` literals (active then provider), else `block`.
 * Does not invoke `onConflict` functions.
 */
export const resolveLiteralOnlyConflictPolicy = (
  activeDialogConfig: DialogOpenConfig | DialogStoredConfig | undefined,
  providerOnConflict: BaseDialogConfig["onConflict"] | undefined,
): DialogConflictPolicy => {
  const activeRaw = activeDialogConfig?.onConflict;
  const activeLit = typeof activeRaw === "string" ? activeRaw : undefined;
  const provRaw = providerOnConflict;
  const provLit = typeof provRaw === "string" ? provRaw : undefined;
  return activeLit ?? provLit ?? "block";
};

/**
 * Builds {@link DialogConflictResolver} for a conflicting `open()` from attempted vs active keys and the stack row key
 * (`targetRowKey`) used to evaluate replace eligibility ({@link DialogConflictKeyRelation} is derived from the keys).
 */
export const createOpenDialogConflict = (options: {
  attemptedDialogKey: string;
  activeDialogKey: string | null;
  targetRowKey: string;
  activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
  providerOnConflict?: BaseDialogConfig["onConflict"];
}): DialogConflictResolver => {
  const { attemptedDialogKey, activeDialogKey, targetRowKey, activeDialogConfig, providerOnConflict } = options;
  const keyRelation = dialogConflictKeyRelation(attemptedDialogKey, activeDialogKey);
  const activePolicy = resolveLiteralOnlyConflictPolicy(activeDialogConfig, providerOnConflict);
  const decision: DialogConflictDecision = isOpenReplaceAllowed(activePolicy, attemptedDialogKey, targetRowKey)
    ? "replace"
    : "block";
  return {
    attemptedDialogKey,
    activeDialogKey,
    keyRelation,
    activePolicy,
    decision,
  };
};

/** Human-readable error when a conflicting `open()` throws (`throwOnConflict`). */
export const formatBlockedOpenConflictError = (conflict: DialogConflictResolver): string => {
  const { attemptedDialogKey, activeDialogKey, keyRelation, activePolicy, decision } = conflict;
  const active = activeDialogKey == null ? "(none)" : `"${activeDialogKey}"`;
  return `[Dialogist] Blocked open: attempted "${attemptedDialogKey}", active ${active}, keyRelation=${keyRelation}, activePolicy=${activePolicy}, decision=${decision}.`;
};

const resolveOnConflictContribution = (
  value: BaseDialogConfig["onConflict"] | undefined,
  conflict: DialogConflictResolver,
  reactiveHandlersContext?: { key: string; internalId: string },
): DialogConflictPolicy | undefined => {
  const effective =
    reactiveHandlersContext !== undefined
      ? resolveOnConflictHandler(reactiveHandlersContext.key, reactiveHandlersContext.internalId, value)
      : value;
  if (effective === undefined) return undefined;
  if (typeof effective === "function") {
    const out = effective(conflict);
    return isDialogConflictPolicy(out) ? out : conflict.activePolicy;
  }
  return effective;
};

/**
 * Resolved `onConflict` for a conflicting `open()`: active literal or function (valid return or
 * {@link DialogConflictResolver.activePolicy}), else provider the same way, else `block`.
 */
export const resolveOpenConflictPolicy = (options: {
  activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
  providerOnConflict?: BaseDialogConfig["onConflict"];
  conflict: DialogConflictResolver;
  /** When the active side is an open dialog row, resolve `onConflict` functions from the reactive handlers store. */
  reactiveHandlersContext?: { key: string; internalId: string };
}): DialogConflictPolicy => {
  const { activeDialogConfig, providerOnConflict, conflict, reactiveHandlersContext } = options;
  const fromActive = resolveOnConflictContribution(activeDialogConfig?.onConflict, conflict, reactiveHandlersContext);
  if (fromActive !== undefined) return fromActive;
  const fromProvider = resolveOnConflictContribution(providerOnConflict, conflict);
  return fromProvider ?? "block";
};

/**
 * Whether `incomingResolvedKey` may replace/update a row keyed by `targetRowKey` under `policy`.
 * Used for same-key in-place opens and for superseding the active row when keyRelation is not `sameKey` (then
 * `targetRowKey` is the active dialog key).
 */
export const openConflictReplaceAllowedForKeys = (
  policy: DialogConflictPolicy,
  incomingResolvedKey: string,
  targetRowKey: string,
): boolean => {
  if (policy === "block") return false;
  if (policy === "replaceAny") return true;
  if (policy === "replaceSameKey") return incomingResolvedKey === targetRowKey;
  return dialogKeySameRoot(incomingResolvedKey, targetRowKey);
};

export const isOpenReplaceAllowed = (
  policy: DialogConflictPolicy,
  incomingResolvedKey: string,
  targetRowKey: string,
): boolean => openConflictReplaceAllowedForKeys(policy, incomingResolvedKey, targetRowKey);

/**
 * After {@link resolveOpenConflictPolicy}, align {@link DialogConflictResolver.decision} with the resolved policy
 * and keys (the preliminary `decision` on the object is literal-baseline only).
 */
export const attachResolvedOpenConflictDecision = (
  conflict: DialogConflictResolver,
  resolvedPolicy: DialogConflictPolicy,
  incomingResolvedKey: string,
  targetRowKey: string,
): DialogConflictResolver => ({
  ...conflict,
  decision: isOpenReplaceAllowed(resolvedPolicy, incomingResolvedKey, targetRowKey) ? "replace" : "block",
});
