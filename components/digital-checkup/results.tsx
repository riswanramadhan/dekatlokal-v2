import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, BookOpen, CheckCircle2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { instrument } from "@/lib/decision-engine";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
import { coursePreview, resultInsight } from "@/lib/digital-checkup/result-insight";
import { moduleVisualForCode } from "@/lib/digital-checkup/module-catalog";

const messages = {
  NO_IDENTIFIED_GAP: "Jawabanmu terlihat sudah sangat kuat di semua bagian. Pilih modul yang paling dekat dengan target 30 harimu atau cek ulang bersama pendamping.",
  UNCOVERED_DIMENSION: "Ada kebutuhan yang belum cocok dengan daftar modul saat ini. Tim pendamping perlu meninjaunya lebih dulu.",
  ALTERNATIVES_NOT_DISTINGUISHABLE: "Kebutuhanmu cukup merata, jadi belum ada satu modul yang paling menonjol. Kamu tetap bisa memilih dari tujuh modul gratis.",
};

export function Results({ assessment }: { assessment: PublicAssessment }) {
  const scores = assessment.scores ?? Array(8).fill(0);
  const insight = resultInsight(scores, assessment.payload.profile);
  const trace = assessment.run?.trace;
  const top = trace?.ranking.filter((item) => item.rank <= 3) ?? [];

  return <>
    <section className="dc-result-hero">
      <div><p className="dc-eyebrow">{assessment.payload.profile.businessName || "Usahamu"} · Checkup selesai</p><h1>Ini cerita usahamu hari ini.</h1><p>{insight.overview}</p></div>
      <CheckCircle2 size={46} strokeWidth={1.4} aria-hidden="true" />
    </section>
    <div className="dc-insight-grid">
      <article><span><BadgeCheck size={19} />Yang sudah jadi modal</span><h2>{insight.strongest.title}</h2><strong>{insight.strongest.score}/100</strong><p>{insight.strongest.story}</p></article>
      <article><span><Target size={19} />Yang paling perlu dibereskan</span><h2>{insight.focus.title}</h2><strong>{insight.focus.score}/100</strong><p>{insight.focus.story}</p></article>
    </div>
    <details className="dc-review dc-score-review"><summary>Lihat nilai 8 bagian usaha</summary><div className="dc-score-list">{instrument.dimensions.map((dimension, index) => <div key={dimension.code}><div><span>{dimension.title}</span><strong>{scores[index]} / 100</strong></div><meter min={0} max={100} value={scores[index] ?? 0} aria-label={dimension.title} /><small>{dimension.definition}</small></div>)}</div></details>

    {!trace ? <div className="dc-note dc-result-wait" role="status"><TrendingUp size={21} /><div><strong>Nilaimu sudah selesai dihitung.</strong><p>Tiga rekomendasi modul sedang dirangkai dari penilaian ahli. Halaman ini akan memperbarui hasilnya otomatis.</p></div></div> : trace.status !== "RANKED" ? <p className="dc-note" role="status">{messages[trace.status]}</p> : <>
      <div className="dc-result-section-heading"><span className="dc-eyebrow">Jalur belajar personal</span><h2>Mulai dari 3 modul ini.</h2><p>Urutannya mengikuti kebutuhan usahamu dan penilaian tiga ahli. Satu modul dulu juga nggak apa-apa.</p></div>
      {trace.topSet.length > 1 && <p className="dc-note">Ada {trace.topSet.length} modul dengan prioritas teratas yang sama. Kamu bisa mulai dari yang paling mudah dipraktikkan minggu ini.</p>}
      <div className="dc-recommendations">{top.map((item) => {
        const intervention = instrument.modules.find((module) => module.code === item.code)!;
        const reasons = assessment.run?.reasons[item.code] ?? [];
        const course = coursePreview(item.code);
        const visual = moduleVisualForCode(item.code);
        return <article key={item.code}>
          <div className="dc-module-image"><Image alt={visual.imageAlt} fill sizes="(max-width: 800px) 88vw, 28vw" src={visual.image} unoptimized /><span className="dc-badge">Prioritas {item.rank}</span></div>
          <div className="dc-module-content"><div className="dc-module-rank"><span>Modul DekatLokal</span><span>{visual.category}</span></div>
            <h3>{course?.title ?? intervention.name}</h3>
            <p>{course?.tagline ?? intervention.scope}</p>
            <div className="dc-module-why"><Lightbulb size={17} aria-hidden="true" /><p>{reasons.length ? `Modul ini bantu kamu merapikan ${reasons.map((reason) => reason.toLowerCase()).join(" dan ")}.` : "Modul ini dipilih dari gabungan kondisi usahamu dan penilaian ahli."}</p></div>
            <strong>Yang akan kamu buat</strong><p>{course?.outcome ?? intervention.output}</p>
            <small><BookOpen size={14} aria-hidden="true" /> {course?.lessons.length ?? 3} materi · latihan · kuis · {visual.duration}</small>
          </div>
        </article>;
      })}</div>
      <details className="dc-review"><summary>Lihat urutan 7 modul</summary><ol>{trace.ranking.map((item) => <li key={item.code}>Prioritas {item.rank} · {coursePreview(item.code)?.title ?? instrument.modules.find((module) => module.code === item.code)?.name}</li>)}</ol></details>
    </>}

    <section className={`dc-website-status is-${insight.website.state}`}>
      <span className="dc-website-mark"><BookOpen size={23} aria-hidden="true" /></span>
      <div><span className="dc-eyebrow">Peluang website gratis</span><h2>{insight.website.title}</h2><p>{insight.website.description}</p><Link href="https://www.dekatlokal.com/digital-checkup" target="_blank" rel="noopener noreferrer">Lihat wilayah & ketentuan <span aria-hidden="true">→</span></Link></div>
    </section>
    {trace && <details className="dc-review"><summary>Kenapa modul ini yang muncul?</summary><p>Nilai delapan bagian dihitung dari jawabanmu. Urutan modul mencocokkan bagian yang masih perlu dibereskan dengan penilaian tiga ahli. Angka prioritas bukan peluang sukses atau jaminan hasil.</p></details>}
  </>;
}
