/*
 * Renders the social cards into public/, before `next dev` and `next build`.
 *
 * Through Metaplate's own command, which writes every card where its metadata says it lives,
 * verifies each file, fails on whatever the plate's guards catch, and (with --target) fails a
 * card that breaks a platform's documented rules, such as WhatsApp's 600 KB limit or LinkedIn's
 * minimum size. Image URLs are relative here (Next's metadataBase makes them absolute), so the
 * URL rules are left to scripts/audit-export.mts and `npm run cards:verify-live`.
 *
 * Called in-process because the plate is JSX that Node cannot load alone: this script runs
 * under tsx, whose loader the import then goes through. That also avoids `NODE_OPTIONS=`, which
 * an npm script cannot set on Windows. The manifest is kept out of public/ so it is not published.
 */

import { runCli } from "metaplate/cli";

const TARGETS = ["openGraph", "x", "linkedin", "facebook", "whatsapp", "slack", "discord"];

const code = await runCli([
  "render",
  "--out",
  "public",
  "--manifest",
  ".og-manifest.json",
  ...TARGETS.flatMap((target) => ["--target", target]),
  // WhatsApp's limit, the strictest any platform documents.
  "--max-file-size",
  "600000",
  "src/lib/og/cards.render.tsx",
]);
process.exit(code);
