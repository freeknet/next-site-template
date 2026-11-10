import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/og/metadata";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { DESCRIPTION, INDEXABLE, NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { BRAND } from "@/lib/constants";
import "./globals.css";

/*
 * Space Grotesk for headings, Inter for body copy, JetBrains Mono for code.
 *
 * Self-hosted from @fontsource (already a dependency for the social cards), so
 * a build asks no font service for anything and a page loads no font from
 * another origin. All three are SIL OFL 1.1; scripts/copy-font-licences.mjs
 * publishes their licences with the export. Only the weights the pages use
 * are listed, because next/font preloads what is here.
 */
const spaceGrotesk = localFont({
  variable: "--font-space-grotesk",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2", weight: "600" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", weight: "600" },
  ],
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2", weight: "500" },
  ],
});

export const metadata: Metadata = {
  ...pageMetadata("/", {
    title: { default: `${NAME}: ${TAGLINE}`, template: `%s · ${NAME}` },
    description: DESCRIPTION,
  }),
  metadataBase: new URL(SITE_URL),
  applicationName: NAME,
  // Until launch, every page asks not to be indexed (see INDEXABLE in lib/site.ts).
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: BRAND.ground,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="bg-ground text-text flex min-h-full flex-col">
        {/*
          Applies a stored theme before first paint. A plain inline script, not
          next/script: `beforeInteractive` is dropped from a static export,
          which brought back a flash of the wrong theme on every load. As the
          first node in <body> it runs before anything below it is painted.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <JsonLd />
      </body>
    </html>
  );
}
