import type { MetadataRoute } from "next";
import { EXPORTED_ROUTES, pathOf, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Paths carry their trailing slash and SITE_URL carries none, so the join never doubles one.
  return EXPORTED_ROUTES.map((route) => ({ url: `${SITE_URL}${pathOf(route)}`, lastModified }));
}
