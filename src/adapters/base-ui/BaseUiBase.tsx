"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { type CSSProperties, type Ref, useCallback } from "react";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";

/**
 * The popup participates as a normal flex item inside the centering wrapper
 * (mirrors HeadlessBase's paper). The `flex: 1 1 auto; minHeight: 0` on
 * DialogScaffolding's inner div (not `height: 100%`) prevents the circular
 * height dependency that arises when a flex container's cross-size is definite.
 */
const POPUP_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none",
};

/**
 * Full-area flex-centering wrapper — identical in structure to HeadlessBase's outer
 * div. Filling the container with `inset: 0` gives the popup the same available
 * width as HeadlessBase so text metrics match across adapters.
 */
const makeCenterWrapperStyle = (isWindowed: boolean): CSSProperties => ({
  position: isWindowed ? "absolute" : "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  overflow: "auto",
  zIndex: 1301,
});

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
  container,
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
    (nextOpen: boolean, eventDetails?: { reason?: string }) => {
      if (!nextOpen) {
        const reason = eventDetails?.reason === "escape-key" ? "escape" : eventDetails?.reason === "outside-press" ? "backdrop" : undefined;
        onClose(reason);
      }
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

  const resolvedContainer = typeof container === "function" ? container() : container;
  const isWindowed = !!resolvedContainer;

  const borderRadiusProp: CSSProperties =
    borderRadius !== undefined
      ? ({
          "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        } as CSSProperties)
      : {};

  const popupStyle: CSSProperties = {
    ...POPUP_STYLE,
    overflow: overflow ?? "hidden",
    ...borderRadiusProp,
    ...paperSlotProps.style,
  };

  const backdropPositionOverride: CSSProperties = isWindowed ? { position: "absolute" } : {};
  const backdropStyle: CSSProperties = hideBackdrop
    ? { ...BACKDROP_STYLE, ...backdropPositionOverride, display: "none" }
    : { ...BACKDROP_STYLE, ...backdropPositionOverride, ...backdropSlotProps.style };

  // Honor the existing focus-flag contract by mapping to Base UI's `modal` and
  // popup `initialFocus`/`finalFocus`.
  // "trap-focus" traps keyboard focus inside the dialog without blocking pointer events on external
  // elements — matching MUI Dialog's default behaviour. modal={true} would additionally set
  // pointer-events:none / inert on everything outside, preventing clicks on e.g. toggles that live
  // outside the popup while the dialog is open (breaks the canClose demo and similar patterns).
  const modal: boolean | "trap-focus" = disableEnforceFocus ? false : "trap-focus";
  const initialFocus = disableAutoFocus ? false : undefined;
  const finalFocus = disableRestoreFocus ? false : undefined;

  const containerProps = rest as Record<string, unknown>;

  const popup = (
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
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
      <Dialog.Portal keepMounted={false} container={(resolvedContainer as HTMLElement | null) ?? undefined}>
        <Dialog.Backdrop
          className={classNames(dialogistClasses.backdrop, backdropSlotProps.className)}
          style={backdropStyle}
        />
        <div style={makeCenterWrapperStyle(isWindowed)}>{popup}</div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

BaseUiBase.displayName = "BaseUiBase";
