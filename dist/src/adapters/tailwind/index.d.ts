import type { DialogComponents } from "../../types";
export { HeadlessBase } from "../../components/headless/HeadlessBase";
export { TailwindActions, TailwindActionsContainer, TailwindContent, TailwindFooter, TailwindStatusBar, TailwindTitle, } from "./TailwindSlots";
/**
 * Default `slots` bundle. Uses the framework-agnostic `HeadlessBase` for the dialog
 * surface (focus trap + scroll lock + portal), and Tailwind-styled DOM components for
 * the rest. Customize by spreading and overriding individual slots.
 */
export declare const tailwindSlots: DialogComponents;
