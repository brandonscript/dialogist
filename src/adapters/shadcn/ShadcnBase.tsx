"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { type CSSProperties, type Ref, useCallback } from "react";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";

/**
 * Tailwind class conventions copied from shadcn/ui's Dialog template (with
 * `data-[state=*]` attributes mapped onto Base UI's `data-state` output). Consumers who
 * have already configured shadcn's tailwindcss-animate plugin will see the same
 * enter/exit animations they expect from a stock shadcn dialog.
 */
// Tailwind animate-in/fade-in classes removed: backdrop animation is now handled
// by dialogistStyles (.Dialogist-backdrop keyframe + transition) using the
// --dialogist-backdrop-duration CSS variable, which works across all adapters.
const SHADCN_BACKDROP_CLASS = "fixed inset-0 z-50 bg-black/50";

const SHADCN_POPUP_CLASS =
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] " +
  "gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg " +
  "data-[state=open]:animate-in data-[state=closed]:animate-out " +
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
  "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] " +
  "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";

/**
 * shadcn-style `Base` slot powered by Base UI primitives instead of Radix. Consumers
 * who use shadcn class conventions (and have `tailwindcss-animate` installed) get the
 * same look + animations as a stock shadcn dialog without the Radix dependency.
 *
 * Pair with `<DialogProvider slots={shadcnSlots}>` (see `dialogist/shadcn`).
 */
export const ShadcnBase = ({
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
    (nextOpen: boolean, eventDetails: { reason?: string }) => {
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

  // When portaling into a sandbox container, use a flex-centering wrapper (matching
  // HeadlessBase) so the popup gets the same content-driven width as MUI.
  // The windowed popup inline style also overrides SHADCN_POPUP_CLASS's fixed/translate/
  // grid/w-full/max-w-lg Tailwind classes so the paper behaves identically to MUI.
  const resolvedContainer = typeof container === "function" ? container() : container;
  const isWindowed = !!resolvedContainer;

  const borderRadiusProp: CSSProperties =
    borderRadius !== undefined
      ? ({
          "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        } as CSSProperties)
      : {};

  // Override SHADCN_POPUP_CLASS's fixed/left-[50%]/top-[50%]/translate/grid/w-full/max-w-lg.
  // The centering is now handled by the full-area flex wrapper (not by SHADCN_POPUP_CLASS's
  // Tailwind transforms), so we reset all positioning to `relative` with no offset or
  // translation. Tailwind v4 uses the standalone CSS `translate` property for
  // translate-x-[-50%]/translate-y-[-50%], so `transform: none` alone is insufficient —
  // we must also set `translate: "none"`.
  const popupStyle: CSSProperties = {
    position: "relative",
    top: "auto",
    left: "auto",
    translate: "none",
    transform: "none",
    display: "flex",
    flexDirection: "column",
    width: "auto",
    maxWidth: "min(90vw, 600px)",
    maxHeight: "calc(100% - 64px)",
    overflow: overflow ?? "hidden",
    ...borderRadiusProp,
    ...paperSlotProps.style,
  };

  // Full-area flex-centering wrapper — mirrors HeadlessBase's outer div.
  // `inset: 0` gives the popup the same available width across adapters so text
  // metrics match MUI. The `flex: 1 1 auto; minHeight: 0` on DialogScaffolding's
  // inner div (replacing `height: 100%`) prevents the circular height dependency
  // that the flex cross-axis definite cross-size would otherwise cause.
  const centerWrapperStyle: CSSProperties = {
    position: isWindowed ? "absolute" : "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflow: "auto",
    zIndex: 1301,
  };

  const backdropPositionOverride: CSSProperties = isWindowed ? { position: "absolute" } : {};
  const backdropStyle: CSSProperties = hideBackdrop
    ? { ...backdropPositionOverride, display: "none" }
    : { ...backdropPositionOverride, ...backdropSlotProps.style };

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
        SHADCN_POPUP_CLASS,
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
      <Dialog.Portal container={(resolvedContainer as HTMLElement | null) ?? undefined}>
        <Dialog.Backdrop
          className={classNames(SHADCN_BACKDROP_CLASS, dialogistClasses.backdrop, backdropSlotProps.className)}
          style={backdropStyle}
        />
        <div style={centerWrapperStyle}>{popup}</div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

ShadcnBase.displayName = "ShadcnBase";
