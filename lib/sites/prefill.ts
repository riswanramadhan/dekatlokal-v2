// Isian awal website dari jawaban Digital Checkup. Murni (tanpa I/O).
import { categoryFromSector, isCategory, type SiteCategory } from "./categories";
import { SAMPLE_CONTENT } from "./samples";
import { coerceContent, slugify, type SiteContent } from "./schema";
import { templateMeta, templateForCategory, type TemplateCode } from "./templates";

export interface ProfileLike {
  businessName?: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  googleMaps?: string;
  sector?: string;
  district?: string;
}

const TAGLINES: Record<SiteCategory, (city: string) => string> = {
  kuliner: (city) => `Masakan dan minuman pilihan${city ? ` di ${city}` : ""}. Pesan mudah lewat WhatsApp.`,
  fashion: (city) => `Koleksi busana dan aksesori pilihan${city ? ` dari ${city}` : ""}.`,
  toko: (city) => `Kebutuhan harian lengkap${city ? ` di ${city}` : ""}, pesan lewat WhatsApp.`,
  jasa: (city) => `Layanan profesional${city ? ` di ${city}` : ""} yang jelas dan bisa diandalkan.`,
  kecantikan: (city) => `Produk dan perawatan kecantikan pilihan${city ? ` di ${city}` : ""}.`,
  kreatif: (city) => `Karya buatan tangan${city ? ` dari ${city}` : ""}.`,
  pangan: (city) => `Hasil bumi dan olahan pangan${city ? ` dari ${city}` : ""}.`,
  pendidikan: (city) => `Kelas dan kursus${city ? ` di ${city}` : ""} dengan suasana belajar yang nyaman.`,
};

/** "Kota Makassar, Sulawesi Selatan" → "Makassar"; "Kabupaten Gowa, …" → "Gowa". */
export function cityFromDistrict(district: string | undefined) {
  const first = (district ?? "").split(",")[0]?.trim() ?? "";
  return first.replace(/^(kota|kabupaten|kab\.)\s+/i, "").slice(0, 80);
}

/**
 * Konten awal untuk website baru. Data kontak diambil dari Checkup; produk & keunggulan memakai contoh kategori
 * (ditandai sebagai contoh di builder). Testimoni & FAQ sengaja kosong supaya tidak ada ulasan karangan yang ikut tayang.
 */
export function prefillContent(profile: ProfileLike | null | undefined, options: { category?: string | null; template?: TemplateCode | null } = {}): { content: SiteContent; template: TemplateCode; slug: string } {
  const category: SiteCategory = isCategory(options.category) ? options.category : categoryFromSector(profile?.sector);
  const template = options.template ?? templateForCategory(category);
  const sample = SAMPLE_CONTENT[category];
  const city = cityFromDistrict(profile?.district);
  const rawName = (profile?.businessName ?? "").trim().slice(0, 80);
  const businessName = rawName.length >= 2 ? rawName : "Nama Usahamu";
  const content = coerceContent({
    ...structuredClone(sample),
    businessName,
    tagline: TAGLINES[category](city),
    about: "",
    category,
    city,
    whatsapp: profile?.whatsapp ?? "",
    instagram: profile?.instagram ?? "",
    tiktok: profile?.tiktok ?? "",
    googleMaps: profile?.googleMaps ?? "",
    address: (profile?.district ?? "").slice(0, 240),
    hours: [],
    palette: templateMeta(template).defaultPalette,
    testimonials: [],
    faq: [],
  }, category);
  return { content, template, slug: slugify(businessName) };
}
