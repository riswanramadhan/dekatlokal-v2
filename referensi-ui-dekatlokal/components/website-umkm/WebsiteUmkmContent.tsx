"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import {
  southSulawesiRegions,
  umkmPortfolio,
  type SouthSulawesiRegion,
  type UmkmPortfolioItem,
} from "./data";

function ArrowIcon({ external = false }: { external?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cta-hover-icon h-4.5 w-4.5 shrink-0"
      aria-hidden="true"
    >
      {external ? (
        <>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </>
      ) : (
        <path d="M5 12h14M13 6l6 6-6 6" />
      )}
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function NaturalBrandLogo({
  src,
  alt,
  className = "umkm-logo-image",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <span className="whitespace-nowrap font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-neutral-400">
        {alt.replace(/ logo$/i, "")}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={420}
      height={220}
      className={className}
      sizes="(max-width: 767px) 120px, 168px"
      onError={() => setHasError(true)}
    />
  );
}

function PortfolioImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(145deg,#f7f9ff,#e8effe)] px-4 text-center text-primary/55">
        <div>
          <svg viewBox="0 0 24 24" fill="none" className="mx-auto mb-2 h-7 w-7" aria-hidden="true">
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="1.7" />
            <path d="m6.5 17 4-4 2.5 2.5 2-2 2.5 2.5M15.8 9.2h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em]">
            Foto akan ditambahkan
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 639px) calc(100vw - 52px), (max-width: 1023px) 45vw, 31vw"
      onError={() => setHasError(true)}
    />
  );
}

export default function WebsiteUmkmContent() {
  const [activeRegion, setActiveRegion] = useState<"all" | SouthSulawesiRegion>("all");
  const regionOptions = southSulawesiRegions.filter((region) =>
    umkmPortfolio.some((business) => business.regions.includes(region.id)),
  );
  const filteredPortfolio = activeRegion === "all"
    ? umkmPortfolio
    : umkmPortfolio.filter((business) => business.regions.includes(activeRegion));
  const mobileLogoRows: UmkmPortfolioItem[][] = [
    umkmPortfolio.filter((_, index) => index % 2 === 0),
    umkmPortfolio.filter((_, index) => index % 2 === 1),
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
      <section className="flex flex-col pb-12 pt-28 sm:pt-32 md:pb-16 md:pt-40">
        <div className="flex flex-col md:flex-1 md:justify-center">
          <motion.div
            className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-4 md:mb-5">
              <span className="hero-kicker hero-kicker--portfolio">
                <span>Website UMKM & Sociopreneur</span>
              </span>
            </div>

            <h1 className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.035em] text-neutral-950 md:text-4xl md:leading-[1.25] lg:text-5xl">
              Website Modern untuk{" "}
              <span className="font-mono font-medium tracking-[-0.055em] text-primary">
                UMKM Lokal
              </span>{" "}
              yang Siap Tumbuh
            </h1>
            <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-600 md:mt-4 md:text-base md:leading-7">
              <span className="md:block">
                Jelajahi karya digital yang membantu UMKM dan sociopreneur tampil lebih profesional, mudah ditemukan,
              </span>{" "}
              <span className="md:block">
                dan lebih dekat dengan pelanggan maupun komunitasnya.
              </span>
            </p>

            <div className="mt-5 md:mt-6">
              <Link
                href="/digital-checkup"
                className="animated-cta group inline-flex items-center gap-3 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:pl-5 md:text-sm"
              >
                <span>Mulai Digital Checkup</span>
                <span className="animated-cta__arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary md:h-9 md:w-9">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 md:h-4.5 md:w-4.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="mt-6 border-t border-neutral-100 pt-4 md:mt-9 md:pt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.35 }}
          >
            <p className="mb-4 text-center font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-neutral-400 md:text-xs">
              {umkmPortfolio.length} identitas lokal, satu gerak digital
            </p>
            <div className="umkm-logo-marquee hidden md:block" aria-label="Logo UMKM dan sociopreneur dalam portfolio">
              <div className="umkm-logo-track">
                {[0, 1].map((groupIndex) => (
                  <div
                    key={groupIndex}
                    className="umkm-logo-group"
                    aria-hidden={groupIndex === 1}
                  >
                    {umkmPortfolio.map((business) => (
                      <span
                        key={`${groupIndex}-${business.slug}`}
                        className="umkm-logo-chip"
                        title={business.name}
                      >
                        <NaturalBrandLogo src={business.logoImage} alt={`${business.name} logo`} />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="umkm-logo-rows md:hidden" aria-label="Logo UMKM dan sociopreneur dalam portfolio">
              {mobileLogoRows.map((logos, rowIndex) => (
                <div key={rowIndex} className="umkm-logo-marquee umkm-logo-marquee--mobile">
                  <div className={`umkm-logo-track ${rowIndex === 1 ? "umkm-logo-track--reverse" : ""}`}>
                    {[0, 1].map((groupIndex) => (
                      <div
                        key={`${rowIndex}-${groupIndex}`}
                        className="umkm-logo-group"
                        aria-hidden={groupIndex === 1}
                      >
                        {logos.map((business) => (
                          <span
                            key={`${rowIndex}-${groupIndex}-${business.slug}`}
                            className="umkm-logo-chip"
                            title={business.name}
                          >
                            <NaturalBrandLogo src={business.logoImage} alt={`${business.name} logo`} />
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="karya-umkm" className="scroll-mt-24 py-10 md:scroll-mt-28 md:py-24 lg:py-28">
        <div>
          <motion.div
            className="mb-8 max-w-3xl md:mb-10"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="mb-4 font-mono text-xs font-semibold tracking-[0.16em] text-primary md:text-sm">
              KARYA WEBSITE UMKM
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-5xl">
              Dibuat untuk karakter bisnis dan gerakan yang{" "}
              <span className="font-mono font-medium text-primary">berbeda-beda.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
              Setiap website dirancang agar identitas UMKM maupun sociopreneur tetap terasa, dengan pengalaman digital yang cepat, jelas, dan mudah digunakan.
            </p>
          </motion.div>

          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-neutral-800 md:text-base">
                Filter daerah
              </p>
              <p className="text-xs text-neutral-500" aria-live="polite">
                {filteredPortfolio.length} karya
              </p>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:pb-0"
              role="group"
              aria-label="Filter karya website berdasarkan daerah"
            >
              <button
                type="button"
                onClick={() => setActiveRegion("all")}
                aria-pressed={activeRegion === "all"}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-sm ${
                  activeRegion === "all"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                Semua Daerah
              </button>
              {regionOptions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setActiveRegion(region.id)}
                  aria-pressed={activeRegion === region.id}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-sm ${
                    activeRegion === region.id
                      ? "border-primary bg-primary text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {filteredPortfolio.map((business, index) => (
              <motion.article
                key={business.slug}
                className="group/card flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200 bg-white p-2.5 shadow-[0_12px_34px_rgba(1,34,98,0.06)] transition-colors duration-300 hover:border-primary/60 md:rounded-[2rem] md:p-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-45px" }}
                transition={{ duration: 0.48, ease: "easeOut", delay: Math.min(index % 3, 2) * 0.07 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-primary-50 md:rounded-[1.45rem]">
                  <PortfolioImage src={business.image} alt={business.imageAlt} />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold shadow-sm backdrop-blur-md md:text-xs ${business.type === "Sociopreneur" ? "bg-primary text-white" : "bg-white/92 text-neutral-800"}`}
                  >
                    {business.type}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3 pb-2 pt-4 sm:pt-5 md:p-4 md:pb-3 md:pt-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
                        {business.category}
                      </p>
                      <h3 className="text-xl font-semibold tracking-[-0.025em] text-neutral-950 md:text-2xl">
                        {business.name}
                      </h3>
                    </div>
                    <span className="card-brand-logo-frame">
                      <NaturalBrandLogo
                        src={business.logoImage}
                        alt={`${business.name} logo`}
                        className="card-brand-logo"
                      />
                    </span>
                  </div>
            <p className="min-h-[4.5rem] line-clamp-3 text-sm leading-6 text-neutral-600">
              {business.description}
            </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <LocationIcon />
                    <span>{business.location}</span>
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-2.5 pt-5 sm:grid-cols-2">
                    <Link
                      href={`/website-umkm/${business.slug}`}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-3 text-xs font-semibold text-neutral-800 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-sm"
                    >
                      Lihat Detail
                      <ArrowIcon />
                    </Link>
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Lihat website ${business.name}`}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(2,85,245,0.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:px-4 md:text-sm"
                    >
                      <span>Lihat Website</span>
                      <ArrowIcon external />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
