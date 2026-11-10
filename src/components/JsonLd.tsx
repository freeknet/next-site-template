import { DESCRIPTION, NAME, REPO_URL, SITE_URL } from "@/lib/site";

/*
 * Structured data for search engines: the site as a schema.org WebSite.
 *
 * A native <script>, not next/script, as Next's JSON-LD guide recommends, with `<` escaped so the
 * JSON can never close the tag early. It is a data block, not executable script, so the CSP step
 * (scripts/csp-hashes.mjs) leaves it out of the hashes.
 */
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NAME,
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    sameAs: [REPO_URL],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
