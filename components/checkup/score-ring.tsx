"use client";
import { useEffect, useState } from "react";

const COLORS = ["#0255f5", "#19c37d", "#f5b82e", "#ff6b5a", "#7c5cff", "#0ea5e9"];

/** Lingkaran skor 0–100 yang terisi saat muncul. */
export function ScoreRing({ value, label = "/ 100", size = 150, color }: { value: number; label?: string; size?: number; color?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(value)); return () => cancelAnimationFrame(t); }, [value]);
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="ck-ring" style={{ width: size, height: size }} role="img" aria-label={`Nilai ${Math.round(value)} dari 100`}>
      <svg viewBox="0 0 100 100"><circle className="track" cx="50" cy="50" r={r} /><circle className="value" cx="50" cy="50" r={r} style={color ? { stroke: color } : undefined} strokeDasharray={c} strokeDashoffset={c - (c * Math.max(0, Math.min(100, shown))) / 100} /></svg>
      <strong>{Math.round(value)}<small>{label}</small></strong>
    </div>
  );
}

/** Confetti ringan berbasis CSS. */
export function Confetti({ count = 24 }: { count?: number }) {
  return (
    <div className="ck-confetti" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ left: `${(i * 97) % 100}%`, background: COLORS[i % COLORS.length], animationDelay: `${(i % 6) * 90}ms`, animationDuration: `${1.3 + (i % 4) * 0.25}s` }} />
      ))}
    </div>
  );
}
