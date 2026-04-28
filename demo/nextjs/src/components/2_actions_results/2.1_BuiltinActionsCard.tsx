"use client";

import { Button, TextField } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { PiCursorClickDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "default-actions-demo";
const CARD_TITLE = "Built-in actions";

const LABELS_SNIPPET = `dialog.open({
  type: "confirm",
  okLabel: "Approve",
  cancelLabel: "Not now",
})`;

export const BuiltinActionsCard = Object.assign(
  memo(function BuiltinActionsCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [okLabel, setOkLabel] = useState("Approve");
    const [cancelLabel, setCancelLabel] = useState("Not now");
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleAlert = () => {
      setResult(null);
      dialog.open({
        type: "alert",
        title: "One action",
        message: "This dialog uses one default action button.",
        okLabel: okLabel || "OK",
        onOkClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "success.main",
          });
        },
      });
    };

    const handleConfirm = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: "Two actions",
        message: "This dialog uses two default action buttons.",
        okLabel: okLabel || "Confirm",
        cancelLabel: cancelLabel || "Cancel",
        onOkClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "success.main",
          });
        },
        onCancelClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "error.main",
          });
        },
      });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiCursorClickDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={<>Actions are the buttons at the bottom of a dialog.</>}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            As we know now, <Code>alert</Code> dialogs show one button (<strong>OK</strong>), and <Code>confirm</Code>{" "}
            dialogs show two (<strong>Cancel</strong> and <strong>Confirm</strong>). You can relabel these using{" "}
            <Code>okLabel</Code> and <Code>cancelLabel</Code> on the <Code>useDialog()</Code> hook or at open time.
          </DemoParagraph>
          <CodeBlock>{LABELS_SNIPPET}</CodeBlock>
          <DemoSectionHeading subtitle={"Try it out"} />
          <FlexBox row gap={1} flexWrap="wrap">
            <TextField
              size="small"
              label="Cancel label"
              value={cancelLabel}
              onChange={(event) => setCancelLabel(event.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            />
            <TextField
              size="small"
              label="OK label (alert + confirm)"
              value={okLabel}
              onChange={(event) => setOkLabel(event.target.value)}
              sx={{ minWidth: 240, flex: 1 }}
            />
          </FlexBox>
          <FlexBox row gap={1} flexWrap="wrap">
            <Button variant="contained" size="small" startIcon={<PiCursorClickDuotone />} onClick={handleAlert}>
              Show alert
            </Button>
            <Button variant="contained" size="small" startIcon={<PiCursorClickDuotone />} onClick={handleConfirm}>
              Show confirm
            </Button>
          </FlexBox>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE, cardSubHeadings: [] },
);
