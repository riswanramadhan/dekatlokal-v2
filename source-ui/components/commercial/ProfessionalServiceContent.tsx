import { siteConfig } from "@/lib/site-config";
import {
  ArrowIcon,
  CheckIcon,
  CommercialFaqList,
  CommercialIcon,
  CommercialLink,
  ProblemFramingSection,
  SectionHeading,
  ServiceComparisonSection,
} from "./SharedCommercialSections";
import {
  HeroAmbientBackground,
  SystemFramesVisual,
  WebsiteOrbitVisual,
} from "./ServiceHeroVisuals";
import type {
  ProfessionalServiceConfig,
  ServiceContentCard,
} from "./extended-service-config";

function ServiceHero({ config }: { config: ProfessionalServiceConfig }) {
  const theme = config.heroTheme ?? "white";
  const isBlue = theme === "blue";
  const visual = config.heroVisual ?? "website-orbit";

  return (
    <section
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ${
        isBlue ? "bg-primary text-white" : "bg-white text-neutral-950"
      }`}
    >
      <HeroAmbientBackground theme={theme} />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-0 pt-44 text-center sm:px-6 sm:pt-48 md:pt-44 lg:px-12 lg:pt-48">
        <span className={`hero-kicker ${isBlue ? "" : "hero-kicker--blue"}`}>
          <span>{config.eyebrow}</span>
        </span>
        <h1
          className={`mx-auto mt-5 max-w-4xl text-3xl font-semibold leading-[1.1] tracking-[-0.045em] md:text-5xl lg:text-[4rem] ${
            isBlue ? "text-white" : "text-neutral-950"
          }`}
        >
          {config.title}
        </h1>
        <p className={`mx-auto mt-5 max-w-2xl text-sm leading-7 md:text-base md:leading-8 ${isBlue ? "text-white/86" : "text-neutral-600"}`}>
          {config.description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <CommercialLink
            href={config.consultationHref}
            external
            variant={isBlue ? "outline" : "primary"}
            className={isBlue ? "border-white bg-white text-primary hover:bg-primary-50" : ""}
          >
            {config.consultationLabel}
            <ArrowIcon external />
          </CommercialLink>
          <CommercialLink
            href={siteConfig.digitalCheckupUrl}
            external
            variant="outline"
            className={isBlue ? "border-white/45 bg-white/10 text-white hover:bg-white/18" : ""}
          >
            Mulai dari Digital Checkup
            <ArrowIcon external />
          </CommercialLink>
        </div>

        <div className="-mb-[5.5rem] md:-mb-28 lg:-mb-36">
          {visual === "system-frames" ? <SystemFramesVisual /> : <WebsiteOrbitVisual theme={theme} />}
        </div>
      </div>
    </section>
  );
}

function AudienceSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="UNTUK SIAPA"
        title={config.audienceTitle}
        description={config.audienceDescription}
        align="center"
      />
      <div className="mt-9 grid gap-4 md:mt-12 md:grid-cols-3">
        {config.audiences.map((audience, index) => (
          <article
            key={audience.title}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_32px_rgba(1,34,98,0.05)] md:p-7"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 text-xl font-semibold leading-snug text-neutral-950">
              {audience.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-neutral-600">{audience.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ValueSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="rounded-[2rem] bg-primary-50 px-6 py-9 md:px-10 md:py-12 lg:px-14">
        <SectionHeading
          eyebrow="NILAI LAYANAN"
          title={config.valueTitle}
          description={config.valueDescription}
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.values.map((value) => (
            <article key={value.title} className="rounded-3xl bg-white p-5 md:p-6">
              {value.icon ? (
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white">
                  <CommercialIcon name={value.icon} />
                </span>
              ) : null}
              <h3 className="mt-5 text-lg font-semibold leading-snug text-neutral-950">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScopeCard({ item }: { item: ServiceContentCard }) {
  return (
    <article className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-[0_12px_34px_rgba(1,34,98,0.05)] md:p-7">
      <h3 className="text-xl font-semibold text-neutral-950">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{item.description}</p>
      {item.items ? (
        <ul className="mt-6 space-y-3">
          {item.items.map((detail) => (
            <li key={detail} className="flex gap-3 text-sm leading-6 text-neutral-700">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-50 text-primary">
                <CheckIcon />
              </span>
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function ScopeSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="RUANG LINGKUP"
        title={config.scopeTitle}
        description={config.scopeDescription}
        align="center"
      />
      <div className="mt-9 grid gap-5 md:mt-12 lg:grid-cols-3">
        {config.scopes.map((scope) => (
          <ScopeCard key={scope.title} item={scope} />
        ))}
      </div>
    </section>
  );
}

function PricingSummarySection({ config }: { config: ProfessionalServiceConfig }) {
  if (!config.pricing) return null;

  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid gap-6 overflow-hidden rounded-[2rem] border border-primary-100 bg-white p-5 shadow-[0_18px_48px_rgba(1,34,98,0.06)] md:p-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
        <div className="flex flex-col rounded-[1.5rem] bg-primary p-6 text-white md:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary-100">
            {config.pricing.eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] md:text-3xl">
            {config.pricing.title}
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/85">{config.pricing.description}</p>
          <div className="mt-auto pt-7">
            <p className="text-sm text-white/70">{config.pricing.priceNote}</p>
            {config.pricing.normalPrice ? (
              <p className="mt-2 text-base font-semibold text-white/55 line-through">
                {config.pricing.normalPrice}
              </p>
            ) : null}
            <p className="mt-1 text-4xl font-semibold leading-none tracking-[-0.05em] md:text-5xl">
              {config.pricing.price}
            </p>
            {config.pricing.deliveryLabel ? (
              <p className="mt-4 inline-flex rounded-full border border-white/22 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
                {config.pricing.deliveryLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex h-full flex-col p-1 md:p-2">
          <span className="w-fit rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary">
            {config.pricing.badge}
          </span>
          <h3 className="mt-5 text-xl font-semibold text-neutral-950 md:text-2xl">
            Yang masuk dalam pembahasan awal
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {config.pricing.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-neutral-700">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-50 text-primary">
                  <CheckIcon />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-neutral-200 pt-5 text-sm leading-7 text-neutral-600">
            Detail biaya, waktu kerja, dan batas pekerjaan tetap dikunci setelah kebutuhan utama
            dipetakan bersama.
          </p>
          <div className="mt-auto pt-6">
            <CommercialLink href={config.consultationHref} external className="w-full">
              {config.pricing.ctaLabel}
              <ArrowIcon external />
            </CommercialLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <SectionHeading
          eyebrow="ARAH SOLUSI"
          title="Solusi dibentuk dari kebutuhan yang paling berdampak"
          description="Bagian ini membantu melihat bentuk pekerjaan yang bisa dikembangkan setelah kebutuhan bisnis dipetakan dengan jelas."
        />
        <div className="space-y-4">
          {config.scenarios.map((scenario, index) => (
            <article
              key={scenario.title}
              className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-5 sm:grid-cols-[auto_1fr] md:p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-950">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-7 text-neutral-600">{scenario.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="PROSES KERJA"
        title="Keputusan besar diuji sebelum pembangunan terlalu jauh"
        description="Tahap dapat disesuaikan dengan kompleksitas proyek, namun cakupan kerja dan titik review tetap dibuat jelas."
        align="center"
      />
      <ol className="mt-9 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-5">
        {config.process.map((step, index) => (
          <li
            key={step.title}
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_rgba(1,34,98,0.04)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {index + 1}
            </span>
            <h3 className="mt-5 text-base font-semibold text-neutral-950">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EstimationSection({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_18px_48px_rgba(1,34,98,0.06)] lg:grid-cols-2">
        <div className="bg-primary p-6 text-white md:p-9 lg:p-11">
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary-100">
            ESTIMASI BERDASARKAN DISCOVERY
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-4xl">
            Harga dan waktu kerja mengikuti cakupan yang dipahami bersama
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/85">{config.estimationDescription}</p>
          <h3 className="mt-8 text-sm font-semibold text-white">Faktor utama estimasi</h3>
          <ul className="mt-4 space-y-3">
            {config.estimationFactors.map((factor) => (
              <li key={factor} className="flex gap-3 text-sm leading-6 text-white/90">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <CheckIcon />
                </span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 md:p-9 lg:p-11">
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary">
            KESEPAKATAN KERJA
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-neutral-950 md:text-3xl">
            Cakupan dibuat jelas sebelum proyek dimulai
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Setiap kebutuhan utama, biaya pihak ketiga, integrasi, dukungan, dan jadwal review
            dirangkum agar pekerjaan berjalan rapi sejak awal.
          </p>
          <ul className="mt-6 space-y-4">
            {config.scopeBoundaries.map((boundary) => (
              <li key={boundary} className="flex gap-3 text-sm leading-7 text-neutral-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {boundary}
              </li>
            ))}
          </ul>
          <CommercialLink href={config.consultationHref} external variant="outline" className="mt-8">
            Minta pemetaan awal
            <ArrowIcon external />
          </CommercialLink>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ config }: { config: ProfessionalServiceConfig }) {
  const headingId = `${config.eyebrow.toLowerCase().replaceAll(" ", "-")}-faq-heading`;

  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="FAQ LAYANAN"
            title="Pertanyaan penting sebelum memulai"
            description="Jawaban singkat untuk membantu Anda mengambil keputusan dengan lebih mudah."
            headingId={headingId}
          />
        </div>
        <CommercialFaqList items={config.faq} headingId={headingId} />
      </div>
    </section>
  );
}

function ClosingCta({ config }: { config: ProfessionalServiceConfig }) {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="service-cta-card rounded-[2rem] px-6 py-10 text-center md:px-12 md:py-14">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary-100">
          MULAI DARI KONTEKS
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
          {config.closingTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
          {config.closingDescription}
        </p>
        <CommercialLink
          href={config.consultationHref}
          external
          variant="outline"
          className="mt-7 border-white bg-white text-primary hover:bg-primary-50"
        >
          {config.consultationLabel}
          <ArrowIcon external />
        </CommercialLink>
      </div>
    </section>
  );
}

export default function ProfessionalServiceContent({
  config,
}: {
  config: ProfessionalServiceConfig;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
      <ServiceHero config={config} />
      <ProblemFramingSection
        id="masalah-layanan"
        eyebrow="MASALAH UTAMA"
        title={config.problemTitle}
        description={config.problemDescription}
        items={config.problems}
      />
      <AudienceSection config={config} />
      <ValueSection config={config} />
      <ScopeSection config={config} />
      <PricingSummarySection config={config} />
      <ServiceComparisonSection
        kind={config.heroVisual === "system-frames" ? "sistem-digital" : "website-custom"}
      />
      <ScenarioSection config={config} />
      <ProcessSection config={config} />
      <EstimationSection config={config} />
      <FaqSection config={config} />
      <ClosingCta config={config} />
    </main>
  );
}
