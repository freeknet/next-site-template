import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO } from "@/lib/site";

/*
 * What must not be written into the site's source.
 *
 * The repository's slug lives in lib/site.ts (and package.json), so moving the
 * project is one edit. And the copy keeps to the house rules: no words that say
 * nothing, and no em dashes in what a reader sees.
 */

const ROOT = process.cwd();

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const file = path.join(directory, name);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.(ts|tsx|mts|mjs|md|css)$/.test(name) ? [file] : [];
  });
}

const FILES = ["src", "scripts"].flatMap((directory) => sourceFiles(path.join(ROOT, directory)));

/** Copy a reader sees: content files, pages, and the identity and card modules. */
const COPY_FILES = FILES.filter(
  (file) =>
    /content\.md$/.test(file) ||
    /(page|not-found|layout)\.tsx$/.test(file) ||
    /lib[\\/](site|og[\\/]cards)\.ts$/.test(file),
);

function matches(pattern: RegExp, files: readonly string[]): string[] {
  return files.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, index) =>
        pattern.test(line) ? [`${path.relative(ROOT, file)}:${index + 1}: ${line.trim()}`] : [],
      ),
  );
}

describe("the source", () => {
  it("has files to scan", () => {
    expect(FILES.length).toBeGreaterThan(30);
    expect(COPY_FILES.length).toBeGreaterThan(5);
  });

  it("writes the repository's slug only in lib/site.ts", () => {
    const slug = new RegExp(REPO.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
    expect(matches(slug, FILES)).toEqual([expect.stringMatching(/^src[\\/]lib[\\/]site\.ts:/)]);
  });

  it("keeps package.json's repository the one lib/site.ts names", () => {
    const manifest = readFileSync(path.join(ROOT, "package.json"), "utf8");
    const urls = manifest.match(/github\.com\/[\w.-]+\/[\w.-]+?(?=[/.]|")/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url).toBe(`github.com/${REPO}`);
  });
});

describe("the copy", () => {
  it("uses none of the words that say nothing", () => {
    const empty =
      /\b(powerful|seamless(ly)?|blazing|stunning|robust|effortless(ly)?|cutting[- ]edge|next[- ]generation|revolutionary|unleash|supercharge|world[- ]class|game[- ]chang\w+)\b/i;
    expect(matches(empty, COPY_FILES)).toEqual([]);
  });

  it("uses no em dash in what a reader sees", () => {
    expect(matches(/—/, COPY_FILES.filter((file) => file.endsWith(".md")))).toEqual([]);
    // In code, only strings and JSX text: comments may keep theirs.
    const strings = /^(?!\s*(\*|\/\/|\/\*)).*—/;
    expect(matches(strings, COPY_FILES.filter((file) => !file.endsWith(".md")))).toEqual([]);
  });
});
