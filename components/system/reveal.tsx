"use client";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, stagger } from "./motion";

type RevealProps = { children?: ReactNode; className?: string; delay?: number; once?: boolean; amount?: number; style?: React.CSSProperties; id?: string };

/** Fades a block in when it scrolls into view. Respects reduced motion. */
export function Reveal({ delay = 0, once = true, amount = 0.2, children, className, style, id }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style} id={id}>{children}</div>;
  return (
    <motion.div id={id} className={className} style={style} initial="hidden" whileInView="show" viewport={{ once, amount }} variants={fadeUp} transition={{ delay }}>
      {children}
    </motion.div>
  );
}

/** Container that staggers its direct `RevealItem` children. */
export function RevealGroup({ children, delay = 0.08, className, style, id }: { children?: ReactNode; delay?: number; className?: string; style?: React.CSSProperties; id?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style} id={id}>{children}</div>;
  return (
    <motion.div id={id} className={className} style={style} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger(delay)}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, style }: { children?: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <motion.div className={className} style={style} variants={fadeUp}>{children}</motion.div>;
}
