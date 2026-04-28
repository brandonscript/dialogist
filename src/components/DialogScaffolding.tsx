"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, styled, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { type CSSProperties, memo, type Ref, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { dialogistClasses } from "../classes";
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

const ACTIONS_ALIGN_TO_CSS: Record<DialogActionsAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const resolveActionsGap = (
  theme: { spacing: (value: number) => string },
  value: number | string | undefined,
  fallback: number,
): string => {
  const v = value === undefined ? fallback : value;
  return typeof v === "number" ? theme.spacing(v) : v;
};

// Default Actions: one inner row when multiple groups so DialogActions has a single child — theme
// `gap` on `.Dialogist-actionsContainer` then does not space every button. Row `gap` = between
// groups; each cluster uses `intraGroupGap` (see {@link import("../types").ActionsStyle}).
// Layout tokens use CSS variables consumed by `.Dialogist-actionsRow` / `.Dialogist-actionsGroup`
// in `dialogistStyles` (no MUI `sx` on these wrappers).
const DefaultActions = ({
  actionGroups,
  dialogKey,
  actionsStyle,
}: {
  actionGroups: import("../types").DialogActionProps[][];
  dialogKey: string;
  actionsStyle?: import("../types").ActionsStyle;
}) => {
  const theme = useTheme();
  const hasMultipleGroups = actionGroups.length > 1;
  const justifyFromAlign = actionsStyle?.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  const hasSingleGroup = actionGroups.length === 1;
  /** Matches `--dialogist-actionsContainer-justify` default when `align` is omitted. */
  const justifyContent = justifyFromAlign ?? "center";

  const innerGapRaw = hasMultipleGroups
    ? actionsStyle?.intraGroupGap !== undefined
      ? actionsStyle.intraGroupGap
      : 1
    : (actionsStyle?.gap ?? 1);

  const groupBoxes = actionGroups.map((group, gi) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: action groups have no stable id; order is fixed per config
    <div key={`${dialogKey}-group-${gi}`}
      className={dialogistClasses.actionsGroup}
      data-dialogist-layout={hasSingleGroup ? "single" : undefined}
      style={
        {
          "--dialogist-actionsGroup-gap": resolveActionsGap(theme, innerGapRaw, 1),
          "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent,
        } as CSSProperties
      }
    >
      {group.map((action, ai) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: action items have no stable id; order is fixed per config
        <Button {...action.props} key={`${dialogKey}-action-${gi}-${ai}`}>
          {action.children || action.title}
        </Button>
      ))}
    </div>
  ));

  if (hasMultipleGroups) {
    return (
      <div
        className={dialogistClasses.actionsRow}
        style={
          {
            "--dialogist-actionsRow-gap": resolveActionsGap(theme, actionsStyle?.gap, 1),
            "--dialogist-actionsRow-justify": justifyContent,
          } as CSSProperties
        }
      >
        {groupBoxes}
      </div>
    );
  }

  return <>{groupBoxes}</>;
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

const DefaultStyledDialog = styled(
  ({ className, slotProps, hideBackdrop, container, ...props }: BaseDialogProps) => (
    <Dialog
      className={`${dialogistClasses.base} ${className || ""}`.trim()}
      {...props}
      container={container}
      disableAutoFocus={props.disableAutoFocus}
      disableEnforceFocus={props.disableEnforceFocus}
      disableRestoreFocus={props.disableRestoreFocus}
      PaperProps={{
        className: classNames(dialogistClasses.rootPaper, className),
        ...slotProps?.paper,
      }}
      slotProps={{
        backdrop: hideBackdrop
          ? { style: { display: "none" } }
          : {
              className: dialogistClasses.backdrop,
              ...slotProps?.backdrop,
            },
      }}
    />
  ),
  {
    shouldForwardProp: (prop) => prop !== "overflow" && prop !== "borderRadius",
  },
)<BaseDialogProps>(({ overflow }) => ({
  overflow: overflow || "hidden",
}));

// Stable dialog renderer that only updates when dialog content changes
const StableDialogRenderer = memo(
  ({
    DialogComponent = DefaultStyledDialog,
    dialog,
    onClose,
    overflow,
    slots,
    slotProps,
    suppressBackdrop,
  }: DialogRendererProps) => {
    const { key: dialogKey, type, config } = dialog;
    const theme = useTheme();

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

      const resizeDuration =
        typeof theme.transitions?.duration?.shortest === "number" ? theme.transitions.duration.shortest : 150;
      const resizeEasing = theme.transitions?.easing?.easeOut ?? "cubic-bezier(0.4, 0, 0.2, 1)";
      const resizeTransition = theme.transitions?.create
        ? theme.transitions.create(["width", "height"], { duration: resizeDuration, easing: resizeEasing })
        : `width ${resizeDuration}ms ${resizeEasing}, height ${resizeDuration}ms ${resizeEasing}`;

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
        // Match MUI transition timings/easing (keep enter/exit transitions intact)
        element.style.transition = resizeTransition;
        element.style.width = `${targetRect.width}px`;
        element.style.height = `${targetRect.height}px`;

        // Cleanup after transition
        transitionTimeout.current = setTimeout(() => {
          element.style.width = "";
          element.style.height = "";
          element.style.transition = baseInlineTransition.current || "";
        }, resizeDuration + 25);
      } else {
        // Restore styles if we cleared them and no change happened (e.g. just render but no layout change)
        // But we cleared them to measure!
        // If no change, we should restore 'auto' (empty string) if it was auto.
        // If it was locked (animating) and no change in *target*, we should revert to locked?
        // Actually, if isLocked was true, we are mid-animation.
        // If visual == target (animation finished?), then we are done.
        // If visual != target, we are interrupting.
        // If we interrupt and target hasn't changed?
        // We cleared styles. Animation stops.
        // We should restore transition?
        // This is edge case. Assuming 3s is long, interruptions are handled by FLIP logic above (widthChanged check uses visual vs target).
        // If visual != target, then changed is true.
        // So we enter the block and animate.
        // If visual == target, then we reached target.
        // We can leave styles cleared.
      }

      // Update prevRect for next time
      prevRect.current = targetRect;
    });

    // Extract custom components with MUI defaults as fallbacks.
    // Memoize wrappers so their identity is stable across renders.
    const Base = useMemo(() => slots?.Base ?? DialogComponent, [slots?.Base, DialogComponent]);
    const Title = useMemo(() => {
      if (slots?.Title) return slots.Title;
      return ({ className, id, ...props }: React.ComponentProps<typeof DialogTitle>) => {
        const mergedProps = {
          ...props,
          ...slotProps?.title,
          className: classNames(dialogistClasses.title, className, slotProps?.title?.className),
          id,
        };
        return <DialogTitle {...mergedProps} />;
      };
    }, [slots?.Title, slotProps?.title]);
    const Content = useMemo(() => {
      if (slots?.Content) return slots.Content;
      return ({ className, id, ...props }: React.ComponentProps<typeof DialogContent>) => {
        const contentSlotProps = slotProps?.content as
          | { sx?: object; style?: CSSProperties; className?: string }
          | undefined;
        const mergedProps = {
          ...props,
          ...contentSlotProps,
          sx: {
            ...(props as { sx?: object }).sx,
            ...(contentSlotProps?.sx ?? {}),
          },
          style: {
            ...(props as { style?: CSSProperties }).style,
            ...(contentSlotProps?.style ?? {}),
          },
          className: classNames(dialogistClasses.content, className, contentSlotProps?.className),
          id,
        };
        return <DialogContent {...mergedProps} />;
      };
    }, [slots?.Content, slotProps?.content]);
    const ActionsContainer = useMemo(() => {
      if (slots?.ActionsContainer) return slots.ActionsContainer;
      return ({ className, ...props }: React.ComponentProps<typeof DialogActions>) => {
        const mergedProps = {
          ...props,
          ...slotProps?.actionsContainer,
          // @ts-expect-error: className might not exist on generic props
          className: classNames(dialogistClasses.actionsContainer, className, slotProps?.actionsContainer?.className),
        };
        return <DialogActions {...mergedProps} />;
      };
    }, [slots?.ActionsContainer, slotProps?.actionsContainer]);
    const StatusBar = slots?.StatusBar;
    const Footer = slots?.Footer;
    const Actions = slots?.Actions || DefaultActions;

    // Stable ARIA ids for accessibility
    const baseDomId = useMemo(() => `dialogist-${dialogKey}`, [dialogKey]);
    const titleId = useMemo(() => `dialogist-${dialogKey}-title`, [dialogKey]);
    const contentId = useMemo(() => `dialogist-${dialogKey}-content`, [dialogKey]);

    const handleDialogSurfaceClose = useCallback(
      (_event?: object, muiReason?: "backdropClick" | "escapeKeyDown") => {
        const mappedReason: DialogCloseReason =
          muiReason === "backdropClick" ? "backdrop" : muiReason === "escapeKeyDown" ? "escape" : "action";
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
          ) : typeof statusBarRaw === "string" ? (
            <Box
              className={classNames(
                dialogistClasses.statusBar,
                dialogistClasses.topCorners,
                slotProps?.statusBar?.className,
              )}
            >
              <Typography variant="caption" color="var(--dialogist-primary-contrastText)">
                {statusBarRaw}
              </Typography>
            </Box>
          ) : (
            statusBarResolved
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
          ) : typeof footerRaw === "string" ? (
            <Box
              className={classNames(
                dialogistClasses.footer,
                dialogistClasses.bottomCorners,
                slotProps?.footer?.className,
              )}
            >
              <Typography variant="caption" color="var(--dialogist-footer-text)">
                {footerRaw}
              </Typography>
            </Box>
          ) : (
            footerResolved
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
              sx: {
                borderRadius: "var(--dialogist-border-radius)",
                ...(config.width !== undefined && {
                  width: typeof config.width === "number" ? `${config.width}px` : config.width,
                }),
                ...(config.minWidth !== undefined && {
                  minWidth: typeof config.minWidth === "number" ? `${config.minWidth}px` : config.minWidth,
                }),
                ...(config.maxWidth !== undefined && { maxWidth: config.maxWidth }),
                ...(config.borderRadius !== undefined && {
                  "--dialogist-border-radius":
                    typeof config.borderRadius === "number" ? `${config.borderRadius}px` : config.borderRadius,
                }),
              },
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
              height: "100%",
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
                sx={{
                  ...(config.actionsStyle?.align && {
                    "--dialogist-actionsContainer-justify": ACTIONS_ALIGN_TO_CSS[config.actionsStyle.align],
                  }),
                  // Custom `Actions` slot: buttons are usually direct flex children — apply `gap` here
                  // like `open({ actionsStyle: { gap } })`. DefaultActions owns row `gap` when grouped.
                  ...(config.actionsStyle?.gap !== undefined &&
                    slots?.Actions && {
                      gap: config.actionsStyle.gap,
                    }),
                  ...(slotProps?.actionsContainer as { sx?: object } | undefined)?.sx,
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
      <div id="dialogist-portal" style={{ isolation: "isolate" }}>
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
