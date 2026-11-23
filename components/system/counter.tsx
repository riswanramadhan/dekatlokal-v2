"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/** Animates a number from 0 to `value` when it enters the viewport. */
export function Counter({ value, suffix = "", prefix = "", duration = 1200, decimals = 0, className }: { value: number; suffix?: string; prefix?: string; duration?: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const finished = reduced ? value : shown;
  useEffect(() => {
    if (reduced || !inView) return;
    let frame = 0; const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduced]);
  return <span ref={ref} className={className}>{prefix}{finished.toFixed(decimals)}{suffix}</span>;
}
