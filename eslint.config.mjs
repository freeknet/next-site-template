import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  /*
   * Canonical Tailwind classes, enforced rather than suggested. An arbitrary
   * value that a registered token already produces (`tracking-[-0.025em]` for
   * `tracking-tight`) is an error. Tokens are read from globals.css, so a token
   * added there is covered without this file changing. `collapse` is off: it
   * would rewrite per-side spacing into shorthands, which is a different
   * judgement from "you spelled a token the long way".
   */
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.tsx", "tests/**/*.tsx"],
    plugins: { "better-tailwindcss": betterTailwind },
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css" },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": [
        "error",
        { collapse: false },
      ],
    },
  },
  // Overrides the default ignores of eslint-config-next, which is why the
  // defaults have to be repeated here rather than added to.
  globalIgnores([
    // Defaults of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Host tooling state.
    ".netlify/**",
    ".wrangler/**",
    // Tooling output.
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
    ".lighthouseci/**",
  ]),
]);

export default eslintConfig;
