import { instrument } from "@/lib/decision-engine";
import { fmt } from "@/lib/digital-checkup/format";

export function Bar({ value, max = 1, label, tone, digits = 0 }: { value: number; max?: number; label?: string; tone?: "mint" | "amber" | "coral"; digits?: number }) {
  const width = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <span className={`adm-bar${tone ? ` adm-bar-${tone}` : ""}`}>
    <span className="adm-bar-track" role="img" aria-label={label ?? `${fmt(value, digits)} dari ${fmt(max, digits)}`}><span className="adm-bar-fill" style={{ width: `${width}%` }} /></span>
    <span className="adm-bar-value">{label ?? fmt(value, digits)}</span>
  </span>;
}

// Delapan nilai bagian (0–100) dengan bilah; urutan C1–C8 mengikuti instrumen.
export function ScoreBars({ scores }: { scores: number[] | null }) {
  if (!scores || scores.length !== 8) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Nilai bagian muncul setelah 32 jawaban final tersimpan.</span></div>;
  return <div className="adm-score-list">
    {instrument.dimensions.map((dimension, index) => <div className="adm-score-row" key={dimension.code}>
      <span>{dimension.title}<small>{dimension.code}</small></span>
      <Bar value={scores[index]} max={100} tone={scores[index] >= 75 ? "mint" : scores[index] >= 50 ? undefined : scores[index] >= 25 ? "amber" : "coral"} />
    </div>)}
  </div>;
}
