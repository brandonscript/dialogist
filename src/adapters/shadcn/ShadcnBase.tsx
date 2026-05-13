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
const SHADCN_BACKDROP_CLASS =
  "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out " +
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

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
    overflow: overflow ?? "hidden",
    ...(borderRadius !== undefined && {
      "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    } as CSSProperties),
    ...paperSlotProps.style,
  };

  const backdropStyle: CSSProperties = hideBackdrop ? { display: "none" } : { ...backdropSlotProps.style };

  const modal: boolean | "trap-focus" = disableEnforceFocus ? "trap-focus" : true;
  const initialFocus = disableAutoFocus ? false : undefined;
  const finalFocus = disableRestoreFocus ? false : undefined;

  const containerProps = rest as Record<string, unknown>;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={classNames(SHADCN_BACKDROP_CLASS, dialogistClasses.backdrop, backdropSlotProps.className)}
          style={backdropStyle}
        />
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
      </Dialog.Portal>
    </Dialog.Root>
  );
};

ShadcnBase.displayName = "ShadcnBase";
