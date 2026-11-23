"use client";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { instrument } from "@/lib/decision-engine";
import { levelLabels, plainQuestion } from "@/lib/digital-checkup/plain-language";
import { adminWhatsApp } from "@/lib/digital-checkup/contact";
import { fadeUp, stagger, tap } from "@/components/system/motion";

type Question = (typeof instrument.questions)[number];

export function QuestionScreen({ question, index, value, onChange, onClear, headingRef }: {
  question: Question; index: number; value: number | null | undefined; onChange: (score: number) => void; onClear: () => void; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const plain = plainQuestion(question.code);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName) && (target as HTMLInputElement).type !== "radio") return;
      const digit = Number(event.key);
      if (digit >= 1 && digit <= 5) onChange(digit - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChange]);

  return (
    <motion.section key={question.code} className="ck-card" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.05)}>
      <motion.div variants={fadeUp} className="ck-q-head">
        <span className="ck-q-code">{question.code}</span>
        <span className="chip chip-primary">Pertanyaan {index + 1} dari 4</span>
      </motion.div>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1} className="ck-q-title">{plain.title}</motion.h1>
      {plain.hint && <motion.p variants={fadeUp} className="ck-q-hint">{plain.hint}</motion.p>}
      {plain.example && <motion.p variants={fadeUp} className="ck-q-example">{plain.example}</motion.p>}
      <motion.details variants={fadeUp} className="ck-official">
        <summary><HelpCircle size={15} /> Lihat pertanyaan resmi</summary>
        <p>{question.text}</p>
      </motion.details>
      <fieldset data-field={question.code} className="ck-fieldset" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <legend className="sr-only">{question.text}</legend>
        <div className="ck-options" role="radiogroup" aria-label={plain.title}>
          {question.options.map((option) => {
            const selected = value === option.score;
            return (
              <motion.label key={option.score} variants={fadeUp} whileTap={reduced ? undefined : tap} className={`ck-option${selected ? " is-selected" : ""}`}>
                <input id={`${question.code}-${option.score}`} type="radio" name={question.code} value={option.score} checked={selected} onChange={() => onChange(option.score)} />
                <span className={`ck-level l${option.score}`} aria-hidden="true">{option.score}</span>
                <span className="ck-option-text"><small>{levelLabels[option.score]}</small><span>{option.label}</span></span>
                <span className="ck-option-check" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
              </motion.label>
            );
          })}
        </div>
      </fieldset>
      <motion.div variants={fadeUp} className="ck-q-help">
        <span><MessageCircleQuestion size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Masih ragu? <a href={adminWhatsApp("Halo Admin DekatLokal, saya sedang mengisi Digital Checkup dan ingin bertanya kepada pendamping.")} target="_blank" rel="noopener noreferrer">Tanya pendamping</a></span>
        {value != null && <button type="button" onClick={onClear}>Kosongkan jawaban</button>}
      </motion.div>
    </motion.section>
  );
}
