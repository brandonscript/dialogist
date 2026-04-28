"use client";

import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { PiHammerDuotone } from "react-icons/pi";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph } from "../common/typography";

const CARD_TITLE = "Using imperative setters";

const IMPERATIVE_UPDATE_SNIPPET = `
const [isLoading, setIsLoading] = useState(false);
const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

const dialog = useDialog(DIALOG_KEY);

dialog.open({
  type: "confirm",
  statusBar: <StatusBar isLoading={true} />,
  footer: <Footer lastSavedAt={null} />,
});

useEffect(() => {
  dialog.setTitle(isLoading ? "Loading..." : "Save your work?");
  dialog.setContent(<Body text={dialogMessage} />);
  // explicitly only observe isLoading and dialogMessage changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoading, dialogMessage]);

useEffect(() => {
  dialog.setStatusBar(<StatusBar isLoading={isLoading} />);
  // explicitly only observe isLoading changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoading]);

useEffect(() => {
  dialog.setFooter(<Footer lastSavedAt={lastSavedAt} />);
  // explicitly only observe lastSavedAt changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastSavedAt]);
`;

export const UsingImperativeSettersCard = Object.assign(
  memo(function UsingImperativeSettersCard() {
    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiHammerDuotone)}
        title={CARD_TITLE}
        description={
          <>
            Imperative setters can be used to update parts of an open dialog without re-calling <Code>open()</Code>.
          </>
        }
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph component="div">
            Use imperative setters when updates come from effects, async tasks, subscriptions, or event handlers and you
            need precise control over when each part updates.
            <Admonition variant="tip" sx={{ my: 2 }}>
              Unlike reactive slots, imperative setters push updates manually. For state-driven updates, prefer{" "}
              <strong>reactive slots</strong> instead.
            </Admonition>
            <BulletList>
              <BulletListItem>
                <Code>setTitle</Code> — update the title (plain text / string only).
              </BulletListItem>
              <BulletListItem>
                <Code>setContent</Code> — update the main content area (a.k.a. body or message).
              </BulletListItem>
              <BulletListItem>
                <Code>setStatusBar</Code> — update the status bar.
              </BulletListItem>
              <BulletListItem>
                <Code>setFooter</Code> — update the footer.
              </BulletListItem>
              <BulletListItem>
                <Code>setProps</Code> — merge a partial <strong>dialog config</strong> (same shape as{" "}
                <Code>open(...config)</Code>) into the current dialog.
              </BulletListItem>
              <BulletListItem>
                <Code>setImperativeHandle</Code> — register a ref so dialog content can expose an imperative API to the
                parent (via <Code>useDialogImperativeHandle</Code> / <Code>useDialogImperativeValue</Code>).
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <Admonition variant="important" sx={{ mb: 1 }}>
            Don't observe dialog-owned state <Code>useEffect</Code> dependencies, or it will cause an infinite loop.
          </Admonition>
          <CodeBlock language="tsx">{IMPERATIVE_UPDATE_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  { cardTitle: CARD_TITLE },
);
