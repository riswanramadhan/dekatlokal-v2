import { siteConfig, siteRoutes } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export type CommercialIconName =
  | "website"
  | "checkup"
  | "custom"
  | "system"
  | "mobile"
  | "catalog"
  | "contact"
  | "search";

export interface CommercialNeedOption {
  title: string;
  audienceLabel: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: CommercialIconName;
  external?: boolean;
}

export interface CommercialFaqItem {
  question: string;
  answer: string;
}

export const WEBSITE_UMKM_SERVICE_PATH = siteRoutes.websiteUmkmService;

export const websiteConsultationMessage = [
  "Halo DekatLokal, saya ingin konsultasi layanan Website UMKM.",
  "Nama usaha:",
  "Jenis usaha:",
  "Kebutuhan utama:",
].join("\n");

export const customWebsiteConsultationMessage =
  "Halo DekatLokal, saya ingin konsultasi website custom untuk bisnis atau organisasi saya.";

export const digitalSystemConsultationMessage =
  "Halo DekatLokal, saya ingin konsultasi sistem digital untuk membantu proses operasional saya.";

export const generalServiceConsultationMessage = [
  "Halo DekatLokal, saya ingin berkonsultasi tentang solusi digital yang sesuai.",
  "Nama usaha/organisasi:",
  "Kebutuhan atau kendala utama:",
].join("\n");

export const commercialLinks = Object.freeze({
  services: siteRoutes.services,
  websiteService: WEBSITE_UMKM_SERVICE_PATH,
  websiteCustom: siteRoutes.websiteCustomService,
  digitalSystem: siteRoutes.digitalSystemService,
  digitalCheckup: siteRoutes.digitalCheckup,
  digitalCheckupApp: siteConfig.digitalCheckupUrl,
  portfolio: siteRoutes.websiteUmkm,
  websiteConsultation: buildWhatsAppUrl(websiteConsultationMessage),
  servicesConsultation: buildWhatsAppUrl(generalServiceConsultationMessage),
  customWebsiteConsultation: buildWhatsAppUrl(customWebsiteConsultationMessage),
  digitalSystemConsultation: buildWhatsAppUrl(digitalSystemConsultationMessage),
});

export const commercialNeedOptions: readonly CommercialNeedOption[] = [
  {
    title: "Website UMKM Cepat",
    audienceLabel: "Untuk UMKM lokal",
    description:
      "Profil usaha, katalog, WhatsApp, Maps, dan SEO dasar disusun dalam satu website yang siap dipakai pelanggan.",
    href: commercialLinks.websiteService,
    ctaLabel: "Lihat layanan",
    icon: "website",
  },
  {
    title: "Digital Checkup",
    audienceLabel: "Untuk usaha yang butuh arah",
    description:
      "Cek kesiapan digital secara gratis, dapatkan rekomendasi prioritas, dan buka peluang mengikuti program website gratis.",
    href: commercialLinks.digitalCheckupApp,
    ctaLabel: "Dapatkan web gratis",
    icon: "checkup",
    external: true,
  },
  {
    title: "Website Custom",
    audienceLabel: "Untuk personal dan bisnis",
    description:
      "Website CMS, multipage dinamis, admin panel, portofolio dinamis, dan fitur khusus yang dapat dikelola sesuai kebutuhan.",
    href: commercialLinks.websiteCustom,
    ctaLabel: "Pelajari layanan",
    icon: "custom",
  },
  {
    title: "Sistem Digital",
    audienceLabel: "Untuk tim yang ingin kerja rapi",
    description:
      "Bangun dashboard, booking, otomasi, atau sistem internal dengan coding dari nol sesuai proses dan goals bisnis.",
    href: commercialLinks.digitalSystem,
    ctaLabel: "Pelajari layanan",
    icon: "system",
  },
];

export const websiteServiceTargets = [
  {
    title: "UMKM yang butuh rumah digital",
    description:
      "Cocok untuk usaha produk maupun jasa yang ingin merangkum profil, penawaran, dan kontak dalam satu tautan.",
  },
  {
    title: "Usaha yang mengandalkan chat dan media sosial",
    description:
      "Website membantu pelanggan menemukan informasi penting tanpa harus menelusuri banyak unggahan atau percakapan.",
  },
  {
    title: "Brand lokal yang ingin tampil lebih jelas",
    description:
      "Susun katalog, cerita usaha, lokasi, dan jalur pemesanan dengan struktur yang mudah dipahami pelanggan.",
  },
] as const;

export const websiteServiceBenefits = [
  {
    title: "Satu tautan untuk informasi usaha",
    description: "Profil, produk atau layanan, lokasi, dan kontak tersusun dalam satu tempat.",
    icon: "website" as const,
  },
  {
    title: "Nyaman dibuka dari ponsel",
    description: "Tampilan disiapkan agar informasi utama tetap jelas pada layar mobile.",
    icon: "mobile" as const,
  },
  {
    title: "Produk lebih mudah dijelajahi",
    description: "Katalog membantu calon pelanggan memahami pilihan sebelum menghubungi usaha.",
    icon: "catalog" as const,
  },
  {
    title: "Jalur kontak lebih jelas",
    description: "Arahkan pengunjung ke WhatsApp, lokasi, atau kanal resmi yang relevan.",
    icon: "contact" as const,
  },
] as const;

export const websiteServiceProblems = [
  {
    title: "Pelanggan harus bertanya hal yang sama berulang kali",
    description:
      "Harga, katalog, lokasi, dan cara pesan masih tersebar di chat atau unggahan lama sehingga calon pelanggan mudah berhenti mencari.",
    icon: "contact" as const,
  },
  {
    title: "Media sosial ramai, tetapi informasi penting cepat tenggelam",
    description:
      "Usaha sudah aktif berbagi konten, namun pelanggan baru belum punya satu tempat untuk memahami bisnis secara utuh.",
    icon: "catalog" as const,
  },
  {
    title: "Bisnis terlihat kurang siap ketika dicari online",
    description:
      "Tanpa profil digital yang rapi, kepercayaan dan kesempatan ditemukan lewat pencarian lokal bisa ikut berkurang.",
    icon: "search" as const,
  },
  {
    title: "Pemilik usaha belum punya waktu mengurus teknis",
    description:
      "Solusi cepat membantu energi pemilik usaha tetap fokus ke produk, pelanggan, dan penjualan.",
    icon: "mobile" as const,
  },
] as const;

export const websiteServiceFeatures = [
  "Tampilan responsif untuk mobile dan desktop",
  "Profil serta cerita singkat usaha",
  "Katalog produk atau layanan sesuai kebutuhan",
  "AI Assistant chatbot 24 jam untuk menjawab pertanyaan pelanggan di website",
  "Tombol WhatsApp dan informasi kontak",
  "Lokasi atau peta bila relevan",
  "Struktur SEO dasar pada halaman publik",
] as const;

export const commercialProcessSteps = [
  {
    title: "Ceritakan kebutuhan",
    description:
      "Sampaikan profil usaha, tujuan website, dan informasi yang sudah tersedia melalui konsultasi singkat.",
  },
  {
    title: "Sepakati cakupan dan rencana",
    description:
      "Tim menyusun cakupan halaman, fitur, kebutuhan konten, estimasi biaya, dan waktu kerja untuk disepakati bersama.",
  },
  {
    title: "Desain dan pembangunan",
    description:
      "Website disiapkan mengikuti identitas usaha dan cakupan kerja yang telah disetujui.",
  },
  {
    title: "Review dan peluncuran",
    description:
      "Hasil ditinjau bersama sebelum dipublikasikan, lalu dukungan diberikan sesuai cakupan layanan.",
  },
] as const;

export const websiteServicePricing = Object.freeze({
  status: "published" as const,
  packageName: "Website UMKM Profesional",
  startingPrice: 999_000,
  normalPrice: 1_599_000,
  startingPriceLabel: "Rp999.000",
  specialPriceLabel: "Harga spesial terbatas",
  timelineLabel:
    "Website siap dalam 1-2 hari setelah materi utama lengkap dan cakupan disepakati.",
  included: websiteServiceFeatures,
  note:
    "Harga spesial terbatas untuk paket awal Website UMKM Cepat dengan domain, hosting, pemeliharaan, dan chatbot AI 24 jam.",
});

export const freeAndProfessionalComparison = [
  {
    title: "Program website gratis",
    description:
      "Ikuti Digital Checkup untuk membuka peluang mendapatkan website gratis melalui program dampak sosial DekatLokal.",
    items: [
      "Dimulai dari Digital Checkup gratis",
      "Prioritas untuk UMKM yang siap berkembang",
      "Website dasar untuk profil, katalog, dan kontak",
      "Setiap layanan profesional ikut menjaga keberlanjutan pemeliharaan program UMKM",
    ],
    ctaLabel: "Dapatkan web gratis",
    href: commercialLinks.digitalCheckupApp,
    external: true,
  },
  {
    title: "Layanan profesional",
    description:
      "Jalur berbayar untuk bisnis yang ingin segera memiliki website profesional dengan waktu kerja dan cakupan yang disepakati.",
    items: [
      "Tidak menunggu seleksi program",
      "Website siap dalam 1-2 hari setelah materi utama lengkap",
      "Desain dan fitur mengikuti kebutuhan bisnis",
      "Revisi serta dukungan berjalan sesuai paket layanan",
    ],
    ctaLabel: "Konsultasi website",
    href: commercialLinks.websiteConsultation,
    external: true,
  },
] as const;

export const websiteServiceFaq: readonly CommercialFaqItem[] = [
  {
    question: "Siapa yang cocok menggunakan layanan Website UMKM?",
    answer:
      "Layanan ini cocok untuk UMKM dan bisnis lokal yang ingin memiliki profil usaha, katalog produk atau layanan, serta jalur kontak yang lebih rapi dalam satu website.",
  },
  {
    question: "Apakah semua materi harus sudah siap sebelum konsultasi?",
    answer:
      "Tidak harus. Konsultasi dapat dimulai dari informasi dasar usaha. Tim DekatLokal membantu merapikan kebutuhan logo, foto, deskripsi, katalog, dan kontak utama.",
  },
  {
    question: "Fitur apa saja yang bisa dimasukkan?",
    answer:
      "Paket awal mencakup profil usaha, katalog, WhatsApp, kontak, lokasi, struktur SEO dasar, dan AI Assistant chatbot 24 jam untuk membantu pengunjung website.",
  },
  {
    question: "Berapa lama proses pembuatan website?",
    answer:
      "Website UMKM biasanya siap dalam 1-2 hari setelah materi utama, jumlah halaman, fitur, dan jadwal review dikonfirmasi.",
  },
  {
    question: "Berapa harga layanan Website UMKM?",
    answer:
      "Paket Website UMKM Cepat tersedia dengan harga spesial terbatas Rp999.000 dari harga normal Rp1.599.000. Domain, hosting, dan pemeliharaan gratis selama 1 tahun sudah termasuk.",
  },
  {
    question: "Apa bedanya layanan profesional dan program website gratis?",
    answer:
      "Program website gratis dimulai dari Digital Checkup dan ditujukan untuk UMKM terpilih. Layanan profesional dapat langsung dijadwalkan dengan cakupan desain, fitur, revisi, dan dukungan yang lebih fleksibel.",
  },
  {
    question: "Apakah ada dukungan setelah website diluncurkan?",
    answer:
      "Ada. Paket Website UMKM Cepat sudah termasuk domain, hosting, dan pemeliharaan gratis 1 tahun. Dukungan tambahan dapat disesuaikan dengan kebutuhan bisnis.",
  },
];

export const verifiedTestimonialPlaceholder = Object.freeze({
  eyebrow: "CERITA KLIEN",
  title: "Website yang membantu usaha tampil lebih siap",
  description:
    "Portofolio DekatLokal menampilkan usaha lokal dengan identitas, produk, dan jalur kontak yang lebih rapi untuk pelanggan.",
  ctaLabel: "Lihat karya yang sudah tayang",
  href: commercialLinks.portfolio,
});
