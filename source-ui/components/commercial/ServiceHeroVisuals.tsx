"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const websiteCards = [
  {
    src: "/image/website-umkm/cards/aroma-bakery.webp",
    alt: "Preview website Aroma Bakery",
    className: "left-[3%] top-[38%] w-[28%] -rotate-10 opacity-75",
  },
  {
    src: "/image/website-umkm/cards/bakpia-malino.webp",
    alt: "Preview website Bakpia Malino",
    className: "left-[18%] top-[18%] w-[30%] -rotate-5",
  },
  {
    src: "/image/website-umkm/cards/kira-kira-michi.webp",
    alt: "Preview website Kira Kira Michi",
    className: "left-[33%] top-[7%] w-[34%] rotate-0 z-20",
    priority: true,
  },
  {
    src: "/image/website-umkm/cards/gingerfit-plus.webp",
    alt: "Preview website Gingerfit Plus",
    className: "right-[18%] top-[18%] w-[30%] rotate-5",
  },
  {
    src: "/image/website-umkm/cards/growmates.webp",
    alt: "Preview website Growmates",
    className: "right-[3%] top-[38%] w-[28%] rotate-10 opacity-75",
  },
] as const;

export function HeroAmbientBackground({ theme = "blue" }: { theme?: "blue" | "white" }) {
  const isBlue = theme === "blue";
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 ${
          isBlue
            ? "bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]"
            : "bg-[radial-gradient(circle_at_50%_12%,rgba(2,85,245,0.12),transparent_30%),linear-gradient(rgba(2,85,245,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(2,85,245,0.035)_1px,transparent_1px)]"
        } bg-[length:100%_100%,72px_72px,72px_72px]`}
      />
      <motion.div
        className={`absolute left-1/2 top-[4.5rem] h-72 w-72 -translate-x-1/2 rounded-full border ${
          isBlue ? "border-white/14" : "border-primary/10"
        }`}
        animate={shouldReduceMotion ? undefined : { opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute -right-[4.5rem] bottom-10 h-64 w-64 rounded-full blur-3xl ${
          isBlue ? "bg-cyan-300/18" : "bg-primary/10"
        }`}
        animate={shouldReduceMotion ? undefined : { x: [0, -18, 0], y: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function WebsiteOrbitVisual({ theme = "blue" }: { theme?: "blue" | "white" }) {
  const shouldReduceMotion = useReducedMotion();
  const isBlue = theme === "blue";

  return (
    <motion.div
      className="relative mx-auto mt-12 h-[15.5rem] w-full max-w-6xl sm:h-[19rem] md:mt-14 md:h-[21.5rem] lg:h-96"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        className={`absolute left-1/2 top-[48%] h-40 w-[118%] -translate-x-1/2 rounded-[50%] border-t ${
          isBlue ? "border-white/24 bg-white/8" : "border-primary/16 bg-primary/5"
        } blur-[0.2px]`}
        animate={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {websiteCards.map((card, index) => (
        <motion.div
          key={card.src}
          className={`absolute overflow-hidden rounded-[1.25rem] border border-white/80 bg-white p-1 shadow-[0_22px_58px_rgba(0,17,49,0.18)] md:rounded-[1.65rem] ${card.className}`}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, index % 2 === 0 ? -10 : 10, 0],
                  x: [0, index % 2 === 0 ? 12 : -12, 0],
                }
          }
          transition={{
            duration: 7 + index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.22,
          }}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-primary-50 md:rounded-[1.35rem]">
            <Image
              src={card.src}
              alt={card.alt}
              fill
              priority={"priority" in card ? card.priority : false}
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 320px"
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function SystemFrame({ title, metric, accent }: { title: string; metric: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-[1.45rem] border border-white/70 bg-white p-2 shadow-[0_22px_58px_rgba(0,17,49,0.18)]">
      <div className="flex items-center gap-1.5 border-b border-neutral-100 px-2 pb-2 pt-1" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-red-300" />
        <span className="h-2 w-2 rounded-full bg-yellow-300" />
        <span className="h-2 w-2 rounded-full bg-green-300" />
        <span className="ml-2 h-5 flex-1 rounded-full bg-neutral-100" />
      </div>
      <div className="rounded-[1.15rem] bg-neutral-950 p-4 text-white">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/55">
          {title}
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{metric}</p>
        <div className="mt-5 grid gap-2">
          <span className={`h-2 rounded-full ${accent}`} />
          <span className="h-2 w-4/5 rounded-full bg-white/18" />
          <span className="h-2 w-2/3 rounded-full bg-white/12" />
        </div>
      </div>
    </div>
  );
}

export function SystemFramesVisual() {
  const shouldReduceMotion = useReducedMotion();
  const frames = [
    { title: "Order", metric: "128", accent: "bg-cyan-300" },
    { title: "Dashboard", metric: "92%", accent: "bg-primary-200" },
    { title: "Booking", metric: "34", accent: "bg-emerald-300" },
  ];

  return (
    <div className="relative mx-auto mt-12 h-[14.5rem] w-full max-w-5xl sm:h-72 md:mt-14 md:h-[20.5rem]">
      <motion.div
        className="absolute left-1/2 top-[45%] h-36 w-[112%] -translate-x-1/2 rounded-[50%] border-t border-white/24 bg-white/8"
        animate={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {frames.map((frame, index) => (
        <motion.div
          key={frame.title}
          className={`absolute w-[42%] max-w-xs ${
            index === 0
              ? "left-[4%] top-[22%] -rotate-8 opacity-80"
              : index === 1
                ? "left-[29%] top-[4%] z-20"
                : "right-[4%] top-[22%] rotate-8 opacity-80"
          }`}
          animate={shouldReduceMotion ? undefined : { y: [0, index === 1 ? -12 : 8, 0] }}
          transition={{ duration: 6.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <SystemFrame {...frame} />
        </motion.div>
      ))}
    </div>
  );
}
