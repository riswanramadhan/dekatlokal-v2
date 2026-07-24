import type { Metadata } from "next";
import { HomeCommercialSections } from "@/components/commercial";
import { FinalCTA, Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { HeroSection, SupportedBySection } from "@/components/sections/landing";
import { siteConfig, siteRoutes } from "@/lib/site-config";

const SITE_URL = siteConfig.mainUrl;
const HOME_HERO_IMAGE = "/image/website-umkm/cards/aroma-bakery.webp";
const OG_IMAGE = "/og-image.png";
const HOME_TITLE = "DekatLokal | Website dan Solusi Digital untuk Bisnis Lokal";
const HOME_DESCRIPTION =
  "Bangun website UMKM, website custom, dan solusi digital yang mudah melalui DekatLokal. Mulai dari Digital Checkup atau konsultasikan kebutuhan bisnis Anda.";

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: siteRoutes.home,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: siteRoutes.home,
    siteName: "DekatLokal",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "DekatLokal | Website dan solusi digital untuk bisnis lokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const HOME_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DekatLokal",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: HOME_DESCRIPTION,
      sameAs: ["https://www.instagram.com/dekatlokal/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: "+62-895-1633-5023",
        email: "hello@dekatlokal.com",
        availableLanguage: "Indonesian",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "DekatLokal",
      inLanguage: "id-ID",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "id-ID",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#primaryimage`,
        url: `${SITE_URL}${HOME_HERO_IMAGE}`,
        contentUrl: `${SITE_URL}${HOME_HERO_IMAGE}`,
        representativeOfPage: true,
        width: 960,
        height: 720,
        caption: "Website UMKM yang dibuat DekatLokal",
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${siteRoutes.websiteUmkmService}/#service`,
      name: "Pembuatan Website UMKM",
      serviceType: "Jasa pembuatan website UMKM",
      url: `${SITE_URL}${siteRoutes.websiteUmkmService}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "UMKM dan bisnis lokal",
      },
      description:
        "Layanan pembuatan website untuk membantu UMKM menyusun profil usaha, katalog, dan jalur kontak dalam satu rumah digital.",
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${siteRoutes.digitalCheckup}/#service`,
      name: "Digital Checkup UMKM",
      url: `${SITE_URL}${siteRoutes.digitalCheckup}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      description:
        "Pemeriksaan kondisi digital UMKM dan rekomendasi langkah digitalisasi yang lebih terarah.",
    },
  ],
}).replace(/</g, "\\u003c");

export default function HomePage() {
  return (
    <div className="public-page-shell relative min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: HOME_SCHEMA_JSON }}
      />

      <PublicHeader />

      <main>
        <div className="overflow-hidden bg-primary">
          <section id="beranda" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
            <HeroSection />
          </section>
        </div>
        <div className="bg-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
            <SupportedBySection />
            <HomeCommercialSections />
          </div>
        </div>
      </main>

      <FinalCTA
        title="Siap membangun langkah digital berikutnya?"
        description="Mulai dari website profesional atau petakan prioritas bisnis Anda melalui Digital Checkup gratis."
        primaryLabel="Buat Website Sekarang"
        primaryHref={siteRoutes.websiteUmkmService}
        secondaryLabel="Cek Kesiapan Digital Gratis"
        secondaryHref={siteConfig.digitalCheckupUrl}
        secondaryExternal
      />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
