import type { Metadata } from "next";
import Link from "next/link";
import { Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { siteRoutes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute: "Artikel DekatLokal | Segera Hadir",
  },
  description:
    "Ruang artikel DekatLokal sedang disiapkan untuk berbagi panduan website, Digital Checkup, dan sistem digital untuk bisnis lokal.",
  alternates: {
    canonical: siteRoutes.articles,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ArtikelPage() {
  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <PublicHeader />

      <main className="mx-auto flex min-h-[calc(100vh-14rem)] w-full max-w-7xl items-center px-4 pb-16 pt-40 sm:px-6 md:pb-24 md:pt-48 lg:px-12">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-primary-100 bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(1,34,98,0.07)] md:px-10 md:py-[4.5rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(2,85,245,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(54,163,255,0.14),transparent_38%)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
              Artikel DekatLokal
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 md:text-5xl">
              Panduan digital untuk bisnis lokal sedang disiapkan.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
              Nantinya halaman ini berisi insight praktis tentang website UMKM, Digital Checkup,
              dan sistem digital yang bisa membantu usaha mengambil keputusan dengan lebih jelas.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={siteRoutes.digitalCheckup}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Mulai Digital Checkup
              </Link>
              <Link
                href={siteRoutes.websiteUmkmService}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Lihat layanan website
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
