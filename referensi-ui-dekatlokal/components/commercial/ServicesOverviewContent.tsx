import Link from "next/link";
import {
  commercialLinks,
  commercialNeedOptions,
} from "./config";
import {
  servicesOverviewFaq,
  servicesOverviewPrinciples,
} from "./extended-service-config";
import {
  ArrowIcon,
  CommercialFaqList,
  CommercialIcon,
  CommercialLink,
  CommercialProcessSection,
  SectionHeading,
} from "./SharedCommercialSections";

const serviceDecisionGuide = [
  {
    situation: "Ingin memahami prioritas digital terlebih dahulu",
    recommendation: "Digital Checkup",
    href: commercialLinks.digitalCheckup,
    note: "Mulai dari checkup gratis, rekomendasi prioritas, dan peluang mengikuti program website gratis.",
  },
  {
    situation: "Butuh profil, katalog, lokasi, dan jalur kontak yang cepat dirapikan",
    recommendation: "Website UMKM Cepat",
    href: commercialLinks.websiteService,
    note: "Cakupan awal lebih terstruktur untuk kebutuhan bisnis lokal.",
  },
  {
    situation: "Punya banyak audiens, konten kompleks, atau alur website khusus",
    recommendation: "Website Custom",
    href: commercialLinks.websiteCustom,
    note: "Dimulai dari pemetaan struktur, pengalaman pengguna, fitur, dan integrasi.",
  },
  {
    situation: "Proses order, administrasi, booking, atau monitoring mulai sulit dipantau",
    recommendation: "Sistem Digital",
    href: commercialLinks.digitalSystem,
    note: "Merapikan proses utama sebelum sistem dikembangkan.",
  },
] as const;

function OverviewHero() {
  return (
    <section className="section-scroll-reveal grid items-center gap-10 pb-12 pt-40 sm:pt-44 md:pb-14 md:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-16 lg:pt-40">
      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary md:text-sm">
          LAYANAN DEKATLOKAL
        </p>
        <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-neutral-950 sm:text-4xl lg:text-[2.9rem]">
          Pilih layanan yang paling pas untuk pertumbuhan bisnis Anda
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
          Tidak semua bisnis membutuhkan solusi yang sama. Mulai dari Digital Checkup, website
          siap tayang, website custom, atau sistem operasional yang dibuat sesuai kebutuhan Anda.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CommercialLink href={commercialLinks.servicesConsultation} external>
            Bantu pilih layanan
            <ArrowIcon external />
          </CommercialLink>
          <CommercialLink href={commercialLinks.digitalCheckupApp} external variant="outline">
            Mulai Digital Checkup
            <ArrowIcon external />
          </CommercialLink>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-primary-50 sm:-inset-5" aria-hidden="true" />
        <div className="grid grid-cols-2 gap-3 rounded-[2rem] border border-primary-100 bg-white p-3 shadow-[0_24px_64px_rgba(1,34,98,0.13)] sm:p-4">
          {commercialNeedOptions.map((option, index) => (
            <Link
              key={option.title}
              href={option.href}
              className={`group rounded-[1.35rem] p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5 ${
                index === 0 || index === 3
                  ? "bg-primary text-white"
                  : "bg-primary-50 text-neutral-950"
              }`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  index === 0 || index === 3
                    ? "bg-white/15 text-white"
                    : "bg-white text-primary"
                }`}
              >
                <CommercialIcon name={option.icon} />
              </span>
            <span className="mt-7 block text-sm font-semibold leading-snug sm:text-base">
                {option.title}
              </span>
              <span
                className={`mt-2 block text-[0.68rem] italic leading-5 sm:text-xs ${
                  index === 0 || index === 3 ? "text-primary-100" : "text-primary"
                }`}
              >
                {option.audienceLabel}
              </span>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 text-[0.68rem] font-medium sm:text-xs ${
                  index === 0 || index === 3 ? "text-primary-100" : "text-primary"
                }`}
              >
                Buka halaman
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceOptionsSection() {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="PILIH LAYANAN"
        title="Tidak semua bisnis membutuhkan website yang sama"
        description="Pilih layanan berdasarkan tujuan, cara kerja, dan hasil yang ingin dicapai. Setiap halaman menjelaskan manfaat, cakupan, harga awal, dan prosesnya dengan jelas."
        align="left"
        layout="split"
        accentWord="kebutuhan"
        accentStyle="highlight"
      />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
        {commercialNeedOptions.map((option) => (
          <Link
            key={option.title}
            href={option.href}
            className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_34px_rgba(1,34,98,0.05)] transition-all hover:-translate-y-1 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <CommercialIcon name={option.icon} />
            </span>
            <p className="mt-4 text-xs italic leading-5 text-primary md:text-[0.8rem]">
              {option.audienceLabel}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950">
              {option.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-neutral-600">{option.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 border-t border-neutral-200 pt-4 text-sm font-semibold text-primary">
              {option.ctaLabel}
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DecisionGuideSection() {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="PANDUAN MEMILIH"
            title="Mulai dari situasi yang sedang Anda hadapi"
            description="Pilih layanan dari masalah yang paling terasa hari ini. Anda tetap dapat berkonsultasi jika belum yakin menentukan titik mulainya."
            accentWord="situasi"
            accentStyle="italic"
          />
        </div>
        <div className="space-y-4">
          {serviceDecisionGuide.map((item) => (
            <Link
              key={item.recommendation}
              href={item.href}
              className="group block rounded-3xl border border-neutral-200 bg-white p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:p-6"
            >
              <p className="text-sm leading-7 text-neutral-600">{item.situation}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-950">{item.recommendation}</h3>
                  <p className="mt-1 text-xs leading-6 text-neutral-500">{item.note}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowIcon />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="rounded-[2rem] bg-primary-50 px-6 py-9 md:px-10 md:py-12 lg:px-14">
        <SectionHeading
          eyebrow="PRINSIP KERJA"
          title="Lebih jelas sebelum lebih banyak"
          description="Kami mengutamakan keputusan yang bisa dijelaskan, alur yang mudah dipakai, dan cakupan kerja yang dapat dievaluasi."
          accentWord="jelas"
          accentStyle="mono"
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicesOverviewPrinciples.map((principle) => (
            <article key={principle.title} className="rounded-3xl bg-white p-5 md:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white">
                <CommercialIcon name={principle.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold leading-snug text-neutral-950">
                {principle.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{principle.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewFaqSection() {
  const headingId = "services-overview-faq-heading";

  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="FAQ LAYANAN"
            title="Yang perlu jelas sebelum memilih"
            description="Jawaban singkat untuk membantu Anda memulai dari layanan yang tepat."
            accentWord="jelas"
            accentStyle="italic"
            headingId={headingId}
          />
        </div>
        <CommercialFaqList items={servicesOverviewFaq} headingId={headingId} />
      </div>
    </section>
  );
}

function OverviewClosingCta() {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="service-cta-card rounded-[2rem] px-6 py-10 text-center md:px-12 md:py-14">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary-100">
          BUTUH ARAH?
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
          Ceritakan masalahnya sebelum memilih teknologinya
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
          Konsultasi awal membantu memilih layanan yang tepat dan menyusun langkah digital yang mudah dijalankan.
        </p>
        <CommercialLink
          href={commercialLinks.servicesConsultation}
          external
          variant="outline"
          className="mt-7 border-white bg-white text-primary hover:bg-primary-50"
        >
          Konsultasi melalui WhatsApp
          <ArrowIcon external />
        </CommercialLink>
      </div>
    </section>
  );
}

export default function ServicesOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
      <OverviewHero />
      <ServiceOptionsSection />
      <DecisionGuideSection />
      <PrinciplesSection />
      <CommercialProcessSection
        id="cara-kerja-layanan"
        title="Cakupan kerja dibangun dari percakapan yang terarah"
        description="Untuk kebutuhan khusus, proses dilanjutkan ke pemetaan yang lebih rinci sebelum estimasi final dibuat."
        headingLayout="split"
        accentWord="percakapan"
        accentStyle="italic"
      />
      <OverviewFaqSection />
      <OverviewClosingCta />
    </main>
  );
}
