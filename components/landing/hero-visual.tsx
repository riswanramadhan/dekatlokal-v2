"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Check, Gift } from "lucide-react";

const scores = [
  { label: "Kenal usaha sendiri", value: 82 },
  { label: "Legalitas dan administrasi", value: 46 },
  { label: "Produk atau layanan", value: 74 },
  { label: "Merek dan tampilan", value: 58 },
  { label: "Pemakaian digital", value: 39 },
  { label: "Konsisten menjalankan rencana", value: 63 },
  { label: "Cara usaha berjalan", value: 70 },
  { label: "Siap ikut pendampingan", value: 88 },
] as const;

const priorityModules = ["Mulai Jualan Online", "Bikin Usaha Mudah Diingat", "Produk Rapi, Kemasan Menarik"] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function barColor(value: number) {
  if (value >= 70) return "linear-gradient(90deg, var(--color-mint), #5fe0aa)";
  if (value >= 50) return "linear-gradient(90deg, var(--color-primary), var(--color-sky))";
  return "linear-gradient(90deg, var(--color-amber), var(--color-coral))";
}

function Floating({
  children,
  className,
  delay,
  distance = 8,
  duration = 5.5,
  reduce,
}: {
  children: ReactNode;
  className: string;
  delay: number;
  distance?: number;
  duration?: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`dl-float ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.92, y: 18 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -distance, 0] }}
        transition={{ duration, ease: "easeInOut", repeat: Infinity, delay: delay + 0.7 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroVisual() {
  const reduce = useReducedMotion() ?? false;
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.3 });
  const average = Math.round(scores.reduce((sum, score) => sum + score.value, 0) / scores.length);

  return (
    <div aria-hidden="true" className="dl-hero-visual" ref={stage}>
      <div className="dl-hero-blob" />
      <div className="dl-hero-floor" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="dl-hero-owner"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        <Image alt="" fill priority sizes="(max-width: 1023px) 70vw, 400px" src="/platform-v2/hero/owner-cutout.webp" unoptimized />
      </motion.div>

      <Floating className="dl-float-card dl-float-main" delay={0.25} distance={7} duration={6} reduce={reduce}>
        <div className="dl-float-head">
          <div>
            <strong>Hasil Digital Checkup</strong>
            <small>8 bagian usaha dinilai</small>
          </div>
          <span className="chip chip-mint"><Check size={12} /> Selesai</span>
        </div>
        <ul className="dl-score-list">
          {scores.map((score, index) => (
            <li className="dl-score-row" key={score.label} style={{ "--dl-bar": barColor(score.value) } as CSSProperties}>
              <span className="dl-score-label">{score.label}</span>
              <span className="dl-score-val">{score.value}</span>
              <span className="dl-score-bar">
                <motion.span
                  animate={{ width: inView || reduce ? `${score.value}%` : "0%" }}
                  initial={{ width: reduce ? `${score.value}%` : "0%" }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: EASE, delay: 0.6 + index * 0.08 }}
                />
              </span>
            </li>
          ))}
        </ul>
        <div className="dl-float-foot">
          <span>Skor keseluruhan</span>
          <strong>{average}<span style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 600 }}>/100</span></strong>
        </div>
      </Floating>

      <Floating className="dl-float-card dl-float-pill" delay={0.45} distance={6} duration={5} reduce={reduce}>
        <i><Gift size={15} /></i>
        Akses modul gratis 7 hari
      </Floating>

      <Floating className="dl-float-card dl-float-modules" delay={0.6} distance={9} duration={6.5} reduce={reduce}>
        <strong>3 modul prioritas</strong>
        <ol>
          {priorityModules.map((module, index) => (
            <li key={module}>
              <i>#{index + 1}</i>
              <span>{module}</span>
            </li>
          ))}
        </ol>
      </Floating>

      <Floating className="dl-float-badge" delay={0.8} distance={5} duration={4.5} reduce={reduce}>
        <Check size={24} strokeWidth={3} />
      </Floating>
    </div>
  );
}
