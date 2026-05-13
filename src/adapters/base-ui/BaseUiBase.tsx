"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { type CSSProperties, type Ref, useCallback } from "react";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";

const POPUP_BASE_STYLE: CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none",
  zIndex: 1301,
};

const BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--dialogist-backdrop-color, rgba(0, 0, 0, 0.5))",
  zIndex: 1300,
};

/**
 * Base UI-backed `Base` slot. Wraps Base UI's parts-based Dialog (`Dialog.Root`,
 * `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`) so Dialogist's slot system can
 * render through them while still controlling open/close via the Provider's state
 * machine. Forwards `slotProps.paper.ref` for the FLIP resize animation.
 */
export const BaseUiBase = ({
  children,
  className,
  hideBackdrop,
  onClose,
  open,
  slotProps,
  id,
  overflow,
  borderRadius,
  disableAutoFocus,
  disableRestoreFocus,
  disableEnforceFocus,
  ...rest
}: BaseDialogProps) => {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onClose();
    },
    [onClose],
  );

  const paperSlotProps = (slotProps?.paper ?? {}) as {
    ref?: Ref<HTMLDivElement>;
    style?: CSSProperties;
    className?: string;
  };
  const backdropSlotProps = (slotProps?.backdrop ?? {}) as {
    style?: CSSProperties;
    className?: string;
  };

  const popupStyle: CSSProperties = {
    ...POPUP_BASE_STYLE,
    overflow: overflow ?? "hidden",
    ...(borderRadius !== undefined && {
      "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    } as CSSProperties),
    ...paperSlotProps.style,
  };

  const backdropStyle: CSSProperties = hideBackdrop
    ? { ...BACKDROP_STYLE, display: "none" }
    : { ...BACKDROP_STYLE, ...backdropSlotProps.style };

  // Honor the existing focus-flag contract by mapping to Base UI's `modal` and
  // popup `initialFocus`/`finalFocus`.
  const modal: boolean | "trap-focus" = disableEnforceFocus ? "trap-focus" : true;
  const initialFocus = disableAutoFocus ? false : undefined;
  const finalFocus = disableRestoreFocus ? false : undefined;

  const containerProps = rest as Record<string, unknown>;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
      <Dialog.Portal keepMounted={false}>
        <Dialog.Backdrop
          className={classNames(dialogistClasses.backdrop, backdropSlotProps.className)}
          style={backdropStyle}
        />
        <Dialog.Popup
          ref={paperSlotProps.ref}
          id={id}
          aria-labelledby={containerProps["aria-labelledby"] as string | undefined}
          aria-describedby={containerProps["aria-describedby"] as string | undefined}
          className={classNames(
            dialogistClasses.base,
            dialogistClasses.rootPaper,
            className,
            paperSlotProps.className,
          )}
          style={popupStyle}
          initialFocus={initialFocus}
          finalFocus={finalFocus}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

BaseUiBase.displayName = "BaseUiBase";
