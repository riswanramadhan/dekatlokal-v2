"use client";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ClipboardCheck } from "lucide-react";
import { instrument, type Answers } from "@/lib/decision-engine";
import { plainDimension, plainQuestion } from "@/lib/digital-checkup/plain-language";
import { fadeUp, stagger } from "@/components/system/motion";

export function ReviewScreen({ answers, confirmed, onConfirm, onEdit, headingRef }: {
  answers: Answers; confirmed: boolean; onConfirm: (value: boolean) => void; onEdit: (dimension: number, question: number) => void; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section className="ck-card" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.05)}>
      <motion.div variants={fadeUp} className="ck-hero-icon"><ClipboardCheck size={30} /></motion.div>
      <motion.p variants={fadeUp} className="eyebrow">Sebentar lagi selesai</motion.p>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1}>Sudah sesuai kondisi usahamu?</motion.h1>
      <motion.p variants={fadeUp} className="ck-lead">Cek sekali lagi, ya. Setelah dikirim, jawaban ini tersimpan sebagai hasil hari ini. Nanti kamu tetap bisa checkup ulang.</motion.p>
      {instrument.dimensions.map((dimension, i) => {
        const questions = instrument.questions.filter((q) => q.dimension === dimension.code);
        const total = questions.reduce((sum, q) => sum + (answers[q.code] ?? 0), 0);
        const plain = plainDimension(dimension.code);
        return (
          <motion.details variants={fadeUp} className="ck-review" key={dimension.code}>
            <summary><span aria-hidden="true">{plain.emoji}</span>{dimension.title}<span className="ck-score-pill">{Math.round((total / 16) * 100)}/100</span><ChevronDown size={18} /></summary>
            <div className="ck-review-body">
              {questions.map((q, j) => (
                <div className="ck-review-row" key={q.code}>
                  <div><strong>{plainQuestion(q.code).title}</strong><span>{q.options.find((o) => o.score === answers[q.code])?.label ?? "Belum dijawab"}</span></div>
                  <button type="button" onClick={() => onEdit(i, j)}>Ubah</button>
                </div>
              ))}
            </div>
          </motion.details>
        );
      })}
      <motion.label variants={fadeUp} className="ck-consent">
        <input type="checkbox" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)} />
        <span>Jawaban sudah saya cek dan sesuai kondisi usaha saya.</span>
      </motion.label>
    </motion.section>
  );
}
