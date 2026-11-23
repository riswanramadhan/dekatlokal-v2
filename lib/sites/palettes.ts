// Palet warna website. Setiap template membaca variabel CSS --c-*, jadi palet bisa ditukar tanpa mengubah layout.
// Kontras ink/bg, muted/bg, dan accentInk/accent dijaga >= 4.5:1 (lihat tests/sites.test.ts).

export interface Palette {
  id: string;
  label: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  line: string;
  soft: string;
}

export const PALETTES = [
  { id: "terakota", label: "Terakota", bg: "#f7f1e8", surface: "#fffaf3", ink: "#2a1d14", muted: "#6b5646", accent: "#a8481f", accentInk: "#ffffff", line: "#e5d6c2", soft: "#efe1cc" },
  { id: "hutan", label: "Hutan", bg: "#f1f4ee", surface: "#ffffff", ink: "#15241a", muted: "#506155", accent: "#2d6a3e", accentInk: "#ffffff", line: "#d6e0d2", soft: "#e2ebdd" },
  { id: "tinta", label: "Tinta", bg: "#f5f5f1", surface: "#ffffff", ink: "#121212", muted: "#57574f", accent: "#121212", accentInk: "#ffffff", line: "#e1e1d9", soft: "#eaeae3" },
  { id: "laut", label: "Laut", bg: "#f0f4f8", surface: "#ffffff", ink: "#0e2233", muted: "#4a5e70", accent: "#0b5a84", accentInk: "#ffffff", line: "#d4dfe9", soft: "#e0eaf3" },
  { id: "mawar", label: "Mawar", bg: "#fbf3f1", surface: "#fffaf8", ink: "#391e23", muted: "#755359", accent: "#a8344e", accentInk: "#ffffff", line: "#eedad6", soft: "#f5e3df" },
  { id: "kunyit", label: "Kunyit", bg: "#fbf6e8", surface: "#fffdf5", ink: "#211f18", muted: "#625b48", accent: "#f0b400", accentInk: "#1d1a10", line: "#ece3c6", soft: "#f6ecc9" },
  { id: "malam", label: "Malam", bg: "#141311", surface: "#1d1c19", ink: "#f4efe5", muted: "#b5ad9e", accent: "#e8b64a", accentInk: "#141311", line: "#33312c", soft: "#26241f" },
  { id: "zaitun", label: "Zaitun", bg: "#f3f1e8", surface: "#fffef9", ink: "#22241a", muted: "#5b5d4b", accent: "#55652b", accentInk: "#ffffff", line: "#dedac9", soft: "#e8e5d4" },
  { id: "biru", label: "Biru DekatLokal", bg: "#f4f8ff", surface: "#ffffff", ink: "#10223d", muted: "#4f607a", accent: "#0255f5", accentInk: "#ffffff", line: "#dbe6f7", soft: "#e6efff" },
] as const satisfies readonly Palette[];

export type PaletteId = (typeof PALETTES)[number]["id"];
export const PALETTE_IDS = PALETTES.map((item) => item.id) as [PaletteId, ...PaletteId[]];
export const paletteById = (id: string): Palette => PALETTES.find((item) => item.id === id) ?? PALETTES[0];

const PALETTE_KEYS = [["bg", "bg"], ["surface", "surface"], ["ink", "ink"], ["muted", "muted"], ["accent", "accent"], ["accent-ink", "accentInk"], ["line", "line"], ["soft", "soft"]] as const;

/**
 * Variabel CSS untuk elemen akar template. Setiap nilai bisa ditimpa dari elemen induk lewat
 * --palette-* (lihat paletteOverride), sehingga galeri bisa menukar warna pratinjau tanpa render ulang.
 */
export function paletteStyle(id: string): Record<string, string> {
  const p = paletteById(id);
  return Object.fromEntries(PALETTE_KEYS.map(([name, key]) => [`--c-${name}`, `var(--palette-${name}, ${p[key]})`]));
}

/** Variabel --palette-* untuk dipasang di pembungkus pratinjau agar template di dalamnya berganti warna. */
export function paletteOverride(id: string): Record<string, string> {
  const p = paletteById(id);
  return Object.fromEntries(PALETTE_KEYS.map(([name, key]) => [`--palette-${name}`, p[key]]));
}

export const isPaletteId = (value: unknown): value is PaletteId => typeof value === "string" && (PALETTE_IDS as readonly string[]).includes(value);

// ─── Kontras WCAG (dipakai test) ───────────────────────────────────────────
function luminance(hex: string) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
