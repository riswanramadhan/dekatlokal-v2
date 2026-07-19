import type { MetadataRoute } from "next";
import {
  PORTFOLIO_LAST_UPDATED,
  umkmPortfolio,
} from "@/components/website-umkm/data";
import { mainSiteUrl, siteConfig, siteRoutes } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentLastModified = new Date("2026-07-16T00:00:00+08:00");
  const portfolioLastModified = new Date(`${PORTFOLIO_LAST_UPDATED}T00:00:00+08:00`);
  const portfolioDetailPages: MetadataRoute.Sitemap = umkmPortfolio.map((business) => ({
    url: mainSiteUrl(`${siteRoutes.websiteUmkm}/${business.slug}`),
    lastModified: portfolioLastModified,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [
    {
      url: siteConfig.mainUrl,
      lastModified: contentLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: mainSiteUrl(siteRoutes.websiteUmkmService),
      lastModified: contentLastModified,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      url: mainSiteUrl(siteRoutes.digitalCheckup),
      lastModified: contentLastModified,
      changeFrequency: "weekly",
      priority: 0.96,
    },
    {
      url: mainSiteUrl(siteRoutes.services),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 0.94,
    },
    {
      url: mainSiteUrl(siteRoutes.websiteUmkm),
      lastModified: portfolioLastModified,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: mainSiteUrl(siteRoutes.websiteCustomService),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: mainSiteUrl(siteRoutes.digitalSystemService),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: mainSiteUrl(siteRoutes.privacyPolicy),
      lastModified: contentLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: mainSiteUrl(siteRoutes.termsOfService),
      lastModified: contentLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...portfolioDetailPages,
  ];
}
