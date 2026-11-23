// Foto bawaan untuk hero website. Semuanya aset lokal di /public (tanpa hotlink).
// Pemilik juga boleh memakai tautan https ke fotonya sendiri.
import type { SiteCategory } from "./categories";

export interface BundledImage {
  id: string;
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  categories: SiteCategory[];
}

export const BUNDLED_IMAGES: BundledImage[] = [
  { id: "roti", src: "/platform-v2/stories/aroma-bakery.webp", alt: "Pemilik toko roti tersenyum di depan rak roti", label: "Etalase roti", width: 960, height: 600, categories: ["kuliner"] },
  { id: "dapur", src: "/platform-v2/stories/dapur-karaeng.webp", alt: "Pemilik dapur rumahan di dapurnya", label: "Dapur rumahan", width: 960, height: 600, categories: ["kuliner"] },
  { id: "konten-kuliner", src: "/platform-v2/courses/promosi.webp", alt: "Pemilik usaha merekam video menu makanan", label: "Sajian siap difoto", width: 1200, height: 750, categories: ["kuliner", "pangan"] },
  { id: "kemasan", src: "/platform-v2/courses/kemasan.webp", alt: "Camilan dikemas ke dalam kantong", label: "Kemasan camilan", width: 1200, height: 750, categories: ["pangan", "kuliner", "toko"] },
  { id: "keripik", src: "/platform-v2/stories/rumah-keripik.webp", alt: "Pemilik usaha menunjukkan keripik dalam toples", label: "Olahan keripik", width: 960, height: 600, categories: ["pangan", "kuliner"] },
  { id: "butik", src: "/platform-v2/courses/growth.webp", alt: "Pemilik butik menata label harga pakaian", label: "Butik pakaian", width: 1200, height: 750, categories: ["fashion"] },
  { id: "packing", src: "/platform-v2/courses/marketplace.webp", alt: "Pakaian dikemas ke dalam kardus pesanan", label: "Kemas pesanan", width: 1200, height: 750, categories: ["fashion", "toko"] },
  { id: "etalase", src: "/platform-v2/courses/digitalisasi.webp", alt: "Pemilik toko mencatat stok di tablet", label: "Toko & stok", width: 1200, height: 750, categories: ["toko"] },
  { id: "pesanan", src: "/platform-v2/access/action.webp", alt: "Pemilik usaha membalas pesanan lewat ponsel", label: "Balas pesanan", width: 800, height: 1000, categories: ["toko", "pangan"] },
  { id: "studio", src: "/platform-v2/courses/branding.webp", alt: "Perajin menata contoh warna dan kemasan di meja kerja", label: "Meja studio", width: 1200, height: 750, categories: ["kreatif"] },
  { id: "perajin", src: "/platform-v2/stories/bakpia-malino.webp", alt: "Perajin senior di ruang kerjanya", label: "Tangan perajin", width: 960, height: 600, categories: ["kreatif"] },
  { id: "herbal", src: "/platform-v2/stories/bio-atama.webp", alt: "Peracik herbal memegang daun segar", label: "Racikan herbal", width: 960, height: 600, categories: ["kecantikan"] },
  { id: "minyak", src: "/platform-v2/stories/eyfa-natural-oil.webp", alt: "Peracik produk perawatan memeriksa botol kaca", label: "Produk perawatan", width: 960, height: 600, categories: ["kecantikan"] },
  { id: "konsultan", src: "/platform-v2/courses/keuangan.webp", alt: "Konsultan mencatat di buku kerja", label: "Meja konsultan", width: 1200, height: 750, categories: ["jasa"] },
  { id: "dokumen", src: "/platform-v2/courses/legalitas.webp", alt: "Profesional merapikan dokumen klien", label: "Berkas klien", width: 1200, height: 750, categories: ["jasa"] },
  { id: "kelas", src: "/platform-v2/stories/sikola-indonesia.webp", alt: "Pengajar menyiapkan materi di depan papan tulis", label: "Ruang kelas", width: 960, height: 600, categories: ["pendidikan"] },
  { id: "belajar", src: "/platform-v2/access/course.webp", alt: "Peserta belajar mencatat di samping tablet", label: "Belajar mandiri", width: 800, height: 1000, categories: ["pendidikan", "jasa"] },
];

export const bundledImage = (id: string) => BUNDLED_IMAGES.find((item) => item.id === id) ?? null;

export type HeroImage = { kind: "bundled"; image: BundledImage } | { kind: "url"; src: string; alt: string } | null;

/** heroImage di konten: id foto bawaan, tautan https, atau kosong. */
export function resolveHero(value: string, businessName: string): HeroImage {
  if (!value) return null;
  const image = bundledImage(value);
  if (image) return { kind: "bundled", image };
  return /^https:\/\//.test(value) ? { kind: "url", src: value, alt: `Foto ${businessName}` } : null;
}

/** URL absolut/relatif untuk metadata (Open Graph) dan JSON-LD. */
export function heroUrl(value: string) {
  const image = bundledImage(value);
  if (image) return image.src;
  return /^https:\/\//.test(value) ? value : null;
}
