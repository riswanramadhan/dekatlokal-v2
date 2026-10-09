"use client";
import { motion, useReducedMotion } from "motion/react";
import { Clock3, ListChecks } from "lucide-react";
import { instrument } from "@/lib/decision-engine";
import { plainDimension } from "@/lib/digital-checkup/plain-language";
import { fadeUp, stagger } from "@/components/system/motion";
import { Confetti, ScoreRing } from "./score-ring";

export function SectionIntro({ index, headingRef }: { index: number; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const dimension = instrument.dimensions[index];
  const plain = plainDimension(dimension.code);
  const reduced = useReducedMotion();
  return (
    <motion.section className="ck-card ck-section-card" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.08)}>
      <motion.div variants={fadeUp} className={`ck-emoji tone-${plain.tone}`} aria-hidden="true">{plain.emoji}</motion.div>
      <motion.p variants={fadeUp} className="eyebrow">Bagian {index + 1} dari 8</motion.p>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1}>{dimension.title}</motion.h1>
      <motion.p variants={fadeUp} className="ck-lead">{plain.blurb}</motion.p>
      <motion.div variants={fadeUp} className="ck-meta"><span><ListChecks size={15} /> 4 pertanyaan</span><span><Clock3 size={15} /> ± 1 menit</span></motion.div>
      <motion.p variants={fadeUp} className="ck-muted" style={{ marginTop: 18 }}>Pilih kondisi tertinggi yang <strong>semua bagiannya sudah kamu lakukan</strong>. Belum dilakukan juga nggak apa-apa.</motion.p>
      {(dimension.code === "C3" || dimension.code === "C7") && <motion.p variants={fadeUp} className="note" style={{ textAlign: "left" }}>Usaha jasa? Baca “produk” sebagai layanan dan “stok” sebagai kapasitas melayani.</motion.p>}
    </motion.section>
  );
}

function message(score: number) {
  if (score >= 75) return { title: "Mantap! Bagian ini sudah jadi modal kuat.", body: "Pertahankan kebiasaan yang sudah jalan dan simpan buktinya." };
  if (score >= 50) return { title: "Bagus, dasarnya sudah ada.", body: "Tinggal dirapikan supaya hasilnya makin terasa." };
  if (score >= 25) return { title: "Sudah mulai terbentuk.", body: "Pilih satu langkah kecil yang paling mudah dijalankan minggu ini." };
  return { title: "Nggak apa-apa, ini titik awal.", body: "Hasil akhir akan memilihkan modul supaya kamu bisa mulai pelan-pelan." };
}

export function SectionDone({ index, score, headingRef }: { index: number; score: number; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const dimension = instrument.dimensions[index];
  const reduced = useReducedMotion();
  const copy = message(score);
  return (
    <motion.section className="ck-card ck-section-card" style={{ position: "relative" }} initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.08)}>
      {!reduced && score >= 50 && <Confetti />}
      <motion.div variants={fadeUp}><ScoreRing value={score} /></motion.div>
      <motion.p variants={fadeUp} className="eyebrow">Bagian {index + 1} selesai</motion.p>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1} style={{ fontSize: "clamp(22px, 3.5vw, 30px)" }}>{copy.title}</motion.h1>
      <motion.p variants={fadeUp} className="ck-lead">{dimension.title}: <strong>{Math.round(score)}</strong> dari 100. {copy.body}</motion.p>
      <motion.div variants={fadeUp} className="ck-dots" aria-hidden="true">{instrument.dimensions.map((d, i) => <span key={d.code} className={i < index ? "is-done" : i === index ? "is-active" : ""} />)}</motion.div>
    </motion.section>
  );
}
