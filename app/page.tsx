import type { Metadata } from "next";
import { PublicLanding } from "@/components/landing/public-landing";
import { getRepositoriesForRequest } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Digital Checkup Gratis untuk UMKM | DekatLokal",
  description:
    "Digital Checkup gratis untuk cek kondisi usaha dalam 5–7 menit. Dapatkan hasil langsung dan temukan langkah berikutnya untuk pemasaran, penjualan, serta pertumbuhan UMKM.",
  keywords: [
    "Digital Checkup UMKM",
    "cek usaha gratis",
    "checkup bisnis UMKM",
    "pengembangan UMKM",
    "belajar bisnis UMKM",
    "DekatLokal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Digital Checkup Gratis untuk UMKM | DekatLokal",
    description:
      "Cek kondisi usahamu dalam 5–7 menit, lihat hasil langsung, lalu temukan langkah yang bisa kamu mulai hari ini.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Checkup Gratis untuk UMKM | DekatLokal",
    description: "Cek usahamu gratis, lihat hasil langsung, dan mulai dari langkah yang paling dibutuhkan.",
  },
};

export default async function PublicLandingPage() {
  const repositories = await getRepositoriesForRequest();
  const modules = await repositories.learning.listFoundationalModules();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Digital Checkup DekatLokal",
    url: "https://digitalcheckup.dekatlokal.com/",
    description: "Digital Checkup gratis untuk membantu UMKM melihat kondisi usaha dan menemukan langkah berikutnya.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "id-ID",
    offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
    provider: { "@type": "Organization", name: "DekatLokal", url: "https://dekatlokal.com/" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicLanding modules={modules} checkupHref="/mulai" />
    </>
  );
}
