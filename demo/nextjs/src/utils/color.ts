type ColorType = "rgb" | "rgba" | "hsl" | "hsla";

type ColorObject = {
  type: ColorType;
  values: number[];
  hex?: boolean;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const round = (value: number, precision = 0): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const noUndefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

const isRgbColor = (color: ColorObject): boolean => {
  return color.type.startsWith("rgb");
};

const parseHexColor = (hex: string): ColorObject => {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3 ? normalized.replace(/./g, "$&$&") : normalized;
  const values = [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];

  return { type: "rgb", values, hex: true };
};

const parseColorString = (color: string): ColorObject => {
  if (color.startsWith("#") || /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) {
    return parseHexColor(color);
  }

  const [type, ...rawValues] = color.split(/[(), /]+/).filter(Boolean) as [ColorType, ...string[]];

  if (!["rgb", "rgba", "hsl", "hsla"].includes(type) || rawValues.length < 3) {
    throw new Error(`[Dialogist demo] Unsupported color format: ${color}`);
  }

  const values = rawValues.slice(0, 4).map((value, index) => {
    if (value.endsWith("%")) {
      const percent = Number.parseFloat(value);
      if (type.startsWith("rgb") && index < 3) return clamp((percent / 100) * 255, 0, 255);
      return percent;
    }
    return Number.parseFloat(value);
  });

  return { type, values };
};

const toHexChannel = (value: number): string => {
  return round(clamp(value, 0, 255), 0)
    .toString(16)
    .padStart(2, "0");
};

const recomposeColor = ({ type, values, hex }: ColorObject): string => {
  const [x, y, z, a] = values;

  if (hex) return `#${toHexChannel(x)}${toHexChannel(y)}${toHexChannel(z)}`;
  if (type.startsWith("hsl")) return `${type}(${x}, ${y}%, ${z}%${a !== undefined ? `, ${a}` : ""})`;
  return `${type}(${x}, ${y}, ${z}${a !== undefined ? `, ${a}` : ""})`;
};

/**
 * Adapted from Colman's RGB saturation utilities, kept local because Colman
 * is not published yet.
 */
const getRgbGray = (rgb: ColorObject): number => {
  const [r, g, b] = rgb.values;
  return round(r * 0.299 + g * 0.587 + b * 0.114, 4);
};

const getRgbMaxSat = (rgb: ColorObject): ColorObject => {
  const {
    type,
    values: [r, g, b, a],
  } = rgb;
  const gray = getRgbGray(rgb);

  if (gray === r && gray === g && gray === b) {
    return rgb;
  }

  const dr = r - gray;
  const dg = g - gray;
  const db = b - gray;

  const getScale = (delta: number): number => {
    if (delta > 0) return (255 - gray) / delta;
    if (delta < 0) return (0 - gray) / delta;
    return Infinity;
  };

  const scale = Math.min(getScale(dr), getScale(dg), getScale(db));

  return {
    type,
    values: [Math.round(gray + dr * scale), Math.round(gray + dg * scale), Math.round(gray + db * scale), a],
  };
};

const saturateHsl = (hsl: ColorObject, amount: number): ColorObject => {
  const {
    type,
    values: [h, s, l, a],
  } = hsl;
  const clampedAmount = clamp(amount, -1, 1);
  const distanceToMax = 100 - s;
  const newS = round(clamp(s + clampedAmount * distanceToMax, 0, 100), 2);

  return { type, values: [h, newS, l, a].filter(noUndefined) };
};

const saturateRgb = (rgb: ColorObject, amount: number): ColorObject => {
  if (amount === 0) return rgb;

  const {
    type,
    values: [r, g, b, a],
    hex,
  } = rgb;
  const gray = round(getRgbGray(rgb), 0);
  const {
    values: [maxR, maxG, maxB],
  } = getRgbMaxSat(rgb);

  if (amount <= -1) {
    return { type, values: [gray, gray, gray, a].filter(noUndefined), hex };
  }

  if (amount >= 1) {
    return { type, values: [round(maxR, 0), round(maxG, 0), round(maxB, 0), a].filter(noUndefined), hex };
  }

  return {
    type,
    values: [
      clamp(r + round((maxR - r) * amount, 0), 0, 255),
      clamp(g + round((maxG - g) * amount, 0), 0, 255),
      clamp(b + round((maxB - b) * amount, 0), 0, 255),
      a,
    ].filter(noUndefined),
    hex,
  };
};

const desaturateHsl = (hsl: ColorObject, amount: number): ColorObject => {
  const {
    type,
    values: [h, s, l, a],
  } = hsl;
  const clampedAmount = clamp(amount, -1, 1);
  const newS = round(clamp(s - clampedAmount * s, 0, 100), 2);

  return { type, values: [h, newS, l, a].filter(noUndefined) };
};

const desaturateRgb = (rgb: ColorObject, amount: number): ColorObject => {
  if (amount === 0) return rgb;
  if (amount < 0) return saturateRgb(rgb, -amount);

  const {
    type,
    values: [r, g, b, a],
    hex,
  } = rgb;
  const clampedAmount = clamp(amount, -1, 1);
  const gray = getRgbGray(rgb);

  if (clampedAmount >= 1) {
    const grayInt = round(gray, 0);
    return { type, values: [grayInt, grayInt, grayInt, a].filter(noUndefined), hex };
  }

  return {
    type,
    values: [
      round(clamp(r * (1 - clampedAmount) + gray * clampedAmount, 0, 255), 0),
      round(clamp(g * (1 - clampedAmount) + gray * clampedAmount, 0, 255), 0),
      round(clamp(b * (1 - clampedAmount) + gray * clampedAmount, 0, 255), 0),
      a,
    ].filter(noUndefined),
    hex,
  };
};

export const saturate = (color: string, amount: number): string => {
  const decomposed = parseColorString(color);
  return recomposeColor(isRgbColor(decomposed) ? saturateRgb(decomposed, amount) : saturateHsl(decomposed, amount));
};

export const desaturate = (color: string, amount: number): string => {
  const decomposed = parseColorString(color);
  return recomposeColor(isRgbColor(decomposed) ? desaturateRgb(decomposed, amount) : desaturateHsl(decomposed, amount));
};
