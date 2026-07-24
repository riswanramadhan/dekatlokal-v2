import Link from "next/link";
import DigitalCheckupHero from "@/components/digital-checkup/DigitalCheckupHero";
import { FinalCTA, Footer, PublicHeader, WhatsAppFAB } from "@/components/layout";
import {
  AnswerSection,
  CurvedImageMarqueeSection,
  DistributionSection,
  FaqSection,
  ProblemSection,
  ProcessStepsSection,
} from "@/components/sections";
import { SupportedBySection } from "@/components/sections/landing";
import {
  digitalCheckupAspects,
  digitalCheckupBenefits,
  digitalCheckupFaq,
} from "@/features/digital-checkup/landing-content";
import { siteConfig, siteRoutes } from "@/lib/site-config";

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  headingId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
  headingId?: string;
}) {
  const words = title.split(" ");
  const accentIndex = Math.max(words.length - 1, 0);
  const ghostWord = eyebrow.split(" ")[0] || "DekatLokal";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`inline-flex items-center gap-2.5 ${centered ? "justify-center" : ""}`}>
        <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
        <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {eyebrow}
        </p>
      </div>
      <div className="relative mt-3">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-5 select-none text-5xl font-black tracking-[-0.08em] text-neutral-950/[0.045] sm:text-6xl lg:text-7xl ${
            centered ? "left-1/2 -translate-x-1/2" : "-left-1"
          }`}
        >
          {ghostWord}
        </span>
        <h2 id={headingId} className="relative text-2xl font-bold leading-tight tracking-[-0.035em] text-foreground md:text-3xl lg:text-[2.35rem]">
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className={index === accentIndex ? "text-primary" : undefined}>
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
      </div>
      <p className="mt-4 text-sm leading-7 text-neutral-600 md:text-[0.95rem] md:leading-7">
        {description}
      </p>
    </div>
  );
}

function CheckupSectionIcon({ variant, index = 0 }: { variant: "benefit" | "aspect"; index?: number }) {
  const aspectIcons = [
    <>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 10h8M8 14h5" />
    </>,
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4l3 2" />
    </>,
    <>
      <path d="M5 8h14l-1.5 10h-11L5 8Z" />
      <path d="M8 8a4 4 0 0 1 8 0" />
    </>,
    <>
      <path d="M5 15V9l10-4v14L5 15Z" />
      <path d="M5 15l-2 4M15 9h4M15 15h3" />
    </>,
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 15l2.5-3 2 2 3.5-5" />
    </>,
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M4.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M15 8.5a2.5 2.5 0 0 1 2.5 2.5M16 16.5a4 4 0 0 1 3.5 2.5" />
    </>,
    <>
      <path d="M6 17V7M10 17v-5M14 17V9M18 17V5" />
      <path d="M4 19h16" />
    </>,
    <>
      <path d="M4 12h4l2-6 4 12 2-6h4" />
      <path d="M12 3v2M12 19v2" />
    </>,
  ];

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-5 w-5" aria-hidden="true">
      {variant === "benefit" ? (
        <>
          <circle cx="12" cy="12" r="7.5" />
          <path d="m12 8 1.5 3.2L17 12l-3.5.8L12 16l-1.5-3.2L7 12l3.5-.8L12 8Z" />
        </>
      ) : aspectIcons[index % aspectIcons.length]}
    </svg>
  );
}

function CheckupOverviewSection() {
  return (
    <section
      id="ringkasan-digital-checkup"
      className="section-scroll-reveal scroll-mt-32 py-9 md:py-12"
      aria-labelledby="checkup-overview-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          eyebrow="Manfaat Digital Checkup"
          title="Lihat kondisi usaha sebelum menentukan langkah"
          description="Digital Checkup membantu Anda memahami posisi bisnis hari ini, menemukan bagian yang perlu diperbaiki, dan memilih prioritas yang realistis."
          centered
          headingId="checkup-overview-title"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {digitalCheckupBenefits.map((benefit, index) => {
          const isPrimary = index === 0;

          return (
            <article
              key={benefit.title}
              className={`group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_14px_38px_rgba(1,34,98,0.06)] transition-all hover:-translate-y-1 md:p-6 ${
                isPrimary
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-200 bg-white text-neutral-950 hover:border-primary/35"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${isPrimary ? "bg-white text-primary" : "bg-primary-50 text-primary"}`}>
                  <CheckupSectionIcon variant="benefit" index={index} />
                </span>
                <span className={`font-mono text-xs font-semibold ${isPrimary ? "text-primary-100" : "text-primary/50"}`}>
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-bold leading-snug md:text-xl">{benefit.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${isPrimary ? "text-white/82" : "text-neutral-600"}`}>
                {benefit.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="service-cta-card mt-5 flex flex-col items-center justify-between gap-5 rounded-[1.9rem] bg-primary px-5 py-6 text-center text-white shadow-[0_22px_54px_rgba(2,85,245,0.26)] md:flex-row md:px-7 md:py-7 md:text-left">
        <div className="relative z-10">
          <p className="mb-2 inline-flex rounded-full bg-white/14 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/82 ring-1 ring-white/18">
            Program dampak sosial
          </p>
          <h3 className="text-lg font-bold leading-snug md:text-xl">Selesaikan Checkup, buka peluang website gratis</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
            UMKM yang menyelesaikan Digital Checkup bisa masuk prioritas seleksi website gratis sesuai kriteria program DekatLokal.
          </p>
        </div>
        <a
          href={siteConfig.digitalCheckupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="animated-cta group relative z-10 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span>Mulai Checkup</span>
          <span className="animated-cta__arrow grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-4 w-4" aria-hidden="true">
              <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
            </svg>
          </span>
        </a>
      </div>

      <div className="mt-12 border-t border-neutral-200 pt-10 md:mt-16 md:pt-12">
        <SectionHeading
          eyebrow="Delapan Aspek"
          title="Kesiapan digital dilihat secara menyeluruh"
          description="Kami melihat fondasi bisnis, identitas, pelanggan, penjualan, konten, pengelolaan, data, dan kebiasaan digital agar rekomendasinya tidak terasa generik."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {digitalCheckupAspects.map((aspect, index) => (
            <article
              key={aspect.title}
              className="group relative overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(1,34,98,0.04)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_16px_38px_rgba(2,85,245,0.09)]"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white">
                  <CheckupSectionIcon variant="aspect" index={index} />
                </span>
                <p className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-primary/55">
                  ASPEK {String(index + 1).padStart(2, "0")}
                </p>
              </div>
              <h3 className="mt-5 text-base font-bold text-foreground">{aspect.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{aspect.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacyNote() {
  return (
    <section
      className="mb-8 rounded-[1.5rem] border border-primary-100 bg-primary-50 p-5 md:p-6"
      aria-labelledby="privacy-note-title"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-primary shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-5 w-5" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
              </svg>
            </span>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Catatan Privasi
            </p>
          </div>
          <h2 id="privacy-note-title" className="mt-3 text-lg font-bold text-foreground md:text-xl">
            Informasi digunakan untuk memproses hasil Checkup
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Data yang dikirim digunakan untuk menghitung hasil, menjalankan analisis
            digital yang relevan, dan mendukung tindak lanjut layanan. Progres dan hasil
            sementara dapat tersimpan pada tab browser yang sama selama sesi terbatas.
          </p>
        </div>
        <Link
          href={siteRoutes.privacyPolicy}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Baca Kebijakan Privasi
        </Link>
      </div>
    </section>
  );
}

export default function DigitalCheckupLanding() {
  const appUrl = siteConfig.digitalCheckupUrl;

  return (
    <div className="public-page-shell relative min-h-screen text-foreground">
      <PublicHeader />

      <main>
        <div className="bg-primary">
          <DigitalCheckupHero appUrl={appUrl} />
        </div>
        <div className="bg-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
            <SupportedBySection />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 md:pt-10 lg:px-12">
          <ProblemSection />
          <AnswerSection />
          <CheckupOverviewSection />

          <section id="cara-kerja" className="scroll-mt-32">
            <ProcessStepsSection />
          </section>
          <section id="sebaran-wilayah" className="scroll-mt-32 overflow-x-clip">
            <DistributionSection />
          </section>
          <CurvedImageMarqueeSection />

          <FaqSection
            id="faq-digital-checkup"
            idPrefix="digital-checkup-faq"
            items={digitalCheckupFaq}
            eyebrow="FAQ Digital Checkup"
            title="Pertanyaan sebelum memulai"
            description="Informasi singkat tentang proses, hasil, dan peluang website gratis."
            variant="plain"
            stickyHeader
          />
          <PrivacyNote />
        </div>
      </main>

      <FinalCTA
        title="Siap melihat prioritas digital bisnis Anda?"
        description="Tanpa login | Gratis | Hasil dan rekomendasi langsung"
        primaryLabel="Mulai Digital Checkup Gratis"
        primaryHref={appUrl}
        primaryExternal
      />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
