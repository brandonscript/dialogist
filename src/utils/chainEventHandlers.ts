/**
 * Merges partial handler objects left-to-right. For the same key:
 * - Two **functions** are **chained** (earlier runs first, then later).
 * - Otherwise the **later value wins** (including a non-function replacing an earlier function).
 */
export const chainEventHandlers = <T extends Record<string, unknown>>(
  ...handlers: Array<Partial<T> | undefined>
): Partial<T> => {
  const result: Record<string, unknown> = {};

  for (const obj of handlers) {
    if (!obj) continue;
    for (const key of Object.keys(obj)) {
      const current = result[key];
      const next = (obj as Record<string, unknown>)[key];
      if (typeof current === "function" && typeof next === "function") {
        result[key] = (...args: unknown[]) => {
          (current as (...args: unknown[]) => unknown)(...args);
          (next as (...args: unknown[]) => unknown)(...args);
        };
      } else {
        result[key] = next;
      }
    }
  }

  return result as Partial<T>;
};
