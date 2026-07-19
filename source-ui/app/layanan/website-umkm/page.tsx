import type { Metadata } from "next";
import {
  WebsiteUmkmServiceContent,
  websiteServiceFaq,
} from "@/components/commercial";
import { Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { siteConfig, siteRoutes } from "@/lib/site-config";

const SITE_URL = siteConfig.mainUrl;
const SERVICE_PATH = siteRoutes.websiteUmkmService;
const SERVICE_URL = `${SITE_URL}${SERVICE_PATH}`;
const OG_IMAGE = "/og-image.png";
const SERVICE_TITLE = "Jasa Pembuatan Website UMKM Cepat dan Tanpa Ribet | DekatLokal";
const SERVICE_DESCRIPTION =
  "Buat website UMKM profesional dengan katalog, WhatsApp, Maps, SEO dasar, dan tampilan mobile. Pengerjaan 1-2 hari setelah materi utama lengkap.";

export const metadata: Metadata = {
  title: {
    absolute: SERVICE_TITLE,
  },
  description: SERVICE_DESCRIPTION,
  keywords: [
    "jasa website UMKM",
    "pembuatan website UMKM",
    "website bisnis lokal",
    "website UMKM Makassar",
    "website katalog UMKM",
  ],
  alternates: {
    canonical: SERVICE_PATH,
  },
  openGraph: {
    title: SERVICE_TITLE,
    description: SERVICE_DESCRIPTION,
    url: SERVICE_PATH,
    type: "website",
    locale: "id_ID",
    siteName: "DekatLokal",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Layanan pembuatan website UMKM DekatLokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SERVICE_TITLE,
    description: SERVICE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const SERVICE_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SERVICE_URL}/#webpage`,
      url: SERVICE_URL,
      name: SERVICE_TITLE,
      description: SERVICE_DESCRIPTION,
      inLanguage: "id-ID",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      breadcrumb: {
        "@id": `${SERVICE_URL}/#breadcrumb`,
      },
      mainEntity: {
        "@id": `${SERVICE_URL}/#service`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/image/website-umkm/cards/aroma-bakery.webp`,
        width: 960,
        height: 720,
        caption: "Website UMKM yang dibuat DekatLokal",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SERVICE_URL}/#breadcrumb`,
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
          name: "Layanan Website UMKM",
          item: SERVICE_URL,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SERVICE_URL}/#service`,
      name: "Pembuatan Website UMKM",
      serviceType: "Jasa pembuatan website UMKM",
      url: SERVICE_URL,
      description: SERVICE_DESCRIPTION,
      provider: {
        "@id": `${SITE_URL}/#organization`,
        "@type": "Organization",
        name: "DekatLokal",
        url: SITE_URL,
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "UMKM dan bisnis lokal",
      },
      image: `${SITE_URL}/image/website-umkm/cards/aroma-bakery.webp`,
      category: "Website dan solusi digital untuk bisnis lokal",
    },
    {
      "@type": "FAQPage",
      "@id": `${SERVICE_URL}/#faq`,
      mainEntity: websiteServiceFaq.map((item) => ({
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

export default function WebsiteUmkmServicePage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA_JSON }}
      />

      <PublicHeader />

      <WebsiteUmkmServiceContent />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
