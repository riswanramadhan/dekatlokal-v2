"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BarChart3, Check, ScanLine } from "lucide-react";
import { conditionScores, instrument, type Answers } from "@/lib/decision-engine";

function dimensionInsight(score: number, title: string) {
  if (score >= 75) return `${title} sudah jadi modal kuat. Pertahankan kebiasaan yang berjalan dan simpan buktinya.`;
  if (score >= 50) return `${title} sudah punya dasar. Rapikan bagian yang belum konsisten supaya hasilnya lebih terasa.`;
  if (score >= 25) return `${title} mulai terbentuk. Pilih satu langkah kecil yang paling mudah kamu jalankan minggu ini.`;
  return `${title} masih perlu dibangun dari dasar. Tenang, hasil akhir akan memilihkan modul untuk mulai pelan-pelan.`;
}

export function DimensionAnalysis({ answers, onComplete }: { answers: Answers; onComplete: () => void }) {
  const scores = useMemo(() => conditionScores(answers), [answers]);
  const [active, setActive] = useState(0);
  const dimension = instrument.dimensions[active];
  const score = Math.round(scores[active] ?? 0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (active === instrument.dimensions.length - 1) onComplete();
      else setActive((value) => value + 1);
    }, reduced ? 320 : 1450);
    return () => window.clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <section className="ck-card ck-analysis" aria-labelledby="dc-analysis-title" aria-live="polite">
      <div className="ck-analysis-icon" aria-hidden="true"><ScanLine size={30} /></div>
      <p className="eyebrow">Analisis {active + 1} dari {instrument.dimensions.length}</p>
      <h1 id="dc-analysis-title">{dimension.internalTitle}</h1>
      <p className="ck-muted">{dimension.definition}</p>
      <div className="ck-analysis-score">
        <span><BarChart3 size={18} aria-hidden="true" style={{ display: "inline", verticalAlign: "-3px" }} /> Kondisi saat ini</span>
        <strong>{score}%</strong>
      </div>
      <div className="ck-analysis-meter" role="progressbar" aria-label={`Analisis ${dimension.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
        <span key={dimension.code} style={{ "--value": `${score}%` } as CSSProperties} />
      </div>
      <div className="ck-analysis-insight"><Check size={18} aria-hidden="true" /><p>{dimensionInsight(score, dimension.title)}</p></div>
      <div className="ck-dots" aria-hidden="true" style={{ marginTop: 18 }}>{instrument.dimensions.map((item, index) => <span className={index < active ? "is-done" : index === active ? "is-active" : ""} key={item.code} />)}</div>
      <button className="text-button" style={{ marginTop: 18 }} type="button" onClick={onComplete}>Lihat tinjauan jawaban <ArrowRight size={15} /></button>
    </section>
  );
}
