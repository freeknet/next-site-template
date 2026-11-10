// Publishes each self-hosted font's licence beside the export, at /fonts/<family>-LICENSE.txt.
// The fonts are SIL OFL 1.1, which asks that the licence travel with the font files.
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const FAMILIES = ["inter", "jetbrains-mono", "space-grotesk"];
const target = path.join("public", "fonts");
mkdirSync(target, { recursive: true });

for (const family of FAMILIES) {
  copyFileSync(
    path.join("node_modules", "@fontsource", family, "LICENSE"),
    path.join(target, `${family}-LICENSE.txt`),
  );
}
console.log(`copy-font-licences: ${FAMILIES.length} licence(s) in ${target}`);
