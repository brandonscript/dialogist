import type { Shadows } from "@mui/material/styles";

const shadowKeyUmbraOpacity = 0.05;
const shadowKeyPenumbraOpacity = 0.08;
const shadowAmbientShadowOpacity = 0.12;
const scale = 0.7;

const umbraEnabled = true;
const penumbraEnabled = true;
const ambientEnabled = true;

type ShadowX = number;
type ShadowY = number;
type ShadowBlur = number;
type ShadowSpread = number;
type ShadowIntensityModifier = number;
type Shadow =
  | [ShadowX, ShadowY, ShadowBlur, ShadowSpread]
  | [ShadowX, ShadowY, ShadowBlur, ShadowSpread, ShadowIntensityModifier];

const createShadow = ({ umbra, penumbra, ambient }: { umbra: Shadow; penumbra: Shadow; ambient: Shadow }) => {
  const umbraShadow = !umbraEnabled
    ? null
    : `${umbra[0] * scale}px ${umbra[1] * scale}px ${umbra[2] * scale}px ${umbra[3] * scale}px rgba(0,0,0,${shadowKeyUmbraOpacity * (umbra[4] ?? 1)})`;
  const penumbraShadow = !penumbraEnabled
    ? null
    : `${penumbra[0] * scale}px ${penumbra[1] * scale}px ${penumbra[2] * scale}px ${penumbra[3] * scale}px rgba(0,0,0,${shadowKeyPenumbraOpacity * (penumbra[4] ?? 1)})`;
  const ambientShadow = !ambientEnabled
    ? null
    : `${ambient[0] * scale}px ${ambient[1] * scale}px ${ambient[2] * scale}px ${ambient[3] * scale}px rgba(0,0,0,${shadowAmbientShadowOpacity * (ambient[4] ?? 1)})`;

  return [umbraShadow, penumbraShadow, ambientShadow].filter(Boolean).join(",");
};

export const createSoftShadows = (intensity: number = 1): Shadows => {
  const s = intensity;
  return [
    "none",
    createShadow({ umbra: [0, 1, 1, -1, s], penumbra: [0, 1, 1, -2, s], ambient: [0, 1, 3, 0, 0.4 * s] }),
    createShadow({ umbra: [0, 1, 2, -1, s], penumbra: [0, 2, 2, -2, s], ambient: [0, 1, 5, 0, 0.5 * s] }),
    createShadow({ umbra: [0, 2, 3, -2, s], penumbra: [0, 3, 4, -2, s], ambient: [0, 1, 8, 0, 0.6 * s] }),
    createShadow({ umbra: [0, 2, 4, -1, s], penumbra: [0, 4, 5, -2, s], ambient: [0, 2, 10, 0, 0.7 * s] }),
    createShadow({ umbra: [0, 3, 5, -1, s], penumbra: [0, 5, 8, -1, s], ambient: [0, 2, 14, 0, 0.8 * s] }),
    createShadow({ umbra: [0, 3, 5, -1, s], penumbra: [0, 6, 10, -1, s], ambient: [0, 3, 18, 0, s] }),
    createShadow({ umbra: [0, 4, 5, -2, s], penumbra: [0, 7, 10, 0, s], ambient: [0, 3, 16, 1, s] }),
    createShadow({ umbra: [0, 4, 5, -3, s], penumbra: [0, 8, 10, 0, s], ambient: [0, 4, 14, 2, s] }),
    createShadow({ umbra: [0, 4, 6, -3, s], penumbra: [0, 9, 12, 0, s], ambient: [0, 4, 16, 2, s] }),
    createShadow({ umbra: [0, 5, 6, -3, s], penumbra: [0, 10, 14, 0, s], ambient: [0, 5, 18, 2, 1.1 * s] }),
    createShadow({ umbra: [0, 5, 7, -4, s], penumbra: [0, 11, 15, 0, s], ambient: [0, 5, 20, 3, 1.1 * s] }),
    createShadow({ umbra: [0, 6, 8, -4, s], penumbra: [0, 12, 17, 1, s], ambient: [0, 6, 22, 3, 1.2 * s] }),
    createShadow({ umbra: [0, 7, 8, -4, s], penumbra: [0, 13, 19, 1, s], ambient: [0, 6, 24, 3, 1.2 * s] }),
    createShadow({ umbra: [0, 7, 9, -4, s], penumbra: [0, 14, 21, 1, s], ambient: [0, 6, 26, 4, 1.3 * s] }),
    createShadow({ umbra: [0, 7, 9, -5, s], penumbra: [0, 15, 22, 1, s], ambient: [0, 7, 28, 4, 1.3 * s] }),
    createShadow({ umbra: [0, 7, 10, -5, s], penumbra: [0, 16, 24, 2, s], ambient: [0, 7, 30, 4, 1.4 * s] }),
    createShadow({ umbra: [0, 8, 11, -5, s], penumbra: [0, 17, 26, 2, s], ambient: [0, 7, 32, 4, 1.5 * s] }),
    createShadow({ umbra: [0, 8, 11, -5, s], penumbra: [0, 18, 28, 2, s], ambient: [0, 8, 34, 5, 1.6 * s] }),
    createShadow({ umbra: [0, 8, 12, -6, s], penumbra: [0, 19, 29, 2, s], ambient: [0, 8, 36, 5, 1.8 * s] }),
    createShadow({ umbra: [0, 9, 13, -6, s], penumbra: [0, 20, 31, 3, s], ambient: [0, 9, 38, 5, 2.0 * s] }),
    createShadow({ umbra: [0, 9, 13, -6, s], penumbra: [0, 21, 33, 3, s], ambient: [0, 9, 40, 5, 2.2 * s] }),
    createShadow({ umbra: [0, 9, 14, -6, s], penumbra: [0, 22, 35, 3, s], ambient: [0, 9, 42, 6, 2.4 * s] }),
    createShadow({ umbra: [0, 10, 14, -7, s], penumbra: [0, 23, 36, 3, s], ambient: [0, 10, 44, 7, 2.6 * s] }),
    createShadow({ umbra: [0, 10, 15, -7, s], penumbra: [0, 24, 38, 3, s], ambient: [0, 10, 46, 7, 2.8 * s] }),
  ] as Shadows;
};
export default createSoftShadows;

export const halfSoftShadows = createSoftShadows(0.5);
