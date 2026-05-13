"use client";

import { Dialog } from "@base-ui-components/react/dialog";

import { dialogistClasses } from "../../classes";
import type { DialogContentSlotProps, DialogTitleSlotProps } from "../../types";
import { classNames } from "../../utils/classNames";

/**
 * Base UI title slot. Uses `Dialog.Title` so screen readers announce the title and
 * Base UI wires `aria-labelledby` automatically. We additionally apply our own id so
 * the scaffolding's `aria-labelledby` linkage continues to work.
 */
export const BaseUiTitle = ({ id, className, children, ...rest }: DialogTitleSlotProps) => (
  <Dialog.Title
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(dialogistClasses.title, className)}
  >
    {children}
  </Dialog.Title>
);
BaseUiTitle.displayName = "BaseUiTitle";

/**
 * Base UI content slot. Uses `Dialog.Description` so Base UI links it to the popup via
 * `aria-describedby`. Falls back to a plain `<div>` semantic, but Base UI's component
 * adds the wiring for free.
 */
export const BaseUiContent = ({ id, className, style, children, ...rest }: DialogContentSlotProps) => (
  <Dialog.Description
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(dialogistClasses.content, className)}
    style={style}
    render={(props) => <div {...props} />}
  >
    {children}
  </Dialog.Description>
);
BaseUiContent.displayName = "BaseUiContent";
