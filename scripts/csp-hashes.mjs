// Writes a strict Content-Security-Policy into every exported page.
//
// A static export has no server to mint nonces, and Next inlines its bootstrap (the
// `self.__next_f.push(...)` payload) plus the theme script as inline <script>s, so the usual
// fallback is `script-src 'unsafe-inline'`, which lets any injected script run too. Instead, this
// hashes each page's own inline scripts and puts a <meta http-equiv="Content-Security-Policy">
// first in its <head> that allows exactly those hashes and same-origin files.
//
// public/_headers sends a looser policy as a header as well, for what a <meta> policy cannot set
// (frame-ancestors). Browsers enforce both, so the stricter one decides. To allow a third-party
// origin (analytics, an embed), add it to POLICY below and to _headers.
//
// Runs in postbuild. tests/e2e/console.spec.ts fails on any CSP violation.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const POLICY = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  // React writes style attributes; hashing those needs 'unsafe-hashes' per value, so styles stay open.
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

/** Script types a browser executes. Anything else (JSON-LD, importmaps aside) is a data block. */
const EXECUTABLE = new Set(["", "text/javascript", "application/javascript", "module"]);

const SCRIPT = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;

export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const [, attributes = "", body] of html.matchAll(SCRIPT)) {
    if (/\ssrc\s*=/i.test(attributes) || body.length === 0) continue;
    const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attributes)?.[1]?.toLowerCase() ?? "";
    if (!EXECUTABLE.has(type)) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  return [...hashes];
}

export function policyFor(html) {
  const directives = { ...POLICY, "script-src": [...POLICY["script-src"], ...inlineScriptHashes(html)] };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

export function withPolicy(html) {
  if (html.includes('http-equiv="Content-Security-Policy"')) return html;
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policyFor(html)}"/>`;
  // First in <head>: a <meta> policy only governs what comes after it.
  return html.replace(/<head(\s[^>]*)?>/i, (open) => `${open}${meta}`);
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

// Run as a script, not when a test imports the functions above.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.resolve("out");
  if (!fs.existsSync(out)) {
    console.error("csp-hashes: no out/ folder; run next build first.");
    process.exit(1);
  }
  const files = htmlFiles(out);
  for (const file of files) fs.writeFileSync(file, withPolicy(fs.readFileSync(file, "utf8")));
  console.log(`csp-hashes: wrote a hashed policy into ${files.length} page(s).`);
}
