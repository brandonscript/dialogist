"use client";

import { Chip, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDeepCallback, useDialog, useDialogImperativeHandle, useDialogImperativeValue } from "dialogist";
import { memo, useEffect, useRef, useState } from "react";
import { MdClear } from "react-icons/md";
import { PiHandCoinsDuotone } from "react-icons/pi";
import { useDebounce } from "use-debounce";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { DocLink } from "../common/links";
import { Code, DemoParagraph } from "../common/typography";
import { Admonition } from "../common";

const DIALOG_KEY = "textfield-validation-demo";
const MIN_CHARS = 7;
const MAX_CHARS = 42;
const CARD_TITLE = "Exposing dialog state imperatively";

const IMPERATIVE_SNIPPET = `
const DIALOG_KEY = "feedback-dialog";

const DialogContent = () => {
  // 1. Inside the dialog, call useDialogImperativeHandle
  useDialogImperativeHandle<FeedbackDialogState>(
    DIALOG_KEY,
    // 2. Return whatever state you want to expose in the factory function
    () => ({ isValid, errorText, charCount, value, ... }),
    // values in this dependency array re-run the factory
    // (similar to a useEffect dependency array)
    [isValid, errorText],
  );
  return (<> {/* dialog content... */} </>);
};

const ParentComponent = () => {
  const dialog = useDialog(DIALOG_KEY);
  
  // 3. In the parent (caller), connect the dialog to a stable ref
  const ref = useRef<FeedbackDialogState>(null);
  dialog.setImperativeHandle(ref);

  // 4. Read the current value (updates reactively)
  const { isValid, errorText } = useDialogImperativeValue<FeedbackDialogState | null>(DIALOG_KEY) ?? {};

  useEffect(() => {
    if (errorText) {
      console.error("Validation error:", errorText);
    } else if (isValid) {
      console.log("Validation passed");
    }
  }, [isValid, errorText]);

  return (
    <Button onClick={() => dialog.open({
      type: "confirm",
      title: "Enter a value",
      content: <DialogContent />,
    })}>Provide feedback</Button>
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
  debounceMs?: number;
}

const TextFieldBody = ({ value: initial, onChange, debounceMs = 200 }: TextFieldBodyProps) => {
  const [value, setValue] = useState(initial);
  const [debouncedValue, { flush }] = useDebounce(value, debounceMs, { leading: true, trailing: true });

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
  }, []);

  useEffect(() => {
    onChange(debouncedValue);
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

export const ExposingDialogStateCard = Object.assign(
  memo(function ExposingDialogStateCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);
    const [textFieldValue, setTextFieldValue] = useState("");
    const validationRef = useRef<TextFieldBodyRef>(null);
    dialog.setImperativeHandle(validationRef);
    const validationState = useDialogImperativeValue<TextFieldBodyRef | null>(DIALOG_KEY);

    const handleTextFieldDialog = async () => {
      setResult(null);

      await dialog.open({
        type: "confirm",
        title: "Enter a value",
        message: <TextFieldBody value={textFieldValue} onChange={setTextFieldValue} />,
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
        icon={withPiDuotoneIcon(PiHandCoinsDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={<>When the caller needs access to a dialog's internal state, you can expose it imperatively.</>}
        actions={[
          {
            label: "Show imperative dialog",
            onClick: handleTextFieldDialog,
            icon: <PiHandCoinsDuotone />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Often the dialog is the source of truth for things like form values, validation state, selected items, and
            other transient state. But sometimes the caller needs insight into that internal state (e.g., to enable a
            button or respond to validation).
          </DemoParagraph>
          <DemoParagraph>
            Similar to React's{" "}
            <DocLink
              href="https://react.dev/reference/react/useImperativeHandle"
              target="_blank"
              rel="noopener noreferrer"
            >
              useImperativeHandle
            </DocLink>
            , you can call <Code>useDialogImperativeHandle()</Code> inside the dialog to expose its current internal
            state to the outside.
          </DemoParagraph>
          <Admonition variant="important" title="Important">
            You almost always need to provide a dependency array to <Code>useDialogImperativeHandle</Code>, even if only
            an empty array <Code>[]</Code>. Without one, React recreates the exposed object on every render, which in
            turn notifies subscribers on every state change.
          </Admonition>
          <CodeBlock language="tsx">{IMPERATIVE_SNIPPET}</CodeBlock>
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
