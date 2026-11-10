import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";
import { DESCRIPTION, NAME, PWA, SHORT_NAME } from "@/lib/site";

export const dynamic = "force-static";

/*
 * The web app manifest: what a browser needs to install the site as an app (docs/pwa.md).
 *
 * Installability needs a name, `start_url`, `display` of standalone (or fullscreen/minimal-ui),
 * and 192px and 512px icons; the maskable icon is what Android crops into its icon shapes. With
 * PWA off the manifest stays, for its name and colours, but `display: browser` means nothing
 * offers to install the site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: NAME,
    short_name: SHORT_NAME,
    description: DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: PWA ? "standalone" : "browser",
    background_color: BRAND.ground,
    theme_color: BRAND.ground,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
