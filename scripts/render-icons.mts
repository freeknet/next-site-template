/*
 * Renders the app icons from the mark into public/icons/, before `next dev` and `next build`.
 *
 * - icon-192.png, icon-512.png: the manifest's standard icons (the sizes Chrome requires to offer
 *   installation), the mark on the ground colour, as the favicon draws it.
 * - maskable-512.png: for Android's adaptive icons, which crop to a circle, squircle or square.
 *   The mark is shrunk into the central safe zone (a circle 80% of the width) on a full-bleed ground.
 * - apple-touch-icon.png: 180px, full-bleed; iOS rounds the corners itself.
 *
 * Generated rather than committed, so changing the mark (src/components/brand/Mark.tsx) or the
 * ground colour (src/lib/constants.ts) changes every icon on the next build.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { MARK_CHEVRON, MARK_CURSOR } from "../src/components/brand/Mark";
import { BRAND } from "../src/lib/constants";

/** The mark on a 512 grid, scaled about the centre by `scale`. */
function iconSvg(scale: number): string {
  const offset = (512 - 512 * scale) / 2;
  const { x, y, width, height } = MARK_CURSOR;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND.ground}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <polyline points="${MARK_CHEVRON}" fill="none" stroke="${BRAND.accent}" stroke-width="50" stroke-linecap="square" stroke-linejoin="miter"/>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${BRAND.accent}"/>
  </g>
</svg>`;
}

const ICONS = [
  { file: "icon-192.png", size: 192, scale: 1 },
  { file: "icon-512.png", size: 512, scale: 1 },
  // The mark's own bounds fill about 75% of its grid; 0.7 keeps it inside the 80% safe circle.
  { file: "maskable-512.png", size: 512, scale: 0.7 },
  { file: "apple-touch-icon.png", size: 180, scale: 0.85 },
] as const;

const target = path.join("public", "icons");
mkdirSync(target, { recursive: true });

for (const icon of ICONS) {
  const png = new Resvg(iconSvg(icon.scale), { fitTo: { mode: "width", value: icon.size } })
    .render()
    .asPng();
  writeFileSync(path.join(target, icon.file), png);
}
console.log(`render-icons: ${ICONS.length} icon(s) in ${target}`);
