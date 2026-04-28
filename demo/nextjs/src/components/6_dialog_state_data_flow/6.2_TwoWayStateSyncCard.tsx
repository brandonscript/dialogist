"use client";

import { InputAdornment, Switch, TextField, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDialog, useDialogExternalSync, useDialogSlots } from "dialogist";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiSwapDuotone } from "react-icons/pi";
import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { DemoPatternLabel } from "../common/DemoPatternLabel";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "two-way-sync-demo";
const CARD_TITLE = "Two-way state sync";

const SAMPLE_NOTES = ["Draft from API", "Another system update", "External: meeting moved", "Synced label"] as const;

/** Doc snippet: external state via props + useDialogSlots; stable setter; re-renders do not reset the hook. */
const SYNC_SNIPPET = `
type DialogContentState = {
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
};

const DIALOG_KEY = "two-way-sync-demo";

const DialogContent = ({ note, setNote }: DialogContentState) => {
  const [localNote, setLocalNote] = useState<string>(note);
  // external value changes re-render the dialog content normally, and
  // useDialogExternalSync keeps a local working copy across re-renders
  const { value: localNote, setValue: setLocalNote } = useDialogExternalSync({
    externalValue: note,
    setExternalValue: setNote,
    // debounce: if the user has not edited for 200ms, sync queued updates.
    debounceMs: 200,
    // throttle: always sync queued updates once every 1000ms, 
    // even if th e user is actively editing.
    throttleMs: 1000,
  });

  return (
    // here while the user is actively editing, local changes win and
    // external changes are queued and reconciled after the idle delay
    <TextField
      value={localNote}
      onChange={(e) => setLocalNote(e.target.value)}
      multiline
      minRows={3}
      label="Note"
      fullWidth
    />
  );
};

const ParentComponent = () => {
  const [note, setNote] = useState("Hello");
  const dialog = useDialog(DIALOG_KEY);

  useDialogSlots(DIALOG_KEY, {
    title: ["Edit note", []],
    // Dialogist keeps the open dialog instance stable, and React keeps
    // the DialogContent component mounted while the dialog is open.
    content: [
      () => (
        <DialogContent note={note} setNote={setNote} />
      ),
      [note, setNote],
    ],
  });

  return (
    <>
      <p>External (committed): {note}</p>
      <button type="button" onClick={() => dialog.open()}>Edit note</button>
    </>
  );
};`;

const EXTERNAL_SYNC_CAUTION_DONT = `
// bundled object
<DialogContent state={{ note, setNote }} />
// bundled array
<DialogContent state={[note, setNote]} />
`;

const EXTERNAL_SYNC_CAUTION_DO = `
// separate props
<DialogContent
  note={note}
  setNote={setNote}
/>
`;

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

type NoteSyncDialogContentProps = {
  note: string;
  setNote: (next: string) => void;
  throttleMs: number;
};

const NoteSyncDialogContent = ({ note, setNote, throttleMs }: NoteSyncDialogContentProps) => {
  const { value: localNote, setValue: setLocalNote } = useDialogExternalSync({
    externalValue: note,
    setExternalValue: setNote,
    // Wait after last edit before local idle (merge queued external updates).
    debounceMs: 400,
    // Cap outbound writes to parent while typing.
    throttleMs,
  });

  return (
    <FlexBox column gap={2} width="100%">
      <DemoParagraph maxWidth={440}>
        The text field is driven only by <Code>useDialogExternalSync</Code>: typing updates local state right away;
        writes to the caller are throttled, then the dialog idles and any pending external value can apply.
      </DemoParagraph>
      <TextField
        label="Shared note"
        value={localNote}
        onChange={(e) => setLocalNote(e.target.value)}
        multiline
        minRows={4}
        fullWidth
      />
    </FlexBox>
  );
};

const truncate = (s: string, max: number) => {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
};

export const TwoWayStateSyncCard = Object.assign(
  memo(function TwoWayStateSyncCard() {
    const [result, setResult] = useState<DialogResult | null>(null);
    const [note, setNote] = useState("Hello");
    const [throttleMs, setThrottleMs] = useState(1000);
    const [pushExternal, setPushExternal] = useState(false);
    const sampleIndexRef = useRef(0);

    const dialog = useDialog(DIALOG_KEY, { type: "alert", liveThrottleMs: 100 });
    const dialogRef = useRef(dialog);
    dialogRef.current = dialog;

    const title = useMemo(() => `Edit shared note (${truncate(note, 28)})`, [note]);

    const props = useMemo(
      () => ({
        overflow: "visible" as const,
      }),
      [],
    );

    useDialogSlots(DIALOG_KEY, {
      title: [title, [note]],
      content: [
        () => <NoteSyncDialogContent note={note} setNote={setNote} throttleMs={throttleMs} />,
        [note, setNote, throttleMs],
      ],
      props: [props, []],
    });

    useEffect(() => {
      if (!pushExternal) return;
      const id = setInterval(() => {
        const next = SAMPLE_NOTES[sampleIndexRef.current % SAMPLE_NOTES.length];
        sampleIndexRef.current += 1;
        setNote(next);
      }, 1800);
      return () => clearInterval(id);
    }, [pushExternal]);

    const handleOpen = useCallback(() => {
      setResult(null);
      dialogRef.current.open({
        okLabel: "Done",
        onClose: () => {
          setPushExternal(false);
          setResult({
            text: "Dialog closed",
            color: "success.main",
          });
        },
      });
    }, []);

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiSwapDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>Two-way sync keeps a local working copy inside the dialog while safely reconciling external updates.</>
        }
        actions={[
          {
            label: "Show two-way sync demo",
            onClick: handleOpen,
            icon: <PiSwapDuotone />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Passing external state into a dialog will naturally re-render the dialog content when that state changes.
            That is normal React behavior, but you often want two-way data flow where the caller's state flows in, and
            edits inside the dialog write back out.{" "}
          </DemoParagraph>
          <DemoParagraph>
            The <Code>useDialogExternalSync()</Code> hook keeps its own local editing state across re-renders, applies
            external changes through a controlled effect, and defers or queues them when the user is actively editing.
            This lets the dialog stay responsive locally while still syncing with the caller over time.
          </DemoParagraph>
          <Admonition variant="note" title="Note">
            What's the difference between imperative handles and external sync, and when should you choose one over the
            other?
            <BulletList ml={-1.5}>
              <BulletListItem>
                <Code>useDialogImperativeValue()</Code>{" "}
                <strong>is best for when you only need to access dialog-owned state or functions.</strong> It reads from
                an imperative handle exposed by the dialog, and allows the caller to observe state (e.g., to check form
                validity or retrieve values) or call functions on the dialog (e.g., to reset a form).{" "}
              </BulletListItem>
              <BulletListItem>
                <Code>useDialogExternalSync()</Code>{" "}
                <strong>
                  is best for when you need to share state back and forth between the dialog and the caller (parent
                  component).
                </strong>{" "}
                The caller owns the state, passes it into the dialog, and receives updates back over time. This is ideal
                for two-way data flow (e.g., when the caller and the dialog are dependent on external data or state
                changes).
              </BulletListItem>
            </BulletList>
          </Admonition>
          <CodeBlock language="tsx">{SYNC_SNIPPET}</CodeBlock>
          <Admonition variant="caution">
            When passing parent state into dialog content for <Code>useDialogExternalSync()</Code>, pass each value as a
            separate prop instead of a bundled object or array. A new object creates{" "}
            <strong>a new reference each time</strong> the parent re-renders, which will cause effects, memoization, and
            dependent components to run on every keystroke.
            <FlexBox column gap={1.25} mt={1.5} sx={{ width: "100%" }}>
              Pass values as separate props, or memoize the object if for some reason you must to group them.
              <DemoPatternLabel variant="dont" sx={{ mb: -0.5 }} />
              <CodeBlock language="tsx" dedent>
                {EXTERNAL_SYNC_CAUTION_DONT}
              </CodeBlock>
              <DemoPatternLabel variant="do" sx={{ mt: 0.25, mb: -0.5 }} />
              <CodeBlock language="tsx" dedent mb={0.5}>
                {EXTERNAL_SYNC_CAUTION_DO}
              </CodeBlock>
            </FlexBox>
          </Admonition>
        </FlexBox>
        <DemoSectionHeading subtitle="Try it out" mt={2} />
        <FlexBox column gap={2}>
          <DemoParagraph>
            Type here or in the open dialog — both paths feed the same external value that is managed by{" "}
            <Code>useDialogExternalSync()</Code>.
          </DemoParagraph>
          <TextField
            label="Shared note (caller)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            sx={{ maxWidth: 480 }}
          />
          <FlexBox column gap={2} maxWidth={320} x="left">
            <ToggleRow
              label="Simulate external updates (replaces note on an interval)"
              checked={pushExternal}
              onChange={setPushExternal}
            />
            <CaptionNumberField label="Outbound throttle" value={throttleMs} onChange={setThrottleMs} />
          </FlexBox>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
