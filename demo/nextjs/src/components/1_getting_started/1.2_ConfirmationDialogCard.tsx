"use client";

import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog, useDialogIsOpen } from "dialogist";
import { memo, useState } from "react";
import { AiTwotoneMessage } from "react-icons/ai";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "confirmation-demo";
const CARD_TITLE = "Confirmation dialog";

const CONFIRM_SNIPPET = `// 1. Register the dialog with a unique ID inside a component
const dialog = useDialog("my-dialog");

// 2. Open it when needed
dialog.open({
  type: "confirm",
  message: "Are you sure you want to proceed?",
  onOkClick: () => {
    // user confirmed
  },
  onCancelClick: () => {
    // user cancelled
  },
});`;

export const ConfirmationDialogCard = Object.assign(
  memo(function ConfirmationDialogCard() {
    const dialog = useDialog(DIALOG_KEY, {
      title: "Confirm action",
      okLabel: "Yes, continue",
      cancelLabel: "Cancel",
    });
    const isDialogOpen = useDialogIsOpen(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleConfirmDialog = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        message: "Are you sure you want to proceed with this action?",
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
        icon={withGenericFillIcon(AiTwotoneMessage)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={"Confirmation dialogs present a message with two buttons: confirm and cancel."}
        actions={[{ label: "Show confirmation dialog", onClick: handleConfirmDialog, icon: <AiTwotoneMessage /> }]}
        result={result}
        renderTrackerDependencies={[isDialogOpen]}
        renderTrackerCountStrategy="dependency-change"
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Setting <Code>type: "confirm"</Code> presents a dialog with <strong>Confirm</strong> and{" "}
            <strong>Cancel</strong> buttons. Use <Code>onOkClick</Code> and <Code>onCancelClick</Code> to respond to the
            user's choice.
          </DemoParagraph>
          <CodeBlock>{CONFIRM_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);

// cleaned up: inlined implementation; no re-export
