import type { BaseDialogConfig, DialogConflictKeyRelation, DialogConflictPolicy, DialogConflictResolver, DialogOpenConfig, DialogStoredConfig } from "../types";
/** Derives {@link DialogConflictKeyRelation} from attempted vs active resolved keys. */
export declare const dialogConflictKeyRelation: (attemptedDialogKey: string, activeDialogKey: string | null) => DialogConflictKeyRelation;
export declare const isDialogConflictPolicy: (value: unknown) => value is DialogConflictPolicy;
/**
 * Conflict policy implied only by string `onConflict` literals (active then provider), else `block`.
 * Does not invoke `onConflict` functions.
 */
export declare const resolveLiteralOnlyConflictPolicy: (activeDialogConfig: DialogOpenConfig | DialogStoredConfig | undefined, providerOnConflict: BaseDialogConfig["onConflict"] | undefined) => DialogConflictPolicy;
/**
 * Builds {@link DialogConflictResolver} for a conflicting `open()` from attempted vs active keys and the stack row key
 * (`targetRowKey`) used to evaluate replace eligibility ({@link DialogConflictKeyRelation} is derived from the keys).
 */
export declare const createOpenDialogConflict: (options: {
    attemptedDialogKey: string;
    activeDialogKey: string | null;
    targetRowKey: string;
    activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
    providerOnConflict?: BaseDialogConfig["onConflict"];
}) => DialogConflictResolver;
/** Human-readable error when a conflicting `open()` throws (`throwOnConflict`). */
export declare const formatBlockedOpenConflictError: (conflict: DialogConflictResolver) => string;
/**
 * Resolved `onConflict` for a conflicting `open()`: active literal or function (valid return or
 * {@link DialogConflictResolver.activePolicy}), else provider the same way, else `block`.
 */
export declare const resolveOpenConflictPolicy: (options: {
    activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
    providerOnConflict?: BaseDialogConfig["onConflict"];
    conflict: DialogConflictResolver;
    /** When the active side is an open dialog row, resolve `onConflict` functions from the reactive handlers store. */
    reactiveHandlersContext?: {
        key: string;
        internalId: string;
    };
}) => DialogConflictPolicy;
/**
 * Whether `incomingResolvedKey` may replace/update a row keyed by `targetRowKey` under `policy`.
 * Used for same-key in-place opens and for superseding the active row when keyRelation is not `sameKey` (then
 * `targetRowKey` is the active dialog key).
 */
export declare const openConflictReplaceAllowedForKeys: (policy: DialogConflictPolicy, incomingResolvedKey: string, targetRowKey: string) => boolean;
export declare const isOpenReplaceAllowed: (policy: DialogConflictPolicy, incomingResolvedKey: string, targetRowKey: string) => boolean;
/**
 * After {@link resolveOpenConflictPolicy}, align {@link DialogConflictResolver.decision} with the resolved policy
 * and keys (the preliminary `decision` on the object is literal-baseline only).
 */
export declare const attachResolvedOpenConflictDecision: (conflict: DialogConflictResolver, resolvedPolicy: DialogConflictPolicy, incomingResolvedKey: string, targetRowKey: string) => DialogConflictResolver;
