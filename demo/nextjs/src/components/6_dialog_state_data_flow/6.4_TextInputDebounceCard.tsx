"use client";

import { Chip, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDeepCallback, useDialog, useDialogImperativeHandle, useDialogImperativeValue } from "dialogist";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { MdClear } from "react-icons/md";
import { PiBeachBallDuotone } from "react-icons/pi";
import { useDebounce } from "use-debounce";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { DemoCheckboxLabel } from "../common/DemoCheckboxLabel";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { DocLink } from "../common/links";
import { OptionControl } from "../common/OptionControl";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "textfield-validation-debounced-demo";
const MIN_CHARS = 7;
const MAX_CHARS = 42;
const CARD_TITLE = "Debouncing external updates";

const DEBOUNCE_SNIPPET = `
const DialogContent = ({ onChange }: { onChange: (v: string) => void }) => {
  const [value, setValue] = useState("");
  const [debouncedValue, { flush }] = useDebounce(value, 400, {
    leading: false,
    trailing: true,
    maxWait: 1000,   // optional: max wait time
  });

  // send debounced updates to the parent
  useEffect(() => {
    onChange(debouncedValue);
    return () => { flush(); }; // flush on unmount to avoid stale state
  }, [debouncedValue]);

  return (<> {/* dialog content... */} </>);
};

const ParentComponent = () => {
  const [textFieldValue, setTextFieldValue] = useState("");
  const dialog = useDialog("debounced-text-dialog", {
    content: <DialogContent onChange={setTextFieldValue} />,
  });

  return (
    <Button onClick={dialog.open}>Open</Button>
  );
};`;

interface TextFieldBodyRef {
  isMaxLength: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isNearlyTooLong: boolean;
  isValid: boolean;
}

interface TextFieldBodyProps {
  value: string;
  onChange: (v: string) => void;
  debounceMs: number;
  maxWait?: number;
  leading: boolean;
  trailing: boolean;
}

const TextFieldBody = ({ value: initial, onChange, debounceMs, maxWait, leading, trailing }: TextFieldBodyProps) => {
  const [value, setValue] = useState(initial);

  const debounceOptions = useMemo(() => {
    const opts: { leading: boolean; trailing: boolean; maxWait?: number } = { leading, trailing };
    if (maxWait !== -1) {
      opts.maxWait = maxWait;
    }
    return opts;
  }, [leading, trailing, maxWait]);

  const [debouncedValue, { flush }] = useDebounce(value, debounceMs, debounceOptions);

  const isMaxLength = value.length === MAX_CHARS;
  const isTooShort = value.length < MIN_CHARS && value.length > 0;
  const isTooLong = value.length > MAX_CHARS;
  const isNearlyTooLong = value.length > MAX_CHARS - 7 && value.length < MAX_CHARS;
  const isValid = value.length >= MIN_CHARS && value.length <= MAX_CHARS;

  const handleChange = useDeepCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
  }, []);

  const handleClear = useDeepCallback(() => {
    setValue("");
    flush();
  }, [flush]);

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange(debouncedValue);
    }
    return () => {
      flush();
    };
  }, [debouncedValue, onChange, flush]);

  useDialogImperativeHandle(
    DIALOG_KEY,
    () => ({
      isMaxLength,
      isTooShort,
      isTooLong,
      isNearlyTooLong,
      isValid,
    }),
    [isMaxLength, isTooShort, isTooLong, isNearlyTooLong, isValid],
  );

  const getHelperText = () => {
    if (isTooShort) return `Too short! Need at least ${MIN_CHARS - value.length} more characters.`;
    if (isTooLong) return `Too long! Please remove ${value.length - MAX_CHARS} characters.`;
    if (isMaxLength) return "No characters left.";
    if (isNearlyTooLong) return `Only ${MAX_CHARS - value.length} characters left.`;
    if (isValid) return null;
    return `Enter at least ${MIN_CHARS} characters.`;
  };

  const getColor = () => {
    if (isTooShort || isTooLong) return "error";
    if (isMaxLength) return "success";
    return "primary";
  };

  return (
    <FlexBox column minWidth={400} position="relative">
      <Typography variant="body1" gutterBottom>
        Enter a short message (7-42 characters):
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        value={value}
        onChange={handleChange}
        placeholder="Share your thoughts..."
        error={isTooShort || isTooLong}
        helperText={getHelperText()}
        color={getColor()}
        slotProps={{
          input: {
            sx: {
              p: 1,
            },
            endAdornment: value.length > 0 && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear text"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    mt: -0.5,
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                >
                  <MdClear size={18} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <FlexBox x="space-between" y="center" mt={1} mx={1.5}>
        <Chip
          size="small"
          label={`${value.length} chars`}
          color={isMaxLength ? "success" : isTooShort || isTooLong ? "error" : "default"}
          variant={isMaxLength ? "filled" : "outlined"}
        />
      </FlexBox>
    </FlexBox>
  );
};

export const TextInputDebounceCard = Object.assign(
  memo(function TextInputDebounceCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);
    const [textFieldValue, setTextFieldValue] = useState("");
    const [debounceMs, setDebounceMs] = useState(400);
    const [maxWait, setMaxWait] = useState<number>(-1);
    const [leading, setLeading] = useState(false);
    const [trailing, setTrailing] = useState(true);

    const validationRef = useRef<TextFieldBodyRef>(null);
    dialog.setImperativeHandle(validationRef);
    const validationState = useDialogImperativeValue<TextFieldBodyRef | null>(DIALOG_KEY);

    const handleDialog = async () => {
      setResult(null);

      await dialog.open({
        type: "confirm",
        title: "Text field with debounced updates",
        message: (
          <TextFieldBody
            value={textFieldValue}
            onChange={(v) => setTextFieldValue(v)}
            debounceMs={debounceMs}
            maxWait={maxWait}
            leading={leading}
            trailing={trailing}
          />
        ),
        okLabel: "Save",
        cancelLabel: "Cancel",
        onOkClick: () => {
          setResult({ text: "Save", color: "success.main" });
        },
        onCancelClick: () => {
          setResult({ text: "Cancel", color: "error.main" });
        },
      });
    };

    const getValidationLabel = () => {
      if (validationState) {
        if (validationState.isValid) return "Valid";
        if (validationState.isTooShort) return "Too short";
        if (validationState.isTooLong) return "Too long";
      } else {
        const len = textFieldValue.length;
        if (len >= MIN_CHARS && len <= MAX_CHARS) return "Valid";
        if (len > 0 && len < MIN_CHARS) return "Too short";
        if (len > MAX_CHARS) return "Too long";
      }
      return !textFieldValue.length ? "Empty" : "Unknown";
    };

    const label = getValidationLabel();
    const color = label === "Valid" ? "success" : label === "Empty" ? "default" : "error";

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiBeachBallDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>For more control over how updates are synced to external state, you can debounce them manually.</>
        }
        actions={[
          {
            label: "Open debounced text dialog",
            onClick: handleDialog,
            icon: <PiBeachBallDuotone />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Not every input needs full two-way state sync. For simple cases like text fields, you can debounce updates
            before passing them to the caller. This keeps the dialog responsive without introducing additional
            synchronization logic.
          </DemoParagraph>
          <DemoParagraph>
            Wrap your internal <Code>onChange</Code> with <Code>useDebounce</Code> before calling the external handler.
            The dialog still updates on every keystroke for instant feedback, but the caller only receives updates after
            the debounce window closes.
          </DemoParagraph>
          <DemoParagraph>
            This demo uses{" "}
            <DocLink href="https://www.npmjs.com/package/use-debounce" target="_blank" rel="noopener noreferrer">
              use-debounce
            </DocLink>
            , but any debounce approach works. Adjust the options below to see how it affects update timing.
          </DemoParagraph>
          <CodeBlock language="tsx">{DEBOUNCE_SNIPPET}</CodeBlock>
        </FlexBox>
        <DemoSectionHeading subtitle="Try it out" mt={2} />
        <FlexBox row gap={2} my={1} flexWrap="wrap">
          <OptionControl
            label="Debounce ms"
            value={debounceMs}
            onChange={(v) => setDebounceMs(Number(v))}
            type="number"
            min={0}
            step={100}
          />
          <OptionControl
            label="Max wait ms"
            value={maxWait}
            onChange={(v) => {
              const val = Number(v);
              // Handle stepping transitions between -1 and 0
              if (val === 99 && maxWait === -1) {
                setMaxWait(0);
              } else if (val === -100 && maxWait === 0) {
                setMaxWait(-1);
              } else {
                setMaxWait(val);
              }
            }}
            type="number"
            min={maxWait === -1 ? -1 : -100}
            step={100}
          />
          <DemoCheckboxLabel checked={leading} onChange={setLeading} label="Leading" />
          <DemoCheckboxLabel checked={trailing} onChange={setTrailing} label="Trailing" />
        </FlexBox>

        <FlexBox row mt={2} x="space-between" y="center">
          <Typography variant="caption" display="block" gutterBottom sx={{ flex: 1, minWidth: 0, mr: 2 }}>
            Current value: "{textFieldValue || "Empty"}" ({textFieldValue.length} chars)
          </Typography>
          <Chip size="small" label={label} color={color} variant="outlined" sx={{ flexShrink: 0 }} />
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
