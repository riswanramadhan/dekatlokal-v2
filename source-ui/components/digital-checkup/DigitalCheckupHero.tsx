"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { HeroAmbientBackground } from "@/components/commercial/ServiceHeroVisuals";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
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
      className="h-5 w-5 md:h-6 md:w-6"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function DigitalCheckupHero({ appUrl }: { appUrl: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="digital-checkup-hero-title">
      <HeroAmbientBackground theme="blue" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-40 sm:px-6 sm:pt-44 md:grid-cols-13 md:gap-8 md:pb-14 md:pt-40 lg:px-12 lg:pb-16 lg:pt-40">
        <motion.div
          className="mx-auto flex flex-col justify-center md:col-span-7 md:mx-0"
          variants={staggerContainer}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="mb-5 md:mb-6">
            <span className="hero-kicker">
              <span>Platform Digitalisasi UMKM</span>
            </span>
          </motion.div>

          <motion.h1
            id="digital-checkup-hero-title"
            variants={fadeInUp}
            className="max-w-3xl text-3xl font-medium leading-[1.2] tracking-[-0.035em] text-white sm:text-4xl md:text-4xl md:leading-[1.14] lg:text-[2.9rem]"
          >
            Digital Checkup{" "}
            <span className="font-mono font-medium tracking-[-0.055em]">UMKM</span>{" "}
            Gratis untuk Mendapatkan Arah Website yang Tepat
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-8 mt-5 max-w-2xl text-sm leading-7 text-white/90 md:text-base md:leading-8 lg:text-base"
          >
            Ikuti checkup singkat, dapatkan rekomendasi prioritas, dan buka peluang memperoleh
            website gratis melalui program dampak sosial DekatLokal.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col items-start gap-3">
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animated-cta group inline-flex min-h-12 items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:gap-4 md:pl-6 md:text-base lg:text-lg"
            >
              <span>Dapatkan Web Gratis</span>
              <span className="animated-cta__arrow grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white md:h-11 md:w-11">
                <ArrowIcon />
              </span>
            </a>
            <span className="hidden rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold text-white/90 sm:inline-flex">
              Gratis, tanpa login, hasil langsung setelah Checkup selesai.
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto flex w-full justify-center md:col-span-6 md:justify-end"
          initial={
            shouldReduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
        >
          <div className="relative mx-8 w-60 sm:w-72 md:mx-10 lg:mx-16 lg:w-80 xl:w-96">
            <Image
              src="/image/hero/hero-image-v3.webp"
              alt="Ilustrasi Digital Checkup UMKM DekatLokal"
              width={800}
              height={917}
              priority
              className="h-auto w-full"
              sizes="(max-width: 639px) 240px, (max-width: 1023px) 288px, 384px"
            />

            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <motion.div
                className="absolute left-[-17%] top-[10%]"
                animate={shouldReduceMotion ? undefined : { y: [0, -14, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              >
                <Image
                  src="/image/hero/hero-image-floating-1.png"
                  alt=""
                  width={345}
                  height={174}
                  className="h-auto w-32 md:w-40 lg:w-48"
                />
              </motion.div>

              <motion.div
                className="absolute -right-[20%] -top-[8%]"
                animate={shouldReduceMotion ? undefined : { y: [0, 18, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2,
                }}
              >
                <Image
                  src="/image/hero/hero-image-floating-2.png"
                  alt=""
                  width={306}
                  height={155}
                  className="h-auto w-32 md:w-40 lg:w-48"
                />
              </motion.div>

              <motion.div
                className="absolute -left-[25%] bottom-[2%]"
                animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
              >
                <Image
                  src="/image/hero/hero-image-floating-3.png"
                  alt=""
                  width={375}
                  height={190}
                  className="h-auto w-32 md:w-40 lg:w-48"
                />
              </motion.div>

              <motion.div
                className="absolute -right-[20%] bottom-[7%]"
                animate={shouldReduceMotion ? undefined : { y: [0, -22, 0] }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.8,
                }}
              >
                <Image
                  src="/image/hero/hero-image-floating-4.png"
                  alt=""
                  width={305}
                  height={173}
                  className="h-auto w-32 md:w-40 lg:w-48"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
