"use client";

import { useEffect, useState } from "react";

/**
 * Kata yang berganti di judul hero. Lebar dikunci oleh kata terpanjang (tanpa loncatan tata letak),
 * berganti tiap 2,2 detik dengan transisi singkat; berhenti saat tab tersembunyi atau pengguna
 * memilih gerak minimal.
 */
export function RotatingWord({ words, interval = 2200, className = "" }: { words: readonly string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
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
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  return <span className={`eco-rotating ${className}`}>
    <span className="eco-rotating__sizer" aria-hidden="true">{longest}</span>
    <span className="eco-rotating__word" key={index} aria-hidden="true">{words[index]}</span>
    <span className="sr-only">{words.join(", ")}</span>
  </span>;
}
