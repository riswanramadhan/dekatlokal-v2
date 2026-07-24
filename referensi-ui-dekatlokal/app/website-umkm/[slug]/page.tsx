import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCTA, Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import { umkmPortfolio } from "@/components/website-umkm/data";
import { siteConfig } from "@/lib/site-config";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = siteConfig.mainUrl;

function getBusiness(slug: string) {
  return umkmPortfolio.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return umkmPortfolio.map((business) => ({ slug: business.slug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = getBusiness(slug);

  if (!business) {
    return {
      title: "Detail Website UMKM",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const detailUrl = `/website-umkm/${business.slug}`;

  return {
    title: `Website ${business.name} - ${business.category} ${business.location}`,
    description: business.description,
    alternates: {
      canonical: detailUrl,
    },
    openGraph: {
      title: `${business.name} - ${business.category} di ${business.location} | DekatLokal`,
      description: business.description,
      url: detailUrl,
      type: "website",
      locale: "id_ID",
      siteName: "DekatLokal",
      images: [
        {
          url: business.image,
          width: 960,
          height: 720,
          alt: business.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.name} - ${business.category} di ${business.location} | DekatLokal`,
      description: business.description,
      images: [business.image],
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
}

export default async function WebsiteUmkmDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const business = getBusiness(slug);

  if (!business) {
    notFound();
  }

  const detailUrl = `${SITE_URL}/website-umkm/${business.slug}`;
  const businessId = `${detailUrl}#business`;
  const breadcrumbId = `${detailUrl}#breadcrumb`;
  const businessDescription = business.details.join(" ");
  const businessSchemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${detailUrl}#webpage`,
        url: detailUrl,
        name: `Website ${business.name} - ${business.category} ${business.location}`,
        description: business.description,
        inLanguage: "id-ID",
        isPartOf: {
          "@id": `${SITE_URL}/website-umkm/#collection`,
        },
        breadcrumb: {
          "@id": breadcrumbId,
        },
        mainEntity: {
          "@id": businessId,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
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
            name: "Website UMKM",
            item: `${SITE_URL}/website-umkm`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: business.name,
            item: detailUrl,
          },
        ],
      },
      {
        "@type": business.type === "UMKM" ? "LocalBusiness" : "Organization",
        "@id": businessId,
        name: business.name,
        url: detailUrl,
        sameAs: business.websiteUrl,
        image: `${SITE_URL}${business.image}`,
        logo: `${SITE_URL}${business.logoImage}`,
        description: businessDescription,
        address: {
          "@type": "PostalAddress",
          addressLocality: business.location,
          addressRegion: "Sulawesi Selatan",
          addressCountry: "ID",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: `${business.location}, Sulawesi Selatan`,
        },
        mainEntityOfPage: {
          "@id": `${detailUrl}#webpage`,
        },
      },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <div className="public-page-shell min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: businessSchemaJson }}
      />

      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-40 lg:px-12">
        <Link
          href="/website-umkm"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Kembali ke karya UMKM
        </Link>

        <section className="mt-8 grid items-center gap-8 md:mt-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="portfolio-detail-visual">
            <div className="relative mb-4 h-16 w-40 max-w-full md:mb-5 md:h-20 md:w-44">
              <Image
                src={business.logoImage}
                alt={`Logo ${business.name}`}
                fill
                className="object-contain object-left"
                sizes="176px"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-primary-50 shadow-[0_18px_48px_rgba(1,34,98,0.08)]">
              <Image
                src={business.image}
                alt={business.imageAlt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 767px) calc(100vw - 40px), 52vw"
              />
            </div>
          </div>

          <div className="portfolio-detail-content">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary md:text-sm">
              {business.category}
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-neutral-950 md:text-5xl">
              {business.name}
            </h1>
            <div className="mt-5 space-y-4">
              {business.details.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium text-neutral-500">Jenis</dt>
                <dd className="mt-1 font-semibold text-neutral-950">{business.type}</dd>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium text-neutral-500">Wilayah</dt>
                <dd className="mt-1 font-semibold text-neutral-950">{business.location}</dd>
              </div>
            </dl>

            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animated-cta mt-7 inline-flex items-center gap-3 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-base"
            >
              <span>Kunjungi Website</span>
              <span className="animated-cta__arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </span>
            </a>
          </div>
        </section>
      </main>

      <FinalCTA />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
