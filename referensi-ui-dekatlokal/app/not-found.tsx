import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 | Halaman Belum Ditemukan",
  description: "Halaman tidak ditemukan. Kembali ke halaman utama DekatLokal untuk melanjutkan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(155deg,#f8faff_0%,#ffffff_50%,#ebf1fe_100%)] px-6 py-12 text-center">
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary-100/45 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-primary-200/35 blur-3xl"
        aria-hidden="true"
      />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 md:left-10 md:top-9"
        aria-label="Kembali ke beranda DekatLokal"
      >
        <Image
          src="/image/brand/dekat-lokal.png"
          alt="DekatLokal"
          width={528}
          height={163}
          priority
          className="h-auto w-32 md:w-40"
        />
      </Link>

      <section className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
        <div className="not-found-icon relative mb-6 h-24 w-24 overflow-hidden rounded-[1.7rem] bg-primary shadow-[0_20px_55px_rgba(2,85,245,0.25)] ring-8 ring-white md:h-28 md:w-28">
          <Image
            src="/image/system/splashscreen-dekatlokal.gif"
            alt=""
            fill
            unoptimized
            className="object-cover"
            aria-hidden="true"
          />
        </div>

        <p className="mb-4 rounded-full border border-primary/15 bg-white/80 px-4 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary shadow-sm backdrop-blur md:text-xs">
          404 · Belum sampai ke sini
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950 sm:text-5xl md:text-6xl">
          Halaman tidak ditemukan.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
          Halaman yang Anda buka tidak tersedia. Silakan kembali ke halaman utama atau pilih layanan DekatLokal.
          Yuk, kembali ke beranda dan lanjut menjelajah dari sana.
        </p>

        <Link
          href="/"
          className="button-link group mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:px-7 md:text-base"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
            aria-hidden="true"
          >
            <path d="m12 19-7-7 7-7M5 12h14" />
          </svg>
          Kembali ke Beranda
        </Link>
      </section>

      <span
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none font-mono text-[clamp(7rem,25vw,20rem)] font-bold leading-[0.68] tracking-[-0.09em] text-primary/[0.035]"
        aria-hidden="true"
      >
        404
      </span>
    </main>
  );
}
