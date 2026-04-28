import { type ComponentType, createElement, isValidElement, type ReactNode } from "react";

import type { DialogPartContent } from "../types";

const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
const REACT_MEMO_TYPE = Symbol.for("react.memo");

/**
 * Turns `DialogPartContent` (React node or component type) into a `ReactNode` for rendering.
 * When `value` is a component type, optional `componentProps` are spread onto it.
 */
export const resolveDialogPartContent = (
  value: DialogPartContent | undefined | null | false,
  componentProps?: Record<string, unknown>,
): ReactNode => {
  if (value == null || value === false) return null;
  if (isValidElement(value)) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") return value;
  if (Array.isArray(value)) return value as ReactNode;
  if (typeof value === "function") {
    return createElement(value as ComponentType<unknown>, (componentProps ?? {}) as never);
  }
  if (typeof value === "object" && value !== null) {
    const t = (value as { $$typeof?: symbol }).$$typeof;
    if (t === REACT_FORWARD_REF_TYPE || t === REACT_MEMO_TYPE) {
      return createElement(value as unknown as ComponentType<unknown>, (componentProps ?? {}) as never);
    }
  }
  return value as ReactNode;
}
