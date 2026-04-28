"use client";

import { FlexBox } from "@mui-flexy/v7";
import { type DialogActionEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { PiBracketsCurlyDuotone } from "react-icons/pi";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "dialog-action-event-payload-demo";
const CARD_TITLE = "DialogActionEvent payload";

const EVENT_SHAPE_SNIPPET = `onOkClick: (event: DialogActionEvent) => {
  const { dialogKey, action, actionId, buttonText } = event;
  console.log({ dialogKey, action, actionId, buttonText });
};

onCancelClick: (event: DialogActionEvent) => {
  // handle cancel action event
};`;

const ASYNC_EVENT_SHAPE_SNIPPET = `const event = await dialog.open({ type: "confirm" });

// verify that the event is a DialogActionEvent
if (event?.reason === "action") {
  const { dialogKey, action, actionId, buttonText } = event as DialogActionEvent;
  console.log({ dialogKey, action, actionId, buttonText });
}`;

export const DialogActionEventPayloadCard = Object.assign(
  memo(function DialogActionEventPayloadCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleOpen = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: "Action callbacks",
        message: "Click a button to trigger a callback.",
        okLabel: "Approve",
        cancelLabel: "Not now",
        onOkClick: ({ dialogKey, action, actionId, buttonText }: DialogActionEvent) => {
          console.log({ dialogKey, action, actionId, buttonText });
          setResult({
            text: `${buttonText} (${action})`,
            color: "success.main",
          });
        },
        onCancelClick: (event: DialogActionEvent) => {
          const { dialogKey, action, actionId, buttonText } = event;
          console.log({ dialogKey, action, actionId, buttonText });
          setResult({
            text: `${buttonText} (${action})`,
            color: "error.main",
          });
        },
      });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiBracketsCurlyDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            Action clicks pass a <Code>DialogActionEvent</Code> object so you can match the callback to the button that
            was clicked.
          </>
        }
        result={result}
        actions={[
          {
            label: "Show dialog",
            onClick: handleOpen,
            icon: <PiBracketsCurlyDuotone />,
          },
        ]}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph component="div">
            The <Code>DialogActionEvent</Code> object (a superset of <Code>DialogCloseEvent</Code>) includes the
            following properties:
            <BulletList>
              <BulletListItem>
                <Code>dialogKey</Code> – the key of the dialog that fired the event.
              </BulletListItem>
              <BulletListItem>
                <Code>action</Code> – the category of action that triggered the event.
              </BulletListItem>
              <BulletListItem>
                <Code>actionId</Code> – the specific action that fired.
              </BulletListItem>
              <BulletListItem>
                <Code>buttonText</Code> – the button label that was visible at the time.
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <CodeBlock>{EVENT_SHAPE_SNIPPET}</CodeBlock>
          <DemoParagraph component="div">
            Or if you use async/await, and you know the action will resolve with a <Code>DialogCloseEvent</Code>, you
            can destructure the event directly:
            <CodeBlock>{ASYNC_EVENT_SHAPE_SNIPPET}</CodeBlock>
            <Admonition sx={{ mt: 2 }}>
              See the <strong>Closing dialogs</strong> section for the differences between the
              <Code>DialogCloseEvent</Code> and <Code>DialogActionEvent</Code> objects.
            </Admonition>
          </DemoParagraph>
          <DemoSectionHeading subtitle="Try it out" />
          <DemoParagraph>Open your browser's console to see the event payload.</DemoParagraph>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);
