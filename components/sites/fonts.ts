// Font template website: dua keluarga sans buatan desainer Indonesia.
// - Plus Jakarta Sans — Tokotype (Gumpita Rahayu), dibuat untuk identitas kota Jakarta.
// - Gantari — Lafontype (Indonesia), geometris yang hangat.
// Karakter tiap template dibedakan lewat peran (judul/isi), ketebalan, dan spasi huruf di CSS-nya,
// bukan dengan menumpuk banyak keluarga font. preload: false → hanya diunduh saat template tampil.
import { Gantari, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-jakarta", style: ["normal", "italic"] });
const gantari = Gantari({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-gantari", style: ["normal", "italic"] });

const BOTH = `${jakarta.variable} ${gantari.variable}`;

export const TEMPLATE_FONTS = {
  warung: BOTH,
  etalase: BOTH,
  studio: BOTH,
  pasar: BOTH,
  kriya: BOTH,
  kelas: BOTH,
  senja: BOTH,
  teduh: BOTH,
} as const;

/** Nama font untuk galeri (dipakai TEMPLATES.fonts). */
export const FONT_NAMES = { jakarta: "Plus Jakarta Sans", gantari: "Gantari" } as const;
