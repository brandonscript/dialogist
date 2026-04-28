"use client";

import { FlexBox } from "@mui-flexy/v7";
import { useDialog, useDialogIsOpen } from "dialogist";
import { memo, useState } from "react";
import { PiClockCountdownDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "async-confirmation-demo";
const CARD_TITLE = "Async dialogs";

const ASYNC_SNIPPET = `// 1. Register the dialog with a unique ID inside a component
const dialog = useDialog("my-dialog");

// 2. Await the user's response (resolves with a 'DialogCloseEvent')
const event = await dialog.open({
  type: "confirm", // or "alert" for single button
  title: "Confirm action",
  message: "Do you want to proceed?",
});

console.log(event.ok); // true if user confirmed; false if cancelled, blocked, etc.
`;

export const AsyncConfirmationDialogCard = Object.assign(
  memo(function AsyncConfirmationDialogCard() {
    const dialog = useDialog(DIALOG_KEY);
    const isDialogOpen = useDialogIsOpen(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleAsyncConfirmDialog = async () => {
      setResult(null);

      try {
        const event = await dialog.open({
          type: "confirm",
          title: "Async confirmation",
          message: "This dialog uses open() to await the user's response. Do you want to proceed?",
          okLabel: "Yes, proceed",
          cancelLabel: "No, cancel",
        });

        if (event.ok) {
          setResult({
            text: "Yes, proceed",
            color: "success.main",
          });
        } else {
          setResult({
            text: "No, cancel",
            color: "error.main",
          });
        }
      } catch (error) {
        setResult({
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          color: "warning.main",
        });
      }
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiClockCountdownDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={"Dialogs can be awaited like any async operation, resolving with the user's response."}
        actions={[{ label: "Show async dialog", onClick: handleAsyncConfirmDialog, icon: <PiClockCountdownDuotone /> }]}
        result={result}
        renderTrackerDependencies={[isDialogOpen]}
        renderTrackerCountStrategy="dependency-change"
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Awaiting <Code>dialog.open()</Code> pauses execution until the user responds, then resolves with a{" "}
            <Code>DialogCloseEvent</Code>. Use <Code>event.ok</Code>, <Code>event.cancelled</Code>, or{" "}
            <Code>event.blocked</Code> to interpret the outcome.
          </DemoParagraph>
          <CodeBlock>{ASYNC_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);

// cleaned up: inlined implementation; no re-export
