import type { BaseDialogProps } from "../../types";
/**
 * MUI-backed `Base` slot. Mirrors the original `DefaultStyledDialog` from before the
 * adapter split. Forwards `slotProps.paper.ref` so the FLIP resize animation in
 * `DialogScaffolding` continues to work.
 *
 * Use via:
 * ```tsx
 * <DialogProvider slots={muiSlots} cssMode="none" />
 * ```
 * (Set `cssMode="none"` if you prefer to render `dialogistGlobalStylesForMui` from
 * the MUI theme adapter instead of the default style injection.)
 */
export declare const MuiBase: import("@emotion/styled").StyledComponent<BaseDialogProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
