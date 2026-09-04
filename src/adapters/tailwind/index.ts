/**
 * Tailwind adapter for Dialogist.
 *
 * DOM-only slot components styled with utility classes (no MUI, no Base UI). Pair with
 * `dialogist/styles.css` for the structural CSS variables, and apply the
 * `dialogistTailwindPreset` (or the v4 `@theme` snippet) so Tailwind's `bg-primary`,
 * `text-foreground`, etc. tokens map onto the same CSS variables Dialogist emits.
 *
 * Usage (Tailwind v3):
 * ```js
 * // tailwind.config.cjs
 * module.exports = {
 *   presets: [require("dialogist/tailwind/preset.cjs")],
 *   ...
 * };
 * ```
 *
 * Usage (Tailwind v4): copy the snippet from `dialogist/tailwind/theme.css.txt` (or the
 * adapter README) into your global stylesheet under `@theme`.
 *
 * ```tsx
 * import "dialogist/styles.css";
 * import { DialogProvider } from "dialogist";
 * import { tailwindSlots } from "dialogist/tailwind";
 *
 * <DialogProvider slots={tailwindSlots} cssMode="external">...</DialogProvider>
 * ```
 *
 * Tailwind users typically prefer to ship the CSS file rather than the inline `<style>`
 * injection — pass `cssMode="external"` and `import "dialogist/styles.css"` once at app
 * boot.
 */
import { HeadlessBase } from "../../components/headless/HeadlessBase";
import type { DialogComponents } from "../../types";
import {
  TailwindActions,
  TailwindActionsContainer,
  TailwindContent,
  TailwindFooter,
  TailwindStatusBar,
  TailwindTitle,
} from "./TailwindSlots";

export { HeadlessBase } from "../../components/headless/HeadlessBase";

export {
  TailwindActions,
  TailwindActionsContainer,
  TailwindContent,
  TailwindFooter,
  TailwindStatusBar,
  TailwindTitle,
} from "./TailwindSlots";

/**
 * Default `slots` bundle. Uses the framework-agnostic `HeadlessBase` for the dialog
 * surface (focus trap + scroll lock + portal), and Tailwind-styled DOM components for
 * the rest. Customize by spreading and overriding individual slots.
 */
export const tailwindSlots: DialogComponents = {
  Base: HeadlessBase,
  Title: TailwindTitle,
  Content: TailwindContent,
  ActionsContainer: TailwindActionsContainer,
  Actions: TailwindActions,
  StatusBar: TailwindStatusBar,
  Footer: TailwindFooter,
};
