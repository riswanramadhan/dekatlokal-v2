import type { Metadata } from "next";
import ProfessionalServiceContent from "@/components/commercial/ProfessionalServiceContent";
import { digitalSystemService } from "@/components/commercial/extended-service-config";
import { buildProfessionalServiceSchema } from "@/components/commercial/service-schema";
import { Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { siteRoutes } from "@/lib/site-config";

const SERVICE_PATH = siteRoutes.digitalSystemService;
const TITLE = "Sistem Digital untuk Operasional Bisnis | DekatLokal";
const DESCRIPTION =
  "Bangun dashboard, booking, otomasi, atau sistem internal dengan coding dari nol sesuai proses tim, keinginan, dan goals bisnis.";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "pengembangan sistem digital",
    "sistem operasional bisnis",
    "dashboard bisnis custom",
    "sistem booking custom",
    "digitalisasi proses UMKM",
  ],
  alternates: {
    canonical: SERVICE_PATH,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SERVICE_PATH,
    type: "website",
    locale: "id_ID",
    siteName: "DekatLokal",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Layanan pengembangan sistem digital DekatLokal",
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

const SERVICE_SCHEMA_JSON = buildProfessionalServiceSchema({
  path: SERVICE_PATH,
  title: TITLE,
  description: DESCRIPTION,
  serviceName: "Pengembangan Sistem Digital",
  serviceType: "Jasa pemetaan dan pengembangan sistem digital operasional",
  audienceType: "Bisnis dan organisasi yang perlu merapikan proses operasional",
  faq: digitalSystemService.faq,
});

export default function DigitalSystemServicePage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA_JSON }}
      />

      <PublicHeader />

      <ProfessionalServiceContent config={digitalSystemService} />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
