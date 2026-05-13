import { ShadcnBase } from './ShadcnBase.js';
import { ShadcnFooter, ShadcnStatusBar, ShadcnActions, ShadcnActionsContainer, ShadcnContent, ShadcnTitle } from './ShadcnSlots.js';

/**
 * shadcn/ui-style adapter for Dialogist, powered by Base UI primitives instead of Radix.
 *
 * Same class conventions and animation primitives as a stock shadcn Dialog (e.g.
 * `data-[state=open]:animate-in`, `bg-background`, `tailwindcss-animate` keyframes), but
 * the underlying components come from `@base-ui-components/react` so consumers don't pull
 * in Radix.
 *
 * Usage (importable bundle):
 * ```tsx
 * import { DialogProvider } from "dialogist";
 * import { shadcnSlots } from "dialogist/shadcn";
 *
 * <DialogProvider slots={shadcnSlots}>...</DialogProvider>
 * ```
 *
 * For shadcn's "copy into your app" workflow, see `templates/dialog.tsx` in this
 * directory — copy that file to `src/components/ui/dialog.tsx` and adjust to taste.
 *
 * Peer dependencies: `@base-ui-components/react@^1.0.0-rc.0`, plus a tailwindcss setup
 * with `tailwindcss-animate` for the enter/exit transitions to take effect.
 */


/** Default `slots` bundle for `<DialogProvider slots={shadcnSlots}>`. */
var shadcnSlots = {
  Base: ShadcnBase,
  Title: ShadcnTitle,
  Content: ShadcnContent,
  ActionsContainer: ShadcnActionsContainer,
  Actions: ShadcnActions,
  StatusBar: ShadcnStatusBar,
  Footer: ShadcnFooter
};

export { ShadcnActions, ShadcnActionsContainer, ShadcnBase, ShadcnContent, ShadcnFooter, ShadcnStatusBar, ShadcnTitle, shadcnSlots };
//# sourceMappingURL=index.js.map
