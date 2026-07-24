import Image from "next/image";
import Link from "next/link";
import {
  commercialLinks,
  commercialNeedOptions,
  WEBSITE_UMKM_SERVICE_PATH,
} from "./config";
import {
  ArrowIcon,
  CheckIcon,
  ClientStoriesSection,
  CommercialIcon,
  CommercialLink,
  CommercialProcessSection,
  PortfolioShowcase,
  SectionHeading,
  SocialImpactSection,
} from "./SharedCommercialSections";

function NeedOptionCard({ option }: { option: (typeof commercialNeedOptions)[number] }) {
  const className =
    "group flex h-full flex-col rounded-[1.6rem] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(1,34,98,0.05)] transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_42px_rgba(2,85,245,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const content = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <CommercialIcon name={option.icon} />
      </span>
      <p className="mt-3 text-xs italic leading-5 text-primary md:text-[0.78rem]">
        {option.audienceLabel}
      </p>
      <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
        {option.title}
      </h3>
      <p className="mt-2.5 flex-1 text-sm leading-6 text-neutral-600">{option.description}</p>
      <span className="mt-4 inline-flex items-center gap-2 border-t border-neutral-200 pt-3 text-sm font-semibold text-primary">
        {option.ctaLabel}
        <ArrowIcon external={option.external} />
      </span>
    </>
  );

  if (option.external) {
    return (
      <a href={option.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={option.href} className={className}>
      {content}
    </Link>
  );
}

function NeedSelectorSection() {
  return (
    <section id="pilih-kebutuhan" className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <SectionHeading
        eyebrow="PILIH KEBUTUHANMU"
        title="Mulai dari solusi yang paling dekat dengan kebutuhan bisnis Anda"
        description="Pilih jalur yang paling sesuai dengan kondisi bisnis Anda. DekatLokal membantu mengubah kebutuhan digital menjadi website, sistem, dan langkah kerja yang jelas."
        accentWord="solusi"
        accentStyle="highlight"
      />

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4">
        {commercialNeedOptions.map((option) => (
          <NeedOptionCard key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}

function WebsiteUmkmHighlightSection() {
  return (
    <section id="layanan-website" className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <div className="grid items-stretch gap-8 rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-[0_18px_48px_rgba(1,34,98,0.06)] md:grid-cols-2 md:gap-10 md:p-8 lg:p-10">
        <div className="relative min-h-[19rem] overflow-hidden rounded-3xl bg-primary-50 md:min-h-0">
          <Image
            src="/image/website-umkm/cards/aroma-bakery.webp"
            alt="Tampilan website Aroma Bakery yang dibuat untuk usaha lokal"
            fill
            className="object-cover"
            sizes="(max-width: 767px) calc(100vw - 72px), 48vw"
          />
        </div>

        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
            <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              WEBSITE UMKM
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] text-neutral-950 md:text-3xl lg:text-[2.35rem]">
            Website UMKM profesional, cepat, dan tanpa <span className="text-primary">ribet</span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-neutral-600 md:text-[0.95rem]">
            Kirim informasi usaha, pilih kebutuhan utama, lalu tim DekatLokal menyiapkan website
            yang mobile-friendly, mudah dibuka pelanggan, dan siap menjadi rumah digital bisnis Anda.
          </p>

          <ul className="mt-6 space-y-3.5 text-sm text-neutral-700 md:text-[0.95rem]">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              Informasi usaha tersusun dalam satu tautan.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              Katalog dan jalur kontak lebih mudah ditemukan.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              Harga, cakupan, dan waktu kerja dibuat jelas sejak awal.
            </li>
          </ul>

          <CommercialLink href={WEBSITE_UMKM_SERVICE_PATH} className="mt-10 w-fit px-5 md:mt-11">
            Pelajari layanan
            <ArrowIcon />
          </CommercialLink>
        </div>
      </div>
    </section>
  );
}

function DigitalCheckupHighlightSection() {
  return (
    <section id="digital-checkup-ringkas" className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-primary-50 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-10 lg:px-14 lg:py-12">
        <div>
          <div className="inline-flex items-center gap-2.5">
            <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
            <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              DIGITAL CHECKUP
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] text-neutral-950 md:text-3xl lg:text-[2.35rem]">
            Belum yakin langkah digital yang perlu <span className="text-primary">diprioritaskan?</span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 md:text-[0.95rem]">
            Ikuti Digital Checkup gratis untuk melihat prioritas digital usaha, mendapatkan
            rekomendasi yang mudah ditindaklanjuti, dan membuka peluang memperoleh website gratis
            melalui program dampak sosial DekatLokal.
          </p>
          <CommercialLink href={commercialLinks.digitalCheckupApp} external className="mt-7">
            Dapatkan web gratis
            <ArrowIcon external />
          </CommercialLink>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <Image
            src="/image/illustrations/welcome-illustration.png"
            alt="Ilustrasi pendampingan Digital Checkup DekatLokal"
            fill
            className="object-contain"
            sizes="(max-width: 767px) 80vw, 36vw"
          />
        </div>
      </div>
    </section>
  );
}

function PortfolioHighlightSection() {
  return (
    <section id="portofolio" className="section-scroll-reveal scroll-mt-28 py-10 md:py-14 lg:py-16">
      <SectionHeading
        eyebrow="KARYA NYATA"
        title="Website yang mengikuti karakter setiap usaha dan gerakan"
        description="Lihat website yang sudah tayang untuk usaha lokal, produk kreatif, dan gerakan sosial. Setiap karya disusun agar identitas bisnis mudah dipahami pelanggan."
        accentWord="karakter"
        accentStyle="mono"
      />

      <PortfolioShowcase className="mt-8 md:mt-10" />
      <div className="mt-6 flex justify-center">
        <CommercialLink href={commercialLinks.portfolio} variant="outline" className="min-w-48">
          Lihat semua karya
          <ArrowIcon />
        </CommercialLink>
      </div>
    </section>
  );
}

const homePricingPlans = [
  {
    name: "Web Gratis",
    price: "Rp0",
    priceNote: "Program sosial",
    delivery: "Jadwal mengikuti seleksi program",
    description: "Peluang website dasar untuk UMKM terpilih yang siap berkembang melalui jalur program DekatLokal.",
    label: "Program sosial",
    labelText: "Dimulai dari Digital Checkup dan proses seleksi sesuai kriteria program.",
    benefits: [
      "Website dasar profil usaha",
      "Katalog ringan dan kontak",
      "Pendampingan sesuai kapasitas program",
      "Terbatas dan melalui seleksi",
    ],
    href: commercialLinks.digitalCheckupApp,
    cta: "Cek program",
    external: true,
    variant: "free",
  },
  {
    name: "Web UMKM Cepat",
    price: "Rp999.000",
    normalPrice: "Rp1.599.000",
    priceNote: "Mulai dari",
    delivery: "Jadi dalam 1-2 hari",
    description: "Rumah digital profesional untuk UMKM yang ingin segera tampil jelas dan mudah dihubungi pelanggan.",
    label: "Bonus AI Assistant",
    labelText: "Chatbot AI 24 jam di website untuk membantu menjawab pertanyaan dasar pelanggan.",
    benefits: [
      "Profil usaha dan katalog",
      "WhatsApp, Maps, dan SEO dasar",
      "Domain, hosting, pemeliharaan 1 tahun",
      "Bonus AI Assistant chat",
    ],
    href: commercialLinks.websiteConsultation,
    cta: "Konsultasi web",
    external: true,
    variant: "popular",
  },
  {
    name: "Web Custom",
    price: "Rp1.999.999",
    normalPrice: "Rp5.259.000",
    priceNote: "Mulai dari",
    delivery: "Jadi dalam 3-4 hari",
    description: "Website dengan struktur, pengalaman, dan fitur khusus untuk kebutuhan brand atau organisasi yang lebih kompleks.",
    label: "Bonus AI Assistant",
    labelText: "Chatbot AI 24 jam dapat ditambahkan untuk membantu pengunjung menjelajahi informasi website.",
    benefits: [
      "Struktur informasi khusus",
      "Desain halaman sesuai brand",
      "Fitur dan integrasi prioritas",
      "Bonus AI Assistant chat",
    ],
    href: commercialLinks.customWebsiteConsultation,
    cta: "Diskusi custom",
    external: true,
    variant: "default",
  },
  {
    name: "Sistem Digital",
    price: "Custom",
    priceNote: "Sesuai kebutuhan",
    delivery: "Versi awal siap dalam 1 pekan",
    description: "Sistem operasional bertahap untuk dashboard, booking, otomasi, dan alur digital khusus.",
    label: "Bonus AI Assistant",
    labelText: "AI Assistant dapat menjadi bagian dari alur layanan atau pusat informasi yang dibutuhkan.",
    benefits: [
      "Pemetaan proses dan peran",
      "Modul dashboard atau otomasi",
      "Integrasi dibahas sesuai kebutuhan",
      "Bonus AI Assistant chat",
    ],
    href: commercialLinks.digitalSystemConsultation,
    cta: "Diskusi sistem",
    external: true,
    variant: "default",
  },
] as const;

function PricingSection() {
  return (
    <section id="harga-website" className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <SectionHeading
        eyebrow="HARGA WEBSITE"
        title="Paket digital yang tumbuh bersama kebutuhan Anda"
        description="Pilih titik mulai yang paling masuk akal hari ini. Setiap paket dirancang agar manfaat, batas kerja, dan langkah berikutnya tetap mudah dipahami."
        align="center"
        className="mx-auto"
      />

      <div className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4">
        {homePricingPlans.map((plan) => {
          const isPopular = plan.variant === "popular";
          const isFree = plan.variant === "free";

          return (
            <article
              key={plan.name}
              className={`relative flex h-full min-h-[30rem] flex-col rounded-[1.55rem] border p-4 shadow-[0_12px_34px_rgba(1,34,98,0.06)] transition-all hover:-translate-y-1 md:p-5 ${
                isPopular
                  ? "border-primary bg-white shadow-[0_18px_44px_rgba(2,85,245,0.16)]"
                  : isFree
                    ? "border-primary-100 bg-primary-50/70"
                    : "border-neutral-200 bg-white"
              }`}
            >
              {isPopular ? (
                <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                  Paling dipilih
                </span>
              ) : null}
              <p className="text-xs font-semibold tracking-[0.12em] text-primary">{plan.name}</p>
              <p className="mt-3 text-xs text-neutral-500">{plan.priceNote}</p>
              <div className="mt-1 flex min-h-[2.15rem] flex-col justify-end">
                {"normalPrice" in plan ? (
                  <p className="text-sm font-semibold text-neutral-400 line-through">
                    {plan.normalPrice}
                  </p>
                ) : null}
                <p className="text-2xl font-bold tracking-[-0.04em] text-neutral-950 md:text-[1.65rem]">
                  {plan.price}
                </p>
              </div>
              <p className="mt-3 min-h-[4rem] text-xs leading-5 text-neutral-600 md:text-[0.82rem]">{plan.description}</p>
              <p className="mt-3 inline-flex min-h-8 w-fit items-center rounded-full border border-primary-100 bg-white px-3 py-1 text-[0.68rem] font-semibold text-primary">
                {plan.delivery}
              </p>

              <div className={`mt-4 min-h-[4.85rem] rounded-2xl border p-3 ${isFree ? "border-primary-200 bg-white/80" : "border-primary-100 bg-primary-50/70"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">{plan.label}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-600">{plan.labelText}</p>
              </div>

              <div className="mt-4 pb-4">
                <p className="text-sm font-semibold text-neutral-950">Benefit</p>
                <ul className="mt-2.5 space-y-2">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2.5 text-xs leading-5 text-neutral-600">
                      <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-primary text-white">
                        <CheckIcon />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <CommercialLink
                href={plan.href}
                external={"external" in plan ? plan.external : false}
                variant={isPopular ? "primary" : "outline"}
                className={`mt-auto w-full whitespace-nowrap px-3.5 text-xs sm:text-sm ${isPopular ? "" : "bg-white"}`}
              >
                {plan.cta}
                <ArrowIcon external={"external" in plan ? plan.external : false} />
              </CommercialLink>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function HomeCommercialSections() {
  return (
    <>
      <NeedSelectorSection />
      <WebsiteUmkmHighlightSection />
      <DigitalCheckupHighlightSection />
      <PortfolioHighlightSection />
      <CommercialProcessSection
        id="cara-kerja-komersial"
        headingLayout="split"
        accentWord="jelas"
        accentStyle="italic"
        variant="reference"
      />
      <ClientStoriesSection id="cerita-klien" />
      <PricingSection />
      <SocialImpactSection />
    </>
  );
}

export {
  DigitalCheckupHighlightSection,
  NeedSelectorSection,
  PortfolioHighlightSection,
  WebsiteUmkmHighlightSection,
};
