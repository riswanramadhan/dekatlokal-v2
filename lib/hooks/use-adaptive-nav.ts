"use client";

import { useEffect, useState } from "react";

export function useAdaptiveNav() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const threshold = reduceMotion ? 80 : 24;

    function update() {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastY;
      if (currentY < 24 || delta < -threshold) {
        setCollapsed(false);
      } else if (delta > threshold && currentY > 120) {
        setCollapsed(true);
      }
      lastY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    function restore() {
      setCollapsed(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("focusin", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focusin", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);

  return { collapsed };
}
