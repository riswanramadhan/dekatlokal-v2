"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

interface FinalCTAProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  primaryExternal?: boolean;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryExternal?: boolean;
}

export default function FinalCTA({
  title = "Mulai Digital Checkup UMKM untuk Langkah Digital yang Tepat",
  description = "Tanpa login | Gratis | Hasil dan rekomendasi langsung",
  primaryLabel = "Mulai Digital Checkup Gratis",
  primaryHref = "/digital-checkup",
  primaryExternal = false,
  secondaryLabel,
  secondaryHref,
  secondaryExternal = false,
}: FinalCTAProps) {
  const shouldReduceMotion = useReducedMotion();
  const primaryClassName =
    "animated-cta group inline-flex min-h-12 items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:min-h-[3.25rem] md:pl-6 md:text-base";
  const primaryContent = (
    <>
      <span>{primaryLabel}</span>
      <span className="animated-cta__arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white md:h-10 md:w-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-4 w-4 md:h-5 md:w-5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </span>
    </>
  );

  return (
    <section className="overflow-hidden pt-12 md:pt-16 lg:pt-24">
      <div className="bg-primary relative">
        <motion.div
          className="absolute -top-18 md:-top-28 lg:-top-48 right-0 pointer-events-none select-none" aria-hidden="true"
          animate={shouldReduceMotion ? undefined : { y: [0, -14, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          >
          <Image
            src="/image/cta-top-right.png"
            alt=""
            width={220}
            height={220}
            className="w-26 md:w-38 lg:w-70 object-contain"
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-6 md:-bottom-12 lg:-bottom-20 left-0 pointer-events-none select-none" aria-hidden="true"
          animate={shouldReduceMotion ? undefined : { y: [0, 18, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          >
          <Image
            src="/image/cta-bottom-left-full.png"
            alt=""
            width={220}
            height={220}
            className="w-26 md:w-42 lg:w-74 object-contain"
          />
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 md:gap-6 lg:gap-12 py-24 md:py-18 lg:py-24"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <motion.h2
          className="text-primary-foreground text-2xl md:text-3xl lg:text-4xl lg:leading-normal font-bold"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
                {title}
            </motion.h2>
            <motion.p
              className="text-primary-foreground text-sm leading-7 md:text-base lg:text-lg"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                {description}
            </motion.p>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {primaryExternal ? (
                  <a
                    href={primaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={primaryClassName}
                  >
                    {primaryContent}
                  </a>
                ) : (
                  <Link href={primaryHref} className={primaryClassName}>
                    {primaryContent}
                  </Link>
                )}
                {secondaryLabel && secondaryHref ? (
                  secondaryExternal ? (
                    <a
                      href={secondaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg"
                    >
                      {secondaryLabel}
                    </a>
                  ) : (
                    <Link
                      href={secondaryHref}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg"
                    >
                      {secondaryLabel}
                    </Link>
                  )
                ) : null}
              </div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
