import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";
import { DESCRIPTION, NAME } from "@/lib/site";

export const dynamic = "force-static";

/** The web app manifest: the name and colours a browser uses when the site is installed or pinned. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NAME,
    short_name: NAME,
    description: DESCRIPTION,
    start_url: "/",
    display: "browser",
    background_color: BRAND.ground,
    theme_color: BRAND.ground,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
