import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { umkmPortfolio } from "@/components/website-umkm/data";
import CurvedImageMarqueeSection from "@/components/sections/CurvedImageMarqueeSection";
import ClientStoriesCarousel from "./ClientStoriesCarousel";
import {
  commercialLinks,
  commercialProcessSteps,
  type CommercialFaqItem,
  type CommercialIconName,
  verifiedTestimonialPlaceholder,
} from "./config";
import AnimatedCommercialFaqList from "./AnimatedCommercialFaqList";

const DEFAULT_PORTFOLIO_SLUGS = [
  "growmates",
  "bakpia-malino",
  "gingerfit-plus",
] as const;

export function ArrowIcon({ external = false }: { external?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon-hover-motion h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
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

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon-hover-motion h-4.5 w-4.5 shrink-0"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function CommercialIcon({ name }: { name: CommercialIconName }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "icon-hover-motion h-7 w-7",
    "aria-hidden": true,
  };

  if (name === "checkup") {
    return (
      <svg {...commonProps}>
        <path d="M8 3h8M9 3v3h6V3" />
        <path d="M7 5H5.5A1.5 1.5 0 0 0 4 6.5v13A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 5H17" />
        <path d="m8 13 2.5 2.5L16 10" />
      </svg>
    );
  }

  if (name === "custom") {
    return (
      <svg {...commonProps}>
        <path d="M4 18.5V21h2.5L18.8 8.7a2 2 0 0 0 0-2.8l-.7-.7a2 2 0 0 0-2.8 0L4 16.5v2Z" />
        <path d="m13.8 6.7 3.5 3.5M4 12V5.5A1.5 1.5 0 0 1 5.5 4H11M12 20H7" />
      </svg>
    );
  }

  if (name === "system") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="8" height="6" rx="2" />
        <rect x="15" y="14" width="6" height="6" rx="2" />
        <path d="M7 7h.01M7 17h.01M18 17h.01" />
      </svg>
    );
  }

  if (name === "mobile") {
    return (
      <svg {...commonProps}>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M10 5h4M11 18.5h2" />
      </svg>
    );
  }

  if (name === "catalog") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="15" width="7" height="5" rx="1.5" />
        <rect x="14" y="15" width="7" height="5" rx="1.5" />
      </svg>
    );
  }

  if (name === "contact") {
    return (
      <svg {...commonProps}>
        <path d="M20 11.5a8 8 0 0 1-8.5 8A8 8 0 1 1 20 11.5Z" />
        <path d="m7.8 17.5-3.3 1 1-3.2M9 9.2c.8 2.2 2.5 3.9 4.8 4.8M9 8.8l1.2-.6M14.2 14l.6-1.2" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...commonProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="2.5" y="4" width="19" height="14" rx="2" />
      <path d="M2.5 8h19M8 21h8M12 18v3" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  layout = "stacked",
  accentWord,
  accentStyle = "highlight",
  className = "",
  headingId,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  layout?: "stacked" | "split";
  accentWord?: string;
  accentStyle?: "highlight" | "italic" | "mono";
  className?: string;
  headingId?: string;
}) {
  const alignment = align === "center" ? "mx-auto items-center text-center" : "items-start";
  const titleParts = accentWord && title.includes(accentWord) ? title.split(accentWord) : null;
  const accentClassName = {
    highlight: "text-primary",
    italic: "text-primary",
    mono: "text-primary",
  }[accentStyle];
  const ghostWord = eyebrow.split(" ")[0] || eyebrow;

  const eyebrowElement = (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary md:text-sm">
      <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
      <span>{eyebrow}</span>
    </p>
  );
  const titleElement = (
    <div className="relative">
      <span
        className={`pointer-events-none absolute -top-9 select-none text-5xl font-semibold leading-none tracking-[-0.04em] text-neutral-950/[0.045] md:-top-12 md:text-7xl ${
          align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        }`}
        aria-hidden="true"
      >
        {ghostWord}
      </span>
      <h2
        id={headingId}
        className="relative text-2xl font-semibold leading-tight tracking-[-0.025em] text-neutral-950 md:text-3xl lg:text-[2.55rem]"
      >
        {titleParts ? (
          <>
            {titleParts[0]}
            <span className={accentClassName}>{accentWord}</span>
            {titleParts.slice(1).join(accentWord)}
          </>
        ) : (
          title
        )}
      </h2>
    </div>
  );
  const descriptionElement = description ? (
    <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 md:text-[0.95rem] md:leading-7">
      {description}
    </p>
  ) : null;

  if (layout === "split") {
    return (
      <div
        className={`grid w-full gap-4 md:grid-cols-[minmax(0,0.92fr)_minmax(16rem,0.68fr)] md:items-end md:gap-10 ${className}`}
      >
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
          {eyebrowElement}
          {titleElement}
        </div>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-neutral-600 md:justify-self-end md:text-[0.95rem] md:leading-7">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex max-w-4xl flex-col ${alignment} ${className}`}>
      <div>
        {eyebrowElement}
        {titleElement}
      </div>
      {descriptionElement}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4.5 w-4.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12.05 2a9.87 9.87 0 0 0-8.4 15.04l-1.1 4.02 4.12-1.08A9.87 9.87 0 1 0 12.05 2Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M8.1 7.8c.25-.28.52-.3.78-.28.2.02.42.06.6.47l.75 1.8c.08.2.07.37-.05.55l-.5.7c-.14.18-.08.36 0 .5.2.34.57.86 1.1 1.35.68.63 1.25.9 1.6 1.08.2.1.36.08.48-.07l.63-.75c.15-.18.32-.2.52-.12l1.78.84c.22.1.36.18.41.3.06.13.06.74-.3 1.33-.36.58-1.03.8-1.45.83-.37.03-.85-.07-1.42-.3-1.3-.53-2.43-1.44-3.4-2.38-.9-.88-1.62-1.83-2.1-2.7-.48-.88-.64-1.58-.62-2.03.02-.44.19-.86.57-1.32Z" fill="currentColor" />
    </svg>
  );
}

export function CommercialLink({
  href,
  children,
  external = false,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  variant?: "primary" | "outline" | "text";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-primary text-white shadow-[0_10px_28px_rgba(2,85,245,0.2)] hover:bg-primary-600 focus-visible:ring-primary",
    outline:
      "border border-primary bg-white text-primary hover:bg-primary-50 focus-visible:ring-primary",
    text: "text-primary hover:text-primary-700 focus-visible:ring-primary",
  }[variant];
  const sharedClassName = `group inline-flex min-h-12 min-w-0 items-center justify-center gap-2.5 rounded-full px-5 py-3 text-center text-sm font-semibold leading-none transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles} ${className}`;
  const isWhatsAppLink = /wa\.me|whatsapp/i.test(href);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClassName}>
        {isWhatsAppLink ? <span className={variant === "primary" ? "text-white" : "text-[#25D366]"}><WhatsAppIcon /></span> : null}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={sharedClassName}>
      {isWhatsAppLink ? <span className={variant === "primary" ? "text-white" : "text-[#25D366]"}><WhatsAppIcon /></span> : null}
      {children}
    </Link>
  );
}

export function PortfolioShowcase({
  slugs = DEFAULT_PORTFOLIO_SLUGS,
  className = "",
}: {
  slugs?: readonly string[];
  className?: string;
}) {
  const selected = slugs
    .map((slug) => umkmPortfolio.find((item) => item.slug === slug))
    .filter((item): item is (typeof umkmPortfolio)[number] => Boolean(item));
  const portfolioItems = selected.length >= 3 ? selected.slice(0, 3) : umkmPortfolio.slice(0, 3);
  const cardDescriptions: Record<string, string> = {
    growmates: "Platform pendampingan anak dengan informasi program, kegiatan, dan jalur kolaborasi yang mudah diakses.",
    "bakpia-malino": "Camilan khas Malino dengan katalog rasa, cerita produk, dan jalur pemesanan yang mudah ditemukan.",
    "gingerfit-plus": "Gingershot organik dengan pilihan varian, manfaat produk, dan jalur pemesanan yang jelas.",
  };

  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 ${className}`}>
      {portfolioItems.map((business) => (
        <article
          key={business.slug}
          className="group/card flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200 bg-white p-2.5 shadow-[0_12px_34px_rgba(1,34,98,0.06)] transition-colors hover:border-primary/60 md:rounded-[2rem] md:p-3"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-primary-50 md:rounded-[1.45rem]">
            <Image
              src={business.image}
              alt={business.imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover/card:scale-[1.025]"
              sizes="(max-width: 639px) calc(100vw - 52px), (max-width: 1023px) 45vw, 31vw"
            />
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[0.65rem] font-semibold text-neutral-800 shadow-sm backdrop-blur-md md:text-xs">
              {business.type}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-3 pb-2 pt-4 md:p-4 md:pb-3 md:pt-5">
            <p className="mb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
              {business.category}
            </p>
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-neutral-950 md:text-2xl">
              {business.name}
            </h3>
            <p className="mb-4 mt-3 min-h-[4.5rem] line-clamp-3 text-sm leading-6 text-neutral-600">
              {cardDescriptions[business.slug] ?? business.description}
            </p>
            <Link
              href={`${commercialLinks.portfolio}/${business.slug}`}
              className="group mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-sm"
            >
              Lihat detail karya
              <ArrowIcon />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

type ComparisonKind = "website-umkm" | "website-custom" | "sistem-digital";

const comparisonRows: Record<ComparisonKind, readonly { criteria: string; other: string; dekatlokal: string }[]> = {
  "website-umkm": [
    { criteria: "Mulai dari kebutuhan usaha", other: "Pilih template sendiri", dekatlokal: "Dipetakan dari profil, produk, dan kontak" },
    { criteria: "Biaya awal", other: "Add-on sering terpisah", dekatlokal: "Mulai Rp999.000 dengan cakupan jelas" },
    { criteria: "Konten dan katalog", other: "Diisi sendiri", dekatlokal: "Dibantu susun agar rapi" },
    { criteria: "WhatsApp, Maps, SEO dasar", other: "Setup manual", dekatlokal: "Termasuk kebutuhan dasar" },
    { criteria: "AI Assistant", other: "Tool tambahan", dekatlokal: "Bonus chat di website" },
    { criteria: "Dukungan", other: "Forum atau tiket umum", dekatlokal: "Tim lokal via WhatsApp" },
  ],
  "website-custom": [
    { criteria: "Strategi halaman", other: "Mengikuti template", dekatlokal: "Disusun dari tujuan brand" },
    { criteria: "Desain dan struktur", other: "Seragam dan terbatas", dekatlokal: "Custom sesuai kebutuhan" },
    { criteria: "Fitur khusus", other: "Plugin/add-on terpisah", dekatlokal: "Dibahas sejak awal" },
    { criteria: "Integrasi", other: "Manual atau terbatas", dekatlokal: "Dipetakan sesuai prioritas" },
    { criteria: "AI Assistant", other: "Perlu tool tambahan", dekatlokal: "Bonus chat website" },
    { criteria: "Biaya", other: "Sering berubah karena add-on", dekatlokal: "Mulai Rp1.999.999 dengan cakupan jelas" },
  ],
  "sistem-digital": [
    { criteria: "Pemetaan proses", other: "Langsung pilih software", dekatlokal: "Alur kerja dipetakan dulu" },
    { criteria: "Modul sistem", other: "Fitur umum", dekatlokal: "Custom sesuai operasi" },
    { criteria: "Dashboard/data", other: "Terpisah di banyak tools", dekatlokal: "Dirancang dalam satu alur" },
    { criteria: "Pengembangan bertahap", other: "Sulit dipisah prioritas", dekatlokal: "Bisa dimulai dari versi awal" },
    { criteria: "Dokumentasi", other: "Minim/hanya tutorial", dekatlokal: "Disiapkan sesuai kebutuhan" },
    { criteria: "AI Assistant", other: "Tidak terintegrasi", dekatlokal: "Bisa dibicarakan sesuai alur" },
  ],
};

function CrossIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
      <path d="m6 6 8 8M14 6l-8 8" />
    </svg>
  );
}

export function ServiceComparisonSection({
  kind,
  title = "Kenapa memilih DekatLokal untuk langkah digital berikutnya?",
  description = "Kami tidak hanya menyiapkan tampilan, tetapi membantu menyusun kebutuhan, cakupan, dan dukungan agar proyek lebih jelas sejak awal.",
}: {
  kind: ComparisonKind;
  title?: string;
  description?: string;
}) {
  const rows = comparisonRows[kind];

  return (
    <section className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12" aria-labelledby={`${kind}-comparison-title`}>
      <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] md:items-end">
        <SectionHeading
          eyebrow="PERBANDINGAN"
          title={title}
          description={description}
          headingId={`${kind}-comparison-title`}
          accentWord="DekatLokal"
        />
        <p className="text-sm leading-7 text-neutral-600 md:justify-self-end">
          Sistem lain sering cocok untuk mulai cepat. DekatLokal membantu ketika Anda butuh alur
          yang lebih jelas, dukungan manusia, dan ruang bertumbuh.
        </p>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row, index) => (
          <article
            key={row.criteria}
            className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(1,34,98,0.05)]"
          >
            <div className="flex items-start gap-3 border-b border-neutral-200 px-5 py-4">
              <span className="font-mono text-[0.65rem] font-bold text-primary/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Kriteria
                </p>
                <h3 className="mt-1 text-base font-semibold text-neutral-950">{row.criteria}</h3>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-start gap-3 px-5 py-4 text-sm text-neutral-600">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-red-50 text-red-500">
                <CrossIcon />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Sistem lain
                </p>
                <p className="mt-1 leading-6">{row.other}</p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-start gap-3 bg-primary px-5 py-4 text-sm text-white">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/18">
                <CheckIcon />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary-100">
                  DekatLokal
                </p>
                <p className="mt-1 leading-6">{row.dekatlokal}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(1,34,98,0.06)] md:block">
        <div className="grid grid-cols-[1.05fr_0.9fr_1fr] border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          <div className="px-4 py-4 md:px-6">Kriteria</div>
          <div className="px-4 py-4 md:px-6">Sistem lain</div>
          <div className="flex items-center justify-center gap-2 bg-primary px-4 py-4 text-white md:px-6">
            <Image src="/image/brand/dekat-lokal.png" alt="" width={88} height={28} className="h-auto w-24 brightness-0 invert" />
          </div>
        </div>
        <div className="divide-y divide-neutral-200">
          {rows.map((row, index) => (
            <div key={row.criteria} className="grid grid-cols-[1.05fr_0.9fr_1fr] text-sm">
              <div className="flex gap-3 px-4 py-4 font-semibold text-neutral-900 md:px-6">
                <span className="font-mono text-[0.65rem] font-bold text-primary/60">{String(index + 1).padStart(2, "0")}</span>
                {row.criteria}
              </div>
              <div className="flex items-start gap-2 px-4 py-4 text-neutral-600 md:px-6">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-50 text-red-500">
                  <CrossIcon />
                </span>
                {row.other}
              </div>
              <div className="flex items-start gap-2 bg-primary px-4 py-4 text-white md:px-6">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/18 text-white">
                  <CheckIcon />
                </span>
                {row.dekatlokal}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface ProblemFramingItem {
  title: string;
  description: string;
  icon?: CommercialIconName;
}

export function ProblemFramingSection({
  id,
  eyebrow = "MASALAH",
  title,
  description,
  items,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  items: readonly ProblemFramingItem[];
}) {
  return (
    <section id={id} className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          headingId={id ? `${id}-title` : undefined}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <article key={item.title} className="problem-card group rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_rgba(1,34,98,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-50 text-primary">
                  {item.icon ? <CommercialIcon name={item.icon} /> : <span className="font-mono text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>}
                </span>
                <span className="font-mono text-[0.62rem] font-semibold tracking-[0.14em] text-primary/55">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold leading-snug text-neutral-950 md:text-lg">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommercialProcessSection({
  id,
  title = "Proses yang jelas dari awal hingga website tayang",
  description =
    "Setiap tahap dibicarakan bersama agar kebutuhan, cakupan kerja, materi, dan ekspektasi tetap selaras.",
  headingLayout = "stacked",
  accentWord,
  accentStyle = "italic",
  variant = "cards",
}: {
  id?: string;
  title?: string;
  description?: string;
  headingLayout?: "stacked" | "split";
  accentWord?: string;
  accentStyle?: "highlight" | "italic" | "mono";
  variant?: "cards" | "reference";
}) {
  return (
    <section id={id} className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <SectionHeading
        eyebrow="CARA KERJA"
        title={title}
        description={description}
        align={headingLayout === "split" ? "left" : "center"}
        layout={headingLayout}
        accentWord={accentWord}
        accentStyle={accentStyle}
      />

      {variant === "reference" ? (
        <ol className="mt-9 divide-y divide-neutral-200 border-y border-neutral-200 md:mt-12">
          {commercialProcessSteps.map((step, index) => (
            <li
              key={step.title}
              className="group grid gap-3 py-6 md:grid-cols-[5rem_minmax(13rem,0.8fr)_minmax(0,1.4fr)] md:items-center md:gap-6"
            >
              <span className="font-mono text-4xl font-medium leading-none tracking-[-0.06em] text-primary md:text-5xl">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-neutral-950">{step.title}</h3>
              <p className="text-sm leading-7 text-neutral-600 md:text-base">{step.description}</p>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="mt-9 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
          {commercialProcessSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_rgba(1,34,98,0.04)] md:p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-base font-semibold text-neutral-950 md:text-lg">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function VerifiedTestimonialPlaceholderSection({ id }: { id?: string }) {
  return (
    <section id={id} className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12">
      <div className="overflow-hidden rounded-[2rem] border border-primary-100 bg-primary-50 px-6 py-8 text-center md:px-10 md:py-10">
        <SectionHeading
          eyebrow={verifiedTestimonialPlaceholder.eyebrow}
          title={verifiedTestimonialPlaceholder.title}
          description={verifiedTestimonialPlaceholder.description}
          align="center"
          className="mx-auto"
        />
        <CommercialLink
          href={verifiedTestimonialPlaceholder.href}
          variant="outline"
          className="mt-7"
        >
          {verifiedTestimonialPlaceholder.ctaLabel}
          <ArrowIcon />
        </CommercialLink>
      </div>
    </section>
  );
}

export function ClientStoriesSection({ id = "cerita-klien" }: { id?: string }) {
  const stories = [
    "aroma-bakery",
    "kira-kira-michi",
    "bakpia-malino",
    "dapur-karaeng",
    "iboo-idn",
    "gingerfit-plus",
  ]
    .map((slug) => umkmPortfolio.find((item) => item.slug === slug))
    .filter((item): item is (typeof umkmPortfolio)[number] => Boolean(item));

  return (
    <section id={id} className="section-scroll-reveal scroll-mt-28 py-9 md:py-11 lg:py-12" aria-labelledby={`${id}-title`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="CERITA KLIEN"
          title="Setiap website dimulai dari cerita usaha yang ingin ditemukan"
          description="Website DekatLokal membantu usaha lokal menampilkan profil, produk, lokasi, dan jalur kontak dengan lebih rapi agar pelanggan lebih mudah mengambil langkah."
          headingId={`${id}-title`}
        />
        <CommercialLink href={commercialLinks.portfolio} variant="outline" className="w-fit shrink-0">
          Lihat semua karya
          <ArrowIcon />
        </CommercialLink>
      </div>

      <ClientStoriesCarousel stories={stories} />
    </section>
  );
}

export function SocialImpactSection({ id = "dampak" }: { id?: string }) {
  const partnerLogos = [
    { src: "/image/logos/partners/bakti-nusa.png", alt: "Bakti Nusa" },
    { src: "/image/logos/partners/dompet-dhuafa.png", alt: "Dompet Dhuafa" },
    { src: "/image/logos/partners/rumah-bumn.png", alt: "Rumah BUMN Makassar" },
  ];

  return (
    <section id={id} className="section-scroll-reveal scroll-mt-28 overflow-hidden py-9 md:py-11 lg:py-12" aria-label="Dampak sosial DekatLokal">
      <CurvedImageMarqueeSection
        id={`${id}-galeri`}
        eyebrow="DAMPAK SOSIAL"
        title="Setiap website berbayar membuka jalan bagi UMKM lain"
        description="Klien DekatLokal tidak hanya mendapatkan website profesional. Setiap proyek turut menjaga program website gratis, pendampingan digital, dan pemeliharaan agar lebih banyak UMKM punya rumah digital yang layak."
        ctaLabel="Lihat program website UMKM"
        ctaHref="/digital-checkup"
      />

      <div className="mx-auto grid max-w-7xl gap-5 border-t border-neutral-200 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(24rem,1fr)] md:items-center md:gap-5 md:pt-6">
        <p className="max-w-xl text-sm leading-7 text-neutral-700 md:text-base">
          Program ini tumbuh bersama mitra dan klien yang percaya bahwa bisnis digital dapat ikut
          memperkuat UMKM dari lingkungan terdekat.
        </p>
        <div className="grid grid-cols-3 items-center gap-3 md:gap-5">
          {partnerLogos.map((logo) => (
            <Image key={logo.alt} src={logo.src} alt={logo.alt} width={170} height={100} className="icon-hover-motion h-20 w-full object-contain md:h-24" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommercialFaqList({
  items,
  headingId,
}: {
  items: readonly CommercialFaqItem[];
  headingId?: string;
}) {
  return <AnimatedCommercialFaqList items={items} headingId={headingId} />;
}
