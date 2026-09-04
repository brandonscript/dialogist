import { HeadlessFooter, HeadlessStatusBar, HeadlessActionsContainer } from '../../components/headless/headlessDefaults.js';
import { BaseUiActions } from './BaseUiActions.js';
import { BaseUiBase } from './BaseUiBase.js';
import { BaseUiContent, BaseUiTitle } from './BaseUiSlots.js';

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

/** Default `slots` bundle for `<DialogProvider slots={baseUiSlots}>`. */
var baseUiSlots = {
  Base: BaseUiBase,
  Title: BaseUiTitle,
  Content: BaseUiContent,
  ActionsContainer: HeadlessActionsContainer,
  Actions: BaseUiActions,
  StatusBar: HeadlessStatusBar,
  Footer: HeadlessFooter
};

export { BaseUiActions, BaseUiBase, BaseUiContent, BaseUiTitle, baseUiSlots };
//# sourceMappingURL=index.js.map
