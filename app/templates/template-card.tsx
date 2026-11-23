"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { paletteById, paletteOverride, type PaletteId } from "@/lib/sites/palettes";
import s from "./gallery.module.css";

/**
 * Kartu galeri dengan pilihan warna. Pratinjau dirender di server sekali saja; saat warna dipilih,
 * variabel --palette-* di pembungkusnya diganti sehingga template di dalamnya langsung berganti warna.
 * Warna terpilih ikut dibawa ke halaman contoh dan ke builder.
 */
export function TemplateCard({ code, name, category, palettes, thumb, children }: {
  code: string;
  name: string;
  category: string;
  palettes: readonly PaletteId[];
  thumb: ReactNode;
  children: ReactNode;
}) {
  const [palette, setPalette] = useState<PaletteId>(palettes[0]);
  const current = paletteById(palette);
  const preview = `/templates/${code}/preview?${new URLSearchParams({ kategori: category, warna: palette })}`;
  const build = `/dashboard/website/baru?${new URLSearchParams({ template: code, kategori: category, warna: palette })}`;

  return <li className={s.card}>
    <div className={s.thumbWrap} style={paletteOverride(palette)}>
      {thumb}
      {/* Tautan menimpa pratinjau (bukan membungkusnya) agar tidak ada <a> bersarang. */}
      <Link href={preview} className={s.thumbLink} aria-label={`Lihat contoh template ${name}, warna ${current.label}`} />
    </div>
    <div className={s.cardBody}>
      {children}
      <div className={s.colorRow}>
        <p className={s.colorLabel} id={`warna-${code}`}>Warna <strong>{current.label}</strong></p>
        <div className={s.swatches} role="radiogroup" aria-labelledby={`warna-${code}`}>
          {palettes.map((id) => {
            const item = paletteById(id);
            return <label key={id} className={s.swatch} title={item.label}>
              <input type="radio" name={`warna-${code}`} value={id} checked={palette === id} onChange={() => setPalette(id)} />
              <span className={s.swatchDot} style={{ background: `linear-gradient(135deg, ${item.bg} 0 50%, ${item.accent} 50% 100%)` }} aria-hidden="true" />
              <span className={s.srOnly}>{item.label}</span>
            </label>;
          })}
        </div>
      </div>
      <div className={s.cardActions}>
        <Link className={s.primary} href={build}>Pakai template ini <ArrowRight size={16} aria-hidden="true" /></Link>
        <Link className={s.secondary} href={preview}><Eye size={16} aria-hidden="true" /> Lihat contoh</Link>
      </div>
    </div>
  </li>;
}
