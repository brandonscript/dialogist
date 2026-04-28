"use client";

import { createContext, type ReactNode, useContext } from "react";

export interface DemoNavScopeValue {
  sectionSlug: string;
  cardSlug: string;
}

const DemoNavScopeContext = createContext<DemoNavScopeValue | null>(null);

export const DemoNavScopeProvider = ({
  sectionSlug,
  cardSlug,
  children,
}: DemoNavScopeValue & { children: ReactNode }) => {
  return <DemoNavScopeContext.Provider value={{ sectionSlug, cardSlug }}>{children}</DemoNavScopeContext.Provider>;
};

export const useDemoNavScope = (): DemoNavScopeValue | null => {
  return useContext(DemoNavScopeContext);
};
