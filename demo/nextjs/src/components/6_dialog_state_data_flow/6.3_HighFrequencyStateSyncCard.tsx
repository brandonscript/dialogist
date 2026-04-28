"use client";

import { Card, CardContent, InputAdornment, Slider, Switch, TextField, Typography } from "@mui/material";
import { FlexBox, FlexColumnBox } from "@mui-flexy/v7";
import {
  setDialogStateValue,
  useDialog,
  useDialogExternalSync,
  useDialogSlots,
  useDialogStateValue,
  useKeyPress,
} from "dialogist";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PiFireTruckDuotone } from "react-icons/pi";
import { useThrottledCallback } from "use-debounce";

import { BaseDemoCard, DemoCardPaper } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "high-frequency-sync-demo";
const CARD_TITLE = "High-frequency state sync";

const LABELS = {
  throttle: "External sync throttle",
  localToggle: "Local state randomizer (every 1.5s)",
  externalToggle: "External state randomizer (every 1.5s)",
} as const;

/** Minimal pattern: external sync + optional dialog state peek + throttled dialog.emit for live UI. */
const SYNC_SNIPPET = `
type DialogContentProps = {
  borderRadius: number;
  setBorderRadius: (n: number) => void;
};

const DIALOG_KEY = "high-frequency-sync-demo";

const DialogContent = ({ borderRadius, setBorderRadius }: DialogContentProps) => {
  const dialog = useDialog(DIALOG_KEY);
  const { value: localRadius, setValue: setLocalRadius } = useDialogExternalSync({
    externalValue: borderRadius,
    setExternalValue: setBorderRadius,
    throttleMs: 500,
  });

  useEffect(() => {
    setDialogStateValue(DIALOG_KEY, "borderRadiusLocal", localRadius);
  }, [localRadius]);

  return (
    <Slider
      value={localRadius}
      onChange={(_, v) => {
        const n = Number(v);
        setLocalRadius(n);
        // broadcast live updates to listeners (e.g. parent, analytics, other UI)
        dialog.emit("borderRadius", n);
      }}
    />
  );
};

const ParentComponent = () => {
  const [borderRadius, setBorderRadius] = useState(12);
  const [innerDialogValue] = useDialogStateValue(DIALOG_KEY, "borderRadiusLocal", borderRadius);
  const dialog = useDialog(DIALOG_KEY);

  useDialogSlots(DIALOG_KEY, {
    title: [\`Border radius (\${borderRadius}px)\`, [borderRadius]],
    content: [
      () => (
        <DialogContent borderRadius={borderRadius} setBorderRadius={setBorderRadius} />
      ),
      [borderRadius, setBorderRadius],
    ],
  });

  useEffect(() => {
    const unsubscribe = dialog.on("borderRadius", (value: number) => {
      console.log("Internal border radius:", value);
    });
    return unsubscribe;
  }, [dialog]);

  return (
    <>
      <p>External: {borderRadius}px · Internal: {innerDialogValue}px</p>
      <Button onClick={() => dialog.open()}>Open</Button>
    </>
  );
}`;

// Shared controls context
type ControlsCtx = {
  randomExternal: boolean;
  setRandomExternal: (v: boolean) => void;
  throttleMs: number;
  setThrottleMs: (v: number) => void;
  randomLocal: boolean;
  setRandomLocal: (v: boolean) => void;
};
const ControlsContext = createContext<ControlsCtx | null>(null);

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}

const ToggleRow = ({ label, checked, onChange }: ToggleRowProps) => {
  return (
    <FlexBox row y="center" gap={1}>
      <Switch size="small" checked={checked} onChange={(_, c) => onChange(c)} name={label} />
      <Typography variant="caption">{label}</Typography>
    </FlexBox>
  );
};

const CaptionNumberField = ({
  label,
  value,
  onChange,
  width = 160,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  width?: number;
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));

  // Sync input value when prop changes (but allow local editing)
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const numValue = Number(newValue);
    if (!Number.isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = Number(inputValue);
    if (Number.isNaN(numValue) || numValue < 0) {
      setInputValue(String(value));
      onChange(value);
    } else {
      onChange(numValue);
    }
  };

  return (
    <TextField
      type="number"
      size="small"
      label={label}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{
        input: {
          inputProps: { min: 0, step: 50 },
          endAdornment: (
            <InputAdornment position="end" sx={{ "& .MuiTypography-root": { fontSize: "0.725rem" } }}>
              ms
            </InputAdornment>
          ),
        },
      }}
      sx={{ mt: 1, width }}
    />
  );
};

type BorderRadiusDemoProps = {
  borderRadius: number;
  setBorderRadius: (value: number) => void;
  onClose: (payload: { action: "close"; borderRadius: number }) => void;
};

const BorderRadiusDemo = ({ borderRadius, setBorderRadius, onClose: _onClose }: BorderRadiusDemoProps) => {
  const controls = useContext(ControlsContext);
  const randomExternal = controls?.randomExternal ?? false;
  const setRandomExternal = controls?.setRandomExternal ?? (() => {});
  const throttleMs = controls?.throttleMs ?? 500;
  const setThrottleMs = controls?.setThrottleMs ?? (() => {});
  const randomLocal = controls?.randomLocal ?? false;
  const setRandomLocal = controls?.setRandomLocal ?? (() => {});
  const [dialogRandomLocal, setDialogRandomLocal] = useState(randomLocal);
  const [dialogRandomExternal, setDialogRandomExternal] = useState(randomExternal);

  useEffect(() => {
    setDialogRandomLocal(randomLocal);
  }, [randomLocal]);

  useEffect(() => {
    setDialogRandomExternal(randomExternal);
  }, [randomExternal]);

  // Use external sync to manage dialog-local state syncing with external borderRadius
  const syncResult = useDialogExternalSync({
    externalValue: borderRadius,
    setExternalValue: setBorderRadius,
    debounceMs: 400,
    throttleMs: throttleMs,
  });
  const localRadius = syncResult.value;
  const setLocalRadius = syncResult.setValue;
  const [displayRadius, setDisplayRadius] = useState<number>(borderRadius);
  const dialog = useDialog(DIALOG_KEY);

  // Store local radius in DialogState so the caller can read it for display
  useEffect(() => {
    setDialogStateValue(DIALOG_KEY, "borderRadiusLocal", localRadius);
  }, [localRadius]);

  // Update display when local radius changes
  useEffect(() => {
    const whole = Math.round(localRadius);
    if (whole !== displayRadius) setDisplayRadius(whole);
  }, [localRadius, displayRadius]);

  // Throttled emit for live listeners/title pipeline (full demo also commits via useDialogExternalSync)
  const throttledCommit = useThrottledCallback(
    (v: number) => {
      dialog.emit("borderRadius", v);
    },
    throttleMs,
    {
      leading: true,
      trailing: true,
    },
  );
  const marks = [
    { value: 0, label: "0px" },
    { value: 8, label: "8px" },
    { value: 12, label: "12px" },
    { value: 16, label: "16px" },
    { value: 24, label: "24px" },
    { value: 32, label: "32px" },
  ];

  const markValues = marks.map((m) => m.value);
  const isShiftPressed = useKeyPress("Shift");

  // Helper function to snap to the nearest mark value
  const snapToNearestMark = useCallback(
    (value: number): number => {
      if (!isShiftPressed) return value;
      let nearest = markValues[0];
      let minDistance = Math.abs(value - nearest);
      for (const markValue of markValues) {
        const distance = Math.abs(value - markValue);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = markValue;
        }
      }
      return nearest;
    },
    [isShiftPressed, markValues],
  );

  const rafRef = (() => {
    let id: number | null = null;
    return {
      cancel() {
        if (id != null) cancelAnimationFrame(id);
        id = null;
      },
      schedule(fn: () => void) {
        if (id != null) cancelAnimationFrame(id);
        id = requestAnimationFrame(() => {
          id = null;
          fn();
        });
      },
    };
  })();

  const applyDomRadius = useCallback(
    (v: number) => {
      const nodeList = document.querySelectorAll(
        '.MuiDialog-paper, .Dialogist-rootPaper, .MuiPaper-root.MuiDialog-paper, div[role="dialog"].MuiDialog-paper',
      );
      const nodes = Array.from(nodeList) as HTMLElement[];
      rafRef.schedule(() => {
        for (const node of nodes) {
          if (node.offsetParent === null) continue;
          node.style.setProperty("--dialogist-border-radius", `${v}px`);
          node.style.setProperty("border-radius", `${v}px`);
        }
      });
      const target = nodes.find((n) => n.offsetParent !== null) || nodes[nodes.length - 1];
      return target;
    },
    [rafRef],
  );

  // Local (internal) randomizer: updates local state (which syncs to external)
  useEffect(() => {
    if (!dialogRandomLocal) return;
    const id = setInterval(() => {
      const v = Math.floor(Math.random() * 33);
      setLocalRadius(v);
      throttledCommit(v);
    }, 1500);
    return () => clearInterval(id);
  }, [dialogRandomLocal, setLocalRadius, throttledCommit]);

  // Reflect local radius updates visually (DOM updates)
  useEffect(() => {
    const whole = Math.round(localRadius);
    applyDomRadius(whole);
  }, [localRadius, applyDomRadius]);

  return (
    <FlexBox column gap={2}>
      <DemoParagraph maxWidth={440} mx="auto" textAlign="left">
        Drag the slider to adjust this dialog&apos;s border radius. The sandbox title tracks committed external state;
        the dialog shell updates in real time. Use <Code>dialog.emit</Code> for high-frequency signals alongside{" "}
        <Code>useDialogExternalSync</Code>.
      </DemoParagraph>
      <DemoParagraph maxWidth={440} textAlign="left" fontSize={12}>
        Hold Shift to snap to the nearest mark.
      </DemoParagraph>

      <Card variant="outlined">
        <CardContent component={FlexColumnBox} x="center" y="center" sx={{ p: 0 }}>
          <Typography variant="h3" fontWeight={700} color="primary.main">
            {displayRadius}px
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Current border radius
          </Typography>
        </CardContent>
      </Card>
      <FlexBox x="center" width="100%">
        <CaptionNumberField label={LABELS.throttle} value={throttleMs} onChange={setThrottleMs} />
      </FlexBox>

      <Slider
        aria-label="Adjust border radius"
        value={localRadius}
        onChange={(_, val) => {
          const raw = Array.isArray(val) ? (val[0] as number) : (val as number);
          // Snap to nearest mark if Shift is held
          const snapped = snapToNearestMark(raw);
          const half = Math.round(snapped * 2) / 2; // allow half-pixel precision for live DOM
          const whole = Math.round(half); // commit only whole numbers
          applyDomRadius(half);
          // Update local state (which will sync to external via useDialogExternalSync)
          setLocalRadius(whole);
          throttledCommit(whole);
        }}
        onChangeCommitted={(_, val) => {
          const raw = Array.isArray(val) ? (val[0] as number) : (val as number);
          // Snap to nearest mark if Shift is held
          const snapped = snapToNearestMark(raw);
          const whole = Math.round(snapped);
          // Flush and cancel throttled commits so final value applies immediately
          const ctl = throttledCommit as unknown as { flush?: () => void; cancel?: () => void };
          ctl.flush?.();
          ctl.cancel?.();
          // Update local state and DOM to the whole-pixel commit
          setLocalRadius(whole);
          applyDomRadius(whole);
          setDisplayRadius(whole);
          dialog.emit("borderRadius", whole);
        }}
        min={0}
        max={32}
        step={0.5}
        marks={marks}
        valueLabelDisplay="off"
        sx={{ mx: 2, mb: 2, width: "auto" }}
      />

      <FlexBox column x="left" gap={2} mt={2} maxWidth={280} mx="auto">
        <ToggleRow
          label={LABELS.localToggle}
          checked={dialogRandomLocal}
          onChange={(v) => {
            setDialogRandomLocal(v);
            setRandomLocal(v);
          }}
        />
        <ToggleRow
          label={LABELS.externalToggle}
          checked={dialogRandomExternal}
          onChange={(v) => {
            setDialogRandomExternal(v);
            setRandomExternal(v);
          }}
        />
      </FlexBox>
    </FlexBox>
  );
};

export const HighFrequencyStateSyncCard = Object.assign(
  memo(function HighFrequencyStateSyncCard() {
    const [result, setResult] = useState<DialogResult | null>(null);
    const [borderRadius, setBorderRadius] = useState(12);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [throttleMs, setThrottleMs] = useState(500);
    const [randomExternal, setRandomExternal] = useState(false);
    const [randomLocal, setRandomLocal] = useState(false);
    // Read dialog's local state value for display
    const [localValue] = useDialogStateValue<number>(DIALOG_KEY, "borderRadiusLocal", borderRadius);

    const dialog = useDialog(DIALOG_KEY, { type: "alert", liveThrottleMs: 100 });
    const dialogRef = useRef(dialog);
    dialogRef.current = dialog;

    const title = useMemo(() => `Live border radius (${borderRadius}px)`, [borderRadius]);

    const handleClose = useCallback(({ borderRadius: _finalRadius }: { action: "close"; borderRadius: number }) => {
      dialogRef.current.close();
      setIsDialogOpen(false);
      setResult({
        text: `Close`,
        color: "success.main",
      });
    }, []);

    const controlsContextValue = useMemo(
      () => ({ randomExternal, setRandomExternal, throttleMs, setThrottleMs, randomLocal, setRandomLocal }),
      [randomExternal, throttleMs, randomLocal],
    );

    const props = useMemo(
      () => ({
        borderRadius: borderRadius,
        overflow: "visible" as const,
      }),
      [borderRadius],
    );

    useDialogSlots(DIALOG_KEY, {
      title: [title, [borderRadius]],
      content: [
        () => (
          <ControlsContext.Provider value={controlsContextValue}>
            <BorderRadiusDemo borderRadius={borderRadius} setBorderRadius={setBorderRadius} onClose={handleClose} />
          </ControlsContext.Provider>
        ),
        [borderRadius, setBorderRadius, handleClose, controlsContextValue],
      ],
      props: [props, [borderRadius]],
    });

    // External randomizer controlled from the caller (continues even when dialog is closed)
    useEffect(() => {
      let id: ReturnType<typeof setInterval> | null = null;
      if (randomExternal) {
        const tick = () => {
          const v = Math.floor(Math.random() * 33);
          setBorderRadius(v);
        };
        tick();
        id = setInterval(tick, 1500);
      }
      return () => {
        if (id) clearInterval(id);
      };
    }, [randomExternal]);

    const handleOpenDemo = () => {
      setResult(null);
      setIsDialogOpen(true);
      dialogRef.current.open({
        okLabel: "Done",
        borderRadius,
        onClose: () => {
          setIsDialogOpen(false);
          setRandomLocal(false);
        },
      });
    };

    useEffect(() => {
      if (!isDialogOpen) setRandomLocal(false);
    }, [isDialogOpen]);

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiFireTruckDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            For high-frequency updates, optimize for performance by keeping state local and debouncing or throttling
            external updates.
          </>
        }
        actions={[
          {
            label: "Show high-frequency sync demo",
            onClick: handleOpenDemo,
            icon: <PiFireTruckDuotone />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            The previous example uses a text field with discrete, low-frequency updates. But some interactions — like
            sliders, drag gestures, scroll events, or window resizing — can produce many updates per second. Pushing
            every change back to the caller would hurt performance.
          </DemoParagraph>
          <DemoParagraph>
            <Code>useDialogExternalSync()</Code> keeps the dialog responsive locally while syncing changes back to the
            caller at a controlled rate. At the same time, <Code>dialog.emit()</Code> lets you broadcast high-frequency
            events to any interested listeners without going through React state.
          </DemoParagraph>
          <DemoParagraph>
            In this example, the slider emits live updates via <Code>dialog.emit()</Code> on every change, while the
            parent subscribes to those events. This lets subscribers respond immediately — including other parts of the
            app, or synchronous logic outside React — while committed state updates remain throttled.
          </DemoParagraph>
          <CodeBlock language="tsx">{SYNC_SNIPPET}</CodeBlock>
        </FlexBox>
        <DemoSectionHeading subtitle="Try it out" mt={2} />
        <FlexBox column gap={2}>
          <DemoCardPaper title="Current border radius / state" mb={1}>
            <FlexBox column gap={0.5}>
              <Typography variant="body2">
                External: <strong>{borderRadius}px</strong>{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  (managed externally)
                </Typography>
              </Typography>
              <Typography variant="body2">
                Local: <strong>{localValue}px</strong>{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  (inside the dialog)
                </Typography>
              </Typography>
            </FlexBox>
          </DemoCardPaper>
          <FlexBox column gap={2} maxWidth={320} x="left">
            <ToggleRow label={LABELS.externalToggle} checked={randomExternal} onChange={setRandomExternal} />
            <CaptionNumberField label={LABELS.throttle} value={throttleMs} onChange={setThrottleMs} />
          </FlexBox>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
