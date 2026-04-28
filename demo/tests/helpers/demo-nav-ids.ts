/** Mirrors `getCardElementId` in `demo/nextjs/src/components/common/demoNavUtils.ts`. */
export const getCardElementId = (sectionSlug: string, cardSlug: string): string => {
  return `demo-card-${sectionSlug}-${cardSlug}`;
};
