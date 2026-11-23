// Kategori template website. Murni (tanpa I/O) — aman diimpor di client, server, dan test.
import { businessSectors } from "@/lib/digital-checkup/contact";

export const SITE_CATEGORIES = [
  { id: "kuliner", label: "Kuliner", short: "Kuliner", description: "Warung, kafe, katering, kue, dan minuman." },
  { id: "fashion", label: "Fashion", short: "Fashion", description: "Butik, hijab, sepatu, tas, dan aksesori." },
  { id: "toko", label: "Toko & Retail", short: "Toko", description: "Toko kelontong, grosir, oleh-oleh, dan barang harian." },
  { id: "jasa", label: "Jasa Profesional", short: "Jasa", description: "Konsultan, servis, laundry, travel, dan jasa digital." },
  { id: "kecantikan", label: "Kecantikan & Kesehatan", short: "Kecantikan", description: "Salon, skincare, herbal, pijat, dan perawatan." },
  { id: "kreatif", label: "Kreatif & Kerajinan", short: "Kreatif", description: "Kerajinan tangan, souvenir, dekorasi, dan studio." },
  { id: "pangan", label: "Pertanian & Pangan", short: "Pangan", description: "Hasil kebun, ternak, ikan, dan olahan pangan." },
  { id: "pendidikan", label: "Pendidikan & Kursus", short: "Kursus", description: "Bimbel, kursus, pelatihan, dan kelas privat." },
] as const;

export type SiteCategory = (typeof SITE_CATEGORIES)[number]["id"];
export const CATEGORY_IDS = SITE_CATEGORIES.map((item) => item.id) as [SiteCategory, ...SiteCategory[]];
export const DEFAULT_CATEGORY: SiteCategory = "toko";

/** Sektor usaha di Digital Checkup → kategori template. Sektor yang tidak pas memakai default yang aman. */
const SECTOR_TO_CATEGORY: Record<string, SiteCategory> = {
  "Makanan & minuman": "kuliner",
  "Fashion & aksesori": "fashion",
  "Toko & perdagangan": "toko",
  "Jasa profesional": "jasa",
  "Kecantikan & kesehatan": "kecantikan",
  "Kerajinan & produk kreatif": "kreatif",
  "Pertanian, peternakan & perikanan": "pangan",
  "Penginapan & wisata": "jasa",
  "Otomotif & transportasi": "jasa",
  "Pendidikan & kursus": "pendidikan",
  "Teknologi & jasa digital": "jasa",
  Lainnya: "toko",
};

export function categoryFromSector(sector: string | null | undefined): SiteCategory {
  return (sector && SECTOR_TO_CATEGORY[sector.trim()]) || DEFAULT_CATEGORY;
}

export const isCategory = (value: unknown): value is SiteCategory => typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
export const categoryLabel = (id: string) => SITE_CATEGORIES.find((item) => item.id === id)?.label ?? "Usaha lokal";

/** Untuk test: semua sektor Checkup punya kategori. */
export const mappedSectors = () => businessSectors.map((sector) => [sector, categoryFromSector(sector)] as const);
