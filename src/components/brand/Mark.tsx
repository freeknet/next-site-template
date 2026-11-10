/*
 * The mark. A placeholder: freeknet's prompt, a chevron and a cursor.
 *
 * Replace the geometry below with the project's own. Everything that draws the
 * mark reads it from here: the header, the 404 page, the favicon
 * (app/icon.svg is a copy, tests/unit/brand.test.ts keeps it in step) and the
 * social cards.
 */

export const MARK_VIEWBOX = "0 0 512 512";

/** The chevron, drawn as a stroke. */
export const MARK_CHEVRON = "142,166 246,256 142,346";

/** The cursor block. */
export const MARK_CURSOR = { x: 282, y: 318, width: 112, height: 48 } as const;

type MarkProps = {
  /** Rendered width and height in px. */
  size?: number;
  /** The fill behind the glyph. Omit for a transparent mark. */
  background?: string;
  /** The glyph colour. Defaults to the accent. */
  color?: string;
  className?: string;
  /** Accessible name. Omit beside a text label; the mark is then hidden. */
  title?: string;
};

export default function Mark({
  size = 32,
  background,
  color = "var(--accent)",
  className,
  title,
}: MarkProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      {title ? <title>{title}</title> : null}
      {background ? <rect width="512" height="512" fill={background} /> : null}
      <polyline
        points={MARK_CHEVRON}
        fill="none"
        stroke={color}
        strokeWidth={50}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect {...MARK_CURSOR} fill={color} />
    </svg>
  );
}
