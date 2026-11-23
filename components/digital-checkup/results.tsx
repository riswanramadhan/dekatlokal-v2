import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, BookOpen, ChevronDown, Gauge, Lightbulb, Target, TrendingUp } from "lucide-react";
import { instrument } from "@/lib/decision-engine";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
import { coursePreview, resultInsight } from "@/lib/digital-checkup/result-insight";
import { moduleVisualForCode } from "@/lib/digital-checkup/module-catalog";
import { plainDimension } from "@/lib/digital-checkup/plain-language";
import { ScoreRing } from "@/components/checkup/score-ring";

const messages = {
  NO_IDENTIFIED_GAP: "Jawabanmu terlihat sudah sangat kuat di semua bagian. Pilih modul yang paling dekat dengan target 30 harimu atau cek ulang bersama pendamping.",
  UNCOVERED_DIMENSION: "Ada kebutuhan yang belum cocok dengan daftar modul saat ini. Tim pendamping perlu meninjaunya lebih dulu.",
  ALTERNATIVES_NOT_DISTINGUISHABLE: "Kebutuhanmu cukup merata, jadi belum ada satu modul yang paling menonjol. Kamu tetap bisa memilih dari tujuh modul gratis.",
};

const level = (score: number) => (score >= 75 ? "lvl-high" : score >= 50 ? "lvl-mid" : "lvl-low");

export function Results({ assessment }: { assessment: PublicAssessment }) {
  const scores = assessment.scores ?? Array(8).fill(0);
  const insight = resultInsight(scores, assessment.payload.profile);
  const trace = assessment.run?.trace;
  const top = trace?.ranking.filter((item) => item.rank <= 3) ?? [];
  const average = scores.reduce((sum: number, value: number) => sum + value, 0) / 8;

  return <>
    <section className="rs-hero">
      <div className="rs-hero-grid">
        <div><p className="eyebrow">{assessment.payload.profile.businessName || "Usahamu"} · Checkup selesai</p><h1>Ini cerita usahamu hari ini.</h1><p>{insight.overview}</p></div>
        <div className="rs-overall"><ScoreRing value={average} size={128} label="rata-rata" /></div>
      </div>
    </section>
    <div className="rs-insights">
      <article className="rs-insight is-strong"><span><BadgeCheck size={17} />Yang sudah jadi modal</span><h2>{insight.strongest.title}</h2><strong>{insight.strongest.score}/100</strong><p>{insight.strongest.story}</p></article>
      <article className="rs-insight is-focus"><span><Target size={17} />Yang paling perlu dibereskan</span><h2>{insight.focus.title}</h2><strong>{insight.focus.score}/100</strong><p>{insight.focus.story}</p></article>
    </div>
    <details className="rs-scores" open>
      <summary><Gauge size={18} /> Nilai 8 bagian usaha <ChevronDown size={18} /></summary>
      <div className="rs-score-list">{instrument.dimensions.map((dimension, index) => { const value = scores[index] ?? 0; return <div className="rs-score-row" key={dimension.code}><div><span>{plainDimension(dimension.code).emoji} {dimension.title}</span><strong>{Math.round(value)} / 100</strong></div><div className={`rs-bar ${level(value)}`}><span style={{ "--value": `${value}%` } as React.CSSProperties} /></div><small>{dimension.definition}</small></div>; })}</div>
    </details>

    {!trace ? <div className="rs-wait" role="status"><TrendingUp size={21} /><div><strong>Nilaimu sudah selesai dihitung.</strong><p>Tiga rekomendasi modul sedang dirangkai dari penilaian ahli. Halaman ini akan memperbarui hasilnya otomatis.</p></div></div> : trace.status !== "RANKED" ? <p className="note" role="status">{messages[trace.status]}</p> : <>
      <div className="rs-section-head"><span className="eyebrow">Jalur belajar personal</span><h2>Mulai dari 3 modul ini.</h2><p>Urutannya mengikuti kebutuhan usahamu dan penilaian tiga ahli. Satu modul dulu juga nggak apa-apa.</p></div>
      {trace.topSet.length > 1 && <p className="note">Ada {trace.topSet.length} modul dengan prioritas teratas yang sama. Kamu bisa mulai dari yang paling mudah dipraktikkan minggu ini.</p>}
      <div className="rs-modules">{top.map((item) => {
        const intervention = instrument.modules.find((module) => module.code === item.code)!;
        const reasons = assessment.run?.reasons[item.code] ?? [];
        const course = coursePreview(item.code);
        const visual = moduleVisualForCode(item.code);
        return <article key={item.code} className="rs-module">
          <div className="rs-module-image"><Image alt={visual.imageAlt} fill sizes="(max-width: 840px) 92vw, 30vw" src={visual.image} unoptimized /><span className="chip">Prioritas {item.rank}</span></div>
          <div className="rs-module-body"><div className="rs-meta"><span>Modul DekatLokal</span><span>{visual.category}</span></div>
            <h3>{course?.title ?? intervention.name}</h3>
            <p>{course?.tagline ?? intervention.scope}</p>
            <div className="rs-why"><Lightbulb size={16} aria-hidden="true" /><p>{reasons.length ? `Modul ini bantu kamu merapikan ${reasons.map((reason) => reason.toLowerCase()).join(" dan ")}.` : "Modul ini dipilih dari gabungan kondisi usahamu dan penilaian ahli."}</p></div>
            <p><strong>Yang akan kamu buat:</strong> {course?.outcome ?? intervention.output}</p>
            <small><BookOpen size={14} aria-hidden="true" /> {course?.lessons.length ?? 3} materi · latihan · kuis · {visual.duration}</small>
          </div>
        </article>;
      })}</div>
      <details className="rs-ranking"><summary>Lihat urutan 7 modul</summary><ol>{trace.ranking.map((item) => <li key={item.code}>Prioritas {item.rank} · {coursePreview(item.code)?.title ?? instrument.modules.find((module) => module.code === item.code)?.name}</li>)}</ol></details>
    </>}

    <section className={`rs-website is-${insight.website.state}`}>
      <span className="rs-mark"><BookOpen size={22} aria-hidden="true" /></span>
      <div><span className="eyebrow">Peluang website gratis</span><h2>{insight.website.title}</h2><p>{insight.website.description}</p><Link href="https://www.dekatlokal.com/digital-checkup" target="_blank" rel="noopener noreferrer">Lihat wilayah & ketentuan <span aria-hidden="true">→</span></Link></div>
    </section>
    {trace && <details className="rs-explain"><summary>Kenapa modul ini yang muncul?</summary><p>Nilai delapan bagian dihitung dari jawabanmu. Urutan modul mencocokkan bagian yang masih perlu dibereskan dengan penilaian tiga ahli. Angka prioritas bukan peluang sukses atau jaminan hasil.</p></details>}
  </>;
}
