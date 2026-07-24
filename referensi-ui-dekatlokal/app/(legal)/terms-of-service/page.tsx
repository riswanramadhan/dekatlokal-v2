import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy";
import { termsOfServiceData } from "@/data/terms-of-service";
import { mainSiteUrl, siteRoutes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Baca syarat dan ketentuan penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
  openGraph: {
    title: "Syarat & Ketentuan | DekatLokal",
    description:
      "Baca syarat dan ketentuan penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
    url: mainSiteUrl(siteRoutes.termsOfService),
    siteName: "DekatLokal",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DekatLokal - Digital Checkup UMKM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan | DekatLokal",
    description:
      "Baca syarat dan ketentuan penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: mainSiteUrl(siteRoutes.termsOfService),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return <PolicyLayout {...termsOfServiceData} />;
}
