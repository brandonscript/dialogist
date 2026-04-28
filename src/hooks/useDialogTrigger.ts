"use client";

import { deepmerge } from "deepmerge-ts";
import { useMemo } from "react";

import type { DialogConfig } from "../types";
import { useDialog } from "../useDialog";
import { chainEventHandlers } from "../utils/chainEventHandlers";

type ClickHandler<P> = P extends { onClick?: (...args: infer Args) => infer Return }
  ? (...args: Args) => Return
  : (event: unknown) => void;

export interface UseDialogTriggerOptions {
  /** Optional config to merge when opening via trigger */
  config?: Partial<DialogConfig>;
  /** Control whether aria-controls points to the dialog key DOM id when closed */
  alwaysAriaControls?: boolean;
}

export const useDialogTrigger = (dialogKey: string, options: UseDialogTriggerOptions = {}) => {
  const { config, alwaysAriaControls } = options;
  const dialog = useDialog(dialogKey);

  const domId = `dialogist-${dialogKey}`;
  const ariaProps = useMemo(() => {
    const controls = alwaysAriaControls || false ? domId : undefined;
    return {
      "aria-haspopup": "dialog" as const,
      "aria-controls": controls,
    };
  }, [domId, alwaysAriaControls]);

  const bindTrigger = <P extends { onClick?: (e: unknown) => void }>(props?: P): P & { onClick: ClickHandler<P> } => {
    const injected = {
      onClick: ((..._args: Parameters<ClickHandler<P>>) => {
        dialog.open(config);
      }) as ClickHandler<P>,
    } satisfies Pick<P, "onClick">;

    return deepmerge({} as P, (props ?? {}) as P, ariaProps, chainEventHandlers(props, injected)) as P & {
      onClick: ClickHandler<P>;
    };
  };

  const bindToggle = <P extends { onClick?: (e: unknown) => void }>(props?: P): P & { onClick: ClickHandler<P> } => {
    const injected = {
      onClick: ((..._args: Parameters<ClickHandler<P>>) => {
        dialog.toggle(config);
      }) as ClickHandler<P>,
    } satisfies Pick<P, "onClick">;

    return deepmerge({} as P, (props ?? {}) as P, ariaProps, chainEventHandlers(props, injected)) as P & {
      onClick: ClickHandler<P>;
    };
  };

  return {
    bindTrigger,
    bindToggle,
    dialog,
    dialogDomId: domId,
  } as const;
};
