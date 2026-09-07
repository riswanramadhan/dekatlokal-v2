"use client";

import { useEffect } from "react";
import { animate, inView, stagger } from "motion";

export function LandingEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".dl-viewport-section"));
    const faqItems = Array.from(document.querySelectorAll<HTMLDetailsElement>(".dl-faq-item"));
    const faqCleanups = faqItems.map((item) => {
      const handleToggle = () => {
        item.classList.toggle("is-active", item.open);
        item.querySelector("summary")?.setAttribute("aria-expanded", String(item.open));
        if (!item.open) return;

        faqItems.forEach((otherItem) => {
          if (otherItem === item) return;
          otherItem.open = false;
          otherItem.classList.remove("is-active");
          otherItem.querySelector("summary")?.setAttribute("aria-expanded", "false");
        });
      };

      item.classList.toggle("is-active", item.open);
      item.querySelector("summary")?.setAttribute("aria-expanded", String(item.open));
      item.addEventListener("toggle", handleToggle);
      return () => item.removeEventListener("toggle", handleToggle);
    });

    if (reduceMotion) {
      sections.forEach((section) => section.classList.add("is-revealed"));
      return () => faqCleanups.forEach((cleanup) => cleanup());
    }

    document.documentElement.classList.add("dl-motion-enabled");
    const stops = sections.map((section) =>
      inView(
        section,
        () => {
          section.classList.add("is-revealed");
          const items = section.querySelectorAll<HTMLElement>("[data-reveal-item]");
          if (items.length) {
            animate(
              items,
              { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] },
              { delay: stagger(0.08), duration: 0.72, ease: [0.22, 1, 0.36, 1] },
            );
          }
        },
        { amount: 0.14, margin: "0px 0px -8% 0px" },
      ),
    );

    const heroItems = document.querySelectorAll<HTMLElement>(".dl-hero-section [data-reveal-item]");
    if (heroItems.length) {
      animate(
        heroItems,
        { opacity: [0, 1], transform: ["translateY(22px)", "translateY(0px)"] },
        { delay: stagger(0.11, { startDelay: 0.08 }), duration: 0.8, ease: [0.22, 1, 0.36, 1] },
      );
    }

    return () => {
      stops.forEach((stop) => stop());
      faqCleanups.forEach((cleanup) => cleanup());
      document.documentElement.classList.remove("dl-motion-enabled");
    };
  }, []);

  return null;
}
