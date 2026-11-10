import type { CSSProperties, ReactNode } from "react";

/*
 * The site's icon set.
 *
 * 24 px grid, 1.6 px stroke with round caps and joins. The accent marks the
 * one part of each icon that carries the meaning; nothing else in the set is
 * coloured. At 16 px the stroke thickens to 1.8 so the figure holds together.
 *
 * Add an icon by drawing it on the same grid, then name it in lib/site.ts's
 * IconName if a section uses it.
 */

/**
 * The colour of the part that carries the meaning.
 *
 * Indirected through a custom property so an icon can be dropped onto the
 * accent fill without every glyph in the set growing its own variant: on an
 * accent button the accent detail is invisible, so `onAccent` rebinds
 * this to `currentColor` — the button's own text colour, `--on-accent` — and
 * the figure goes monochrome instead of losing half of itself.
 */
const ACCENT = "var(--icon-accent, var(--accent))";

/** Set on the SVG by `onAccent`; every accented part reads it. */
const ON_ACCENT_STYLE = { "--icon-accent": "currentColor" } as CSSProperties;

type IconProps = {
  size?: number;
  className?: string;
  /** Accessible name. Omitted icons are hidden from assistive technology. */
  title?: string;
  /**
   * Set when the icon sits on the accent fill. `Action`'s primary variant
   * passes it automatically.
   */
  onAccent?: boolean;
};

function Icon({
  size = 24,
  className,
  title,
  onAccent,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      // The stroke thickens at 16 px so the figure holds together.
      strokeWidth={size <= 16 ? 1.8 : 1.6}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={
        onAccent
          ? { display: "block", flex: "none", ...ON_ACCENT_STYLE }
          : { display: "block", flex: "none" }
      }
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function GuideIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
      <path d="M12 6.5v13" stroke={ACCENT} />
    </Icon>
  );
}

export function AboutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" stroke={ACCENT} />
      <circle cx="12" cy="7.75" r="0.6" fill={ACCENT} stroke={ACCENT} />
    </Icon>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="7.5" height="6" rx="1" />
      <rect x="13" y="4.5" width="7.5" height="6" rx="1" />
      <rect x="3.5" y="13.5" width="7.5" height="6" rx="1" />
      <rect x="13" y="13.5" width="7.5" height="6" rx="1" stroke={ACCENT} />
    </Icon>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12h6M9 15.5h6" stroke={ACCENT} />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12.5" rx="1.5" />
      <path d="M9 20h6M12 16.5V20" />
      <path d="M8.5 10.5l2.5 2.5 4.5-5" stroke={ACCENT} />
    </Icon>
  );
}

export function DeployIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 14.5v4.5h16v-4.5" />
      <path d="M12 14.5v-11M7.5 8l4.5-4.5L16.5 8" stroke={ACCENT} />
    </Icon>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M6.5 10h6M6.5 13.5h4" />
      <path d="M15 9.5h3v5h-3z" stroke={ACCENT} />
    </Icon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z" />
      <path d="M3.5 12l8.5 4.5 8.5-4.5" />
      <path d="M3.5 16l8.5 4.5 8.5-4.5" stroke={ACCENT} />
    </Icon>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </Icon>
  );
}

/**
 * GitHub's own glyph. A third-party mark, drawn with its real curves rather
 * than forced onto the set's grid.
 */
export function GitHubIcon({ size = 16, className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * The icon that stands for each navigable section, named in lib/site.ts so
 * the footer, the mobile menu and a page's own header use the same figure.
 */
export const NAV_ICONS = {
  guide: GuideIcon,
  about: AboutIcon,
} as const;
