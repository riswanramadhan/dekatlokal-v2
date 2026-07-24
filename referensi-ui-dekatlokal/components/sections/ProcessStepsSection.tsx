"use client";

import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";

const steps = [
  {
    icon: "solar:notes-bold-duotone",
    title: "Isi Checkup",
    description: "Jawab pertanyaan singkat tentang usaha dan kanal digital Anda.",
  },
  {
    icon: "material-symbols:credit-score-rounded",
    title: "Lihat Analisis",
    description: "Sistem membaca kesiapan dan bagian yang perlu diperbaiki.",
  },
  {
    icon: "material-symbols-light:recommend-sharp",
    title: "Pilih Prioritas",
    description: "Dapatkan langkah yang paling masuk akal untuk dikerjakan lebih dulu.",
  },
  {
    icon: "mdi:web-check",
    title: "Lanjut ke Platform",
    description: "Daftar dan selesaikan alur belajar sampai rekomendasi akhir di platform Digital Checkup.",
  },
] as const;

export default function ProcessStepsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative left-1/2 mb-8 w-screen -translate-x-1/2 overflow-hidden py-9 text-center md:py-11 lg:mb-12 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(2,85,245,0.08),transparent_32%),radial-gradient(circle_at_12%_84%,rgba(56,189,248,0.1),transparent_25%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <div className="inline-flex items-center justify-center gap-2.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
          <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            CARA KERJA
          </p>
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.04em] text-neutral-950 md:text-4xl lg:text-[2.75rem]">
          Empat langkah menuju <span className="text-primary">prioritas yang jelas</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-[0.95rem]">
          Isi singkat, lihat hasilnya, lalu pilih langkah digital yang paling relevan.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-[90rem] px-4 sm:px-6 md:mt-9 lg:px-10">
        <motion.div
          className="pointer-events-none absolute inset-y-6 left-1/2 w-16 -translate-x-1/2 rounded-full bg-primary md:hidden"
          animate={shouldReduceMotion ? undefined : { opacity: [0.8, 1, 0.8], y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 rounded-full bg-cyan-300/90" />
        </motion.div>
        <motion.svg
          viewBox="0 0 1440 330"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-56 w-[112vw] -translate-x-1/2 -translate-y-1/2 md:block"
          animate={shouldReduceMotion ? undefined : { x: [-24, 24, -24], y: [-5, 5, -5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <path
            d="M-40 248 C 210 42, 420 276, 682 160 S 1140 32, 1490 188"
            fill="none"
            stroke="#0255F5"
            strokeWidth="80"
            strokeLinecap="round"
          />
          <motion.path
            d="M-40 248 C 210 42, 420 276, 682 160 S 1140 32, 1490 188"
            fill="none"
            stroke="#67D5FF"
            strokeWidth="30"
            strokeLinecap="round"
            strokeDasharray="250 170"
            opacity="0.9"
            animate={shouldReduceMotion ? undefined : { strokeDashoffset: [0, -420] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              className="relative flex min-h-44 flex-col items-center justify-center rounded-[2rem] border border-primary-100 bg-white/96 px-5 py-6 shadow-[0_18px_44px_rgba(1,34,98,0.1)] backdrop-blur-md sm:min-h-52 sm:rounded-[999px] sm:px-6 lg:min-h-56"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.08 }}
            >
              <span className="absolute left-5 top-5 font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-primary/45 sm:left-1/2 sm:top-7 sm:-translate-x-1/2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={`grid h-14 w-14 place-items-center rounded-[1.25rem] text-white shadow-[0_12px_28px_rgba(2,85,245,0.2)] ${index % 2 === 0 ? "bg-primary" : "bg-[#0b3c9d]"}`}>
                <Icon icon={step.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-base font-bold tracking-[-0.025em] text-neutral-950 md:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 max-w-52 text-xs leading-5 text-neutral-600 md:text-sm md:leading-6">
                {step.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
