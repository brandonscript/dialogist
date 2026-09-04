import type { ActionsProps } from "../../types";
/**
 * Base UI-backed `Actions` slot. Uses `@base-ui-components/react/button` (`Button`) for
 * accessible button semantics, styled with Dialogist CSS variables so the buttons
 * automatically reflect the active adapter theme without requiring Tailwind.
 *
 * Mirrors MUI's `MuiActions` layout (row/group) using the same CSS class structure.
 */
export declare const BaseUiActions: {
    ({ actionGroups, dialogKey, actionsStyle }: ActionsProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
