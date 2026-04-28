"use client";

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import {
  type DialogActionsAlign,
  type DialogCloseEvent,
  type DialogContentTextAlign,
  useDialog,
  useDialogSlots,
} from "dialogist";
import { memo, useCallback, useState } from "react";
import { LuAlignCenter, LuAlignJustify, LuAlignLeft, LuAlignRight, LuX } from "react-icons/lu";
import { PiLayoutDuotone } from "react-icons/pi";

import { useDemoState } from "@/contexts/DemoStateContext";
import { useRenderTracking } from "@/contexts/RenderTrackingContext";
import { withTooltip } from "@/utils/withTooltip";

import { ActionSquaresIcon } from "../common/ActionSquaresIcon";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { RequireWindowedMode } from "../common/WindowedModePrompt";

const ButtonWithTooltip = withTooltip(Button);
const DIALOG_KEY = "body-alignment-presentation-demo";

const CARD_TITLE = "Aligning content";
const CARD_SUBHEADINGS = ["Content style", "Actions style", "App-wide defaults"] as const;

const buildContentSampleContent = (flexAlignLabel: string, textAlign: DialogContentTextAlign) => {
  return [
    <Typography
      key="line-1"
      component="div"
      sx={{ px: 1, py: 0.5, borderRadius: 0.75, backgroundColor: "action.hover", textAlign: "inherit" }}
    >
      Text alignment: {textAlign}
    </Typography>,
    <Typography
      key="line-2"
      component="div"
      sx={{ px: 1, py: 0.5, borderRadius: 0.75, backgroundColor: "action.hover", textAlign: "inherit" }}
    >
      Supporting line with a bit more detail so this feels like real dialog body content.
    </Typography>,
    <Typography
      key="line-3"
      component="div"
      sx={{ px: 1, py: 0.5, borderRadius: 0.75, backgroundColor: "action.hover", textAlign: "inherit" }}
    >
      Flex alignment: {flexAlignLabel}
    </Typography>,
  ];
};

const ACTIONS_STYLE_SNIPPET = `dialog.open({
  actions: [
    { id: "cancel", title: "Cancel", props: { variant: "outlined" } },
    { id: "ok", title: "Save" },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});`;

const CONTENT_STYLE_SNIPPET = `dialog.open({
  contentStyle: {
    align: "space-between",
    textAlign: "left",
    maxWidth: 400,
    minHeight: 180,
  },
});`;

const DEFAULT_OPTIONS_SNIPPET = `const App = () => (
  <DialogProvider
    defaultOptions={{
      contentStyle: { textAlign: "center", maxWidth: 400 },
      actionsStyle: { align: "end" },
    }}
  >
    {children}
  </DialogProvider>
);
`;

const ALIGN_TO_CSS: Record<DialogActionsAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const VerticalAlignmentIcon = ({ align }: { align: DialogActionsAlign }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: ALIGN_TO_CSS[align],
        alignItems: "center",
        gap: 0.25,
        width: 24,
        height: 24,
        border: "2px solid",
        borderColor: "text.secondary",
        borderRadius: 0.5,
        color: "text.primary",
        "& > span": {
          width: 10,
          height: 2,
          borderRadius: 999,
          backgroundColor: "currentColor",
        },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
};

const FLEX_ALIGN_OPTIONS: { label: string; align: DialogActionsAlign; icon: React.ReactNode }[] = [
  { label: "space-between", align: "space-between", icon: <VerticalAlignmentIcon align="space-between" /> },
  { label: "space-around", align: "space-around", icon: <VerticalAlignmentIcon align="space-around" /> },
  { label: "space-evenly", align: "space-evenly", icon: <VerticalAlignmentIcon align="space-evenly" /> },
  { label: "start", align: "start", icon: <VerticalAlignmentIcon align="start" /> },
  { label: "center", align: "center", icon: <VerticalAlignmentIcon align="center" /> },
  { label: "end", align: "end", icon: <VerticalAlignmentIcon align="end" /> },
];

const TEXT_ALIGN_OPTIONS: { label: string; textAlign: DialogContentTextAlign; icon: React.ReactNode }[] = [
  { label: "left", textAlign: "left", icon: <LuAlignLeft size={16} /> },
  { label: "center", textAlign: "center", icon: <LuAlignCenter size={16} /> },
  { label: "right", textAlign: "right", icon: <LuAlignRight size={16} /> },
  { label: "justify", textAlign: "justify", icon: <LuAlignJustify size={16} /> },
];

const HorizontalAlignmentIcon = ({ align }: { align: DialogActionsAlign }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: 72,
        height: 26,
        border: "2px solid",
        borderColor: "text.secondary",
        borderRadius: 0.5,
        px: 0.75,
      }}
    >
      <ActionSquaresIcon count={2} sx={{ justifyContent: ALIGN_TO_CSS[align], width: "100%" }} />
    </Box>
  );
};

type ActionsPreviewOption = {
  label: string;
  align: DialogActionsAlign;
  icon: React.ReactNode;
};

const ACTION_LAYOUT_OPTIONS: ActionsPreviewOption[] = [
  { label: "space-between", align: "space-between", icon: <HorizontalAlignmentIcon align="space-between" /> },
  { label: "space-around", align: "space-around", icon: <HorizontalAlignmentIcon align="space-around" /> },
  { label: "space-evenly", align: "space-evenly", icon: <HorizontalAlignmentIcon align="space-evenly" /> },
  { label: "left", align: "start", icon: <HorizontalAlignmentIcon align="start" /> },
  { label: "center", align: "center", icon: <HorizontalAlignmentIcon align="center" /> },
  { label: "right", align: "end", icon: <HorizontalAlignmentIcon align="end" /> },
];

const BASE_ACTIONS = [
  { id: "cancel", title: "Cancel", resolveValue: false as const, props: { variant: "outlined" as const } },
  { id: "draft", title: "Save as draft", resolveValue: "draft" as const, props: { variant: "outlined" as const } },
  {
    id: "save",
    title: "Save",
    resolveValue: "save" as const,
    props: { variant: "contained" as const, autoFocus: true },
  },
];

const buildDialogResult = (label: string, color: string): DialogResult => {
  return {
    text: label,
    color,
  };
};

const getFlexAlignLabel = (align: DialogActionsAlign): string => {
  return FLEX_ALIGN_OPTIONS.find((opt) => opt.align === align)?.label ?? align;
};

// ─── Memoized sub-sections ────────────────────────────────────────────────────
// These sections don't depend on `activeActionsOption`, so they bail out of
// re-rendering when only the actions alignment changes, cutting Cycle 1 cost.

const SizeControlsSection = memo(function SizeControlsSection({
  bodyMaxWidth,
  bodyMinHeightInput,
  onMaxWidthChange,
  onMinHeightChange,
  onMinHeightClear,
}: {
  bodyMaxWidth: number;
  bodyMinHeightInput: string;
  onMaxWidthChange: (v: number) => void;
  onMinHeightChange: (v: string) => void;
  onMinHeightClear: () => void;
}) {
  return (
    <>
      <FormControl sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          Content max width (px)
        </Typography>
        <TextField
          size="small"
          type="number"
          value={bodyMaxWidth}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            onMaxWidthChange(parsed);
          }}
          inputProps={{ min: 120, step: 10 }}
        />
      </FormControl>
      <FormControl sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          Content min height (px or auto)
        </Typography>
        <TextField
          size="small"
          value={bodyMinHeightInput}
          onChange={(event) => {
            const next = event.target.value.trimStart();
            if (next === "" || next.toLowerCase() === "auto" || /^\d+$/.test(next)) {
              onMinHeightChange(next);
            }
          }}
          placeholder="auto"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: -0.25 }}>
                <IconButton
                  size="small"
                  edge="end"
                  aria-label="Clear min height"
                  onClick={onMinHeightClear}
                  disabled={bodyMinHeightInput.trim() === ""}
                  sx={{ p: 0.5 }}
                >
                  <LuX size={13} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>
    </>
  );
});

const ContentAlignSection = memo(function ContentAlignSection({
  activeAlign,
  textAlign,
  onAlignChange,
  onTextAlignChange,
}: {
  activeAlign: DialogActionsAlign;
  textAlign: DialogContentTextAlign;
  onAlignChange: (v: DialogActionsAlign) => void;
  onTextAlignChange: (v: DialogContentTextAlign) => void;
}) {
  return (
    <FlexBox column gap={1}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        Content flex & text alignment
      </Typography>
      <FlexBox column gap={2.5}>
        <FormControl sx={{ minWidth: 0 }}>
          <RadioGroup
            value={activeAlign}
            onChange={(event) => onAlignChange(event.target.value as DialogActionsAlign)}
            row
            sx={{ gap: 2.5, flexWrap: "wrap" }}
          >
            {FLEX_ALIGN_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.label}
                value={opt.align}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {opt.icon}
                    <Typography variant="caption">{opt.label}</Typography>
                  </Box>
                }
                sx={{ mr: 0 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl sx={{ minWidth: 0 }}>
          <RadioGroup
            value={textAlign}
            onChange={(event) => onTextAlignChange(event.target.value as DialogContentTextAlign)}
            row
            sx={{ gap: 2.5, flexWrap: "wrap" }}
          >
            {TEXT_ALIGN_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.label}
                value={opt.textAlign}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {opt.icon}
                    <Typography variant="caption">{opt.label}</Typography>
                  </Box>
                }
                sx={{ mr: 0 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </FlexBox>
    </FlexBox>
  );
});

// ─── Interactive section ───────────────────────────────────────────────────────

/** Interactive "Try it out" section — isolated so state changes don't re-render the whole card. */
const AligningContentInteractive = memo(function AligningContentInteractive({
  onResult,
}: {
  onResult: (result: DialogResult | null) => void;
}) {
  const dialog = useDialog(DIALOG_KEY);
  const [activeAlign, setActiveAlign] = useState<DialogActionsAlign>("space-between");
  const [textAlign, setTextAlign] = useState<DialogContentTextAlign>("left");
  const [activeActionsOption, setActiveActionsOption] = useState<ActionsPreviewOption>(ACTION_LAYOUT_OPTIONS[0]);
  const [bodyMaxWidth, setBodyMaxWidth] = useState<number>(400);
  const [bodyMinHeightInput, setBodyMinHeightInput] = useState<string>("180");
  const { isGlobalLoading } = useRenderTracking();
  const { isFullscreen } = useDemoState();

  const resolvedMinHeight = (() => {
    const normalized = bodyMinHeightInput.trim().toLowerCase();
    if (normalized === "" || normalized === "auto") return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  })();

  const handlePreviewClose = useCallback(
    (event: DialogCloseEvent) => {
      const buttonText = event.reason === "action" ? (event.buttonText ?? "Close") : "Close";
      const color =
        buttonText === "Save" ? "success.main" : buttonText === "Save as draft" ? "info.main" : "text.secondary";
      onResult(buildDialogResult(buttonText, color));
    },
    [onResult],
  );

  /** Live body, actions, footer, and layout props come from slots while this dialog is open. */
  useDialogSlots(DIALOG_KEY, {
    title: ["Aligning content", []],
    content: [() => buildContentSampleContent(getFlexAlignLabel(activeAlign), textAlign), [activeAlign, textAlign]],
    actions: [() => BASE_ACTIONS, []],
    footer: [() => `Actions align: ${activeActionsOption.label}`, [activeActionsOption.label]],
    props: [
      () => ({
        contentStyle: {
          align: activeAlign,
          textAlign,
          maxWidth: bodyMaxWidth,
          ...(resolvedMinHeight !== undefined ? { minHeight: resolvedMinHeight } : {}),
        },
        actionsStyle: { align: activeActionsOption.align, gap: 1 },
      }),
      [activeAlign, textAlign, bodyMaxWidth, resolvedMinHeight, activeActionsOption.align],
    ],
  });

  const showPreviewDialog = useCallback(() => {
    void dialog.open({
      type: "confirm",
      onConflict: "replaceSameKey",
      minWidth: 420,
      onClose: handlePreviewClose,
    });
  }, [dialog, handlePreviewClose]);

  // Stable callbacks so memo sub-sections don't re-render when unrelated state changes.
  const handleMaxWidthChange = useCallback((v: number) => setBodyMaxWidth(v), []);
  const handleMinHeightChange = useCallback((v: string) => setBodyMinHeightInput(v), []);
  const handleMinHeightClear = useCallback(() => setBodyMinHeightInput(""), []);
  const handleAlignChange = useCallback((v: DialogActionsAlign) => setActiveAlign(v), []);
  const handleTextAlignChange = useCallback((v: DialogContentTextAlign) => setTextAlign(v), []);

  // Fire on pointer-down (not pointer-up/onChange) so the dialog update pipeline starts at press time,
  // reducing perceived latency from ~115ms to ~65ms from first contact.
  const handleActionsOptionPointerDown = useCallback((opt: (typeof ACTION_LAYOUT_OPTIONS)[number]) => {
    setActiveActionsOption(opt);
  }, []);

  return (
    <FlexBox column gap={1.5}>
      <DemoSectionHeading subtitle="Try it out" />
      <DemoParagraph>
        Open the dialog, then change the controls: <Code>useDialogSlots</Code> pushes updates into the open dialog
        when slot dependencies change.
      </DemoParagraph>
      <FlexBox column gap={1.5} width="100%">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
            alignItems: "start",
          }}
        >
          <SizeControlsSection
            bodyMaxWidth={bodyMaxWidth}
            bodyMinHeightInput={bodyMinHeightInput}
            onMaxWidthChange={handleMaxWidthChange}
            onMinHeightChange={handleMinHeightChange}
            onMinHeightClear={handleMinHeightClear}
          />
          <FlexBox column gap={2} sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
            <ContentAlignSection
              activeAlign={activeAlign}
              textAlign={textAlign}
              onAlignChange={handleAlignChange}
              onTextAlignChange={handleTextAlignChange}
            />
            <FlexBox column gap={1}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Actions alignment
              </Typography>
              <FormControl sx={{ minWidth: 0 }}>
                <RadioGroup
                  value={activeActionsOption.label}
                  onChange={(event) => {
                    // Safety fallback: state is already set from onPointerDown; this is a no-op in
                    // the common case but ensures correctness for keyboard/accessibility navigation.
                    const opt = ACTION_LAYOUT_OPTIONS.find((o) => o.label === event.target.value);
                    if (opt) setActiveActionsOption(opt);
                  }}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, auto)",
                    columnGap: 2.5,
                    rowGap: 1,
                  }}
                >
                  {ACTION_LAYOUT_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.label}
                      value={opt.label}
                      onPointerDown={() => handleActionsOptionPointerDown(opt)}
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {opt.icon}
                          <Typography variant="caption">{opt.label}</Typography>
                        </Box>
                      }
                      sx={{ mr: 0 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </FlexBox>
          </FlexBox>
        </Box>
        <RequireWindowedMode mb={0} />
        <ButtonWithTooltip
          variant="contained"
          size="medium"
          startIcon={<PiLayoutDuotone size={18} />}
          onClick={() => showPreviewDialog()}
          disabled={isFullscreen || isGlobalLoading}
          disabledTooltip="Switch to windowed mode in the sandbox"
          sx={{ alignSelf: "flex-start", mt: 2 }}
          data-testid="aligning-content-show-dialog"
        >
          Show dialog
        </ButtonWithTooltip>
      </FlexBox>
    </FlexBox>
  );
});

export const AligningContentCard = Object.assign(
  memo(function AligningContentCard() {
    const [result, setResult] = useState<DialogResult | null>(null);

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiLayoutDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            Use <Code>contentStyle</Code> and <Code>actionsStyle</Code> to control layout in the dialog&apos;s content
            and actions slots.
          </>
        }
        result={result}
      >
        <FlexBox column gap={3} sx={{ mt: 1.5 }}>
          <FlexBox column gap={1.5}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]} />
            <DemoParagraph>
              <Code>contentStyle.align</Code> controls the vertical flex alignment of items in the content area (via CSS
              <Code>justify-content</Code>). You can also use <Code>textAlign</Code> to align text, and{" "}
              <Code>minWidth</Code>/<Code>maxWidth</Code> or <Code>minHeight</Code>/<Code>maxHeight</Code> to constrain
              the content size.
            </DemoParagraph>
            <CodeBlock>{CONTENT_STYLE_SNIPPET}</CodeBlock>
          </FlexBox>
          <FlexBox column gap={1.5}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[1]} />
            <DemoParagraph component="div">
              Customize action buttons with the <Code>actions</Code> array:
              <BulletList>
                <BulletListItem>
                  <Code>id</Code> – a unique identifier for the action.
                  <BulletList nested>
                    <BulletListItem>
                      Use <Code>ok</Code> to target the primary action button (the <strong>OK</strong> button).
                    </BulletListItem>
                    <BulletListItem>
                      Use <Code>cancel</Code> to target the <strong>Cancel</strong> button (in a <Code>confirm</Code>{" "}
                      type dialog).
                    </BulletListItem>
                  </BulletList>
                </BulletListItem>
                <BulletListItem>
                  <Code>title</Code> – the button text label.
                </BulletListItem>
                <BulletListItem>
                  <Code>props</Code> – props passed to the <Code>Button</Code> component.
                </BulletListItem>
              </BulletList>
              Customize the actions container with<Code>actionsStyle</Code>:
              <BulletList>
                <BulletListItem>
                  <Code>actionsStyle.align</Code> controls how buttons are distributed.
                </BulletListItem>
                <BulletListItem>
                  <Code>actionsStyle.gap</Code> controls spacing between them.
                </BulletListItem>
              </BulletList>
            </DemoParagraph>
            <CodeBlock>{ACTIONS_STYLE_SNIPPET}</CodeBlock>
          </FlexBox>

          <FlexBox column gap={1.5}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[2]} />
            <DemoParagraph>
              If most of your dialogs share the same layout — a consistent max width, a standard text alignment — you
              can set those values once in <Code>DialogProvider</Code> via <Code>defaultOptions</Code> to avoid
              repeating them on every <Code>open()</Code> call. Any per-call value still takes priority.
            </DemoParagraph>
            <CodeBlock language="tsx">{DEFAULT_OPTIONS_SNIPPET}</CodeBlock>
          </FlexBox>

          <AligningContentInteractive onResult={setResult} />
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
