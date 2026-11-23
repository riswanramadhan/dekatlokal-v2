"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Kata yang berganti di judul hero, berganti tiap 2,2 detik dengan transisi singkat; berhenti saat
 * tab tersembunyi atau pengguna memilih gerak minimal. Lebar mengikuti kata yang sedang tampil
 * (diukur dari salinan tersembunyi) dan berpindah halus, jadi sorotan di belakangnya selalu pas.
 */
export function RotatingWord({ words, interval = 2200, className = "" }: { words: readonly string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[] | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const key = words.join("|");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!reduce.matches && !document.hidden) timer = setInterval(() => setIndex((current) => (current + 1) % words.length), interval);
    };
    sync();
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [words.length, interval]);

  useEffect(() => {
    const box = measureRef.current;
    if (!box) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const next = Array.from(box.children, (child) => Math.ceil(child.getBoundingClientRect().width));
      setWidths((previous) => (previous && previous.every((value, i) => value === next[i]) ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    void document.fonts?.ready.then(measure);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [key]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  const width = widths?.[index];
  return <span className={`eco-rotating ${className}`} style={width ? { width } : undefined} data-measured={widths ? "" : undefined}>
    <span ref={measureRef} className="eco-rotating__measure" aria-hidden="true">{words.map((word) => <span key={word}>{word}</span>)}</span>
    <span className="eco-rotating__sizer" aria-hidden="true">{longest}</span>
    <span className="eco-rotating__word" key={index} aria-hidden="true">{words[index]}</span>
    <span className="sr-only">{words.join(", ")}</span>
  </span>;
}
