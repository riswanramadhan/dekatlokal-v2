import Image from "next/image";

/**
 * Pembuka setelah hero, identik dengan dekatlokal.com (SupportedBySection + marquee logo UMKM):
 * eyebrow bergaris, kata bayangan, judul beraksen, lalu logo usaha yang berjalan.
 */
export function AboutWithLogos({ eyebrow, ghost, title, accent, after, description, logos }: {
  eyebrow: string;
  ghost: string;
  title: string;
  accent: string;
  after: string;
  description: string;
  logos: ReadonlyArray<readonly [string, string]>;
}) {
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)];
  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
    <section className="mx-auto grid max-w-7xl gap-6 border-b border-neutral-200 pb-10 pt-16 md:grid-cols-[minmax(10rem,0.34fr)_minmax(0,1fr)] md:items-start md:gap-10 md:pb-12 md:pt-20 lg:gap-16" aria-labelledby="tentang-checkup-title">
      <p className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary md:text-sm">
        <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
        <span>{eyebrow}</span>
      </p>
      <div className="relative">
        <span className="pointer-events-none absolute -top-9 left-0 select-none text-5xl font-semibold leading-none tracking-[-0.04em] text-neutral-950/[0.045] md:-top-12 md:text-7xl" aria-hidden="true">{ghost}</span>
        <h2 id="tentang-checkup-title" className="relative max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.025em] text-neutral-950 md:text-3xl lg:text-[2.55rem]">
          {title} <span className="text-primary">{accent}</span>{after}
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-600 md:text-[0.95rem] md:leading-7">{description}</p>
      </div>
    </section>

    <div className="py-8 md:py-10" aria-label="Usaha lokal bersama DekatLokal">
      <p className="mb-4 text-center font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-neutral-400 md:text-xs">{logos.length} USAHA LOKAL, SATU GERAK DIGITAL</p>
      {rows.map((row, rowIndex) => <div key={rowIndex} className={`umkm-logo-marquee ${rowIndex === 1 ? "mt-3 md:hidden" : ""}`}>
        <div className={`umkm-logo-track ${rowIndex === 1 ? "umkm-logo-track--reverse" : ""}`}>
          {[0, 1].map((groupIndex) => <div key={groupIndex} className="umkm-logo-group" aria-hidden={groupIndex === 1 || rowIndex === 1}>
            {(rowIndex === 0 ? logos : row).map(([name, src]) => <span key={`${groupIndex}-${name}`} className="umkm-logo-chip" title={name}>
              <Image src={src} alt={groupIndex === 0 && rowIndex === 0 ? `${name} logo` : ""} width={420} height={220} className="umkm-logo-image" sizes="(max-width: 767px) 120px, 168px" draggable={false} />
            </span>)}
          </div>)}
        </div>
      </div>)}
    </div>
  </div>;
}
