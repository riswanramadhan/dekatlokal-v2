import Image from "next/image";
import {
  commercialLinks,
  freeAndProfessionalComparison,
  websiteServiceBenefits,
  websiteServiceFaq,
  websiteServiceFeatures,
  websiteServicePricing,
  websiteServiceProblems,
  websiteServiceTargets,
} from "./config";
import {
  ArrowIcon,
  CheckIcon,
  CommercialFaqList,
  CommercialIcon,
  CommercialLink,
  CommercialProcessSection,
  ClientStoriesSection,
  PortfolioShowcase,
  ProblemFramingSection,
  SectionHeading,
  ServiceComparisonSection,
} from "./SharedCommercialSections";
import { HeroAmbientBackground, WebsiteOrbitVisual } from "./ServiceHeroVisuals";

function getStartingPriceLabel(value: number | null): string {
  if (value === null) return websiteServicePricing.startingPriceLabel;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ServiceHero() {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-primary text-white">
      <HeroAmbientBackground theme="blue" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-0 pt-40 text-center sm:px-6 sm:pt-44 md:pt-40 lg:px-12 lg:pt-44">
        <span className="hero-kicker">
          <span>Layanan Website UMKM</span>
        </span>
        <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-semibold leading-[1.1] tracking-[-0.045em] text-white md:text-5xl lg:text-[4rem]">
          Website UMKM Profesional, Cepat, dan Tanpa Ribet
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/86 md:text-base md:leading-8">
          Kirim informasi usaha, pilih kebutuhan utama, lalu tim DekatLokal menyiapkan
          website yang mobile-friendly, mudah dibuka pelanggan, dan siap menjadi rumah digital
          bisnis Anda.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <CommercialLink href={commercialLinks.websiteConsultation} external variant="outline" className="border-white bg-white text-primary hover:bg-primary-50">
            Konsultasi Website
            <ArrowIcon external />
          </CommercialLink>
          <CommercialLink href={commercialLinks.portfolio} variant="outline" className="border-white/45 bg-white/10 text-white hover:bg-white/18">
            Lihat hasil website
            <ArrowIcon />
          </CommercialLink>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/70">
          Konsultasi awal melalui WhatsApp. Tidak memerlukan login atau pembayaran di website.
        </p>

        <div className="-mb-[5.5rem] md:-mb-28 lg:-mb-36">
          <WebsiteOrbitVisual theme="blue" />
        </div>
      </div>
    </section>
  );
}

function ServiceTargetsSection() {
  return (
    <section id="untuk-siapa" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="UNTUK SIAPA"
        title="Dibuat untuk usaha lokal yang ingin hadir lebih jelas secara digital"
        description="Mulai dari informasi yang sudah tersedia. DekatLokal membantu merapikan profil, katalog, kontak, dan tampilan website agar lebih siap digunakan pelanggan."
        align="left"
        layout="split"
        accentWord="digital"
        accentStyle="mono"
      />
      <div className="mt-9 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3">
        {websiteServiceTargets.map((target, index) => (
          <article
            key={target.title}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_32px_rgba(1,34,98,0.05)] md:p-7"
          >
            <span className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-primary-50 font-mono text-sm font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-semibold leading-snug text-neutral-950 md:text-xl">
              {target.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-neutral-600">{target.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServiceBenefitsSection() {
  return (
    <section id="manfaat" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <div className="rounded-[2rem] bg-primary-50 px-6 py-9 md:px-10 md:py-12 lg:px-14">
        <SectionHeading
          eyebrow="MANFAAT WEBSITE"
          title="Website sebagai titik temu informasi usaha dan pelanggan"
          description="Website bekerja sebagai pusat informasi bisnis agar pelanggan lebih cepat memahami produk, lokasi, kontak, dan cara memesan."
          accentWord="titik temu"
          accentStyle="italic"
        />
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {websiteServiceBenefits.map((benefit) => (
            <article key={benefit.title} className="group rounded-3xl bg-white p-5 transition-transform hover:-translate-y-1 md:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white">
                <CommercialIcon name={benefit.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold leading-snug text-neutral-950 md:text-lg">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesAndPricingSection() {
  const priceLabel = getStartingPriceLabel(websiteServicePricing.startingPrice);

  return (
    <section id="paket" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="PAKET WEBSITE"
        title="Cakupan awal yang dapat disesuaikan dengan kebutuhan usaha"
        description="Paket Website UMKM Cepat sudah mencakup kebutuhan utama untuk tampil profesional, termasuk AI Assistant chatbot 24 jam."
        align="left"
        layout="split"
        accentWord="Cakupan"
        accentStyle="highlight"
      />

      <div className="mt-9 grid items-stretch gap-6 md:mt-12 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="flex flex-col rounded-[2rem] bg-primary p-6 text-white md:p-8">
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary-100">
            {websiteServicePricing.packageName.toUpperCase()}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <span className="text-sm text-white/60 line-through">
              Rp{new Intl.NumberFormat("id-ID").format(websiteServicePricing.normalPrice)}
            </span>
            <h3 className="text-3xl font-semibold leading-none md:text-4xl">{priceLabel}</h3>
          </div>
          <span className="mt-3 w-fit rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
            {websiteServicePricing.specialPriceLabel}
          </span>
          <p className="mt-5 text-sm leading-7 text-white/85">{websiteServicePricing.note}</p>

          <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-100">
              Waktu Pengerjaan
            </p>
            <p className="mt-2 text-sm leading-6 text-white/90">
              {websiteServicePricing.timelineLabel}
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-100">
              Bonus Website
            </p>
            <p className="mt-2 text-sm leading-6 text-white/90">
              AI Assistant chatbot 24 jam membantu menjawab pertanyaan pengunjung dan mengarahkan
              mereka ke WhatsApp bisnis Anda.
            </p>
          </div>

          <div className="mt-auto pt-7">
            <CommercialLink
              href={commercialLinks.websiteConsultation}
              external
              variant="outline"
              className="w-full border-white bg-white text-primary hover:bg-primary-50"
            >
              Konsultasi paket
              <ArrowIcon external />
            </CommercialLink>
          </div>
        </article>

        <article className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_14px_38px_rgba(1,34,98,0.05)] md:p-8">
          <h3 className="text-xl font-semibold text-neutral-950 md:text-2xl">
            Fitur yang masuk dalam paket awal
          </h3>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {websiteServiceFeatures.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm leading-6 text-neutral-700">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-50 text-primary">
                  <CheckIcon />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-neutral-200 pt-5 text-xs leading-6 text-neutral-500">
            Paket dapat dikembangkan sesuai kebutuhan bisnis, mulai dari halaman tambahan, katalog
            lebih rinci, sampai integrasi lanjutan.
          </p>
        </article>
      </div>
    </section>
  );
}

function ServiceExamplesSection() {
  return (
    <section id="portofolio-layanan" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="KARYA NYATA"
        title="Karya website dari bisnis dan gerakan lokal"
        description="Portofolio DekatLokal menampilkan website usaha lokal dengan profil, katalog, dan jalur kontak yang dibuat lebih jelas untuk pelanggan."
        accentWord="Karya"
        accentStyle="mono"
      />
      <PortfolioShowcase
        slugs={["aroma-bakery", "kira-kira-michi", "bakpia-malino"]}
        className="mt-8 md:mt-10"
      />
      <div className="mt-6 flex justify-center">
        <CommercialLink href={commercialLinks.portfolio} className="min-w-52">
          Jelajahi portofolio
          <ArrowIcon />
        </CommercialLink>
      </div>
    </section>
  );
}

function FreeAndPaidSection() {
  return (
    <section id="gratis-vs-berbayar" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="PROGRAM WEBSITE"
        title="Pilih jalur yang paling sesuai dengan kondisi bisnis Anda"
        description="Mulai dari Digital Checkup untuk peluang website gratis, atau ambil jalur profesional jika website perlu segera dikerjakan."
        align="center"
      />

      <div className="mt-9 grid gap-5 md:mt-12 md:grid-cols-2">
        {freeAndProfessionalComparison.map((option, index) => (
          <article
            key={option.title}
            className={`relative flex h-full flex-col rounded-[2rem] border p-6 md:p-8 ${
              index === 1
                ? "border-primary bg-primary text-white shadow-[0_18px_44px_rgba(2,85,245,0.18)]"
                : "border-neutral-200 bg-white text-neutral-950"
            }`}
          >
            {index === 1 ? (
              <span className="absolute right-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                Pilihan utama
              </span>
            ) : null}
            <p
              className={`pr-28 font-mono text-xs font-semibold tracking-[0.14em] ${
                index === 1 ? "text-primary-100" : "text-primary"
              }`}
            >
              {index === 1 ? (
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#39ff88] shadow-[0_0_0_4px_rgba(57,255,136,0.18),0_0_14px_rgba(57,255,136,0.75)]" aria-hidden="true">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#39ff88] opacity-70" />
                  </span>
                  LAYANAN CEPAT
                </span>
              ) : (
                "PROGRAM BERDAMPAK"
              )}
            </p>
            <h3 className="mt-4 text-2xl font-semibold">{option.title}</h3>
            <p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-white/85" : "text-neutral-600"}`}>
              {option.description}
            </p>
            <ul className="mt-6 space-y-3">
              {option.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                      index === 1 ? "bg-white text-primary" : "bg-primary-50 text-primary"
                    }`}
                  >
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {index === 0 ? (
              <div className="mt-7 border-t border-neutral-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Mitra awal program
                </p>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  Dukungan mitra dan setiap layanan profesional membantu program website UMKM tetap berjalan.
                </p>
                <div className="mt-5 grid grid-cols-3 items-center gap-1.5 sm:gap-2">
                  {[
                    ["/image/logos/partners/bakti-nusa.png", "Bakti Nusa"],
                    ["/image/logos/partners/dompet-dhuafa.png", "Dompet Dhuafa"],
                    ["/image/logos/partners/rumah-bumn.png", "Rumah BUMN Makassar"],
                  ].map(([src, alt]) => (
                    <Image key={alt} src={src} alt={alt} width={128} height={82} className="icon-hover-motion h-16 w-full object-contain" />
                  ))}
                </div>
              </div>
            ) : null}
            {index === 1 ? (
              <div className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-100">
                  Bonus layanan
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Website dilengkapi AI Assistant chatbot 24 jam yang menjawab pertanyaan dasar pelanggan secara otomatis.
                </p>
              </div>
            ) : null}
            <div className="mt-auto pt-7">
              <CommercialLink
                href={option.href}
                external={"external" in option ? option.external : false}
                variant={index === 1 ? "outline" : "primary"}
                className={`w-full ${
                  index === 1 ? "border-white bg-white text-primary hover:bg-primary-50" : ""
                }`}
              >
                {option.ctaLabel}
                <ArrowIcon external={"external" in option ? option.external : false} />
              </CommercialLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServiceFaqSection() {
  return (
    <section id="faq-layanan" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="FAQ LAYANAN"
            title="Pertanyaan sebelum memulai website"
            description="Jawaban singkat untuk membantu Anda memulai website dengan lebih mudah."
            headingId="faq-service-heading"
          />
        </div>
        <CommercialFaqList items={websiteServiceFaq} headingId="faq-service-heading" />
      </div>
    </section>
  );
}

function ServiceClosingCta() {
  return (
    <section className="section-scroll-reveal py-10 md:py-14 lg:py-16">
      <div className="service-cta-card rounded-[2rem] px-6 py-10 text-center md:px-12 md:py-14">
        <div className="relative z-10">
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary-100 md:text-sm">
            MULAI DARI KONSULTASI
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
            Ceritakan website yang dibutuhkan bisnis Anda
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
            Tim DekatLokal membantu memetakan cakupan, materi, estimasi biaya, dan waktu kerja sebelum
            pekerjaan dimulai.
          </p>
          <CommercialLink
            href={commercialLinks.websiteConsultation}
            external
            variant="outline"
            className="mt-7 border-white bg-white text-primary hover:bg-primary-50"
          >
            Konsultasi melalui WhatsApp
            <ArrowIcon external />
          </CommercialLink>
        </div>
      </div>
    </section>
  );
}

export default function WebsiteUmkmServiceContent() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
      <ServiceHero />
      <ProblemFramingSection
        id="masalah-website-umkm"
        title="Website cepat dimulai dari masalah yang ingin dibereskan"
        description="Sebelum memilih layout, DekatLokal melihat hambatan yang membuat pelanggan sulit memahami dan menghubungi bisnis Anda."
        items={websiteServiceProblems}
      />
      <ServiceTargetsSection />
      <ServiceBenefitsSection />
      <FeaturesAndPricingSection />
      <ServiceComparisonSection kind="website-umkm" />
      <ServiceExamplesSection />
      <CommercialProcessSection
        id="proses-layanan"
        title="Dari kebutuhan awal sampai website siap diluncurkan"
        description="Waktu kerja mengikuti kelengkapan konten, cakupan fitur, dan jadwal review yang disepakati."
      />
      <FreeAndPaidSection />
      <ClientStoriesSection id="testimonial-layanan" />
      <ServiceFaqSection />
      <ServiceClosingCta />
    </main>
  );
}

export { getStartingPriceLabel, ServiceFaqSection };
