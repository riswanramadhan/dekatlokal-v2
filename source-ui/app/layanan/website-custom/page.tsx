import type { Metadata } from "next";
import ProfessionalServiceContent from "@/components/commercial/ProfessionalServiceContent";
import { websiteCustomService } from "@/components/commercial/extended-service-config";
import { buildProfessionalServiceSchema } from "@/components/commercial/service-schema";
import { Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { siteRoutes } from "@/lib/site-config";

const SERVICE_PATH = siteRoutes.websiteCustomService;
const TITLE = "Jasa Website Custom CMS dan Admin Panel | DekatLokal";
const DESCRIPTION =
  "Website custom CMS, multipage dinamis, admin panel, dan portofolio dinamis untuk personal atau bisnis. Mulai Rp1.999.999 dengan cakupan yang jelas.";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "jasa website custom",
    "website perusahaan custom",
    "website organisasi",
    "UI UX website Indonesia",
    "pengembangan website khusus",
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
        alt: "Layanan pembuatan website custom DekatLokal",
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
  serviceName: "Pembuatan Website Custom",
  serviceType: "Jasa perancangan dan pengembangan website custom",
  audienceType:
    "Personal, profesional, brand, organisasi, dan bisnis dengan kebutuhan website khusus",
  faq: websiteCustomService.faq,
});

export default function WebsiteCustomServicePage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA_JSON }}
      />

      <PublicHeader />

      <ProfessionalServiceContent config={websiteCustomService} />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
