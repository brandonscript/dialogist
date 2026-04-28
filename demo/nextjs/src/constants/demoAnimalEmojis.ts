/**
 * Shared animal → emoji map for render-tracker IDs and other demos (e.g. conflict open markers).
 * Background colors per animal stay in `useRenderTracker` as `emojiColorMap` (same keys).
 */
export const DEMO_ANIMAL_EMOJI_MAP = {
  bear: "🐻",
  bird: "🐦",
  camel: "🐫",
  cat: "🐈‍⬛",
  deer: "🦌",
  dog: "🐶",
  dolphin: "🐬",
  eagle: "🦅",
  elephant: "🐘",
  fish: "🐟",
  fox: "🦊",
  frog: "🐸",
  giraffe: "🦒",
  koala: "🐨",
  lion: "🦁",
  owl: "🦉",
  panda: "🐼",
  peacock: "🦚",
  phoenix: "🐦‍🔥",
  rabbit: "🐇",
  seal: "🦭",
  shark: "🦈",
  tiger: "🐯",
  turtle: "🐢",
  whale: "🐋",
  wolf: "🐺",
  zebra: "🦓",
} as const;

export type DemoAnimal = keyof typeof DEMO_ANIMAL_EMOJI_MAP;

/** Stable key order for cycling through every emoji in the map. */
export const DEMO_ANIMAL_KEYS = Object.keys(DEMO_ANIMAL_EMOJI_MAP) as DemoAnimal[];

export const DEMO_ANIMAL_EMOJI_LIST: readonly string[] = DEMO_ANIMAL_KEYS.map((k) => DEMO_ANIMAL_EMOJI_MAP[k]);
