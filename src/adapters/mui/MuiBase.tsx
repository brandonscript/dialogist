"use client";

import { Dialog, styled } from "@mui/material";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";

type DialogSlotProps = NonNullable<React.ComponentProps<typeof Dialog>["slotProps"]>;

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
  ({ className, slotProps, hideBackdrop, container, onClose, ...props }: BaseDialogProps) => {
    const userSlotProps = (slotProps ?? {}) as Partial<DialogSlotProps>;
    const userPaper =
      userSlotProps.paper != null && typeof userSlotProps.paper === "object"
        ? (userSlotProps.paper as Record<string, unknown>)
        : undefined;
    const userPaperClassName = typeof userPaper?.className === "string" ? userPaper.className : undefined;

    const rawBackdrop = userSlotProps.backdrop;
    const backdropSlot: DialogSlotProps["backdrop"] = hideBackdrop
      ? { style: { display: "none" } }
      : rawBackdrop === false
        ? false
        : typeof rawBackdrop === "object" && rawBackdrop !== null
          ? {
              ...(rawBackdrop as object),
              className: classNames(
                dialogistClasses.backdrop,
                "className" in rawBackdrop && typeof (rawBackdrop as { className?: unknown }).className === "string"
                  ? (rawBackdrop as { className: string }).className
                  : undefined,
              ),
            }
          : { className: dialogistClasses.backdrop };

    return (
      <Dialog
        className={classNames(dialogistClasses.base, className)}
        {...props}
        container={container as React.ComponentProps<typeof Dialog>["container"]}
        onClose={(_event, reason) => onClose(reason === "escapeKeyDown" ? "escape" : "backdrop")}
        disableAutoFocus={props.disableAutoFocus}
        disableEnforceFocus={props.disableEnforceFocus}
        disableRestoreFocus={props.disableRestoreFocus}
        slotProps={{
          ...userSlotProps,
          paper: {
            ...userPaper,
            className: classNames(dialogistClasses.rootPaper, userPaperClassName),
          },
          backdrop: backdropSlot,
        }}
      />
    );
  },
  {
    shouldForwardProp: (prop) => prop !== "overflow" && prop !== "borderRadius",
  },
)<BaseDialogProps>(({ overflow }) => ({
  overflow: overflow || "hidden",
}));

MuiBase.displayName = "MuiBase";
