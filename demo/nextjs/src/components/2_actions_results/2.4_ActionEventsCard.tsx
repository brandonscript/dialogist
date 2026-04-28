"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { PiLightningDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const CARD_TITLE = "Action events";

const CARD_SUBHEADINGS = ["Handle button clicks with callbacks", "Handle button clicks with async/await"] as const;

const CALLBACKS_SNIPPET = `dialog.open({
  type: "confirm",
  onOkClick: () => {
    // user confirmed
  },
  onCancelClick: () => {
    // user cancelled
  },
});`;

const ASYNC_CALLBACKS_SNIPPET = `const event = await dialog.open({ type: "confirm" });

if (event.ok) {
  // user confirmed
} else if (event.blocked) {
  // a conflicting open() was blocked by conflict policy (not a button dismiss)
} else {
  // user cancelled (Cancel, backdrop, or escape)
}
`;

export const ActionEventsCard = Object.assign(
  memo(function ActionEventsCard() {
    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiLightningDuotone)}
        title={CARD_TITLE}
        description="Action events fire when a user clicks a dialog button."
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]} />
          <DemoParagraph>
            <Code>onOkClick</Code> fires when the user clicks the primary button, and <Code>onCancelClick</Code> fires
            for the secondary button. Both are optional.
          </DemoParagraph>
          <CodeBlock>{CALLBACKS_SNIPPET}</CodeBlock>
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[1]} />
          <DemoParagraph>
            You can also use async/await to handle button clicks. Use <Code>event.ok</Code> to check whether the user
            confirmed, <Code>event.cancelled</Code> for a dismiss, and <Code>event.blocked</Code> when a conflicting{" "}
            <Code>open()</Code> was blocked without throwing.
          </DemoParagraph>
          <DemoParagraph>
            This event, a <Code>DialogCloseEvent</Code>, is covered in more detail in the{" "}
            <strong>Closing dialogs</strong> section below.
          </DemoParagraph>
          <CodeBlock>{ASYNC_CALLBACKS_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
