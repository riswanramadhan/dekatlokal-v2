// Katalog produk berbayar DekatLokal. Aman diimpor di client (tanpa rahasia).
// Pembayaran manual: pengguna memesan -> konfirmasi via WhatsApp -> admin mengaktifkan.

export type Feature = "site_publish" | "ai_admin" | "checkup_pro" | "gbp" | "website_care";
export type ProductCode = "site_upgrade" | "ai_admin_monthly" | "checkup_pro" | "gbp_optimization" | "website_care_monthly";

export interface Product {
  code: ProductCode;
  feature: Feature;
  name: string;
  tagline: string;
  price: number;
  period: "once" | "month";
  /** Lama hak akses setelah diaktifkan admin; null = tanpa batas waktu. */
  days: number | null;
  bullets: string[];
  /** Butuh resource (mis. id website) saat memesan. */
  needsResource?: "site";
}

export const PRODUCTS: Product[] = [
  {
    code: "site_upgrade",
    feature: "site_publish",
    name: "Website UMKM Permanen",
    tagline: "Pertahankan website dari template, tanpa batas waktu.",
    price: 499_000,
    period: "once",
    days: null,
    bullets: ["Website tetap online setelah masa gratis 14 hari", "Bantuan pasang domain .com milikmu", "Bebas ubah isi kapan saja dari dashboard"],
    needsResource: "site",
  },
  {
    code: "ai_admin_monthly",
    feature: "ai_admin",
    name: "AI Admin UMKM",
    tagline: "Asisten chat 24 jam di websitemu, menjawab pakai info usahamu.",
    price: 99_000,
    period: "month",
    days: 30,
    bullets: ["Jawab pertanyaan harga, menu, jam buka otomatis", "Kotak masuk semua percakapan pelanggan", "Arahkan pelanggan serius ke WhatsApp-mu"],
    needsResource: "site",
  },
  {
    code: "checkup_pro",
    feature: "checkup_pro",
    name: "Checkup Pro",
    tagline: "Laporan lengkap + konsultasi 30 menit dengan tim DekatLokal.",
    price: 79_000,
    period: "once",
    days: null,
    bullets: ["Laporan PDF detail: skor 8 dimensi, gap, dan urutan prioritas modul", "Rencana aksi 30 hari per minggu yang bisa langsung dikerjakan", "Jadwal konsultasi online 30 menit sesuai waktu pilihanmu"],
  },
  {
    code: "gbp_optimization",
    feature: "gbp",
    name: "Optimasi Google Business Profile",
    tagline: "Rapikan profil Google Maps usahamu supaya lebih mudah ditemukan.",
    price: 149_000,
    period: "once",
    days: null,
    bullets: ["Audit & perbaikan nama, kategori, jam, dan deskripsi", "Penataan foto dan produk", "Panduan membalas ulasan pelanggan"],
  },
  {
    code: "website_care_monthly",
    feature: "website_care",
    name: "Website Care",
    tagline: "Website selalu aman, cepat, dan terbarui setiap bulan.",
    price: 79_000,
    period: "month",
    days: 30,
    bullets: ["Update konten hingga 3 kali per bulan", "Pemantauan website & backup", "Laporan kunjungan dan SEO bulanan"],
  },
];

/** Lama trial gratis per fitur (hari). Fitur lain tidak punya trial. */
export const TRIAL_DAYS: Partial<Record<Feature, number>> = { site_publish: 14, ai_admin: 7 };

export const productByCode = (code: string) => PRODUCTS.find((product) => product.code === code);
export const productForFeature = (feature: Feature) => PRODUCTS.find((product) => product.feature === feature);

export const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
export const priceLabel = (product: Product) => `${formatRupiah(product.price)}${product.period === "month" ? "/bulan" : ""}`;

export const ORDER_STATUS_LABEL: Record<string, string> = { pending: "Menunggu pembayaran", active: "Aktif", cancelled: "Dibatalkan" };
