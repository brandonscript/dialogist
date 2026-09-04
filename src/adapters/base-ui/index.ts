/**
 * Base UI adapter for Dialogist.
 *
 * Wraps Base UI's parts-based Dialog (`Dialog.Root`, `Dialog.Portal`, `Dialog.Backdrop`,
 * `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`) in Dialogist's slot interface so
 * the engine continues to drive open/close while Base UI handles focus management,
 * scroll-lock, and pointer dismissal.
 *
 * The remaining slots (`ActionsContainer`, `Actions`, `StatusBar`, `Footer`) reuse the
 * framework-agnostic headless defaults — they are pure DOM and don't benefit from a
 * library wrapper.
 *
 * Usage:
 * ```tsx
 * import { DialogProvider } from "dialogist";
 * import { baseUiSlots } from "dialogist/base-ui";
 *
 * <DialogProvider slots={baseUiSlots}>...</DialogProvider>
 * ```
 *
 * Peer dependency: `@base-ui-components/react@^1.0.0-rc.0`.
 */
import {
  HeadlessActionsContainer,
  HeadlessFooter,
  HeadlessStatusBar,
} from "../../components/headless/headlessDefaults";
import type { DialogComponents } from "../../types";
import { BaseUiActions } from "./BaseUiActions";
import { BaseUiBase } from "./BaseUiBase";
import { BaseUiContent, BaseUiTitle } from "./BaseUiSlots";

export { BaseUiActions } from "./BaseUiActions";
export { BaseUiBase } from "./BaseUiBase";
export { BaseUiContent, BaseUiTitle } from "./BaseUiSlots";

/** Default `slots` bundle for `<DialogProvider slots={baseUiSlots}>`. */
export const baseUiSlots: DialogComponents = {
  Base: BaseUiBase,
  Title: BaseUiTitle,
  Content: BaseUiContent,
  ActionsContainer: HeadlessActionsContainer,
  Actions: BaseUiActions,
  StatusBar: HeadlessStatusBar,
  Footer: HeadlessFooter,
};
