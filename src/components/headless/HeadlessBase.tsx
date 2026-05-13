"use client";

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import { dialogistClasses } from "../../classes";
import type { BaseDialogProps } from "../../types";
import { classNames } from "../../utils/classNames";
import { focusFirstElement, handleFocusTrapKeyDown } from "./focusTrap";

const SCROLL_LOCK_COUNTER_KEY = "__dialogistScrollLock__";

interface ScrollLockState {
  count: number;
  previousOverflow: string;
  previousPaddingRight: string;
}

const getScrollLockState = (): ScrollLockState | undefined => {
  if (typeof document === "undefined") return undefined;
  const target = document.body as HTMLElement & {
    [SCROLL_LOCK_COUNTER_KEY]?: ScrollLockState;
  };
  return target[SCROLL_LOCK_COUNTER_KEY];
};

const acquireScrollLock = (): void => {
  if (typeof document === "undefined") return;
  const target = document.body as HTMLElement & {
    [SCROLL_LOCK_COUNTER_KEY]?: ScrollLockState;
  };
  let state = target[SCROLL_LOCK_COUNTER_KEY];
  if (!state) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    state = {
      count: 0,
      previousOverflow: target.style.overflow,
      previousPaddingRight: target.style.paddingRight,
    };
    target[SCROLL_LOCK_COUNTER_KEY] = state;
    target.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      target.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  state.count += 1;
};

const releaseScrollLock = (): void => {
  if (typeof document === "undefined") return;
  const target = document.body as HTMLElement & {
    [SCROLL_LOCK_COUNTER_KEY]?: ScrollLockState;
  };
  const state = target[SCROLL_LOCK_COUNTER_KEY];
  if (!state) return;
  state.count -= 1;
  if (state.count <= 0) {
    target.style.overflow = state.previousOverflow;
    target.style.paddingRight = state.previousPaddingRight;
    delete target[SCROLL_LOCK_COUNTER_KEY];
  }
};

/**
 * Apply a forwarded ref (object or callback) to a DOM node.
 */
const applyRef = <T,>(ref: Ref<T> | undefined, node: T | null): void => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  (ref as { current: T | null }).current = node;
};

const BACKDROP_BASE_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1300,
  overflow: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const BACKDROP_LAYER_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--dialogist-backdrop-color, rgba(0, 0, 0, 0.5))",
  pointerEvents: "auto",
};

const HEADLESS_PAPER_BASE_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none",
  zIndex: 1,
};

/**
 * Framework-agnostic default `Base` slot used by `DialogScaffolding` when no adapter is
 * provided. Renders a backdrop, paper container, focus trap, Esc handler, scroll lock,
 * and forwards `slotProps.paper.ref` for the FLIP resize animation.
 *
 * Adapters (MUI, Base UI, shadcn) replace this with their own Dialog primitive when
 * mounted via `DialogProvider.slots`.
 */
export const HeadlessBase = ({
  children,
  className,
  hideBackdrop,
  onClose,
  open,
  slotProps,
  id,
  overflow,
  disableAutoFocus,
  disableEnforceFocus,
  disableRestoreFocus,
  borderRadius,
  ...rest
}: BaseDialogProps) => {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const setPaperRef = useCallback(
    (node: HTMLDivElement | null) => {
      paperRef.current = node;
      applyRef(slotProps?.paper?.ref as Ref<HTMLDivElement> | undefined, node);
    },
    [slotProps?.paper?.ref],
  );

  useLayoutEffect(() => {
    if (!open) return;
    if (typeof document !== "undefined" && !disableRestoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    }
  }, [open, disableRestoreFocus]);

  useEffect(() => {
    if (!open) return;
    acquireScrollLock();
    return releaseScrollLock;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (disableAutoFocus) return;
    const node = paperRef.current;
    if (!node) return;
    const t = window.setTimeout(() => {
      focusFirstElement(node);
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, disableAutoFocus]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (disableEnforceFocus) return;
      const node = paperRef.current;
      if (!node) return;
      handleFocusTrapKeyDown(node, event);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, disableEnforceFocus]);

  useEffect(() => {
    if (!open) return;
    return () => {
      if (disableRestoreFocus) return;
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [open, disableRestoreFocus]);

  if (!open) return null;

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const paperSlotProps = (slotProps?.paper ?? {}) as {
    ref?: Ref<HTMLDivElement>;
    style?: CSSProperties;
    className?: string;
  };
  const backdropSlotProps = (slotProps?.backdrop ?? {}) as {
    style?: CSSProperties;
    className?: string;
  };

  const paperStyle: CSSProperties = {
    ...HEADLESS_PAPER_BASE_STYLE,
    overflow: overflow ?? "hidden",
    ...(borderRadius !== undefined && {
      "--dialogist-border-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    } as CSSProperties),
    ...paperSlotProps.style,
  };

  const backdropLayerStyle: CSSProperties = hideBackdrop
    ? { ...BACKDROP_LAYER_STYLE, display: "none" }
    : { ...BACKDROP_LAYER_STYLE, ...backdropSlotProps.style };

  const containerProps = rest as Record<string, unknown>;

  return (
    <div
      role="presentation"
      style={BACKDROP_BASE_STYLE}
      onClick={onBackdropClick}
      data-dialogist-headless-base="true"
    >
      <div
        aria-hidden="true"
        className={classNames(dialogistClasses.backdrop, backdropSlotProps.className)}
        style={backdropLayerStyle}
      />
      <div
        ref={setPaperRef}
        role="dialog"
        aria-modal="true"
        id={id}
        aria-labelledby={containerProps["aria-labelledby"] as string | undefined}
        aria-describedby={containerProps["aria-describedby"] as string | undefined}
        className={classNames(dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className)}
        style={paperStyle}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

HeadlessBase.displayName = "HeadlessBase";
