"use client";

import { Dialog, styled } from "@mui/material";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";

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
export const MuiBase = styled(
  ({ className, slotProps, hideBackdrop, container, ...props }: BaseDialogProps) => (
    <Dialog
      className={classNames(dialogistClasses.base, className)}
      {...props}
      container={container as React.ComponentProps<typeof Dialog>["container"]}
      disableAutoFocus={props.disableAutoFocus}
      disableEnforceFocus={props.disableEnforceFocus}
      disableRestoreFocus={props.disableRestoreFocus}
      PaperProps={{
        className: classNames(dialogistClasses.rootPaper),
        ...(slotProps?.paper as React.ComponentProps<typeof Dialog>["PaperProps"]),
      }}
      slotProps={{
        backdrop: hideBackdrop
          ? { style: { display: "none" } }
          : {
              className: dialogistClasses.backdrop,
              ...(slotProps?.backdrop as Record<string, unknown> | undefined),
            },
      }}
    />
  ),
  {
    shouldForwardProp: (prop) => prop !== "overflow" && prop !== "borderRadius",
  },
)<BaseDialogProps>(({ overflow }) => ({
  overflow: overflow || "hidden",
}));

MuiBase.displayName = "MuiBase";
