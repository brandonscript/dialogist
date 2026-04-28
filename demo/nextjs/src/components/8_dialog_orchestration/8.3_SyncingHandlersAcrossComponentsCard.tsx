"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { LuGitCompareArrows } from "react-icons/lu";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const CARD_TITLE = "Syncing handlers across components";

const HANDLERS_SNIPPET = `import {
  useDialogActionsContext,
  useDialogHandlers,
} from "dialogist";

const DIALOG_KEY = "save-reminder";

// component that owns the state + behavior
const HandleUnsavedChangesForm = () => {
  const [isSaved, setIsSaved] = useState(false);

  const { ownerToken } = useDialogHandlers(DIALOG_KEY, {
    canClose: () => isSaved,
    onClose: (event) => {
      console.log("closed", event.reason);
    },
  });

  // pass token up / out however your app shares it
  return <SaveButton ownerToken={ownerToken} onSave={() => setIsSaved(true)} />;
};

interface SaveButtonProps {
  ownerToken: symbol;
  onSave: () => void;
}

// component that opens the dialog
const SaveButton = ({ ownerToken, onSave }: SaveButtonProps) => {
  const { openDialog } = useDialogActionsContext();

  return (
    <Button
      onClick={() => {
        void openDialog({
          dialogKey: DIALOG_KEY,
          type: "confirm",
          title: "Unsaved changes",
          message: "Save before leaving?",
          onConflict: "replaceSameKey",
          ownerToken,
        });
      }}
    >
      Open dialog
    </Button>
  );
};`;

export const SyncingHandlersAcrossComponentsCard = Object.assign(
  memo(function SyncingHandlersAcrossComponentsCard() {
    return (
      <BaseDemoCard
        icon={withGenericOutlineIcon(LuGitCompareArrows)}
        title={CARD_TITLE}
        description={
          <>
            Keep dialog handlers in sync with React state when dialogs are opened from <em>outside</em> the component
            that owns that state.
          </>
        }
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            When you open dialogs through <Code>useDialog</Code>, handlers like <Code>canClose</Code> and{" "}
            <Code>onClose</Code> stay in sync automatically — they update on every render.
          </DemoParagraph>
          <DemoParagraph>
            But when a dialog is opened from elsewhere (i.e. <em>outside the component</em> that owns its state), those
            handlers can become stale — they only know about the state as it was at the time the dialog was opened.
          </DemoParagraph>
          <DemoParagraph>
            <Code>useDialogHandlers()</Code> solves this by letting the component that <em>owns</em> the state stay in
            control. It registers reactive handlers that continue updating over time, even if something else triggered
            the open.
          </DemoParagraph>
          <DemoSectionHeading>When to use it?</DemoSectionHeading>
          <DemoParagraph>Most of the time, you probably don't need to.</DemoParagraph>
          <DemoParagraph component="div">
            But when a dialog is opened from one place, while its config and behavior depend on React state in another
            component — that's when <Code>useDialogHandlers()</Code> becomes useful. Some examples:
            <BulletList pb={0}>
              <BulletListItem>
                A dialog is opened from <strong>outside the component</strong> that owns its state (e.g. via context, a
                store, or a global action), while its handlers still depend on React state in another component.
              </BulletListItem>
              <BulletListItem>
                A <strong>router or navigation hook</strong> triggers the open (e.g. "unsaved changes — leave?"), while
                the form state lives elsewhere.
              </BulletListItem>
              <BulletListItem>
                A dialog action needs to call a function that only exists in a <strong>child component</strong>.
              </BulletListItem>
              <BulletListItem>
                A <strong>background or application event</strong> opens the dialog, but a mounted component still needs
                to control how it behaves.
              </BulletListItem>
              <BulletListItem>
                A <strong>shared toolbar</strong> opens a confirmation dialog, but the actual handler (e.g. delete row)
                belongs to the currently selected item.
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <DemoSectionHeading>How it works</DemoSectionHeading>
          <DemoParagraph>
            <Code>useDialogHandlers()</Code> returns an <Code>ownerToken</Code> that must be passed when opening the
            dialog. This establishes ownership — it tells Dialogist which component is responsible for providing and
            updating the dialog's handlers over time.
          </DemoParagraph>
          <DemoParagraph>
            If multiple parts of your app could register handlers for the same dialog, the <Code>ownerToken</Code>{" "}
            ensures only one source of truth controls its behavior.
          </DemoParagraph>
          <Admonition variant="important" sx={{ mb: 0 }}>
            Only one <Code>ownerToken</Code> should control handler updates for an open dialog at a time. If more than
            one place might register handlers for the same key, be thoughtful about how you implement your token logic
            so the desired component/instance wins.
          </Admonition>
          <DemoSectionHeading subtitle="Try it out" mt={2} />
          <CodeBlock language="tsx">{HANDLERS_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
