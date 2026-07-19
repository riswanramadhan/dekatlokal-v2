import { siteConfig, siteRoutes } from "@/lib/site-config";
import type { CommercialFaqItem } from "./config";

export function buildProfessionalServiceSchema({
  path,
  title,
  description,
  serviceName,
  serviceType,
  audienceType,
  faq,
}: {
  path: string;
  title: string;
  description: string;
  serviceName: string;
  serviceType: string;
  audienceType: string;
  faq: readonly CommercialFaqItem[];
}): string {
  const siteUrl = siteConfig.mainUrl;
  const pageUrl = `${siteUrl}${path}`;
  const servicesUrl = `${siteUrl}${siteRoutes.services}`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: "id-ID",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        breadcrumb: {
          "@id": `${pageUrl}/#breadcrumb`,
        },
        mainEntity: {
          "@id": `${pageUrl}/#service`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Layanan",
            item: servicesUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: serviceName,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: serviceName,
        serviceType,
        url: pageUrl,
        description,
        provider: {
          "@id": `${siteUrl}/#organization`,
          "@type": "Organization",
          name: "DekatLokal",
          url: siteUrl,
        },
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
        audience: {
          "@type": "BusinessAudience",
          audienceType,
        },
        category: "Website dan solusi digital untuk bisnis lokal",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  }).replace(/</g, "\\u003c");
}

