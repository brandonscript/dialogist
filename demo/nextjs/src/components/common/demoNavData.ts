import type { ComponentType } from "react";

import { AlertDialogCard } from "../1_getting_started/1.1_AlertDialogCard";
import { ConfirmationDialogCard } from "../1_getting_started/1.2_ConfirmationDialogCard";
import { AsyncConfirmationDialogCard } from "../1_getting_started/1.3_AsyncDialogCard";
import { DialogConfigurationCard } from "../1_getting_started/1.4_DialogConfigCard";
import { BuiltinActionsCard } from "../2_actions_results/2.1_BuiltinActionsCard";
import { CustomActionsCard } from "../2_actions_results/2.2_CustomActionsCard";
import { ActionGroupsCard } from "../2_actions_results/2.3_ActionGroupsCard";
import { ActionEventsCard } from "../2_actions_results/2.4_ActionEventsCard";
import { DialogActionEventPayloadCard } from "../2_actions_results/2.5_DialogActionEventPayloadCard";
import { CloseHandlingCard } from "../3_closing_dialogs/3.1_CloseHandlingCard";
import { DialogCloseEventCard } from "../3_closing_dialogs/3.2_DialogCloseEventPayloadCard";
import { PreventingDialogsFromClosingCard } from "../3_closing_dialogs/3.3_PreventingDialogsFromClosingCard";
import { AligningContentCard } from "../4_layout_presentation/4.1_AligningContentCard";
import { StatusBarFooterDialogCard } from "../4_layout_presentation/4.2_StatusBarFooterCard";
import { CustomComponentsDialogCard } from "../4_layout_presentation/4.3_CustomComponentsCard";
import { UsingReactiveSlotHooksCard } from "../5_updating_dialog_content/5.1_UsingReactiveSlotHooksCard";
import { UsingImperativeSettersCard } from "../5_updating_dialog_content/5.2_UsingImperativeSettersCard";
import { UsingReplaceIfOpenCard } from "../5_updating_dialog_content/5.3_ReplacingOpenDialogsCard";
import { UnderstandingDialogSlotsCard } from "../5_updating_dialog_content/5.4_UnderstandingDialogSlotsCard";
import { ExposingDialogStateCard } from "../6_dialog_state_data_flow/6.1_ExposingDialogStateCard";
import { TwoWayStateSyncCard } from "../6_dialog_state_data_flow/6.2_TwoWayStateSyncCard";
import { HighFrequencyStateSyncCard } from "../6_dialog_state_data_flow/6.3_HighFrequencyStateSyncCard";
import { TextInputDebounceCard } from "../6_dialog_state_data_flow/6.4_TextInputDebounceCard";
import { StreamingDataCard } from "../6_dialog_state_data_flow/6.5_StreamingDataCard";
import { ReactContextCard } from "../7_data_providers/7.1_ReactContextCard";
import { ReactQueryCard } from "../7_data_providers/7.2_ReactQueryCard";
import { JotaiCard } from "../7_data_providers/7.3_JotaiCard";
import { RTKCard } from "../7_data_providers/7.4_RTKCard";
import { ZustandCard } from "../7_data_providers/7.5_ZustandCard";
import { MultipleDialogsCard } from "../8_dialog_orchestration/8.1_MultiStepDialogFlowsCard";
import { DialogConflictDemoCard } from "../8_dialog_orchestration/8.2_HandlingOpenConflictsCard";
import { SyncingHandlersAcrossComponentsCard } from "../8_dialog_orchestration/8.3_SyncingHandlersAcrossComponentsCard";
import { ListVirtualizationCard } from "../8_dialog_orchestration/8.4_ListVirtualizationCard";
import { toSlug } from "./demoNavUtils";

export {
  buildDemoPath,
  getCardElementId,
  getCategoryElementId,
  getElementScrollTop,
  getSubHeadingElementId,
  SUBNAV_WIDTH,
  toSlug,
} from "./demoNavUtils";

export type DemoCardComponent = ComponentType & {
  cardTitle?: string;
  cardSubHeadings?: DemoSubHeading[];
};

export interface DemoSubHeading {
  name: string;
  /** URL fragment segment; defaults to {@link toSlug} of `name`. */
  slug?: string;
}

export interface DemoCard {
  /** Falls back to `component.cardTitle` when omitted. */
  name?: string;
  component: DemoCardComponent;
  /** URL path segment under the section; defaults to {@link toSlug} of the card display name. */
  slug?: string;
  /** Override subsections; falls back to `component.cardSubHeadings` when omitted. */
  subHeadings?: DemoSubHeading[];
}

/** Returns the display name for a card, preferring the explicit `name` then `component.cardTitle`. */
export const getCardName = (card: DemoCard): string => {
  return card.name ?? card.component.cardTitle ?? "";
};

/** URL segment for the card within its section. */
export const getCardSlug = (card: DemoCard): string => {
  return card.slug ?? toSlug(getCardName(card));
};

/** URL fragment segment for a subsection. */
export const getSubHeadingSlug = (sub: DemoSubHeading): string => {
  return sub.slug ?? toSlug(sub.name);
};

/** Label matched by DemoSectionHeading subtitle; kept out of the side sub-nav only. */
export const SUB_HEADING_HIDDEN_FROM_NAV = "Try it out";

/** Returns subsections for a card, preferring explicit `subHeadings` then `component.cardSubHeadings`. */
export const getSubHeadings = (card: DemoCard): DemoSubHeading[] => {
  return card.subHeadings ?? card.component.cardSubHeadings ?? [];
};

/** Sub-nav list: same as {@link getSubHeadings} but omits {@link SUB_HEADING_HIDDEN_FROM_NAV}. */
export const getSubHeadingsForNav = (card: DemoCard): DemoSubHeading[] => {
  return getSubHeadings(card).filter((sub) => sub.name !== SUB_HEADING_HIDDEN_FROM_NAV);
};

export interface DemoSection {
  category: string;
  /** URL path segment for this section (e.g. `getting-started`). */
  sectionSlug: string;
  label: string;
  tabLabel: string;
  cards: DemoCard[];
}

const demoCard = (name: string, component: DemoCardComponent): DemoCard => {
  return { name, component };
};

export const DEMO_REGISTRY: DemoSection[] = [
  {
    category: "Getting started",
    sectionSlug: "getting-started",
    label: "Getting started",
    tabLabel: "getting started",
    cards: [
      demoCard("Alert dialog", AlertDialogCard),
      demoCard("Confirmation dialog", ConfirmationDialogCard),
      demoCard("Async dialogs", AsyncConfirmationDialogCard),
      demoCard("Dialog configuration", DialogConfigurationCard),
    ],
  },
  {
    category: "Actions & results",
    sectionSlug: "actions-and-results",
    label: "Actions & results",
    tabLabel: "actions & results",
    cards: [
      demoCard("Built-in actions", BuiltinActionsCard),
      demoCard("Custom actions", CustomActionsCard),
      demoCard("Action groups", ActionGroupsCard),
      demoCard("Action events", ActionEventsCard),
      demoCard("DialogActionEvent payload", DialogActionEventPayloadCard),
    ],
  },
  {
    category: "Closing dialogs",
    sectionSlug: "closing-dialogs",
    label: "Closing dialogs",
    tabLabel: "closing dialogs",
    cards: [
      demoCard("Ways to close dialogs", CloseHandlingCard),
      demoCard("DialogCloseEvent payload", DialogCloseEventCard),
      demoCard("Preventing dialogs from closing", PreventingDialogsFromClosingCard),
    ],
  },
  {
    category: "Layout & presentation",
    sectionSlug: "layout-and-presentation",
    label: "Layout & presentation",
    tabLabel: "layout & presentation",
    cards: [
      demoCard("Aligning content", AligningContentCard),
      demoCard("Status bar & footer", StatusBarFooterDialogCard),
      demoCard("Using custom components", CustomComponentsDialogCard),
    ],
  },
  {
    category: "Updating dialog content",
    sectionSlug: "updating-dialog-content",
    label: "Updating dialog content",
    tabLabel: "updating dialog content",
    cards: [
      demoCard("Using reactive slot hooks", UsingReactiveSlotHooksCard),
      demoCard("Using imperative setters", UsingImperativeSettersCard),
      demoCard("Replacing open dialogs", UsingReplaceIfOpenCard),
      demoCard("Understanding dialog slots", UnderstandingDialogSlotsCard),
    ],
  },
  {
    category: "Dialog state & data flow",
    sectionSlug: "dialog-state-and-data-flow",
    label: "Dialog state & data flow",
    tabLabel: "dialog state & data flow",
    cards: [
      demoCard("Exposing dialog state imperatively", ExposingDialogStateCard),
      demoCard("Two-way state sync", TwoWayStateSyncCard),
      demoCard("High-frequency state sync", HighFrequencyStateSyncCard),
      demoCard("Debouncing external updates", TextInputDebounceCard),
      demoCard("Streaming data in dialogs", StreamingDataCard),
    ],
  },
  {
    category: "Data providers",
    sectionSlug: "data-providers",
    label: "Data providers",
    tabLabel: "data providers",
    cards: [
      demoCard("Using React context", ReactContextCard),
      demoCard("Using React Query", ReactQueryCard),
      demoCard("Using Jotai", JotaiCard),
      demoCard("Using Redux Toolkit (RTK)", RTKCard),
      demoCard("Using Zustand", ZustandCard),
    ],
  },
  {
    category: "Dialog orchestration",
    sectionSlug: "dialog-orchestration",
    label: "Dialog orchestration",
    tabLabel: "dialog orchestration",
    cards: [
      demoCard("Multi-step dialog flows", MultipleDialogsCard),
      demoCard("Handling open conflicts", DialogConflictDemoCard),
      demoCard("Syncing handlers across components", SyncingHandlersAcrossComponentsCard),
      demoCard("List virtualization", ListVirtualizationCard),
    ],
  },
];

const validateDemoRegistry = (): void => {
  const sectionSlugs = new Set<string>();
  const composite = new Set<string>();
  for (const section of DEMO_REGISTRY) {
    if (sectionSlugs.has(section.sectionSlug)) {
      throw new Error(`Duplicate demo sectionSlug: ${section.sectionSlug}`);
    }
    sectionSlugs.add(section.sectionSlug);
    for (const card of section.cards) {
      const key = `${section.sectionSlug}/${getCardSlug(card)}`;
      if (composite.has(key)) {
        throw new Error(`Duplicate demo section/card slug pair: ${key}`);
      }
      composite.add(key);
    }
  }
};

if (process.env.NODE_ENV !== "production") {
  validateDemoRegistry();
}

export const findSectionBySlug = (sectionSlug: string): DemoSection | undefined => {
  return DEMO_REGISTRY.find((s) => s.sectionSlug === sectionSlug);
};

export const findCardBySlugs = (
  sectionSlug: string,
  cardSlug: string,
): { section: DemoSection; card: DemoCard } | undefined => {
  const section = findSectionBySlug(sectionSlug);
  if (!section) return undefined;
  const card = section.cards.find((c) => getCardSlug(c) === cardSlug);
  if (!card) return undefined;
  return { section, card };
};

/** In sidebar order: every card's route for scroll-spy and routing. */
export const getAllCardRoutes = (): { sectionSlug: string; cardSlug: string }[] => {
  return DEMO_REGISTRY.flatMap((section) =>
    section.cards.map((card) => ({ sectionSlug: section.sectionSlug, cardSlug: getCardSlug(card) })),
  );
};
