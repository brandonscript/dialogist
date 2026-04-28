"use client";

import { FlexBox } from "@mui-flexy/v7";
import { useDialogFlow } from "dialogist";
import { memo, useState } from "react";
import { TbBrandCitymapper } from "react-icons/tb";
import { Admonition } from "../common";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { InlineArrowRight } from "../common/InlineArrowRight";
import {
  BulletList,
  BulletListItem,
  Code,
  DemoParagraph,
  DemoSectionHeading,
  TextWithCode,
} from "../common/typography";

const CARD_TITLE = "Multi-step dialog flows";
const CARD_SUBHEADINGS = [
  "The useDialogFlow hook",
  "Flow next targets",
  "Conditional routing with resolveStep",
  "Lifecycle callbacks",
  "Updating step content with useDialogSlots",
];

const USE_DIALOG_FLOW_SNIPPET = `const { start } = useDialogFlow(["multi-step-flow"], {
  defaults: { ... }, // common dialog config
  steps: {
    // config for individual steps:
    "step-1": { ... },
    "step-2": { ... },
    "step-3": { ... },
    "another-step": { ... },
    "step-name-goes-here": { ... },
  },
});

const StartFlowButton = () => {
  return <Button onClick={() => start("step-1")}>Start flow</Button>;
};
`;

const NEXT_TARGETS_SNIPPET = `const { start } = useDialogFlow(["multi-step-flow"], {
  defaults: {
    cancel: { show: "always", label: "Cancel" },
  },
  steps: {
    "step-1": {
      title: "Step 1",
      message: "Welcome to the flow.",
      next: "step-2",
    },
    "step-2": {
      title: "Step 2",
      message: "Choose your path before the flow collapses...",
      next: ["step-3a", "step-3b"],
    },
    "step-3a": {
      title: "Step 3 (one)",
      message: "You chose the first path.",
      nextLabel: "Path one",
    },
    "step-3b": {
      title: "Step 3 (two)",
      message: "You chose the second path.",
      nextLabel: "Path two",
    },
  },
});

const StartFlowButton = () => {
  return <Button onClick={() => start("step-1")}>Start flow</Button>;
};
`;

const USE_DIALOG_SLOTS_SNIPPET = `
// by targeting the composite key, this will trigger 
// when step-1 is active/visible
useDialogSlots(["multi-step-flow", "step-1"], {
  // re-render content when dependencies change
  content: [
    () => <Step1Content title={title} message={message} />,
    [title, message, ...],
  ],
});

// only updates when step-2 is active/visible
useDialogSlots(["multi-step-flow", "step-2"], {
  content: [
    () => <Step2Content title={title} message={message} />,
    [title, message, ...],
  ],
});

`;

const FLOW_SNIPPET = `const checkoutDialogFlow: DialogFlowConfig = {
  defaults: {
    maxWidth: 460,
    minWidth: 360,
    actionsStyle: { gap: 3, intraGroupGap: 1 },
    cancel: {
      show: "always", // or ["step-name", "step-name", ...]
      label: "Cancel",
      props: {
        variant: "outlined",
      },
    },
    end: {
      label: "Confirm order",
    },
    onStep: ({ step, reason, dialogState }) => {
      // can be used to perform common actions on every step transition
      trackingService.trackStep({ step, reason, dialogState });
    },
  },
  steps: {
    cart: {
      title: "Review your cart",
      content: <CartSummary />,
      next: "shipping",
    },
    shipping: {
      title: "Shipping details",
      content: <ShippingForm />,
      // one "Next" button is implied for a single next target
      next: {
        step: "delivery",
        // you can conditionally enable or disable the next button
        // by returning true or false from the canProceed function
        canProceed: () => user?.hasShippingAddress,
      },
    },
    delivery: {
      title: "Choose delivery",
      content: <DeliveryOptions />,
      // branching flow: one next button per target
      next: [
        {
          step: "standard",
          label: "Standard",
        },
        {
          step: "express",
          label: "Express",
          // state exposed via useDialogImperativeHandle() is also passed 
          // automatically to canProceed functions
          canProceed: ({ dialogState }) => dialogState?.isAvailable,
        },
      ],
      // additional buttons can appear between Back and Next/Finish
      actions: [
        {
          id: "help",
          label: "Help",
          onClick: () => openShippingHelp(),
        },
      ],
    },
    standard: {
      title: "Standard delivery",
      content: <StandardDeliveryDetails />,
      next: "review",
    },
    express: {
      title: "Express delivery",
      content: <ExpressDeliveryDetails />,
      next: "review",
    },
    review: {
      title: "Review and confirm",
      content: <CheckoutReview />,
      // if no next is specified, Dialogist implies a "Finish" button.
      resolveStep: ({ reason, dialogState }) => {
        // override routing based on reason and dialog state; return:
        // - a step name to navigate to (e.g. "delivery")
        // - "start" to restart the flow from the beginning
        // - "back" to go back to the previous step
        // - "end" to explicitly finish the flow
        // - undefined to fall through to default routing
        //   (i.e. respect the configured "next" target, or end if none)
        if (reason === "end" && dialogState?.requiresApproval) {
          return "approval";
        }
      },
      onEnd: ({ step, prevStep }) => {
        trackCheckoutComplete({ step, prevStep });
      },
      onCancel: ({ step }) => {
        trackCheckoutAbandoned({ step });
      },
    },
    approval: {
      title: "Additional approval required",
      content: <ApprovalNotice />,
      next: {
        label: "Finish",
        canProceed: ({ dialogState }) => dialogState?.approvalGranted,
      },
      onBack: ({ prevStep }) => {
        console.log("Returning from approval to", prevStep);
      },
    },
  },
});

const { start } = useDialogFlow(["checkout", "flow"], checkoutDialogFlow);

const startFlow = async () => {
  // call or await the entrypoint step to start the flow
  return await start("cart"); // resolves when the flow ends
};

const CheckoutButton = () => {
  return <Button onClick={startFlow}>Checkout</Button>;
};
`;

export const MultipleDialogsCard = Object.assign(
  memo(function MultipleDialogsCard() {
    const [result, setResult] = useState<DialogResult | null>(null);

    const { start } = useDialogFlow(["multiple-dialogs", "flow"], {
      defaults: {
        maxWidth: 420,
        minWidth: 420,
        actionsStyle: { gap: 5, intraGroupGap: 1 },
        cancel: { show: "always", label: "Cancel" },
        end: { label: "Done" },
        onStep: ({ reason, step, prevStep }) => {
          let text = reason.charAt(0).toUpperCase() + reason.slice(1);
          text += prevStep ? ` (${step}, was ${prevStep})` : ` (${step})`;
          setResult({
            text,
            color: reason === "end" ? "success.main" : "info.main",
          });
        },
        onCancel: ({ step }) => {
          console.log("[demo] Cancelled at", step);
        },
        onEnd: ({ step, prevStep }) => {
          console.log("[demo] Flow finished at", step, "from", prevStep);
        },
      },
      steps: {
        "step-1": {
          title: "Step 1",
          message: "Welcome to the flow.",
          next: "step-2",
        },
        "step-2": {
          title: "Step 2",
          message: "Choose your path before the flow collapses...",
          next: ["step-3a", "step-3b"],
        },
        "step-3a": {
          title: "Step 3 (one)",
          message: "You chose the first path.",
          nextLabel: "Path one",
        },
        "step-3b": {
          title: "Step 3 (two)",
          message: "You chose the second path.",
          nextLabel: "Path two",
        },
      },
    });

    const handleStart = async () => {
      setResult(null);
      await start("step-1");
      console.log("[demo] Flow finished (awaited)");
    };

    return (
      <BaseDemoCard
        icon={withGenericOutlineIcon(TbBrandCitymapper)}
        title={CARD_TITLE}
        dialogKey="multiple-dialogs-*"
        description={
          <>
            Build multi-step dialog flows by defining steps and their transitions, with sequencing and lifecycle handled
            for you.
          </>
        }
        actions={[
          {
            label: "Start dialog flow",
            onClick: handleStart,
            icon: <TbBrandCitymapper />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          {/* The useDialogFlow hook */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]}>
            <TextWithCode text={CARD_SUBHEADINGS[0]} code="useDialogFlow" />
          </DemoSectionHeading>
          <DemoParagraph>
            <Code>useDialogFlow</Code> helps you orchestrate multi-step dialog flows. Instead of manually managing
            dialog state and chaining steps together, you can define a declarative flow configuration and let the hook
            handle sequencing, transitions, and lifecycle.
          </DemoParagraph>
          <DemoParagraph>
            It acts as a drop-in replacement for <Code>useDialog</Code>, adding step awareness, routing, and flow-level
            behavior on top of the same underlying dialog system:
          </DemoParagraph>
          <CodeBlock>{USE_DIALOG_FLOW_SNIPPET}</CodeBlock>
          {/* Flow next targets */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[1]}>
            <TextWithCode text={CARD_SUBHEADINGS[1]} code="next" />
          </DemoSectionHeading>
          <DemoParagraph>
            Each step is defined by its own configuration object, keyed by a unique step name. A step typically includes
            properties like <Code>title</Code>, <Code>content</Code>, and a <Code>next</Code> target.
          </DemoParagraph>
          <DemoParagraph component="div">
            The <Code>next</Code> property controls how the flow advances. It can be:
            <BulletList>
              <BulletListItem>
                a step name (<Code>string</Code>)
              </BulletListItem>
              <BulletListItem>
                a <Code>FlowStepNextTarget</Code> object
              </BulletListItem>
              <BulletListItem>or an array of either to support branching flows</BulletListItem>
            </BulletList>
            A single <Code>next</Code> target creates a "Next" button automatically. An array of targets creates one
            button per option. If no <Code>next</Code> is specified, the step is treated as a final step and a "Finish"
            button is shown automatically.
          </DemoParagraph>
          <DemoParagraph>
            A <Code>canProceed</Code> callback can be defined on a <Code>next</Code> target to conditionally enable or
            disable each <Code>next</Code> button. Return <Code>true</Code> to enable the button, or
            <Code>false</Code> to disable it.
          </DemoParagraph>
          <DemoParagraph>
            Dialogist will also generate a "Back" button when appropriate, and a "Cancel" button can be enabled globally
            via <Code>defaults</Code>.
          </DemoParagraph>
          <Admonition variant="important">
            If an invalid step name is specified, it will be treated as if no <Code>next</Code> target was configured —
            the flow will end and the dialog will be closed.
          </Admonition>
          <CodeBlock>{NEXT_TARGETS_SNIPPET}</CodeBlock>
          {/* Conditional routing with resolveStep */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[2]}>
            <TextWithCode text={CARD_SUBHEADINGS[2]} code="resolveStep" />
          </DemoSectionHeading>
          <DemoParagraph>
            While <Code>next</Code> defines the default flow, it cannot handle conditional routing. For dynamic
            behavior, use the resolveStep callback.
          </DemoParagraph>
          <DemoParagraph>
            <Code>resolveStep</Code> is called whenever a step attempts to transition. It receives the current step
            context, the navigation reason (<Code>"next"</Code>, <Code>"back"</Code>, <Code>"cancel"</Code>, or{" "}
            <Code>"end"</Code>), and the current
            <Code>dialogState</Code>.
          </DemoParagraph>
          <DemoParagraph component="div">
            If resolveStep returns a value, it overrides the default behavior:
            <BulletList>
              <BulletListItem>
                a valid step name <InlineArrowRight /> navigate to that step
              </BulletListItem>
              <BulletListItem>
                <Code>"back"</Code> <InlineArrowRight /> go back to the previous step
              </BulletListItem>
              <BulletListItem>
                <Code>"start"</Code> <InlineArrowRight /> restart the flow from the beginning
              </BulletListItem>
              <BulletListItem>
                <Code>"end"</Code> <InlineArrowRight /> finish the flow and close the dialog
              </BulletListItem>
            </BulletList>
            Omitting a return value (or returning anything other than a known step name) will fall through to default
            routing: it respects the configured <Code>next</Code> value if one is configured, or ends the flow.
          </DemoParagraph>
          {/* Lifecycle callbacks */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[3]} />
          <DemoParagraph>
            <Code>useDialogFlow</Code> exposes lifecycle callbacks to observe and react to flow transitions. These can
            be defined in <Code>defaults</Code> (applied to all steps in this flow), or per-step. If defined in both
            defaults and a step, both callbacks will be called.
          </DemoParagraph>
          <DemoParagraph component="div">
            Use these callbacks for side effects like analytics, logging, or external state updates — not for routing
            (which should be handled by <Code>resolveStep</Code>).
            <BulletList>
              <BulletListItem>
                Transition callbacks (<Code>onNext</Code>, <Code>onBack</Code>, <Code>onCancel</Code>,{" "}
                <Code>onEnd</Code>) fire based on how the user navigates between steps.
              </BulletListItem>
              <BulletListItem>
                The <Code>onStep</Code> callback runs on every transition, regardless of direction.
              </BulletListItem>
            </BulletList>
            Each handler receives a <Code>FlowStepEvent</Code> containing the current <Code>step</Code>, the{" "}
            <Code>prevStep</Code>, the transition <Code>reason</Code>, and any <Code>dialogState</Code>.
          </DemoParagraph>
          <DemoParagraph>
            Here's a complete example of a multi-step flow with conditional routing, lifecycle callbacks, and reactive
            step content:
          </DemoParagraph>
          <CodeBlock>{FLOW_SNIPPET}</CodeBlock>
          {/* Updating step content with useDialogSlots */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[4]}>
            <TextWithCode text={CARD_SUBHEADINGS[4]} code="useDialogSlots" />
          </DemoSectionHeading>
          <DemoParagraph>
            Like singular dialogs, flow steps are static by default. This keeps the flow config easy to reason about,
            but it also means step content does not automatically update when state changes.
          </DemoParagraph>
          <DemoParagraph>
            Multi-step dialogs use a composite key that includes the step name, so you can target a specific step by
            passing <Code>[dialogKey, stepName]</Code> to <Code>useDialogSlots</Code>. Slot updates are only applied
            when that step is active/visible:
          </DemoParagraph>
          <CodeBlock>{USE_DIALOG_SLOTS_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
