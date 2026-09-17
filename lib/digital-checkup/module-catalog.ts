export type ModuleCategory = "Branding" | "Digitalisasi" | "Legalitas" | "Operasional" | "Pengembangan" | "Penjualan";

export type ModuleVisual = {
  access: "Gratis" | "Premium";
  category: ModuleCategory;
  duration: string;
  image: string;
  imageAlt: string;
  prerequisite?: string;
  reason?: string;
  recommended?: boolean;
};

const premiumPrerequisite = "Selesaikan tiga modul dasar.";

export const moduleVisualBySlug: Record<string, ModuleVisual> = {
  "digitalisasi-umkm": { access: "Gratis", category: "Digitalisasi", duration: "20-30 menit", image: "/platform-v2/courses/digitalisasi.webp", imageAlt: "Pelaku UMKM merapikan tampilan online usahanya", reason: "merapikan tampilan online usaha", recommended: true },
  "branding-umkm": { access: "Gratis", category: "Branding", duration: "25-35 menit", image: "/platform-v2/courses/branding.webp", imageAlt: "Proses menyusun identitas visual usaha lokal", reason: "membuat identitas lebih konsisten", recommended: true },
  "produk-dan-kemasan": { access: "Gratis", category: "Penjualan", duration: "25-35 menit", image: "/platform-v2/courses/kemasan.webp", imageAlt: "Pemilik UMKM menata kemasan produk", reason: "memperjelas informasi untuk pelanggan", recommended: true },
  "konsistensi-promosi": { access: "Gratis", category: "Penjualan", duration: "20-30 menit", image: "/platform-v2/courses/promosi.webp", imageAlt: "Pembuatan konten promosi produk UMKM" },
  "marketplace-dan-kanal-penjualan": { access: "Premium", category: "Penjualan", duration: "35-45 menit", image: "/platform-v2/courses/marketplace.webp", imageAlt: "Pemilik usaha mengelola pesanan dari tempat jualan", prerequisite: premiumPrerequisite },
  "operasional-dan-keuangan-dasar": { access: "Premium", category: "Operasional", duration: "35-45 menit", image: "/platform-v2/courses/keuangan.webp", imageAlt: "Pencatatan operasional dan keuangan usaha kecil", prerequisite: premiumPrerequisite },
  "legalitas-usaha": { access: "Premium", category: "Legalitas", duration: "30-40 menit", image: "/platform-v2/courses/legalitas.webp", imageAlt: "Dokumen legalitas usaha sedang disiapkan", prerequisite: premiumPrerequisite },
  "komitmen-dan-growth-mindset": { access: "Premium", category: "Pengembangan", duration: "30-40 menit", image: "/platform-v2/courses/growth.webp", imageAlt: "Pemilik UMKM menyusun rencana pertumbuhan", prerequisite: premiumPrerequisite },
};

export const fallbackModuleVisual: ModuleVisual = {
  access: "Gratis",
  category: "Digitalisasi",
  duration: "20-30 menit",
  image: "/platform-v2/courses/digitalisasi.webp",
  imageAlt: "Pelaku UMKM mengembangkan kemampuan digital",
};

const slugByDecisionCode: Record<string, string> = {
  A1: "digitalisasi-umkm",
  A2: "branding-umkm",
  A3: "legalitas-usaha",
  A4: "konsistensi-promosi",
  A5: "marketplace-dan-kanal-penjualan",
  A6: "operasional-dan-keuangan-dasar",
  A7: "komitmen-dan-growth-mindset",
};

export function moduleVisualForCode(code: string): ModuleVisual {
  return moduleVisualBySlug[slugByDecisionCode[code]] ?? fallbackModuleVisual;
}
