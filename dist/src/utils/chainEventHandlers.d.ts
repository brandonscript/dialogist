/**
 * Merges partial handler objects left-to-right. For the same key:
 * - Two **functions** are **chained** (earlier runs first, then later).
 * - Otherwise the **later value wins** (including a non-function replacing an earlier function).
 */
export declare const chainEventHandlers: <T extends Record<string, unknown>>(...handlers: Array<Partial<T> | undefined>) => Partial<T>;
