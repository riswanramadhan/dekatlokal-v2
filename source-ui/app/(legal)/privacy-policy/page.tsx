import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy";
import { privacyPolicyData } from "@/data/privacy-policy";
import { mainSiteUrl, siteRoutes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Baca kebijakan privasi penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
  openGraph: {
    title: "Kebijakan Privasi | DekatLokal",
    description:
      "Baca kebijakan privasi penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
    url: mainSiteUrl(siteRoutes.privacyPolicy),
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
    title: "Kebijakan Privasi | DekatLokal",
    description:
      "Baca kebijakan privasi penggunaan layanan DekatLokal | platform digitalisasi UMKM lokal di Indonesia.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: mainSiteUrl(siteRoutes.privacyPolicy),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PolicyLayout {...privacyPolicyData} />;
}
