"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { LuX } from "react-icons/lu";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading, Key, TextWithCode } from "../common/typography";

const CARD_TITLE = "Ways to close dialogs";

const CARD_SUBHEADINGS = [
  "Action clicks",
  "Esc key and backdrop clicks",
  "Using dialog.close()",
  "Using dialog.replace()",
] as const;

const ACTION_CLICK_SNIPPET = `
const handleClose = (event: DialogCloseEvent) => {
  switch (event.reason) {
    case "action":
      // you can safely cast the event to DialogActionEvent:
      console.log("Dialog closed by action button");
      break;
    case "escape":
      console.log("Dialog closed by Esc or backdrop click");
      break;
    // ...etc.
  }
};

// use the onClose callback:
dialog.open({ type: "alert", message: "Processing…" }, { onClose: handleClose });

// or use async/await:
const event = await dialog.open({ type: "alert", message: "Processing…" });
handleClose(event);
`;

const ESC_BACKDROP_SNIPPET = `
const [showDialog, setShowDialog] = useState(false);
const { open } = useDialog("processing-dialog");

const handleClose = (event: DialogCloseEvent) => {
  if (event.reason === "backdrop" || event.reason === "escape") {
    console.log("Dialog closed by Esc or backdrop click");
  }
};

useEffect(() => {
  if (!showDialog) return;

  // handle the onClose callback:
  open({ type: "alert", message: "Processing…" }, { onClose: handleClose });

  // or use async/await:
  (async () => {
    const event = await open({ type: "alert", message: "Processing…" });
    handleClose(event);
  })();
}, [open, showDialog, handleClose]);
`;

const PROGRAMMATIC_SNIPPET = `
const [isProcessing, setIsProcessing] = useState(false);
const { open, close, isOpen } = useDialog("processing-dialog");

useEffect(() => {
  if (isProcessing && !isOpen) {
    open({ type: "alert", message: "Processing…" });
  } else if (!isProcessing && isOpen) {
    close();
  }
}, [isProcessing, open, close, isOpen]);`;

const REPLACE_SNIPPET = `
const [isProcessing, setIsProcessing] = useState(false);
const { open, replace } = useDialog("processing-dialog");

useEffect(() => {
  if (isProcessing) {
    open({ type: "alert", message: "Processing…" });
  } else {
    replace({ 
      type: "confirm",
      message: "Done processing. Do you want to see the results?",
    });
  }
}, [open, replace, isProcessing]);`;

export const CloseHandlingCard = Object.assign(
  memo(function CloseHandlingCard() {
    return (
      <BaseDemoCard
        icon={withGenericOutlineIcon(LuX)}
        title={CARD_TITLE}
        description={
          <>
            Dialogs can be closed in other ways too, like when the user clicks outside the dialog or presses the{" "}
            <Key>Esc</Key> key.
          </>
        }
      >
        <FlexBox column gap={2.5} mt={1.5}>
          <FlexBox column gap={1}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]} />
            <DemoParagraph>
              Built-in or custom actions resolve the dialog because the user clicked a button. This results in a{" "}
              <Code>DialogActionEvent</Code> event (see the previous section in <strong>Actions & results</strong> for
              more details). In addition to the named <Code>onOkClick</Code> and <Code>onCancelClick</Code> callbacks,
              you can also use the generic <Code>onClose</Code> callback to handle all close events. The two-argument{" "}
              <Code>{`open({ … }, { onClose })`}</Code> form merges the second object into the first (same as a single
              merged config).
            </DemoParagraph>
            <CodeBlock>{ACTION_CLICK_SNIPPET}</CodeBlock>
          </FlexBox>

          <FlexBox column gap={1}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[1]} />
            <DemoParagraph>
              If the user clicks outside the dialog or presses the <Key>Esc</Key> key, the dialog will close, and a{" "}
              <Code>DialogCloseEvent</Code> will be passed to the <Code>onClose</Code> callback or async/await event
              with the <Code>reason</Code> set to <Code>backdrop</Code> or <Code>escape</Code> respectively.
            </DemoParagraph>
            <CodeBlock>{ESC_BACKDROP_SNIPPET}</CodeBlock>
          </FlexBox>

          <FlexBox column gap={1}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[2]}>
              <TextWithCode text={CARD_SUBHEADINGS[2]} code="dialog.close()" />
            </DemoSectionHeading>
            <DemoParagraph>
              If you need to programmatically close the dialog (i.e., without the user clicking a button), call{" "}
              <Code>dialog.close()</Code>.
            </DemoParagraph>
            <CodeBlock>{PROGRAMMATIC_SNIPPET}</CodeBlock>
            <DemoParagraph>
              You can do this from any component in the tree, as long as it uses the same key you passed when opening
              the dialog.
            </DemoParagraph>
          </FlexBox>

          <FlexBox column gap={1}>
            <DemoSectionHeading subtitle={CARD_SUBHEADINGS[3]}>
              <TextWithCode text={CARD_SUBHEADINGS[3]} code="dialog.replace()" />
            </DemoSectionHeading>
            <DemoParagraph>
              To swap the current dialog in-place for a new one (without leaving the overlay), call{" "}
              <Code>dialog.replace()</Code>. The new dialog will seamlessly replace the current one, and the previous
              dialog will be closed.
            </DemoParagraph>
            <CodeBlock>{REPLACE_SNIPPET}</CodeBlock>
          </FlexBox>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
