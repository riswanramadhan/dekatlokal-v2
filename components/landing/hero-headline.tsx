"use client";

import { useEffect, useState } from "react";

const words = ["customer", "cuan", "pasar", "peluang", "teknologi", "pertumbuhan"];

export function HeroHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!preference.matches && !document.hidden) {
        timer = setInterval(() => setIndex((current) => (current + 1) % words.length), 3000);
      }
    };
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <h1 className="dl-new-headline" id="hero-title">
      <span className="dl-headline-intro">Cek kondisi usahamu.</span>
      <span className="dl-headline-main">Agar lebih Dekat dengan</span>
      <span className="dl-word-window" aria-hidden="true">
        <span className="dl-word-sizer">pertumbuhan</span>
        <span className="dl-changing-word" key={index}>{words[index]}</span>
      </span>
      <span className="dl-sr-only">customer, cuan, pasar, peluang, teknologi, dan pertumbuhan.</span>
    </h1>
  );
}
