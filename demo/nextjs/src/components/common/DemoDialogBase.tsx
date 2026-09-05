"use client";

import Dialog, { type DialogProps } from "@mui/material/Dialog";
import type { PaperProps } from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";
import { type BaseDialogProps, dialogistClasses } from "dialogist";
import { forwardRef, useMemo } from "react";

import { useDemoState } from "../../contexts/DemoStateContext";

const joinClassNames = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ").trim();

export const DemoDialogBase = forwardRef<HTMLDivElement, BaseDialogProps>(function DemoDialogBase(
  { className, slotProps, hideBackdrop, overflow, borderRadius, children, onClose, ...dialogProps }: BaseDialogProps,
  ref,
) {
  const { isFullscreen, sandboxContainer } = useDemoState();

  const container: DialogProps["container"] | undefined = useMemo(() => {
    if (isFullscreen) {
      return undefined;
    }
    return sandboxContainer ?? undefined;
  }, [isFullscreen, sandboxContainer]);

  const mergedClassName = joinClassNames(dialogistClasses.base, className);

  const mergedSlotProps = useMemo(() => {
    type SlotShape = NonNullable<DialogProps["slotProps"]>;
    const userSlotProps = (slotProps ?? {}) as Partial<SlotShape>;
    const rawBackdrop = userSlotProps.backdrop;

    const backdropSlot: SlotShape["backdrop"] = hideBackdrop
      ? { style: { display: "none" } }
      : rawBackdrop === false
        ? false
        : typeof rawBackdrop === "object" && rawBackdrop !== null
          ? {
              ...(rawBackdrop as object),
              className: joinClassNames(
                dialogistClasses.backdrop,
                "className" in rawBackdrop && typeof (rawBackdrop as { className?: unknown }).className === "string"
                  ? (rawBackdrop as { className: string }).className
                  : undefined,
              ),
            }
          : { className: joinClassNames(dialogistClasses.backdrop) };

    const userPaper =
      userSlotProps.paper != null && typeof userSlotProps.paper === "object"
        ? (userSlotProps.paper as Partial<PaperProps>)
        : undefined;

    const paperClassName = joinClassNames(dialogistClasses.rootPaper, userPaper?.className);
    const borderRadiusSx =
      borderRadius !== undefined
        ? { "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius }
        : undefined;
    const paperSx: SxProps<Theme> | undefined = borderRadiusSx
      ? ([borderRadiusSx, userPaper?.sx] as SxProps<Theme>)
      : userPaper?.sx;

    return {
      ...userSlotProps,
      paper: {
        ...userPaper,
        className: paperClassName,
        sx: paperSx,
      },
      backdrop: backdropSlot,
    } as DialogProps["slotProps"];
  }, [slotProps, hideBackdrop, borderRadius]);

  return (
    <Dialog
      {...dialogProps}
      ref={ref}
      container={container}
      disableEnforceFocus={!isFullscreen}
      className={mergedClassName}
      slotProps={mergedSlotProps}
      sx={{ overflow: overflow ?? "hidden" }}
      onClose={(_event, reason) => onClose(reason === "escapeKeyDown" ? "escape" : "backdrop")}
    >
      {children}
    </Dialog>
  );
});
