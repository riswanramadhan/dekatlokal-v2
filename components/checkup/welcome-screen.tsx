"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { fadeUp, stagger } from "@/components/system/motion";

export function WelcomeScreen({ consent, onConsent, onStart, configured, headingRef }: { consent: boolean; onConsent: (value: boolean) => void; onStart: () => void; configured: boolean; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const reduced = useReducedMotion();
  return (
    <motion.section className="ck-card" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.07)}>
      <motion.div variants={fadeUp} className="ck-hero-icon"><Sparkles size={30} /></motion.div>
      <motion.p variants={fadeUp} className="eyebrow">Mulai dari kondisi hari ini</motion.p>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1}>Usahamu mau ke mana? Yuk, cari langkahnya.</motion.h1>
      <motion.p variants={fadeUp} className="ck-lead">Jawab 32 pertanyaan singkat, satu per satu seperti kuis. Di akhir, kamu lihat kondisi usahamu dan 3 modul belajar yang paling pas.</motion.p>
      <motion.div variants={fadeUp} className="ck-facts">
        <div><strong>32</strong><span>pertanyaan</span></div>
        <div><strong>5–7</strong><span>menit</span></div>
        <div><strong>Gratis</strong><span>hasil langsung</span></div>
      </motion.div>
      <motion.details variants={fadeUp} className="ck-privacy">
        <summary><ShieldCheck size={18} /> Jawabanmu tetap milikmu</summary>
        <p>Draf disimpan di perangkat ini maksimal 7 hari. Kami menyimpan nama bisnis, email, WhatsApp, jawaban, dan profil usaha untuk menyusun rekomendasi serta penelitian pendampingan UMKM. Data penelitian memakai kode usaha, bukan nama.</p>
        <p>Kamu tidak perlu mengisi NIK, rekening, atau omzet. Hasil ini membantu diskusi dengan pendamping, bukan penentu kredit, bantuan, atau jaminan keberhasilan usaha.</p>
        <Link className="link" href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Baca kebijakan privasi</Link>
      </motion.details>
      <motion.label variants={fadeUp} className="ck-consent">
        <input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
        <span>Ya, saya memahami tujuan dan penggunaan data ini, serta bersedia ikut.</span>
      </motion.label>
      <motion.div variants={fadeUp}>
        <button type="button" className="btn btn-primary btn-lg btn-block" disabled={!consent} onClick={onStart}>Mulai Checkup Gratis <ArrowRight size={18} /></button>
        <p className="ck-muted" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><Clock3 size={14} /> Bisa berhenti kapan saja. Jawaban tersimpan otomatis.</p>
      </motion.div>
      {!configured && <p className="note note-warning">Formulir bisa kamu baca. Penyimpanan sedang dihubungkan; jawaban belum dapat dikirim saat ini.</p>}
    </motion.section>
  );
}
