"use client";

import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog, useDialogIsOpen } from "dialogist";
import { memo, useState } from "react";
import { AiTwotoneAlert } from "react-icons/ai";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "alert-demo";
const CARD_TITLE = "Alert dialog";

const ALERT_SNIPPET = `// 1. Register the dialog with a unique ID inside a component
const dialog = useDialog("my-dialog");

// 2. Open it when needed
dialog.open({
  type: "alert",
  title: "Heads up",
  message: "Something important just happened.",
});`;

export const AlertDialogCard = Object.assign(
  memo(function AlertDialogCard() {
    const dialog = useDialog(DIALOG_KEY, {
      title: "Alert",
      okLabel: "Got it!",
    });
    const isDialogOpen = useDialogIsOpen(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleAlertDialog = () => {
      setResult(null);
      dialog.open({
        type: "alert",
        message: "This is an important alert message that you should read!",
        onOkClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "info.main",
          });
        },
      });
    };

    return (
      <BaseDemoCard
        icon={withGenericFillIcon(AiTwotoneAlert)}
        title={CARD_TITLE}
        subtitle="The basic open pattern"
        dialogKey={DIALOG_KEY}
        description="Alert dialogs are the simplest dialog type: one message and one button."
        actions={[{ label: "Show alert dialog", onClick: handleAlertDialog, icon: <AiTwotoneAlert /> }]}
        result={result}
        renderTrackerDependencies={[isDialogOpen]}
        renderTrackerCountStrategy="dependency-change"
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Register a dialog with <Code>useDialog(id)</Code>, then call <Code>open()</Code> whenever you want to show
            it. Optional configuration passed to the hook defines defaults for that dialog instance.
          </DemoParagraph>
          <CodeBlock>{ALERT_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);

// cleaned up: inlined implementation; no re-export
