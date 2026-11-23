// Skema isi website + aturan alamat (slug). Murni: dipakai form (client), API (server), dan test.
import { z } from "zod";
import { CATEGORY_IDS, type SiteCategory } from "./categories";
import { PALETTE_IDS } from "./palettes";
import { bundledImage } from "./images";

export const MAX_SITES_PER_OWNER = 3;
export const LIMITS = { products: 12, services: 6, testimonials: 3, faq: 5, hours: 4, extraKnowledge: 3000, welcome: 300, chatMessage: 600 } as const;

const text = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`);
const MAPS_HOSTS = ["maps.app.goo.gl", "goo.gl", "maps.google.com", "www.google.com", "google.com", "maps.google.co.id", "www.google.co.id", "google.co.id"];

/** Normalisasi nomor WhatsApp Indonesia ke format 62xxxxxxxxxx. null bila tidak valid. */
export function waNumber(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("62") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^8\d{7,11}$/.test(local) ? `62${local}` : null;
}

export function waLink(raw: string | null | undefined, message = "") {
  const number = waNumber(raw);
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const formatPrice = (price: number | null) => (price === null ? "Tanya harga" : `Rp${price.toLocaleString("id-ID")}`);

const handle = text(64).refine((value) => !value || /^@?[a-zA-Z0-9._]{1,64}$/.test(value), "Isi nama pengguna saja, misalnya @namausaha.").transform((value) => value.replace(/^@/, ""));
const mapsLink = text(500).refine((value) => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === "https:" && MAPS_HOSTS.includes(url.hostname); } catch { return false; }
}, "Gunakan tautan HTTPS Google Maps dari tombol Bagikan.");
const heroImage = text(500).refine((value) => {
  if (!value || bundledImage(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname.includes(".") && !/^(localhost|127\.|10\.|192\.168\.)/.test(url.hostname); } catch { return false; }
}, "Pilih foto bawaan atau tempel tautan foto yang diawali https://.");

export const productSchema = z.object({
  name: text(80).min(1, "Isi nama produk."),
  price: z.number({ error: "Isi harga dengan angka." }).int("Pakai angka bulat.").min(0, "Harga tidak boleh negatif.").max(100_000_000, "Cek lagi harganya.").nullable(),
  description: text(200).default(""),
});
export const serviceSchema = z.object({ title: text(60).min(1, "Isi judul keunggulan."), description: text(200).default("") });
export const testimonialSchema = z.object({ name: text(60).min(1, "Isi nama pelanggan."), quote: text(280).min(1, "Isi testimoni."), role: text(60).default("") });
export const faqSchema = z.object({ question: text(150).min(1, "Isi pertanyaan."), answer: text(500).min(1, "Isi jawaban.") });
export const hoursSchema = z.object({ days: text(40).min(1, "Isi hari."), time: text(40).min(1, "Isi jam.") });

export const siteContentSchema = z.object({
  businessName: text(80).min(2, "Isi nama usaha (minimal 2 huruf)."),
  tagline: text(120).default(""),
  about: text(1200).default(""),
  category: z.enum(CATEGORY_IDS),
  city: text(80).default(""),
  whatsapp: text(25).refine((value) => !value || waNumber(value) !== null, "Masukkan nomor WhatsApp aktif, misalnya 081234567890.").default(""),
  instagram: handle.default(""),
  tiktok: handle.default(""),
  googleMaps: mapsLink.default(""),
  address: text(240).default(""),
  hours: z.array(hoursSchema).max(LIMITS.hours, `Maksimal ${LIMITS.hours} baris jam buka.`).default([]),
  palette: z.enum(PALETTE_IDS),
  heroImage: heroImage.default(""),
  products: z.array(productSchema).max(LIMITS.products, `Maksimal ${LIMITS.products} produk.`).default([]),
  services: z.array(serviceSchema).max(LIMITS.services, `Maksimal ${LIMITS.services} keunggulan.`).default([]),
  testimonials: z.array(testimonialSchema).max(LIMITS.testimonials, `Maksimal ${LIMITS.testimonials} testimoni.`).default([]),
  faq: z.array(faqSchema).max(LIMITS.faq, `Maksimal ${LIMITS.faq} pertanyaan.`).default([]),
  cta: text(40).default(""),
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export type SiteContentInput = z.input<typeof siteContentSchema>;
export type Product = SiteContent["products"][number];

/** Syarat tambahan sebelum website boleh tayang (draf boleh belum lengkap). */
export function publishIssues(content: SiteContent): string[] {
  const issues: string[] = [];
  if (!waNumber(content.whatsapp)) issues.push("Isi nomor WhatsApp supaya pelanggan bisa memesan.");
  if (!content.tagline.trim()) issues.push("Isi kalimat singkat (tagline) tentang usahamu.");
  if (!content.products.length && !content.services.length) issues.push("Tambahkan minimal satu produk atau keunggulan.");
  return issues;
}

export const siteAiSchema = z.object({
  enabled: z.boolean().default(true),
  welcome: text(LIMITS.welcome).default(""),
  extraKnowledge: text(LIMITS.extraKnowledge).default(""),
});
export type SiteAi = z.infer<typeof siteAiSchema>;
export const DEFAULT_AI: SiteAi = { enabled: true, welcome: "", extraKnowledge: "" };

/** Baca isi website dari DB dengan toleran: bidang yang rusak/kedaluwarsa diganti nilai bawaan, bukan error. */
export function coerceContent(raw: unknown, fallbackCategory: SiteCategory = "toko"): SiteContent {
  const parsed = siteContentSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const shape = siteContentSchema.shape;
  const base: Record<string, unknown> = { businessName: "Usaha Lokal", category: fallbackCategory, palette: PALETTE_IDS[0] };
  for (const key of Object.keys(shape) as (keyof typeof shape)[]) {
    const field = shape[key].safeParse(source[key]);
    if (field.success && field.data !== undefined) base[key] = field.data;
  }
  return siteContentSchema.parse(base);
}
export const coerceAi = (raw: unknown): SiteAi => siteAiSchema.safeParse(raw).data ?? DEFAULT_AI;

// ─── Alamat website (/situs/[slug]) ────────────────────────────────────────
export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
export const RESERVED_SLUGS = new Set(["admin", "api", "app", "dashboard", "dekatlokal", "dekat-lokal", "digitalcheckup", "digital-checkup", "masuk", "daftar", "login", "logout", "situs", "templates", "template", "www", "mail", "bantuan", "help", "support", "contoh", "demo", "test", "official", "resmi", "pembayaran", "checkout"]);

export function slugIssue(slug: string): string | null {
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) return `Alamat ${SLUG_MIN}–${SLUG_MAX} karakter.`;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) return "Pakai huruf kecil, angka, dan tanda minus (tidak di awal/akhir).";
  if (slug.includes("--")) return "Jangan pakai dua tanda minus berurutan.";
  if (RESERVED_SLUGS.has(slug)) return "Alamat ini dipakai sistem. Coba yang lain.";
  return null;
}
export const isValidSlug = (slug: string) => slugIssue(slug) === null;
export const slugSchema = z.string().trim().toLowerCase().superRefine((value, ctx) => { const issue = slugIssue(value); if (issue) ctx.addIssue({ code: "custom", message: issue }); });

/** Nama usaha → alamat. "Kopi Ña'Senja & Co." → "kopi-na-senja-co". */
export function slugify(name: string): string {
  let slug = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " dan ").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (slug.length > SLUG_MAX) slug = slug.slice(0, SLUG_MAX).replace(/-[^-]*$/, "") || slug.slice(0, SLUG_MAX);
  slug = slug.replace(/-+$/g, "");
  if (slug.length < SLUG_MIN) slug = `${slug || "usaha"}-lokal`.replace(/^-/, "");
  if (RESERVED_SLUGS.has(slug)) slug = `${slug}-umkm`;
  return slug;
}

/** Kandidat alamat bila yang utama sudah dipakai: nama, nama-kota, nama-2 … */
export function slugCandidates(name: string, city = ""): string[] {
  const base = slugify(name);
  const withCity = city ? slugify(`${name} ${city}`) : "";
  const numbered = [2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${base.slice(0, SLUG_MAX - 2)}-${n}`);
  return [...new Set([base, withCity, ...numbered].filter((item) => item && isValidSlug(item)))];
}
