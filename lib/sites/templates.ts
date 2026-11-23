// Daftar template (metadata saja, tanpa React) — dipakai galeri, builder, API, dan test.
import type { SiteCategory } from "./categories";
import type { PaletteId } from "./palettes";

export interface TemplateMeta {
  code: string;
  name: string;
  summary: string;
  /** Kategori yang paling cocok (urutan = prioritas). */
  bestFor: SiteCategory[];
  defaultPalette: PaletteId;
  fonts: string;
  layout: string;
}

export const TEMPLATES = [
  { code: "warung", name: "Warung", summary: "Hangat dan menggugah selera. Daftar menu bergaya papan menu, cocok untuk warung, kafe, dan kue rumahan.", bestFor: ["kuliner", "pangan"], defaultPalette: "terakota", fonts: "Fraunces + Figtree", layout: "Hero terbelah, papan menu dua kolom, kartu lokasi" },
  { code: "etalase", name: "Etalase", summary: "Tegas seperti etalase butik. Foto besar dan katalog produk berkisi untuk fashion dan toko.", bestFor: ["fashion", "toko"], defaultPalette: "tinta", fonts: "Archivo Expanded + Manrope", layout: "Hero foto penuh, katalog berkisi, info toko" },
  { code: "studio", name: "Studio", summary: "Rapi dan meyakinkan. Layanan bernomor dan tabel paket harga untuk jasa profesional.", bestFor: ["jasa"], defaultPalette: "laut", fonts: "Instrument Serif + Instrument Sans", layout: "Hero teks besar, layanan bernomor, tabel paket" },
  { code: "pasar", name: "Pasar", summary: "Berani seperti poster pasar. Harga besar dan kartu produk tebal untuk hasil kebun dan olahan pangan.", bestFor: ["pangan", "toko", "kuliner"], defaultPalette: "hutan", fonts: "Bricolage Grotesque + DM Sans", layout: "Hero blok warna, kartu harga besar, cerita usaha" },
  { code: "kriya", name: "Kriya", summary: "Lembut dan elegan seperti galeri. Koleksi bernomor untuk kerajinan, kecantikan, dan produk perawatan.", bestFor: ["kreatif", "kecantikan"], defaultPalette: "mawar", fonts: "Cormorant Garamond + Karla", layout: "Hero tengah berbingkai, koleksi bernomor, kutipan besar" },
  { code: "kelas", name: "Kelas", summary: "Jelas dan ramah. Kartu program, alasan memilih, dan FAQ menonjol untuk kursus dan bimbel.", bestFor: ["pendidikan", "jasa"], defaultPalette: "biru", fonts: "Lexend", layout: "Hero checklist, kartu program, FAQ menonjol" },
] as const satisfies readonly TemplateMeta[];

export type TemplateInfo = (typeof TEMPLATES)[number];
export type TemplateCode = TemplateInfo["code"];
export const TEMPLATE_CODES = TEMPLATES.map((item) => item.code) as [TemplateCode, ...TemplateCode[]];
export const isTemplateCode = (value: unknown): value is TemplateCode => typeof value === "string" && (TEMPLATE_CODES as readonly string[]).includes(value);
export const templateMeta = (code: string): TemplateMeta => TEMPLATES.find((item) => item.code === code) ?? TEMPLATES[0];

/** Template bawaan untuk kategori (dipakai saat pemilik belum memilih). */
export function templateForCategory(category: SiteCategory): TemplateCode {
  return (TEMPLATES.find((item) => (item.bestFor as readonly string[])[0] === category) ?? TEMPLATES.find((item) => (item.bestFor as readonly string[]).includes(category)) ?? TEMPLATES[0]).code;
}

/** Urutan galeri untuk kategori: yang paling cocok di depan, sisanya tetap tampil. */
export function templatesForCategory(category: SiteCategory | null) {
  if (!category) return [...TEMPLATES];
  const score = (item: TemplateMeta) => { const index = item.bestFor.indexOf(category); return index === -1 ? 99 : index; };
  return [...TEMPLATES].sort((a, b) => score(a) - score(b));
}
