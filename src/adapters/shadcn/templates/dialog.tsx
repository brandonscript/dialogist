/**
 * Copy-template for shadcn-style users who prefer to inline their UI components.
 *
 * Copy this file to `src/components/ui/dialog.tsx` (or wherever your shadcn components
 * live) and adjust class names / structure to taste. Then wire it into Dialogist by
 * passing your custom slots:
 *
 * ```tsx
 * import { DialogProvider } from "dialogist";
 * import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
 *
 * <DialogProvider
 *   slots={{
 *     Base: Dialog,
 *     Title: DialogTitle,
 *     Content: DialogContent,
 *   }}
 * >
 *   ...
 * </DialogProvider>
 * ```
 *
 * Requires `@base-ui-components/react` and (for animations) `tailwindcss-animate` in
 * your tailwind config.
 */
import { Dialog as BaseUiDialog } from "@base-ui-components/react/dialog";
import type * as React from "react";

// Replace this with your shadcn `cn` helper if you have one.
const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

export interface DialogProps {
  open?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  hideBackdrop?: boolean;
  id?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export const Dialog = ({ open, onClose, children, className, hideBackdrop, id, ...rest }: DialogProps) => {
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <BaseUiDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseUiDialog.Portal>
        {!hideBackdrop && (
          <BaseUiDialog.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/50",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            )}
          />
        )}
        <BaseUiDialog.Popup
          id={id}
          aria-labelledby={rest["aria-labelledby"]}
          aria-describedby={rest["aria-describedby"]}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          {children}
        </BaseUiDialog.Popup>
      </BaseUiDialog.Portal>
    </BaseUiDialog.Root>
  );
};

export const DialogTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <BaseUiDialog.Title
    {...props}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
  >
    {children}
  </BaseUiDialog.Title>
);

export const DialogContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <BaseUiDialog.Description
    {...props}
    className={cn("text-sm text-muted-foreground", className)}
    render={(p) => <div {...p} />}
  >
    {children}
  </BaseUiDialog.Description>
);
