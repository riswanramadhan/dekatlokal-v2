"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Hero biru identik dengan dekatlokal.com (components/sections/landing/HeroSection.tsx + HeroAmbientBackground).
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };
const fadeInUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-4 w-4 md:h-5 md:w-5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function HeroAmbientBackground() {
  const reduce = useReducedMotion();
  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:100%_100%,72px_72px,72px_72px]" />
    <motion.div className="absolute left-1/2 top-[4.5rem] h-72 w-72 -translate-x-1/2 rounded-full border border-white/14" animate={reduce ? undefined : { opacity: [0.55, 0.9, 0.55] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
    <motion.div className="absolute -right-[4.5rem] bottom-10 h-64 w-64 rounded-full bg-cyan-300/18 blur-3xl" animate={reduce ? undefined : { x: [0, -18, 0], y: [0, 14, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
  </div>;
}

export interface EcosystemHeroProps {
  kicker: string;
  title: ReactNode;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  footnote?: ReactNode;
  visual?: ReactNode;
  id?: string;
}

export function EcosystemHero({ kicker, title, description, primary, secondary, footnote, visual, id = "beranda" }: EcosystemHeroProps) {
  const reduce = useReducedMotion();
  return <div className="overflow-hidden bg-primary">
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
      <div className={`public-header-offset relative isolate overflow-hidden text-center ${visual ? "pb-0" : "pb-16 md:pb-20 lg:pb-24"}`}>
        <HeroAmbientBackground />
        <motion.div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center" variants={staggerContainer} initial={reduce ? false : "hidden"} animate="visible">
          <motion.div variants={fadeInUp} className="mb-5 md:mb-6"><span className="hero-kicker"><span>{kicker}</span></span></motion.div>
          <motion.h1 id={`${id}-title`} variants={fadeInUp} className="max-w-4xl text-3xl font-medium leading-[1.14] tracking-[-0.045em] text-white md:text-5xl md:leading-[1.08] lg:text-[4.25rem]">
            {title}
          </motion.h1>
          <motion.p variants={fadeInUp} className="mb-7 mt-5 max-w-2xl text-sm leading-7 text-white/88 md:mb-8 md:text-base md:leading-8">{description}</motion.p>
          <motion.div variants={fadeInUp} className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href={primary.href} className="animated-cta group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:text-base">
              <span>{primary.label}</span>
              <span className="animated-cta__arrow grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white md:h-10 md:w-10"><ArrowIcon /></span>
            </Link>
            {secondary ? <Link href={secondary.href} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:text-base">
              {secondary.label}
              <ArrowIcon />
            </Link> : null}
          </motion.div>
          {footnote ? <motion.div variants={fadeInUp} className="mt-5 text-xs text-white/80 md:text-sm">{footnote}</motion.div> : null}
        </motion.div>
        {visual ? <div className="relative z-10 mx-auto mt-10 w-full max-w-5xl md:mt-12">{visual}</div> : null}
      </div>
    </section>
  </div>;
}
