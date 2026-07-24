import type { MetadataRoute } from "next";
import { mainSiteUrl, siteConfig, siteRoutes } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/preview/",
        "/staging/",
        "/scoring-simulation",
        "/assessment",
        "/assessment/",
        "/assesment",
        "/assesment/",
        "/login",
      ],
    },
    sitemap: mainSiteUrl(siteRoutes.sitemap),
    host: siteConfig.mainUrl,
  };
}
