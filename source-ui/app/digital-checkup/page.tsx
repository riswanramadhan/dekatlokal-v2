import type { Metadata } from "next";
import DigitalCheckupLanding from "@/components/digital-checkup/DigitalCheckupLanding";
import { digitalCheckupFaq } from "@/features/digital-checkup/landing-content";
import { siteConfig } from "@/lib/site-config";

const SITE_URL = siteConfig.mainUrl;
const DIGITAL_CHECKUP_OG_IMAGE = "/og-digital-checkup.png";
const DIGITAL_CHECKUP_TITLE = "Digital Checkup UMKM Gratis | Cek Kesiapan Digital Usaha";
const DIGITAL_CHECKUP_DESCRIPTION =
  "Cek kesiapan digital UMKM secara gratis, temukan prioritas usaha, dan dapatkan rekomendasi yang mudah dilakukan bersama DekatLokal.";

export const metadata: Metadata = {
  title: {
    absolute: DIGITAL_CHECKUP_TITLE,
  },
  description: DIGITAL_CHECKUP_DESCRIPTION,
  openGraph: {
    title: DIGITAL_CHECKUP_TITLE,
    description: DIGITAL_CHECKUP_DESCRIPTION,
    url: "/digital-checkup",
    siteName: "DekatLokal",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: DIGITAL_CHECKUP_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Digital Checkup UMKM Gratis DekatLokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DIGITAL_CHECKUP_TITLE,
    description: DIGITAL_CHECKUP_DESCRIPTION,
    images: [DIGITAL_CHECKUP_OG_IMAGE],
  },
  alternates: {
    canonical: "/digital-checkup",
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

const DIGITAL_CHECKUP_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/digital-checkup/#webpage`,
      url: `${SITE_URL}/digital-checkup`,
      name: DIGITAL_CHECKUP_TITLE,
      description: DIGITAL_CHECKUP_DESCRIPTION,
      inLanguage: "id-ID",
      isAccessibleForFree: true,
      breadcrumb: {
        "@id": `${SITE_URL}/digital-checkup/#breadcrumb`,
      },
      mainEntity: {
        "@id": `${SITE_URL}/digital-checkup/#service`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/digital-checkup/#primaryimage`,
        url: `${SITE_URL}${DIGITAL_CHECKUP_OG_IMAGE}`,
        contentUrl: `${SITE_URL}${DIGITAL_CHECKUP_OG_IMAGE}`,
        width: 1200,
        height: 630,
        caption: "Digital Checkup UMKM Gratis DekatLokal",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/digital-checkup/#breadcrumb`,
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
          name: "Digital Checkup",
          item: `${SITE_URL}/digital-checkup`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/digital-checkup/#service`,
      name: "Digital Checkup UMKM Gratis",
      serviceType: "Pemeriksaan kesiapan digital UMKM",
      url: `${SITE_URL}/digital-checkup`,
      description: DIGITAL_CHECKUP_DESCRIPTION,
      isAccessibleForFree: true,
      provider: {
        "@id": `${SITE_URL}/#organization`,
        "@type": "Organization",
        name: "DekatLokal",
        url: SITE_URL,
      },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "UMKM dan bisnis lokal",
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
        url: siteConfig.digitalCheckupUrl,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/digital-checkup/#faq`,
      mainEntity: digitalCheckupFaq.map((item) => ({
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

export default function DigitalCheckupPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: DIGITAL_CHECKUP_SCHEMA_JSON }}
      />
      <DigitalCheckupLanding />
    </>
  );
}
