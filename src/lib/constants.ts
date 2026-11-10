/*
 * Values with no CSS to live in.
 *
 * Colours are custom properties in globals.css and reach components through
 * Tailwind tokens. The hexes below exist for the one place CSS cannot reach:
 * Satori, which renders the social cards outside a browser.
 * tests/unit/palette.test.ts checks the two tables agree.
 */

/** The dark theme's palette, for contexts with no CSS. */
export const BRAND = {
  ground: "#0B0D0E",
  panel: "#151819",
  hairline: "#262B2D",
  secondary: "#A3ABA1",
  label: "#8A9288",
  text: "#E8EAE6",
  accent: "#B8F84A",
  /** The light theme's ground, for the browser's theme colour. */
  groundLight: "#F6F7F4",
} as const;

/** The gradient's stops. */
export const SPECTRUM = [
  { offset: 0, color: "#B8F84A" },
  { offset: 0.35, color: "#6FD3FF" },
  { offset: 0.68, color: "#D7A6FF" },
  { offset: 1, color: "#FF8AC8" },
] as const;

/** The page gutter and maximum content width, shared by every section. */
export const CONTAINER = "mx-auto max-w-[1400px] px-6 sm:px-10";

/** Icon sizes: 24 for cards, 20 for section rules, 16 inline. */
export const ICON = {
  section: 20,
  card: 24,
  inline: 16,
} as const;

/** Social cards are the standard 1.91:1. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
