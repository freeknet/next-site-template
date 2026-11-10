import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AA_LARGE, AA_NORMAL, contrastRatio } from "@/lib/contrast";
import { BRAND } from "@/lib/constants";

/*
 * Pins the palette against WCAG AA, in both themes.
 *
 * globals.css is read directly, so changing a hex value there is enough for
 * this file to say whether the new colour still reads.
 */

/** Every `selector { … }` rule's hex custom properties, read from globals.css. */
function readRules(): { selector: string; props: Record<string, string> }[] {
  const css = readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");
  // Comments can contain braces and hex values; strip them first.
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: { selector: string; props: Record<string, string> }[] = [];
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].replace(/\s+/g, " ").trim();
    const props: Record<string, string> = {};
    for (const prop of match[2].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8});/g)) {
      props[prop[1]] = prop[2].toLowerCase();
    }
    if (Object.keys(props).length > 0) rules.push({ selector, props });
  }
  return rules;
}

const RULES = readRules();

function tokensWhere(selectors: string[]): Record<string, string> {
  const found = RULES.filter((rule) => selectors.includes(rule.selector));
  if (found.length === 0) throw new Error(`no rule for ${selectors.join(", ")}`);
  return Object.assign({}, ...found.map((rule) => rule.props));
}

const DARK = tokensWhere([":root", ':root[data-theme="dark"]']);
const LIGHT_EXPLICIT = tokensWhere([':root[data-theme="light"]']);
const LIGHT_SYSTEM = tokensWhere([':root:not([data-theme="dark"])']);
const CODE = RULES.find((rule) => "code-ground" in rule.props)?.props;
if (!CODE) throw new Error("no rule declares --code-ground");

const THEMES = { dark: DARK, light: LIGHT_EXPLICIT } as const;

const TOKENS = [
  "ground",
  "panel",
  "panel-raised",
  "hairline",
  "hairline-strong",
  "grey",
  "secondary",
  "bright",
  "text",
  "label",
  "accent",
  "accent-deep",
  "accent-text",
  "on-accent",
];

describe.each(Object.entries(THEMES))("the %s theme", (name, T) => {
  const surfaces = { ground: T.ground, panel: T.panel, "panel-raised": T["panel-raised"] };

  it("declares every token the site paints with", () => {
    for (const token of TOKENS) {
      expect(T[token], `${name} is missing --${token}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  for (const token of ["text", "bright", "secondary", "label", "accent-text"]) {
    it(`--${token} clears AA on every surface`, () => {
      for (const [surfaceName, surface] of Object.entries(surfaces)) {
        const ratio = contrastRatio(T[token], surface);
        expect(ratio, `${name}: --${token} on ${surfaceName} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
      }
    });
  }

  it("--on-accent is legible on the accent fill", () => {
    expect(contrastRatio(T["on-accent"], T.accent)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("the accent reads as a UI shape on the ground (focus rings, underlines)", () => {
    expect(contrastRatio(T.accent, T.ground)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it("keeps the grey ladder in order: text, bright, secondary, label", () => {
    const ladder = ["text", "bright", "secondary", "label"].map((token) => contrastRatio(T[token], T.ground));
    for (let index = 1; index < ladder.length; index += 1) {
      expect(ladder[index]).toBeLessThanOrEqual(ladder[index - 1]);
    }
  });
});

describe("the two ways into the light theme", () => {
  it("agree, so the system preference and an explicit choice look the same", () => {
    expect(LIGHT_SYSTEM).toEqual(LIGHT_EXPLICIT);
  });
});

describe("the code surface", () => {
  it("keeps its text legible in both themes", () => {
    for (const token of ["code-text", "code-dim"]) {
      expect(contrastRatio(CODE[token], CODE["code-ground"])).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });
});

describe("the table the social cards paint from", () => {
  it("agrees with the dark theme", () => {
    const pairs: [keyof typeof BRAND, string][] = [
      ["ground", "ground"],
      ["panel", "panel"],
      ["hairline", "hairline"],
      ["text", "text"],
      ["secondary", "secondary"],
      ["label", "label"],
      ["accent", "accent"],
    ];
    for (const [brand, token] of pairs) {
      expect(BRAND[brand].toLowerCase(), brand).toBe(DARK[token]);
    }
  });
});
