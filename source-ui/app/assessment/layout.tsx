import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

const APP_TITLE = "Digital Checkup UMKM | DekatLokal";
const APP_DESCRIPTION =
  "Aplikasi Digital Checkup DekatLokal untuk memetakan kondisi digital usaha dan menampilkan rekomendasi prioritas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.digitalCheckupUrl),
  title: {
    absolute: APP_TITLE,
  },
  description: APP_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: siteConfig.digitalCheckupUrl,
    siteName: "DekatLokal",
    locale: "id_ID",
    type: "website",
  },
};

export default function AssessmentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
