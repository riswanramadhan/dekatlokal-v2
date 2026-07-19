import type { Metadata } from "next";
import ServicesOverviewContent from "@/components/commercial/ServicesOverviewContent";
import {
  commercialNeedOptions,
} from "@/components/commercial/config";
import { servicesOverviewFaq } from "@/components/commercial/extended-service-config";
import { Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { siteConfig, siteRoutes } from "@/lib/site-config";

const SITE_URL = siteConfig.mainUrl;
const SERVICES_PATH = siteRoutes.services;
const SERVICES_URL = `${SITE_URL}${SERVICES_PATH}`;
const TITLE = "Layanan Website dan Sistem Digital untuk Bisnis Lokal | DekatLokal";
const DESCRIPTION =
  "Pilih Digital Checkup, Website UMKM Cepat, Website Custom, atau Sistem Digital sesuai kebutuhan bisnis. Cakupan kerja, proses, dan estimasi dibahas secara jelas.";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "layanan digital UMKM",
    "jasa website bisnis lokal",
    "website custom Indonesia",
    "sistem digital bisnis",
    "Digital Checkup UMKM",
  ],
  alternates: {
    canonical: SERVICES_PATH,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SERVICES_PATH,
    type: "website",
    locale: "id_ID",
    siteName: "DekatLokal",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Pilihan layanan digital DekatLokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SERVICES_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SERVICES_URL}/#webpage`,
      url: SERVICES_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "id-ID",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      breadcrumb: {
        "@id": `${SERVICES_URL}/#breadcrumb`,
      },
      mainEntity: {
        "@id": `${SERVICES_URL}/#services-list`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SERVICES_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Layanan",
          item: SERVICES_URL,
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SERVICES_URL}/#services-list`,
      name: "Layanan DekatLokal",
      itemListElement: commercialNeedOptions.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.title,
        url: `${SITE_URL}${service.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SERVICES_URL}/#faq`,
      mainEntity: servicesOverviewFaq.map((item) => ({
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

export default function ServicesPage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: SERVICES_SCHEMA_JSON }}
      />

      <PublicHeader />

      <ServicesOverviewContent />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
