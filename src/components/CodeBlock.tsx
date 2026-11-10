/*
 * A fenced code block: a title bar naming the language, and the code on the
 * dark code ground, which stays dark in both themes.
 *
 * `min-w-0` lets it shrink inside a grid or flex row, so a long line scrolls
 * inside the block instead of widening the page. Focusable, so a block that
 * scrolls sideways on a phone can be scrolled from the keyboard, and labelled,
 * so that focus announces what it is.
 */

const TITLES: Record<string, string> = {
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  console: "Shell",
  powershell: "PowerShell",
  ts: "TypeScript",
  tsx: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  jsonc: "JSON",
  toml: "TOML",
  yaml: "YAML",
  yml: "YAML",
  css: "CSS",
  md: "Markdown",
  markdown: "Markdown",
};

export function codeTitle(language: string | undefined): string {
  if (!language || language === "text") return "Text";
  return TITLES[language] ?? language.toUpperCase();
}

export default function CodeBlock({
  text,
  language,
  className,
}: {
  text: string;
  language?: string;
  className?: string;
}) {
  const title = codeTitle(language);
  return (
    <figure className={`rule-grid flex min-w-0 flex-col ${className ?? ""}`}>
      <figcaption className="bg-panel text-label px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase">
        {title}
      </figcaption>
      <pre
        tabIndex={0}
        aria-label={`${title} code`}
        className="bg-code-ground text-code-text overflow-x-auto px-5 py-4 font-mono text-[13.5px] leading-[1.7]"
      >
        <code>{text}</code>
      </pre>
    </figure>
  );
}
