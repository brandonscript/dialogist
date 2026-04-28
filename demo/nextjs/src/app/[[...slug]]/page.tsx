import { DEMO_REGISTRY, getCardSlug } from "../../components/common/demoNavData";

export const dynamicParams = false;

export const generateStaticParams = (): { slug: string[] }[] => {
  return [
    { slug: [] },
    ...DEMO_REGISTRY.flatMap((section) => [
      { slug: [section.sectionSlug] },
      ...section.cards.map((card) => ({ slug: [section.sectionSlug, getCardSlug(card)] })),
    ]),
  ];
};

/**
 * Dynamic segment changes swap this route slot only. Heavy UI lives in ./layout.tsx
 * so client navigations do not remount the demo shell.
 */
export default function DemoSlugPage() {
  return null;
}
