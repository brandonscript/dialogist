"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_ANIMAL_EMOJI_MAP as animalEmoji, DEMO_ANIMAL_KEYS, type DemoAnimal } from "../constants/demoAnimalEmojis";
import { useRenderTracking } from "../contexts/RenderTrackingContext";

// Arrays for generating human-readable IDs (deduped list)
const adjectives = [
  "bold",
  "bored",
  "brave",
  "bright",
  "calm",
  "clever",
  "clever",
  "cool",
  "fresh",
  "gentle",
  "happy",
  "humble",
  "hungry",
  "kind",
  "kind",
  "loud",
  "quick",
  "quiet",
  "sharp",
  "silly",
  "sleepy",
  "smart",
  "smooth",
  "soft",
  "stoic",
  "strong",
  "swift",
  "thirsty",
  "warm",
  "wise",
];

const animals = DEMO_ANIMAL_KEYS;
type Animal = DemoAnimal;

export const emojiColorMap = {
  bear: "#DAC2B2",
  bird: "#B9D0D4",
  camel: "#E6C29C",
  cat: "#E2E1E1",
  deer: "#E3D7CC",
  dog: "#EEE3D5",
  dolphin: "#BAEFF6",
  eagle: "#F5ECE2",
  elephant: "#D7D9D7",
  fish: "#B1E3F5",
  fox: "#FFC64E",
  frog: "#EAF39D",
  giraffe: "#F2CD6D",
  koala: "#DED1C9",
  lion: "#FDD29D",
  owl: "#FCF0E9",
  panda: "#F3F3F2",
  peacock: "#85D58F",
  phoenix: "#FEE1CE",
  rabbit: "#EFEFEF",
  seal: "#D9D7D6",
  shark: "#C3D6D9",
  tiger: "#F1D880",
  turtle: "#B6E38E",
  whale: "#CBE2F0",
  wolf: "#C5C4C3",
  zebra: "#E6E4E2",
} satisfies Record<Animal, string>;

// Fisher–Yates shuffle
const shuffleArray = <T>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Bags to cycle through animals and adjectives without repetition until exhausted
const animalBagMutable: Animal[] = shuffleArray([...animals]);
const adjectiveBagMutable: string[] = shuffleArray(adjectives);

const takeFromBag = <T>(bagRef: T[], seed: () => T[]): T => {
  if (bagRef.length === 0) {
    const refill = seed();
    bagRef.push(...refill);
  }
  const value = bagRef.pop();
  // Fallback safety (shouldn't happen): regenerate bag in place
  if (value === undefined) {
    const regenerated = seed();
    bagRef.push(...regenerated);
    return bagRef.pop() as T;
  }
  return value;
};

// Recent visible sets to reduce duplicates in current viewport
const recentAnimals = new Set<Animal>();
const recentAdjectives = new Set<string>();
const RECENT_LIMIT = Math.min(6, animals.length);

const pickUnique = <T extends string>(current: Set<T>, limit: number, bagRef: T[], seed: () => T[]): T => {
  // Try a few times to avoid a recent duplicate
  for (let tries = 0; tries < 4; tries++) {
    const candidate = takeFromBag(bagRef, seed);
    if (!current.has(candidate)) {
      current.add(candidate);
      if (current.size > limit) {
        // prune oldest by converting to array
        const first = current.values().next().value as T;
        current.delete(first);
      }
      return candidate;
    }
  }
  // If we couldn't avoid, just use the next value
  const fallback = takeFromBag(bagRef, seed);
  current.add(fallback);
  if (current.size > limit) {
    const first = current.values().next().value as T;
    current.delete(first);
  }
  return fallback;
};

const generateHumanReadableId = (): string => {
  const animal = pickUnique<Animal>(recentAnimals, RECENT_LIMIT, animalBagMutable, () => shuffleArray([...animals]));
  const adjective = pickUnique<string>(recentAdjectives, RECENT_LIMIT, adjectiveBagMutable, () =>
    shuffleArray(adjectives),
  );
  const emoji = animalEmoji[animal] ?? "🐾";
  return `${emoji} ${adjective}-${animal}`;
};

export interface RenderInfo {
  renderId: string;
  renderCount: number;
  lastRenderTime: number;
  currentRenderTime: number;
}

export type RenderCountStrategy = "all-renders" | "dependency-change";

/**
 * Hook to track component re-renders with content-dependent IDs
 * - ID changes when content changes (based on dependencies)
 * - Tracks render count and timestamps
 * - Returns previous render time for tooltip calculations
 * - Waits until page is loaded to start counting (so first count is 1)
 * - Waits until page is loaded to generate stable IDs (no flickering)
 */
export const useRenderTracker = (
  componentName?: string,
  dependencies?: any[],
  countStrategy: RenderCountStrategy = "all-renders",
): RenderInfo => {
  const { resetCounter } = useRenderTracking();
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const currentIdRef = useRef<string | null>(null); // Start with null, generate after page ready
  const lastDependenciesRef = useRef(dependencies);
  const lastCountedDependenciesRef = useRef(dependencies);
  const lastResetCounterRef = useRef(resetCounter);

  // State to track if page is ready to start counting renders
  const [isPageReady, setIsPageReady] = useState(false);

  // Mark page as ready after initial load/hydration is complete
  useEffect(() => {
    // Use a small delay to ensure all initial renders/hydration are done
    const timer = setTimeout(() => {
      setIsPageReady(true);
      // Generate stable ID only after page is ready
      if (currentIdRef.current === null) {
        currentIdRef.current = generateHumanReadableId();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Safe dependency comparison that handles React elements and circular references
  const safeStringify = (obj: any): string => {
    try {
      const seen = new Set();
      return JSON.stringify(obj, (_key, val) => {
        if (val != null && typeof val === "object") {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
          // Handle React elements by using their type and key
          if (val.$$typeof) {
            return `[ReactElement:${val.type?.name || val.type || "Unknown"}]`;
          }
        }
        return val;
      });
    } catch {
      // Fallback for any other serialization issues
      return String(obj);
    }
  };

  // Check if dependencies changed to regenerate ID and reset timestamp
  const dependenciesChanged =
    dependencies !== undefined && safeStringify(dependencies) !== safeStringify(lastDependenciesRef.current);
  const countedDependenciesChanged =
    dependencies !== undefined && safeStringify(dependencies) !== safeStringify(lastCountedDependenciesRef.current);

  // Check if reset was triggered
  const resetTriggered = resetCounter !== lastResetCounterRef.current;

  if (dependenciesChanged || renderCountRef.current === 0 || resetTriggered) {
    if (resetTriggered) {
      // Reset all counters when reset is triggered
      renderCountRef.current = 0;
      lastResetCounterRef.current = resetCounter;
      // Mark page as ready immediately when reset is triggered (user action)
      setIsPageReady(true);
      // Generate new ID immediately for reset (user action)
      currentIdRef.current = generateHumanReadableId();
    } else if (isPageReady) {
      // Only generate new ID if page is ready (avoid flickering during load)
      currentIdRef.current = generateHumanReadableId();
    }
    lastRenderTimeRef.current = Date.now(); // ← Reset timestamp when content changes or reset
    lastDependenciesRef.current = dependencies;
  }

  // Only start counting renders after page is ready
  if (isPageReady) {
    if (countStrategy === "dependency-change") {
      // Count only meaningful dependency transitions (e.g. open -> close), not every render.
      const shouldCount = dependencies === undefined ? true : countedDependenciesChanged;
      if (shouldCount) {
        renderCountRef.current += 1;
        lastCountedDependenciesRef.current = dependencies;
      }
    } else {
      // Increment render count (account for React StrictMode double-rendering in dev)
      const isDevMode = process.env.NODE_ENV === "development";
      renderCountRef.current += isDevMode ? 0.5 : 1;
    }
  }

  // Calculate display count: in dev mode, show 1 for first 2 renders, then increment normally
  const isDevMode = process.env.NODE_ENV === "development";
  const displayCount = isPageReady
    ? countStrategy === "dependency-change"
      ? Math.max(1, Math.round(renderCountRef.current) + 1)
      : isDevMode
        ? Math.max(1, Math.floor(renderCountRef.current))
        : Math.round(renderCountRef.current)
    : 1; // Show 1 while waiting for page to be ready

  if (componentName && process.env.NODE_ENV === "development") {
    // console.log(
    //   `🔄 ${componentName} re-rendered: ${currentIdRef.current || "loading"} (render ${displayCount}) [internal: ${renderCountRef.current}] ${!isPageReady ? "[waiting for page ready]" : ""}`,
    // );
  }

  return {
    renderId: currentIdRef.current || "loading", // ← Show "loading" until ID is generated
    renderCount: displayCount, // ← Properly handle StrictMode double-rendering
    lastRenderTime: lastRenderTimeRef.current, // ← Fixed timestamp for tooltip calculation
    currentRenderTime: Date.now(), // ← Current time for display
  };
};
