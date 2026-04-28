"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { PiSpinnerBallDuotone } from "react-icons/pi";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph } from "../common/typography";

const CARD_TITLE = "Using reactive slot hooks";

const REACTIVE_SLOTS_SNIPPET = `
const DIALOG_KEY = "reactive-slots-demo";
const [isLoading, setIsLoading] = useState(false);
const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

const dialog = useDialog(DIALOG_KEY);

dialog.open({
  type: "confirm",
  message: "Processing your request.",
});

useDialogContent(DIALOG_KEY, 
  () => <Body text={dialogMessage} />,
  [dialogMessage], // "observe" dialogMessage changes
);
useDialogStatusBar(DIALOG_KEY,
  () => <StatusBar isLoading={isLoading} />,
  [isLoading], // "observe" isLoading changes
);
useDialogFooter(DIALOG_KEY,
  () => <Footer lastSavedAt={lastSavedAt} />,
  [lastSavedAt], // "observe" lastSavedAt changes
);
`;

const REACTIVE_SLOTS_SNIPPET_2 = `// or register multiple slots together with useDialogSlots
useDialogSlots(DIALOG_KEY, {
  content: [() => <Body text={dialogMessage} />, [dialogMessage]],
  statusBar: [() => <StatusBar isLoading={isLoading} />, [isLoading]],
  footer: [() => <Footer lastSavedAt={lastSavedAt} />, [lastSavedAt]],
});
`;

export const UsingReactiveSlotHooksCard = Object.assign(
  memo(function UsingReactiveSlotHooksCard() {
    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiSpinnerBallDuotone)}
        title={CARD_TITLE}
        description={<>Reactive slots keep individual parts of a dialog in sync with state automatically.</>}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            A <em>slot</em> is an isolated part of the dialog — like <Code>content</Code>, <Code>statusBar</Code>,{" "}
            <Code>footer</Code>, or <Code>actions</Code>. Each slot updates independently, so changing one part of the
            dialog doesn&apos;t re-render the others. This keeps updates predictable and avoids unnecessary re-renders.
          </DemoParagraph>
          <DemoParagraph component="div">
            Dialogist exposes hooks that let you register a render function and a dependency array for each slot. When a
            value in the dependency array changes, that slot re-renders automatically. Similar to <Code>useEffect</Code>
            , each slot "observes" the values in its dependency array:
            <BulletList>
              <BulletListItem>
                Use <Code>useDialogContent</Code> to update the dialog's content.
              </BulletListItem>
              <BulletListItem>
                Use <Code>useDialogStatusBar</Code> to update the status bar.
              </BulletListItem>
              <BulletListItem>
                Use <Code>useDialogFooter</Code> to update the footer.
              </BulletListItem>
              <BulletListItem>
                Or use <Code>useDialogSlots</Code> to register multiple slots together.
              </BulletListItem>
            </BulletList>
            <Admonition variant="tip">
              These hooks can be used to update the active dialog from anywhere in your component tree as long as the
              dialog key is the same.
            </Admonition>
          </DemoParagraph>
          <CodeBlock language="tsx">{REACTIVE_SLOTS_SNIPPET}</CodeBlock>
          <CodeBlock language="tsx">{REACTIVE_SLOTS_SNIPPET_2}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);
