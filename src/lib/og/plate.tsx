/*
 * The social card, as a Metaplate plate.
 *
 * The cards are ordinary files: `metaplate render` writes `og-image.png`
 * beside each route in public/ before the build (scripts/render-cards.mts), so
 * any static host serves them and no server ever runs the renderer.
 *
 * Colours come from lib/constants.ts because Satori has no CSS custom
 * properties. The pages import this module too, for `og.metadata`, which only
 * builds a URL: Satori and resvg load when something renders, and
 * next.config.ts keeps them out of the bundle.
 */

import { fontsourceFontLoader } from "metaplate/fonts";
import { createNodeOg } from "metaplate/node";
import { MARK_CHEVRON, MARK_CURSOR, MARK_VIEWBOX } from "../../components/brand/Mark";
import { BRAND, OG_SIZE, SPECTRUM } from "../constants";
import { NAME, SITE_URL } from "../site";
import type { CardCopy } from "./cards";

const spectrum = `linear-gradient(90deg, ${SPECTRUM.map(
  (stop) => `${stop.color} ${stop.offset * 100}%`,
).join(", ")})`;

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox={MARK_VIEWBOX}>
      <polyline
        points={MARK_CHEVRON}
        fill="none"
        stroke={BRAND.accent}
        strokeWidth={50}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect {...MARK_CURSOR} fill={BRAND.accent} />
    </svg>
  );
}

export const og = createNodeOg<CardCopy>({
  alt: (copy) => copy.alt,
  size: OG_SIZE,
  // A real file name, so a static host knows the type from the extension.
  imagePath: "og-image.png",
  /*
   * Crawlers cache an image by its URL, so a changed card gets a new `?v=`.
   * Raise `revision` when the layout below changes what unchanged copy looks
   * like: the copy is all the token can see.
   */
  version: "copy",
  revision: "1",
  fonts: fontsourceFontLoader([
    { font: "space-grotesk", weight: 600 },
    { font: "inter", weight: 400 },
    { font: "jetbrains-mono", weight: 500 },
  ]),
  /*
   * Render guards: a card that breaks one of these fails `npm run assets`, and so the build,
   * instead of shipping. docs/social-cards.md explains each.
   * - missingGlyphs: a character no loaded font covers (it would draw as a box or nothing)
   * - overflow: text laid out past the canvas edge
   * - safeArea: text in the strip that X's 2:1 or Open Graph's 1.91:1 crop cuts off
   * - textOverlap: two text boxes that intersect (a long title running into the description)
   * - blank: every pixel the same colour (the text never rendered)
   */
  guards: {
    missingGlyphs: "error",
    overflow: "error",
    safeArea: "error",
    textOverlap: "error",
    blank: "error",
  },
  component: (copy) => (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "60px 72px 56px",
        background: BRAND.ground,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Mark size={56} />
        <span
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: 30,
            marginLeft: 18,
            color: BRAND.text,
          }}
        >
          {NAME}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: BRAND.accent,
            marginBottom: 20,
          }}
        >
          {copy.eyebrow}
        </span>
        <span
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.08,
            letterSpacing: -1.4,
            color: BRAND.text,
            maxWidth: 960,
          }}
        >
          {copy.title}
        </span>
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: 26,
            lineHeight: 1.4,
            color: BRAND.secondary,
            marginTop: 20,
            maxWidth: 960,
          }}
        >
          {copy.description}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 18, color: BRAND.label }}>
          {SITE_URL.replace(/^https?:\/\//, "")}
        </span>
        <div style={{ display: "flex", width: 240, height: 4, backgroundImage: spectrum }} />
      </div>
    </div>
  ),
});
