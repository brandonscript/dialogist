"use client";

import { type CSSProperties, memo, type Ref, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { dialogistClasses } from "../classes";
import { useDialogistAdapter } from "../context/DialogistAdapterContext";
import { useDeepMemo } from "../hooks/useDeepCompare";
import { useMemoizedDialogParts } from "../hooks/useMemoizedDialogParts";
import type {
  BaseDialogProps,
  CustomDialogConfig,
  DialogActionsAlign,
  DialogCloseOptions,
  DialogCloseReason,
  DialogComponents,
  DialogPartContent,
  DialogSlotProps,
  DialogState,
} from "../types";
import { classNames } from "../utils/classNames";
import { type ConfigForActions, deriveEffectiveActions } from "../utils/dialogActions";
import { resolveDialogPartContent } from "../utils/resolveDialogPartContent";
import { HeadlessBase } from "./headless/HeadlessBase";
import {
  HeadlessActions,
  HeadlessActionsContainer,
  HeadlessContent,
  HeadlessFooter,
  HeadlessStatusBar,
  HeadlessTitle,
} from "./headless/headlessDefaults";

const ACTIONS_ALIGN_TO_CSS: Record<DialogActionsAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

interface DialogScaffoldingProps<
  C extends React.ComponentType<BaseDialogProps> = React.ComponentType<BaseDialogProps>,
> {
  dialogs: DialogState[];
  onClose: (id: string, options?: { cancelled?: boolean; preserveBackdrop?: boolean }) => void;
  DialogComponent?: C;
  overflow?: "visible" | "hidden";
  slots?: DialogComponents;
  slotProps?: DialogSlotProps;
}

interface DialogRendererProps<C extends React.ComponentType<BaseDialogProps> = React.ComponentType<BaseDialogProps>> {
  DialogComponent?: C;
  dialog: DialogState;
  onClose: (id: string, options?: DialogCloseOptions) => void;
  overflow?: "visible" | "hidden";
  slots?: DialogComponents;
  slotProps?: DialogSlotProps;
  suppressBackdrop?: boolean;
}

// Stable dialog renderer that only updates when dialog content changes
const StableDialogRenderer = memo(
  ({
    DialogComponent = HeadlessBase,
    dialog,
    onClose,
    overflow,
    slots,
    slotProps,
    suppressBackdrop,
  }: DialogRendererProps) => {
    const { key: dialogKey, type, config } = dialog;
    const adapter = useDialogistAdapter();

    // Ref for the Paper element (Dialog content container) to animate transitions
    const paperRef = useRef<HTMLDivElement>(null);
    // Ref to store the previous dimensions for FLIP animation
    const prevRect = useRef<{ width: number; height: number } | undefined>(undefined);
    // Ref for the transition cleanup timeout
    const transitionTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // Preserve any existing inline transition (avoid capturing our own mid-animation value)
    const baseInlineTransition = useRef<string | undefined>(undefined);

    useLayoutEffect(() => {
      const element = paperRef.current;
      if (!element) return;

      if (baseInlineTransition.current === undefined) {
        baseInlineTransition.current = element.style.transition;
      }

      const resizeDuration = adapter.transitionDuration;
      const resizeEasing = adapter.transitionEasing;
      const resizeTransition = `width ${resizeDuration}ms ${resizeEasing}, height ${resizeDuration}ms ${resizeEasing}`;

      // 1. Check if currently locked/animating
      const isLocked = element.style.width !== "" || element.style.height !== "";

      // 2. Measure current visual size (Start point for interruption)
      const visualRect = element.getBoundingClientRect();

      // 3. Unlock to measure natural size
      // We temporarily remove explicit sizes to let content dictate size
      element.style.width = "";
      element.style.height = "";

      // 4. Measure target natural size
      const targetRect = element.getBoundingClientRect();

      // 5. Determine Start Rect
      // If we were locked, we start from where we visually were.
      // If we were auto, we start from the previous natural size (prevRect).
      // If no prevRect (first render), we don't animate (Start = Target).
      const startRect = isLocked ? visualRect : prevRect.current || targetRect;

      // 6. Check for significant change
      const widthChanged = Math.abs(startRect.width - targetRect.width) > 1;
      const heightChanged = Math.abs(startRect.height - targetRect.height) > 1;

      if (widthChanged || heightChanged) {
        // FLIP Animation

        // Clear cleanup timeout
        if (transitionTimeout.current) clearTimeout(transitionTimeout.current);

        // Set to Start (Instant)
        element.style.transition = "none";
        element.style.width = `${startRect.width}px`;
        element.style.height = `${startRect.height}px`;

        // Force Reflow
        void element.offsetHeight;

        // Animate to Target
        element.style.transition = resizeTransition;
        element.style.width = `${targetRect.width}px`;
        element.style.height = `${targetRect.height}px`;

        // Cleanup after transition
        transitionTimeout.current = setTimeout(() => {
          element.style.width = "";
          element.style.height = "";
          element.style.transition = baseInlineTransition.current || "";
        }, resizeDuration + 25);
      }

      // Update prevRect for next time
      prevRect.current = targetRect;
    });

    // Extract custom components with headless defaults as fallbacks.
    // Memoize wrappers so their identity is stable across renders.
    const Base = useMemo(() => slots?.Base ?? DialogComponent, [slots?.Base, DialogComponent]);
    const Title = useMemo(() => {
      if (slots?.Title) return slots.Title;
      return ({ className, id, ...props }: import("../types").DialogTitleSlotProps) => (
        <HeadlessTitle
          {...props}
          {...slotProps?.title}
          className={classNames(className, slotProps?.title?.className)}
          id={id}
        />
      );
    }, [slots?.Title, slotProps?.title]);
    const Content = useMemo(() => {
      if (slots?.Content) return slots.Content;
      return ({ className, id, style, ...props }: import("../types").DialogContentSlotProps) => {
        const contentSlotProps = slotProps?.content as
          | { style?: CSSProperties; className?: string }
          | undefined;
        return (
          <HeadlessContent
            {...props}
            {...contentSlotProps}
            className={classNames(className, contentSlotProps?.className)}
            style={{
              ...style,
              ...(contentSlotProps?.style ?? {}),
            }}
            id={id}
          />
        );
      };
    }, [slots?.Content, slotProps?.content]);
    const ActionsContainer = useMemo(() => {
      if (slots?.ActionsContainer) return slots.ActionsContainer;
      return ({ className, ...props }: import("../types").DialogActionsContainerSlotProps) => {
        const actionsContainerSlotProps = slotProps?.actionsContainer as
          | { className?: string; style?: CSSProperties }
          | undefined;
        return (
          <HeadlessActionsContainer
            {...props}
            {...actionsContainerSlotProps}
            className={classNames(className, actionsContainerSlotProps?.className)}
          />
        );
      };
    }, [slots?.ActionsContainer, slotProps?.actionsContainer]);
    const StatusBar = slots?.StatusBar;
    const Footer = slots?.Footer;
    const Actions = slots?.Actions ?? HeadlessActions;

    // Stable ARIA ids for accessibility
    const baseDomId = useMemo(() => `dialogist-${dialogKey}`, [dialogKey]);
    const titleId = useMemo(() => `dialogist-${dialogKey}-title`, [dialogKey]);
    const contentId = useMemo(() => `dialogist-${dialogKey}-content`, [dialogKey]);

    const handleDialogSurfaceClose = useCallback(
      // Overloaded call sites:
      //   MUI:       onClose(event: object, muiReason: "backdropClick" | "escapeKeyDown")
      //   Non-MUI:   onClose(reason?: "escape" | "backdrop")
      (_eventOrReason?: object | "escape" | "backdrop", muiReason?: "backdropClick" | "escapeKeyDown") => {
        let mappedReason: DialogCloseReason;
        if (typeof _eventOrReason === "string") {
          // Non-MUI adapter passing close reason directly as first arg.
          mappedReason = _eventOrReason;
        } else {
          // MUI passes the event object as first arg and reason string as second arg.
          mappedReason =
            muiReason === "backdropClick" ? "backdrop" : muiReason === "escapeKeyDown" ? "escape" : "action";
        }
        onClose(dialogKey, {
          cancelled: true,
          reason: mappedReason,
        });
      },
      [onClose, dialogKey],
    );

    // Use memoized dialog parts to prevent unnecessary re-renders
    const customConfig = type === "custom" ? (config as CustomDialogConfig) : null;
    const {
      title,
      content,
      props,
      statusBar: statusBarRaw,
      footer: footerRaw,
    } = useMemoizedDialogParts(
      {
        statusBar: config.statusBar,
        title: config.title,
        content: config.message as DialogPartContent | undefined,
        props: customConfig?.props || {},
        footer: config.footer,
      },
      {
        statusBarDeps: [config.statusBar],
        titleDeps: [config.title],
        contentDeps: [config.message],
        propsDeps: [customConfig?.props],
        footerDeps: [config.footer],
      },
    );

    // Memoize dialog content to prevent unnecessary re-renders using deep comparison
    const dialogContent = useDeepMemo(() => {
      const statusBarResolved =
        statusBarRaw != null && statusBarRaw !== false ? resolveDialogPartContent(statusBarRaw) : null;
      const statusBar =
        statusBarRaw != null && statusBarRaw !== false ? (
          StatusBar ? (
            <StatusBar
              content={statusBarResolved}
              dialogKey={dialogKey}
              dialogType={type}
              className={classNames(dialogistClasses.statusBar, slotProps?.statusBar?.className)}
              {...slotProps?.statusBar}
            />
          ) : (
            <HeadlessStatusBar
              content={statusBarResolved}
              dialogKey={dialogKey}
              dialogType={type}
              className={classNames(
                dialogistClasses.statusBar,
                typeof statusBarRaw === "string" ? dialogistClasses.topCorners : undefined,
                slotProps?.statusBar?.className,
              )}
              {...slotProps?.statusBar}
            />
          )
        ) : null;

      const footerResolved = footerRaw != null && footerRaw !== false ? resolveDialogPartContent(footerRaw) : null;
      const footer =
        footerRaw != null && footerRaw !== false ? (
          Footer ? (
            <Footer
              content={footerResolved}
              dialogKey={dialogKey}
              className={classNames(dialogistClasses.footer, slotProps?.footer?.className)}
              {...slotProps?.footer}
            />
          ) : (
            <HeadlessFooter
              content={footerResolved}
              dialogKey={dialogKey}
              className={classNames(
                dialogistClasses.footer,
                typeof footerRaw === "string" ? dialogistClasses.bottomCorners : undefined,
                slotProps?.footer?.className,
              )}
              {...slotProps?.footer}
            />
          )
        ) : null;

      // Unified actions path: derive from config (explicit actions or built-in actions)
      const effectiveActions = deriveEffectiveActions(
        config as ConfigForActions,
        dialogKey,
        dialog.internalId,
        onClose,
      );
      const contentStyle = config.contentStyle;

      let contentSlot: React.ReactNode;
      if (type === "custom") {
        if (content == null || content === false) {
          throw new Error(
            `No message or content for custom dialog "${dialogKey}". Provide message, content, or a registered content slot.`,
          );
        }
        const customOnClose = props.onClose as ((result: unknown) => void) | undefined;
        const customProps = {
          ...props,
          onClose: customOnClose
            ? (result?: unknown) => {
                customOnClose(result);
                onClose(dialogKey, { resolveValue: result, reason: "action" });
              }
            : (result?: unknown) => onClose(dialogKey, { resolveValue: result, reason: "action" }),
          dialog,
        };
        contentSlot = resolveDialogPartContent(content as DialogPartContent, customProps);
      } else {
        contentSlot = resolveDialogPartContent(content as DialogPartContent, {});
      }

      const paperStyle: CSSProperties = {
        borderRadius: "var(--dialogist-border-radius)",
        ...(config.width !== undefined && {
          width: typeof config.width === "number" ? `${config.width}px` : config.width,
        }),
        ...(config.minWidth !== undefined && {
          minWidth: typeof config.minWidth === "number" ? `${config.minWidth}px` : config.minWidth,
        }),
        ...(config.maxWidth !== undefined && {
          maxWidth: typeof config.maxWidth === "number" ? `${config.maxWidth}px` : config.maxWidth,
        }),
        ...(config.borderRadius !== undefined && {
          ["--dialogist-border-radius"]:
            typeof config.borderRadius === "number" ? `${config.borderRadius}px` : config.borderRadius,
        } as CSSProperties),
      };

      return (
        <Base
          id={baseDomId}
          open={true}
          onClose={handleDialogSurfaceClose}
          overflow={overflow}
          disableRestoreFocus={config.a11yRestoreFocus === false}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={contentId}
          className={slotProps?.base?.className}
          {...slotProps?.base}
          slotProps={{
            paper: {
              ref: paperRef as Ref<HTMLDivElement>,
              style: paperStyle,
              ...slotProps?.base?.slotProps?.paper,
            },
            ...slotProps?.base?.slotProps,
          }}
          hideBackdrop={suppressBackdrop}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              backgroundColor: "var(--dialogist-bg-paper)",
            }}
          >
            {statusBar}
            {title && <Title id={titleId}>{title}</Title>}
            {type === "custom" ? (
              <Content id={contentId}>{contentSlot}</Content>
            ) : (
              <Content
                id={contentId}
                data-dialogist-content-managed="true"
                style={{
                  backgroundColor: "var(--dialogist-bg-paper)",
                  color: "var(--dialogist-content-text)",
                  ...(contentStyle?.align && {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: ACTIONS_ALIGN_TO_CSS[contentStyle.align],
                  }),
                  ...(contentStyle?.align && {
                    "--dialogist-content-display": "flex",
                    "--dialogist-content-flex-direction": "column",
                    "--dialogist-content-align-items": "stretch",
                    "--dialogist-content-justify": ACTIONS_ALIGN_TO_CSS[contentStyle.align],
                  }),
                  ...(contentStyle?.textAlign && {
                    textAlign: contentStyle.textAlign,
                  }),
                  ...(contentStyle?.textAlign && {
                    "--dialogist-content-text-align": contentStyle.textAlign,
                  }),
                  ...(contentStyle?.minWidth !== undefined && {
                    minWidth:
                      typeof contentStyle.minWidth === "number" ? `${contentStyle.minWidth}px` : contentStyle.minWidth,
                  }),
                  ...(contentStyle?.minWidth !== undefined && {
                    "--dialogist-content-min-width":
                      typeof contentStyle.minWidth === "number" ? `${contentStyle.minWidth}px` : contentStyle.minWidth,
                  }),
                  ...(contentStyle?.maxWidth !== undefined && {
                    maxWidth:
                      typeof contentStyle.maxWidth === "number" ? `${contentStyle.maxWidth}px` : contentStyle.maxWidth,
                  }),
                  ...(contentStyle?.maxWidth !== undefined && {
                    "--dialogist-content-max-width":
                      typeof contentStyle.maxWidth === "number" ? `${contentStyle.maxWidth}px` : contentStyle.maxWidth,
                  }),
                  ...(contentStyle?.minHeight !== undefined && {
                    minHeight:
                      typeof contentStyle.minHeight === "number"
                        ? `${contentStyle.minHeight}px`
                        : contentStyle.minHeight,
                  }),
                  ...(contentStyle?.minHeight !== undefined && {
                    "--dialogist-content-min-height":
                      typeof contentStyle.minHeight === "number"
                        ? `${contentStyle.minHeight}px`
                        : contentStyle.minHeight,
                  }),
                  ...(contentStyle?.maxHeight !== undefined && {
                    maxHeight:
                      typeof contentStyle.maxHeight === "number"
                        ? `${contentStyle.maxHeight}px`
                        : contentStyle.maxHeight,
                  }),
                  ...(contentStyle?.maxHeight !== undefined && {
                    "--dialogist-content-max-height":
                      typeof contentStyle.maxHeight === "number"
                        ? `${contentStyle.maxHeight}px`
                        : contentStyle.maxHeight,
                  }),
                }}
              >
                {contentSlot}
              </Content>
            )}
            {effectiveActions.length > 0 && (
              <ActionsContainer
                style={{
                  ...(config.actionsStyle?.align && {
                    "--dialogist-actionsContainer-justify": ACTIONS_ALIGN_TO_CSS[config.actionsStyle.align],
                  } as CSSProperties),
                  ...(config.actionsStyle?.gap !== undefined &&
                    slots?.Actions && {
                      gap: adapter.resolveSpacing(config.actionsStyle.gap, 1),
                    }),
                  ...((slotProps?.actionsContainer as { style?: CSSProperties } | undefined)?.style ?? {}),
                }}
                {...slotProps?.actionsContainer}
              >
                <Actions
                  actions={effectiveActions.flat()}
                  actionGroups={effectiveActions}
                  actionsStyle={config.actionsStyle}
                  dialogKey={dialogKey}
                  {...slotProps?.actions}
                />
              </ActionsContainer>
            )}
            {footer}
          </div>
        </Base>
      );
    }, [
      type,
      title,
      content,
      props,
      config,
      onClose,
      handleDialogSurfaceClose,
      dialog,
      overflow,
      statusBarRaw,
      footerRaw,
      config.width,
      config.minWidth,
      config.maxWidth,
      config.borderRadius,
      dialogKey,
      slots,
      slotProps,
      Base,
      Title,
      Content,
      ActionsContainer,
      StatusBar,
      Footer,
      Actions,
      suppressBackdrop,
      adapter,
    ]);

    return dialogContent;
  },
);

StableDialogRenderer.displayName = "StableDialogRenderer";

// Stable scaffolding component that uses portals
export const DialogScaffolding = memo(
  <C extends React.ComponentType<BaseDialogProps> = React.ComponentType<BaseDialogProps>>({
    dialogs,
    onClose,
    DialogComponent,
    overflow,
    slots,
    slotProps,
  }: DialogScaffoldingProps<C>) => {
    // Only render if we have dialogs and document is available
    if (typeof document === "undefined" || dialogs.length === 0) {
      return null;
    }

    // Find the active dialog (last non-held dialog, or last dialog if none are held)
    // With replaceDialog, dialogs update in-place, so we just render the last dialog
    const activeDialog = dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;

    return createPortal(
      <div id="dialogist-portal" style={{ isolation: "isolate", position: "relative", zIndex: 1300 }}>
        {activeDialog && (
          <StableDialogRenderer
            key={activeDialog.internalId}
            dialog={activeDialog}
            onClose={onClose}
            DialogComponent={DialogComponent}
            overflow={overflow}
            suppressBackdrop={false}
            slots={slots}
            slotProps={slotProps}
          />
        )}
      </div>,
      document.body,
    );
  },
);

DialogScaffolding.displayName = "DialogScaffolding";
