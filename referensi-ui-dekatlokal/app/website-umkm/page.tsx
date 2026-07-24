import type { Metadata } from "next";
import { FinalCTA, Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import WebsiteUmkmContent from "@/components/website-umkm/WebsiteUmkmContent";
import { umkmPortfolio } from "@/components/website-umkm/data";
import { siteConfig } from "@/lib/site-config";

const SITE_URL = siteConfig.mainUrl;
const OG_IMAGE = "/og-image.png";
const WEBSITE_UMKM_TITLE = "Website UMKM Makassar dan Sulawesi Selatan | DekatLokal";
const WEBSITE_UMKM_DESCRIPTION =
  "Jelajahi website modern untuk UMKM Makassar dan Sulawesi Selatan yang dibuat DekatLokal agar usaha lokal tampil profesional, cepat, dan mudah ditemukan.";

export const metadata: Metadata = {
  title: {
    absolute: WEBSITE_UMKM_TITLE,
  },
  description: WEBSITE_UMKM_DESCRIPTION,
  keywords: [
    "website UMKM",
    "portfolio website UMKM",
    "jasa website UMKM",
    "website UMKM Sulawesi Selatan",
    "digitalisasi UMKM",
    "website sociopreneur",
  ],
  alternates: {
    canonical: "/website-umkm",
  },
  openGraph: {
    title: WEBSITE_UMKM_TITLE,
    description: WEBSITE_UMKM_DESCRIPTION,
    url: "/website-umkm",
    type: "website",
    locale: "id_ID",
    siteName: "DekatLokal",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Website UMKM Makassar dan Sulawesi Selatan DekatLokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: WEBSITE_UMKM_TITLE,
    description: WEBSITE_UMKM_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const PORTFOLIO_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/website-umkm/#collection`,
  name: WEBSITE_UMKM_TITLE,
  url: `${SITE_URL}/website-umkm`,
  description: WEBSITE_UMKM_DESCRIPTION,
  inLanguage: "id-ID",
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: umkmPortfolio.length,
    itemListElement: umkmPortfolio.map((business, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": business.type === "UMKM" ? "LocalBusiness" : "Organization",
        "@id": `${SITE_URL}/website-umkm/${business.slug}#business`,
        name: business.name,
        url: `${SITE_URL}/website-umkm/${business.slug}`,
        sameAs: business.websiteUrl,
        image: `${SITE_URL}${business.image}`,
        logo: `${SITE_URL}${business.logoImage}`,
        description: business.details.join(" "),
        areaServed: {
          "@type": "AdministrativeArea",
          name: `${business.location}, Sulawesi Selatan`,
        },
      },
    })),
  },
}).replace(/</g, "\\u003c");

export default function WebsiteUmkmPage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PORTFOLIO_SCHEMA_JSON }}
      />

      <PublicHeader />

      <WebsiteUmkmContent />
      <FinalCTA />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
