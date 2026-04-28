"use client";

import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { PiBracketsCurlyDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph, DemoSectionHeading, Key } from "../common/typography";

const DIALOG_KEY = "dialog-close-event-demo";
const CARD_TITLE = "DialogCloseEvent payload";
const CARD_SUBHEADINGS = ["Additional close hooks"] as const;

const ON_CLOSE_SNIPPET = `
const isAction = (event: DialogCloseEvent): event is DialogActionEvent =>
  event.reason === "action";

dialog.open({
  type: "confirm",
  title: "Close handling demo",
  message: "Try Esc, backdrop click, or buttons.",
  onClose: ({ reason, ...event }: DialogCloseEvent) => {
    console.log(reason); // "action" | "backdrop" | "escape" | "programmatic" | "replace"
    if (isAction(event)) {
      // event is now cast to DialogActionEvent
    }
  },
});

// or using async/await:
const event = await dialog.open({ 
  type: "confirm", 
  title: "Close handling demo", 
  message: "Try Esc, backdrop click, or buttons.",
});

if (isAction(event)) {
  // event is now cast to DialogActionEvent
}
`;

export const DialogCloseEventCard = Object.assign(
  memo(function DialogCloseEventCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleOpen = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: "Close handling demo",
        message: "Try closing this dialog with Escape, backdrop click, or buttons.",
        okLabel: "Continue",
        cancelLabel: "Cancel",
        onClose: (event: DialogCloseEvent) => {
          console.log("DialogCloseEvent:", event);
          if (event.reason === "action" && event.action && event.buttonText) {
            setResult({
              text: `${event.buttonText} (${event.action})`,
              color: event.action === "cancelClicked" ? "error.main" : "success.main",
            });
          } else {
            setResult({
              text: `Reason: ${event.reason}`,
              color: "info.main",
            });
          }
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
            This event is passed to all closing callbacks like <Code>onClose</Code>, and when using async/await on{" "}
            <Code>dialog.open()</Code>.
          </>
        }
        result={result}
        resultLabel="Close result"
        actions={[
          {
            label: "Show dialog",
            onClick: handleOpen,
            icon: <PiBracketsCurlyDuotone />,
          },
        ]}
      >
        <FlexBox column gap={1.5} mt={1.5}>
          <DemoParagraph component="div">
            The <Code>DialogCloseEvent</Code> object includes the following properties:
            <BulletList>
              <BulletListItem>
                <Code>dialogKey</Code> – the key of the dialog that fired the event.
              </BulletListItem>
              <BulletListItem>
                <Code>reason</Code> – the reason the dialog closed
                <BulletList nested>
                  <BulletListItem>
                    <Code>action</Code> – a dialog button was clicked (this event will be a{" "}
                    <Code>DialogActionEvent</Code>).
                  </BulletListItem>
                  <BulletListItem>
                    <Code>backdrop</Code> – the user clicked outside the dialog.
                  </BulletListItem>
                  <BulletListItem>
                    <Code>escape</Code> – the user pressed the <Key>Esc</Key> key.
                  </BulletListItem>
                  <BulletListItem>
                    <Code>programmatic</Code> – the dialog was closed programmatically (e.g. via{" "}
                    <Code>dialog.close()</Code>
                    ).
                  </BulletListItem>
                  <BulletListItem>
                    <Code>replace</Code> – the dialog was replaced by another dialog (e.g. via{" "}
                    <Code>dialog.replace()</Code>
                    ).
                  </BulletListItem>
                </BulletList>
              </BulletListItem>
              <BulletListItem>
                <Code>ok</Code> – whether the dialog was confirmed (OK, Confirm, or non-cancel action).
              </BulletListItem>
              <BulletListItem>
                <Code>cancelled</Code> – whether the user dismissed the dialog (Cancel button, backdrop, escape).
              </BulletListItem>
              <BulletListItem>
                <Code>blocked</Code> – when an <Code>open()</Code> could not run because conflict policy blocked it
                (only on that call's promise; not a user dismiss).
              </BulletListItem>
              <BulletListItem>
                <Code>resolveValue</Code> – the value returned from the dialog.
              </BulletListItem>
            </BulletList>
            And when the reason is <Code>action</Code> (i.e. the dialog was closed by a button click), the{" "}
            <Code>DialogActionEvent</Code> will include the additional properties:
            <BulletList>
              <BulletListItem>
                <Code>action</Code> – the action that triggered the event.
              </BulletListItem>
              <BulletListItem>
                <Code>actionId</Code> – the specific action that triggered the event.
              </BulletListItem>
              <BulletListItem>
                <Code>buttonText</Code> – the text of the button that triggered the event.
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <CodeBlock>{ON_CLOSE_SNIPPET}</CodeBlock>
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]} />
          <DemoParagraph component="div">
            For finer control over the closing lifecycle, you can subscribe using the generic <Code>on("...")</Code>{" "}
            API:
            <BulletList>
              <BulletListItem>
                <Code>on("willClose")</Code> – fires synchronously before <Code>onClose</Code>.
              </BulletListItem>
              <BulletListItem>
                <Code>on("close")</Code> – an alias for <Code>onClose</Code>; fires asynchronously after{" "}
                <Code>willClose</Code>.
              </BulletListItem>
              <BulletListItem>
                <Code>on("didClose")</Code> – fires asynchronously after the dialog close animation completes (in the
                next tick after <Code>onClose</Code>).
              </BulletListItem>
              <BulletListItem>
                <Code>on("closePrevented")</Code> – fires when closing is blocked by the <Code>canClose()</Code> guard.
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <DemoSectionHeading subtitle="Try it out" />
          <DemoParagraph>
            Open the dialog and inspect the console to see the close payload. Try closing the dialog with <Key>Esc</Key>
            , a backdrop click, or by clicking a button.
          </DemoParagraph>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
