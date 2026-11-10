import { CARDS } from "@/lib/og/cards";
import { DESCRIPTION, EXPORTED_ROUTES, NAME, pathOf, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/*
 * /llms.txt: a plain-text map of the site for language-model tools, following the llmstxt.org
 * convention (a title, a one-line summary, then links with a note each). Built from the same
 * route list and card copy as everything else, so it cannot drift from the pages.
 */
export function GET() {
  const lines = [
    `# ${NAME}`,
    "",
    `> ${DESCRIPTION}`,
    "",
    "## Pages",
    "",
    ...EXPORTED_ROUTES.map((route) => {
      const card = CARDS[route];
      return `- [${card.title.replace(/\.$/, "")}](${SITE_URL}${pathOf(route)}): ${card.description}`;
    }),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
