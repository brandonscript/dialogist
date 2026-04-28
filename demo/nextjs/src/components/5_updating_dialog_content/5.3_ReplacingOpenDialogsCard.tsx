"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { LuReplace } from "react-icons/lu";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const CARD_TITLE = "Replacing open dialogs";

const Icon = withGenericFillIcon(LuReplace, { accent: "rect-last" });

const REPLACE_ON_ACTIVE_SNIPPET = `
const EditEntityDialogButton = ({ entityId }: { entityId: string }) => {
  const DIALOG_KEY = "edit-entity-dialog";
  const { open } = useDialog(DIALOG_KEY);

  // clicking "Edit" for a different entity replaces the currently 
  // open dialog with a new one for the new entityId
  const handleClick = () => {
    open({
      type: "confirm",
      title: \`Edit entity \${entityId}\`,
      message: <EntityEditor entityId={entityId} />,
      statusBar: <StatusBar entityId={entityId} />,
      footer: <Footer entityId={entityId} />,
      onConflict: "replaceSameKey",
    });
  };

  return (
    <Button onClick={handleClick}>
      Edit
    </Button>
  );
};`;

export const UsingReplaceIfOpenCard = Object.assign(
  memo(function UsingReplaceIfOpenCard() {
    return (
      <BaseDemoCard
        icon={Icon}
        title={CARD_TITLE}
        description={
          <>
            You can re-open or refresh the active dialog with <Code>onConflict</Code> even if its config is unchanged.
          </>
        }
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            By default, calling <Code>open()</Code> on a dialog that is <em>already</em> open will be blocked. But you
            can set <Code>onConflict</Code> to <Code>&quot;replaceSameKey&quot;</Code>, which allows the active dialog
            to be replaced with the latest config from <Code>useDialog()</Code> or <Code>open()</Code>.
          </DemoParagraph>
          <DemoParagraph>
            This can be useful when the dialog's structure changes significantly or needs a full reset, but though
            Dialogist does its best to merge changes, it is usually less efficient than reactive slots or imperative
            setters.
          </DemoParagraph>
          <Admonition variant="important">
            Avoid triggering replacement from state changes caused by opening the dialog itself. E.g. in the code below,
            if you include <Code>isOpen</Code> in the <Code>useEffect</Code> dependencies, it will re-open the dialog
            every time it opens and closes.
          </Admonition>
          <CodeBlock language="tsx">{REPLACE_ON_ACTIVE_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
