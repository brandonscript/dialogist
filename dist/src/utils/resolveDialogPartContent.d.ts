import { type ReactNode } from "react";
import type { DialogPartContent } from "../types";
/**
 * Turns `DialogPartContent` (React node or component type) into a `ReactNode` for rendering.
 * When `value` is a component type, optional `componentProps` are spread onto it.
 */
export declare const resolveDialogPartContent: (value: DialogPartContent | undefined | null | false, componentProps?: Record<string, unknown>) => ReactNode;
