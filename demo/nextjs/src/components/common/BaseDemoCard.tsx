"use client";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import type { PaperProps } from "@mui/material/Paper";
import type { CSSProperties } from "@mui/material/styles";
import { type ResponsiveStyleValue, styled } from "@mui/system";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogKey, useDialogIsOpen } from "dialogist";
import React, { type ChangeEvent, type ElementType, type PropsWithChildren, type ReactNode } from "react";

import { DEMO_BASE_DEMO_CARD_CLASS } from "@/constants/demoCardIconClasses";
import { extractStringsFromReactNode } from "@/utils/string.utils";
import { withTooltip } from "@/utils/withTooltip";

import { useDemoNavScope } from "../../contexts/DemoNavScope";
import { useRenderTracking } from "../../contexts/RenderTrackingContext";
import type { RenderCountStrategy } from "../../hooks/useRenderTracker";
import { Admonition } from "./admonition";
import { CodeBlock } from "./code";
import { DemoCopyLink } from "./DemoCopyLink";
import { type DialogResult, DialogResultDisplay } from "./DialogResultDisplay";
import { buildDemoPath } from "./demoNavData";
import { RenderTracker } from "./RenderTracker";
import { DemoSectionHeading } from "./typography";

export interface DemoCardAction {
  label: string;
  onClick: () => void;
  variant?: "contained" | "outlined" | "text";
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  disabledTooltip?: string;
}

/** Icon component type (e.g. react-icons) — receives `size` and `aria-hidden`. */
export type DemoCardIconComponent = ElementType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

interface DemoCardProps {
  /** Rendered as-is when a React element; otherwise treated as a component (e.g. `LuZap` from react-icons). */
  icon?: ReactNode | DemoCardIconComponent;
  /** Pixel size for component icons (ignored when `icon` is a React element). Default 24. */
  iconSize?: number;
  /** MUI palette path or CSS color for the header icon (wrapper + SVG). Default `text.primary` to match the title. */
  iconColor?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  dialogKey?: DialogKey; // Optional dialog key to display next to title
  description: ReactNode;
  result?: DialogResult | null;
  children?: ReactNode; // Additional content to display after description
  actions?: DemoCardAction[]; // Alternative to single button for complex demos
  /** Layout for actions: row (wrap) or column */
  actionsDirection?: "row" | "column";
  /** Sx applied to the actions container (e.g. maxWidth, alignSelf) */
  actionsContainerSx?: object;
  /** Sx applied to each action button (e.g. justifyContent: 'flex-start') */
  actionButtonSx?: object;
  /** Optional code/usage snippet to display below the description */
  docSnippet?: ReactNode;
  /** Override the default "You clicked" label in the result display. */
  resultLabel?: string;
  needsFixing?: boolean;
  renderTrackerDependencies?: unknown[];
  renderTrackerCountStrategy?: RenderCountStrategy;
}

const ButtonWithTooltip = withTooltip(Button);

const renderDemoCardIcon = (icon: ReactNode | DemoCardIconComponent, iconSize: number): ReactNode => {
  if (icon == null) return null;
  if (React.isValidElement(icon)) return icon;
  return React.createElement(icon as DemoCardIconComponent, {
    size: iconSize,
    "aria-hidden": true,
  });
};

export const BaseDemoCard = ({
  icon,
  iconSize = 22,
  iconColor = "text.primary",
  title,
  subtitle,
  dialogKey,
  description,
  result,
  children,
  actions,
  actionsDirection = "row",
  actionsContainerSx,
  actionButtonSx,
  docSnippet,
  resultLabel,
  needsFixing,
  renderTrackerDependencies,
  renderTrackerCountStrategy,
}: DemoCardProps) => {
  const { isGlobalLoading } = useRenderTracking();
  const demoNavScope = useDemoNavScope();
  const componentName = extractStringsFromReactNode(title);
  const hasDialogKey = dialogKey !== undefined;
  const isDialogOpen = useDialogIsOpen(dialogKey ?? "__base-demo-card-no-dialog__");
  const effectiveTrackerDependencies = renderTrackerDependencies ?? (hasDialogKey ? [isDialogOpen] : [result]);
  const effectiveTrackerCountStrategy =
    renderTrackerCountStrategy ?? (hasDialogKey ? "dependency-change" : "all-renders");
  return (
    <Card
      className={DEMO_BASE_DEMO_CARD_CLASS}
      sx={{
        position: "relative",
        borderColor: "divider",
        backgroundColor: needsFixing ? "error.light" : "background.paper",
        overflow: "visible",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        mt: 1,
        pt: 0.5,
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", containerType: "inline-size" }}>
        <FlexBox x="space-between" y="center" gap={2} mb={2}>
          {demoNavScope ? (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <DemoCopyLink
                variant="card"
                pathToCopy={buildDemoPath(demoNavScope.sectionSlug, demoNavScope.cardSlug)}
                ariaLabel="Copy link to this demo card"
                sx={{ maxWidth: "100%" }}
              >
                <FlexBox row y="center" gap={1.25} sx={{ minWidth: 0 }}>
                  {icon != null && (
                    <FlexBox
                      y="center"
                      sx={{
                        lineHeight: 0,
                        color: iconColor,
                        "& svg": {
                          width: `${iconSize}px`,
                          height: `${iconSize}px`,
                          fontSize: `${iconSize}px`,
                          color: iconColor,
                        },
                      }}
                    >
                      {renderDemoCardIcon(icon, iconSize)}
                    </FlexBox>
                  )}
                  <Typography component="h3" className="demo-card-title" variant="h6" sx={{ minWidth: 0 }}>
                    {title}
                  </Typography>
                </FlexBox>
              </DemoCopyLink>
            </Box>
          ) : (
            <FlexBox row y="center" gap={1.25} sx={{ minWidth: 0, flex: 1 }}>
              {icon != null && (
                <FlexBox
                  y="center"
                  sx={{
                    lineHeight: 0,
                    color: iconColor,
                    "& svg": {
                      width: `${iconSize}px`,
                      height: `${iconSize}px`,
                      fontSize: `${iconSize}px`,
                      color: iconColor,
                    },
                  }}
                >
                  {renderDemoCardIcon(icon, iconSize)}
                </FlexBox>
              )}
              <Typography component="h3" className="demo-card-title" variant="h6" sx={{ minWidth: 0 }}>
                {title}
              </Typography>
            </FlexBox>
          )}
          <RenderTracker
            componentName={componentName}
            dependencies={effectiveTrackerDependencies}
            countStrategy={effectiveTrackerCountStrategy}
            variant="default"
            showEmoji={true}
            showTimestamp={false}
            sx={{ position: "relative", top: 0, right: 0, zIndex: 2 }}
          />
        </FlexBox>
        {subtitle != null &&
          (demoNavScope ? (
            <DemoCopyLink
              variant="card"
              pathToCopy={buildDemoPath(demoNavScope.sectionSlug, demoNavScope.cardSlug)}
              ariaLabel="Copy link to this demo card"
              sx={{ mb: 2, alignItems: "center", maxWidth: "100%" }}
            >
              <DemoSectionHeading
                sx={{
                  mt: -2,
                  pt: 0,
                  mb: 0,
                  flex: "0 1 auto",
                  minWidth: 0,
                }}
              >
                {subtitle}
              </DemoSectionHeading>
            </DemoCopyLink>
          ) : (
            <DemoSectionHeading
              sx={{
                mt: -2,
                pt: 0,
                mb: 2,
              }}
            >
              {subtitle}
            </DemoSectionHeading>
          ))}
        <Admonition sx={{ mt: subtitle != null ? 0 : 0.5 }}>{description}</Admonition>
        {docSnippet != null &&
          (typeof docSnippet === "string" ? (
            <FlexBox sx={{ mt: 1.5 }}>
              <CodeBlock>{docSnippet}</CodeBlock>
            </FlexBox>
          ) : (
            <FlexBox sx={{ mt: 1.5 }}>{docSnippet}</FlexBox>
          ))}
        {children}
      </CardContent>
      {(actions || result) && (
        <CardActions sx={{ mt: "auto", background: "none", py: 2, px: 2.5 }}>
          <FlexBox column width="100%">
            {actions && (
              <FlexBox column gap={1} width="100%" sx={actionsContainerSx}>
                <FlexBox
                  width="100%"
                  gap={1}
                  {...(actionsDirection === "column"
                    ? ({ column: true } as const)
                    : ({ row: true, flexWrap: "wrap" as const } as const))}
                >
                  {actions.map((action) => (
                    <ButtonWithTooltip
                      key={action.label}
                      variant={action.variant || "contained"}
                      onClick={action.onClick}
                      startIcon={action.icon}
                      size="small"
                      disabled={isGlobalLoading || action.disabled}
                      tooltip={action.tooltip}
                      disabledTooltip={action.disabledTooltip}
                      sx={actionButtonSx}
                    >
                      {action.label}
                    </ButtonWithTooltip>
                  ))}
                </FlexBox>
              </FlexBox>
            )}
            <Collapse in={!!result} timeout={200} sx={{ minHeight: 0 }}>
              <FlexBox column width="100%" sx={{ pt: actions ? 2 : 0 }}>
                <DialogResultDisplay result={result} label={resultLabel} />
              </FlexBox>
            </Collapse>
          </FlexBox>
        </CardActions>
      )}
    </Card>
  );
};

interface StyledPaperProps extends PaperProps {
  maxWidth?: ResponsiveStyleValue<CSSProperties["maxWidth"]>;
  minHeight?: ResponsiveStyleValue<CSSProperties["minHeight"]>;
  mt?: ResponsiveStyleValue<CSSProperties["marginTop"]>;
  mb?: ResponsiveStyleValue<CSSProperties["marginBottom"]>;
  my?: ResponsiveStyleValue<CSSProperties["marginTop"] & CSSProperties["marginBottom"]>;
}

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => !["maxWidth", "minHeight", "mt", "mb", "my"].includes(prop as string),
})<StyledPaperProps>(({ theme, maxWidth, minHeight, mt, mb, my }) =>
  theme.unstable_sx({
    p: 2,
    bgcolor: "grey.100",
    borderRadius: 1,
    position: "relative",
    mt,
    mb,
    my: mt !== undefined || mb !== undefined ? undefined : my,
    maxWidth,
    minHeight,
  }),
);

type DemoCardPaperProps = PropsWithChildren<{
  /** Small label in the top-right; omitted when empty */
  title?: string;
  maxWidth?: ResponsiveStyleValue<CSSProperties["maxWidth"]>;
  minHeight?: ResponsiveStyleValue<CSSProperties["minHeight"]>;
  mt?: ResponsiveStyleValue<CSSProperties["marginTop"]>;
  my?: ResponsiveStyleValue<CSSProperties["marginTop"] & CSSProperties["marginBottom"]>;
  mb?: ResponsiveStyleValue<CSSProperties["marginBottom"]>;
  innerMargin?: {
    top?: ResponsiveStyleValue<CSSProperties["marginTop"]>;
    right?: ResponsiveStyleValue<CSSProperties["marginRight"]>;
    bottom?: ResponsiveStyleValue<CSSProperties["marginBottom"]>;
    left?: ResponsiveStyleValue<CSSProperties["marginLeft"]>;
  };
}>;

export const DemoCardPaper = React.memo(function DemoCardPaper({
  title = "",
  children,
  maxWidth,
  minHeight,
  mt,
  my = 2,
  mb,
  innerMargin,
}: DemoCardPaperProps) {
  const showCorner = Boolean(title?.trim());
  return (
    <StyledPaper maxWidth={maxWidth} minHeight={minHeight} my={my} mt={mt} mb={mb}>
      <FlexBox
        column
        gap={0.5}
        sx={{
          "& > *:last-child": {
            mt: innerMargin?.top ?? 0,
            mr: innerMargin?.right ?? 0,
            mb: innerMargin?.bottom ?? 0,
            ml: innerMargin?.left ?? 0,
          },
        }}
      >
        {showCorner ? (
          <Typography
            component="strong"
            variant="caption"
            fontWeight={600}
            display="block"
            position="absolute"
            top={(t) => t.spacing(0.75)}
            right={(t) => t.spacing(1)}
            sx={{ opacity: 0.45 }}
          >
            {title}
          </Typography>
        ) : null}
        {children}
      </FlexBox>
    </StyledPaper>
  );
});

export const DemoCardSwitch = React.memo(function DemoCardSwitch({
  checked,
  onChange,
  label,
  labelPlacement,
}: {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  label: string;
  labelPlacement: "start" | "end";
}) {
  return (
    <FormControlLabel
      sx={{ m: 0 }}
      control={<Switch size="small" checked={checked} onChange={onChange} />}
      label={
        <Typography variant="caption" color="text.secondary" mr={labelPlacement === "start" ? 1 : 0}>
          {label}
        </Typography>
      }
      labelPlacement={labelPlacement}
    />
  );
});
