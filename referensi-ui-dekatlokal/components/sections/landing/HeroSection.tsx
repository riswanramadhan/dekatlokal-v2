"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { HeroAmbientBackground, WebsiteOrbitVisual } from "@/components/commercial/ServiceHeroVisuals";
import { siteConfig, siteRoutes } from "@/lib/site-config";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: "easeOut" as const },
  },
};

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon-hover-motion h-4 w-4 md:h-5 md:w-5"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden pb-0 pt-40 text-center md:pt-44 lg:pt-48">
      <HeroAmbientBackground theme="blue" />
      <motion.div
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center"
        variants={staggerContainer}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="mb-5 md:mb-6">
          <span className="hero-kicker">
            <span>Solusi Digital untuk Bisnis Lokal</span>
          </span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="max-w-4xl text-3xl font-medium leading-[1.14] tracking-[-0.045em] text-white md:text-5xl md:leading-[1.08] lg:text-[4.25rem]"
        >
          Website dan Solusi Digital untuk{" "}
          <span className="font-mono font-medium tracking-[-0.055em]">Bisnis Lokal</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mb-7 mt-5 max-w-2xl text-sm leading-7 text-white/88 md:mb-8 md:text-base md:leading-8"
        >
          Bangun website profesional, kembangkan sistem digital, atau mulai dari Digital Checkup
          untuk mengetahui kebutuhan usaha yang paling perlu diprioritaskan.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <Link
            href={siteRoutes.websiteUmkmService}
            className="animated-cta group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:text-base"
          >
            <span>Buat Website Sekarang</span>
            <span className="animated-cta__arrow grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white md:h-10 md:w-10">
              <ArrowIcon />
            </span>
          </Link>
          <a
            href={siteConfig.digitalCheckupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:text-base"
          >
            Cek Kesiapan Digital Gratis
            <ArrowIcon />
          </a>
        </motion.div>
      </motion.div>

      <div className="relative z-10 -mb-[5.5rem] md:-mb-[6.5rem] lg:-mb-32">
        <WebsiteOrbitVisual theme="blue" />
      </div>
    </section>
  );
}
