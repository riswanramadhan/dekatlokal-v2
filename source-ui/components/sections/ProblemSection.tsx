"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { umkmPortfolio } from "@/components/website-umkm/data";

const stats = [
  {
    value: umkmPortfolio.length,
    suffix: "",
    label: "website usaha dan gerakan lokal dalam portofolio",
  },
  {
    value: 100,
    suffix: "%",
    label: "tampilan dirancang nyaman untuk perangkat mobile",
  },
  {
    value: 24,
    suffix: "/7",
    label: "informasi usaha siap dilihat calon pelanggan",
  },
];

function CountUpNumber({
  target,
  suffix,
  duration = 2000,
  delay = 0,
}: {
  target: number;
  suffix: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    let animationFrame = 0;

    const timeout = setTimeout(() => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      };

      animationFrame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [isInView, target, duration, delay]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function ProblemSection() {
  return (
    <section className="mb-10 text-center md:mb-12 lg:mb-14" aria-labelledby="social-proof-title">
      <motion.div
        className="mx-auto mb-7 max-w-3xl md:mb-9"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center justify-center gap-2.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
          <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            BUKTI NYATA
          </p>
        </div>
        <h2 id="social-proof-title" className="mt-3 text-2xl font-bold leading-tight tracking-[-0.035em] text-foreground md:text-3xl lg:text-[2.35rem]">
          Website membuat usaha lebih siap <span className="text-primary">ditemukan</span>
        </h2>
        <p className="mt-4 text-sm leading-7 text-neutral-600 md:text-[0.95rem]">
          Satu rumah digital membantu calon pelanggan mengenali usaha, melihat produk, menemukan
          lokasi, dan menghubungi Anda tanpa harus mencari informasi di banyak tempat.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex min-h-44 flex-col items-center justify-center rounded-[1.5rem] border border-primary-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(1,34,98,0.06)] md:px-6"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.15 }}
            >
              <p className="mb-2 text-4xl font-bold tabular-nums tracking-[-0.05em] text-primary lg:text-5xl">
                <CountUpNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={1800}
                  delay={i * 150}
                />
              </p>
              <p className="max-w-56 text-sm font-semibold leading-6 text-neutral-700 md:text-[0.9rem]">
                {stat.label}
              </p>
            </motion.div>
          ))}
      </div>

    </section>
  );
}
