"use client";
import type { Variants } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};
export const stagger = (delay = 0.08, start = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: start } },
});
export const slide = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.22 } }),
};
export const tap = { scale: 0.97 };
