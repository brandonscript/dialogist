"use client";

/**
 * Sandbox-aware Base slot wrappers for non-MUI adapters.
 *
 * Each wrapper reads `sandboxContainer` and `isFullscreen` from `DemoStateContext`
 * and injects `container={sandboxContainer}` into the underlying Base component when
 * in windowed mode. This causes the adapter to portal into the sandbox element and use
 * `position: absolute` so the dialog is visually contained within it — matching the
 * behaviour of `DemoDialogBase` for the MUI adapter.
 *
 * `DemoShadcnBase` additionally injects z-index overrides in fullscreen mode because
 * shadcn's Tailwind `z-50` class (z-index: 50) is too low when MUI components with
 * z-index 1000+ are present.
 */

import type React from "react";

import type { BaseDialogProps } from "dialogist";
import { BaseUiBase } from "dialogist/base-ui";
import { ShadcnBase } from "dialogist/shadcn";
import { HeadlessBase } from "dialogist/tailwind";

import { useDemoState } from "../../contexts/DemoStateContext";

const resolveContainer = (
  sandboxContainer: HTMLElement | null,
  isFullscreen: boolean,
): Element | null => (isFullscreen ? null : sandboxContainer);

/**
 * Paper overrides applied in windowed mode to match MUI Dialog's appearance.
 *
 * MUI's theme sets boxShadow: "none" on all Paper components in the demo, so we
 * mirror that here. Paper width is left content-driven (same as MUI) — after fixing
 * the font family to match MUI (Lexend via var(--font-sans)), the content-driven
 * width resolves identically across all adapters.
 */
const WINDOWED_PAPER_STYLE: React.CSSProperties = {
  boxShadow: "none",
};

const mergeSlotProps = (
  existing: BaseDialogProps["slotProps"],
  extra: React.CSSProperties,
): BaseDialogProps["slotProps"] => {
  const existingPaper = existing?.paper as { style?: React.CSSProperties; [k: string]: unknown } | undefined;
  return {
    ...existing,
    paper: {
      ...existingPaper,
      style: { ...extra, ...(existingPaper?.style ?? {}) },
    },
  };
};

/** Tailwind adapter: HeadlessBase with sandbox portal support. */
export const DemoHeadlessBase = (props: BaseDialogProps) => {
  const { sandboxContainer, isFullscreen } = useDemoState();
  const container = resolveContainer(sandboxContainer, isFullscreen);
  const slotProps =
    !isFullscreen && sandboxContainer
      ? mergeSlotProps(props.slotProps, WINDOWED_PAPER_STYLE)
      : props.slotProps;
  return <HeadlessBase {...props} container={container} slotProps={slotProps} />;
};
DemoHeadlessBase.displayName = "DemoHeadlessBase";

/** Base UI adapter: BaseUiBase with sandbox portal support. */
export const DemoBaseUiBase = (props: BaseDialogProps) => {
  const { sandboxContainer, isFullscreen } = useDemoState();
  const container = resolveContainer(sandboxContainer, isFullscreen);
  const slotProps =
    !isFullscreen && sandboxContainer
      ? mergeSlotProps(props.slotProps, WINDOWED_PAPER_STYLE)
      : props.slotProps;
  return <BaseUiBase {...props} container={container} slotProps={slotProps} />;
};
DemoBaseUiBase.displayName = "DemoBaseUiBase";

/** shadcn adapter: ShadcnBase with sandbox portal support + fullscreen z-index fix. */
export const DemoShadcnBase = (props: BaseDialogProps) => {
  const { sandboxContainer, isFullscreen } = useDemoState();
  const container = resolveContainer(sandboxContainer, isFullscreen);

  let slotProps: BaseDialogProps["slotProps"] = props.slotProps;

  if (!isFullscreen && sandboxContainer) {
    // In windowed mode: remove box-shadow to match MUI theme (which sets shadow: none on Paper)
    slotProps = mergeSlotProps(slotProps, WINDOWED_PAPER_STYLE);
  } else if (isFullscreen) {
    // In fullscreen: shadcn's z-50 (z-index:50) is too low vs MUI's z-index hierarchy
    const existingBackdrop = slotProps?.backdrop as { style?: React.CSSProperties; [k: string]: unknown } | undefined;
    const existingPaper = slotProps?.paper as { style?: React.CSSProperties; [k: string]: unknown } | undefined;
    slotProps = {
      ...slotProps,
      backdrop: {
        ...existingBackdrop,
        style: { zIndex: 1300, ...(existingBackdrop?.style ?? {}) },
      },
      paper: {
        ...existingPaper,
        style: { zIndex: 1301, ...(existingPaper?.style ?? {}) },
      },
    };
  }

  return <ShadcnBase {...props} container={container} slotProps={slotProps} />;
};
DemoShadcnBase.displayName = "DemoShadcnBase";
