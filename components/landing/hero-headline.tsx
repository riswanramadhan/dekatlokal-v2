"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export const heroWords = ["pelanggan", "cuan", "pesanan", "peluang", "pasar", "pertumbuhan"] as const;
const longestWord = [...heroWords].sort((a, b) => b.length - a.length)[0];

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!document.hidden) {
        timer = setInterval(() => setIndex((current) => (current + 1) % heroWords.length), 3000);
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduceMotion]);

  const word = heroWords[index];

  return (
    <h1 className="dl-hero-title" id="hero-title">
      <span className="dl-hero-title-line">Agar lebih Dekat dengan</span>
      <span className="dl-hero-title-line">
        <span aria-hidden="true" className="dl-word-window">
          <span className="dl-word-sizer">{longestWord}</span>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ y: "0%", opacity: 1 }}
              className="dl-changing-word"
              exit={{ y: "-105%", opacity: 0 }}
              initial={{ y: "105%", opacity: 0 }}
              key={word}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="sr-only">{heroWords.join(", ")}.</span>
      </span>
    </h1>
  );
}
