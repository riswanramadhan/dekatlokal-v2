import type { FoundationalModule, ModuleCatalog } from "@/domain/entities";
import { moduleCatalogSchema } from "@/domain/schemas";

type ModuleSeed = {
  slug: string;
  title: string;
  shortTitle: string;
  outcome: string;
  summary: string;
  icon: string;
  theme: FoundationalModule["theme"];
  estimatedMinutes: number;
  lessonTitles: [string, string, string, string];
  lessonFocuses: [string, string, string, string];
  taskTitle: string;
  taskInstruction: string;
  assetType: string;
  assetLabel: string;
  badge: string;
  topics: [string, string, string, string, string, string, string, string];
  legalNote?: string;
};

function buildQuestions(slug: string, topics: ModuleSeed["topics"]) {
  return topics.map((topic, index) => ({
    id: `${slug}-post-${index + 1}`,
    topic,
    prompt: `Dalam konteks ${topic.toLowerCase()}, pilihan mana yang paling membantu UMKM bertindak dengan jelas?`,
    options: [
      {
        id: "practical",
        label: `Mulai dari informasi usaha yang benar, sederhana, dan dapat dipakai pelanggan.`,
      },
      {
        id: "generic",
        label: "Gunakan kalimat promosi umum agar terlihat ramai dan lengkap.",
      },
      {
        id: "delay",
        label: "Tunda sampai semua alat digital dan desain terasa sempurna.",
      },
    ],
    correctOptionId: "practical",
    correctExplanation: `${topic} perlu dibuat praktis, jelas, dan langsung bisa diterapkan pada usaha.`,
    incorrectExplanation: `Belum tepat. Untuk ${topic.toLowerCase()}, pilih langkah kecil yang benar, spesifik, dan bisa digunakan pelanggan atau pemilik usaha.`,
  }));
}

function buildModule(seed: ModuleSeed): FoundationalModule {
  return {
    id: `module-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    shortTitle: seed.shortTitle,
    outcome: seed.outcome,
    summary: seed.summary,
    icon: seed.icon,
    theme: seed.theme,
    estimatedMinutes: seed.estimatedMinutes,
    lessons: seed.lessonTitles.map((title, index) => ({
      id: `${seed.slug}-lesson-${index + 1}`,
      title,
      focus: seed.lessonFocuses[index],
      type:
        index === 0
          ? "story"
          : index === 1
            ? "reading"
            : index === 2
              ? "checklist"
              : "template",
      estimatedMinutes: index === 0 ? 4 : index === 1 ? 5 : index === 2 ? 6 : 7,
    })),
    practicalTask: {
      title: seed.taskTitle,
      instruction: seed.taskInstruction,
      assetType: seed.assetType,
      assetLabel: seed.assetLabel,
      futureUse:
        "Aset ini tersimpan di Aset Usaha dan dapat dipakai ulang untuk profil, Jejak Tumbuh, dan reward landing page.",
    },
    postTestQuestions: buildQuestions(seed.slug, seed.topics),
    correctiveReviews: seed.topics.slice(0, 4).map((topic) => ({
      topic,
      title: `Penguatan: ${topic}`,
      body: `Ulangi inti ${topic.toLowerCase()} dengan contoh usaha sendiri. Fokus pada satu keputusan kecil yang bisa dilakukan hari ini.`,
    })),
    badge: seed.badge,
    legalNote: seed.legalNote,
  };
}

export const foundationalModules: ModuleCatalog = moduleCatalogSchema.parse([
  buildModule({
    slug: "digitalisasi-umkm",
    title: "Digitalisasi UMKM",
    shortTitle: "Digitalisasi",
    outcome:
      "UMKM memiliki fondasi digital yang rapi dan mudah ditemukan pelanggan.",
    summary:
      "Rapikan data usaha, kanal digital, WhatsApp Business, profil Google, dan metrik dasar.",
    icon: "Smartphone",
    theme: "blue",
    estimatedMinutes: 32,
    lessonTitles: [
      "Cek Kesiapan Digital Usahamu",
      "Rapikan Identitas Digital",
      "Buat Pusat Informasi Usaha",
      "Ukur Interaksi Digital Dasar",
    ],
    lessonFocuses: [
      "Kanal yang sudah dimiliki dan data yang belum lengkap.",
      "Nama usaha, kontak, jam operasional, alamat, dan deskripsi.",
      "WhatsApp Business, Google Business Profile, tautan utama, dan landing page overview.",
      "Klik WhatsApp, kunjungan profil, pertanyaan pelanggan, dan catatan sederhana.",
    ],
    taskTitle: "Lengkapi Digital Profile Checklist",
    taskInstruction:
      "Periksa data usaha, pilih satu profil digital utama, lalu lengkapi informasi yang paling sering dicari pelanggan.",
    assetType: "digital_profile",
    assetLabel: "Digital Profile Checklist",
    badge: "Profil Usaha Siap",
    topics: [
      "Pemilihan channel",
      "Konsistensi nama usaha",
      "WhatsApp Business",
      "Profil Google",
      "Jam operasional",
      "CTA pelanggan",
      "Kontak utama",
      "Metrik dasar",
    ],
  }),
  buildModule({
    slug: "branding-umkm",
    title: "Branding UMKM",
    shortTitle: "Branding",
    outcome: "UMKM memiliki identitas dan pesan brand yang konsisten.",
    summary:
      "Tentukan nilai unik, target pelanggan, tagline, tone, dan mini brand kit.",
    icon: "BadgeCheck",
    theme: "violet",
    estimatedMinutes: 30,
    lessonTitles: [
      "Kenali Nilai Unik Usahamu",
      "Tentukan Target Pelanggan",
      "Susun Pesan, Tagline, dan Tone",
      "Bangun Mini Brand Kit",
    ],
    lessonFocuses: [
      "Alasan pelanggan memilih usaha dibanding pilihan lain.",
      "Pelanggan utama, kebutuhan, dan bahasa yang mereka pahami.",
      "Pesan singkat, tagline, dan gaya bicara yang konsisten.",
      "Warna, font referensi, contoh visual, dan aturan sederhana.",
    ],
    taskTitle: "Membuat Mini Brand Kit",
    taskInstruction:
      "Susun nilai unik, target pelanggan, tagline, tone, dan referensi warna yang bisa dipakai saat membuat konten.",
    assetType: "mini_brand_kit",
    assetLabel: "Mini Brand Kit",
    badge: "Brand Mulai Konsisten",
    topics: [
      "Nilai unik",
      "Target pelanggan",
      "Positioning",
      "Tagline",
      "Tone of voice",
      "Warna brand",
      "Konsistensi identitas",
      "Pesan utama",
    ],
  }),
  buildModule({
    slug: "produk-dan-kemasan",
    title: "Produk dan Kemasan",
    shortTitle: "Produk",
    outcome:
      "Produk lebih jelas, menarik, aman, dan mudah dipahami pelanggan.",
    summary:
      "Perjelas manfaat, varian, informasi kemasan, foto, dan deskripsi produk.",
    icon: "PackageCheck",
    theme: "coral",
    estimatedMinutes: 34,
    lessonTitles: [
      "Perjelas Manfaat dan Varian Produk",
      "Tentukan Informasi Produk yang Wajib Terlihat",
      "Evaluasi Fungsi dan Tampilan Kemasan",
      "Siapkan Foto dan Deskripsi Produk",
    ],
    lessonFocuses: [
      "Manfaat utama, varian, dan alasan pelanggan memilih produk.",
      "Informasi bahan, ukuran, harga, cara pakai, dan kontak.",
      "Kemasan yang melindungi produk dan membantu pelanggan paham.",
      "Foto produk dan deskripsi yang siap masuk katalog.",
    ],
    taskTitle: "Membuat Product Sheet",
    taskInstruction:
      "Isi judul produk, deskripsi, varian, harga, checklist kemasan, dan foto produk utama.",
    assetType: "product_sheet",
    assetLabel: "Product Sheet",
    badge: "Produk Lebih Jelas",
    topics: [
      "Manfaat produk",
      "Varian produk",
      "Informasi kemasan",
      "Fungsi kemasan",
      "Foto produk",
      "Deskripsi produk",
      "Harga dan ukuran",
      "Checklist perbaikan",
    ],
  }),
  buildModule({
    slug: "konsistensi-promosi",
    title: "Konsistensi Promosi",
    shortTitle: "Promosi",
    outcome: "UMKM memiliki sistem promosi yang ringan dan konsisten.",
    summary:
      "Buat tujuan promosi, pilar konten, kalender 7 hari, caption, CTA, dan evaluasi sederhana.",
    icon: "CalendarDays",
    theme: "yellow",
    estimatedMinutes: 30,
    lessonTitles: [
      "Tentukan Tujuan dan Pilar Konten",
      "Buat Kalender Promosi 7 Hari",
      "Tulis Caption dan CTA yang Jelas",
      "Review Hasil Konten Secara Sederhana",
    ],
    lessonFocuses: [
      "Tujuan konten dan pilar yang bisa diulang tanpa bingung.",
      "Jadwal promosi ringan selama tujuh hari.",
      "Caption singkat, ajakan bertindak, dan format posting.",
      "Cara melihat respon pelanggan tanpa laporan rumit.",
    ],
    taskTitle: "Membuat Kalender Konten 7 Hari",
    taskInstruction:
      "Susun tujuh ide konten dan tiga draft caption dengan CTA yang jelas untuk pelanggan.",
    assetType: "weekly_content_calendar",
    assetLabel: "Kalender Konten 7 Hari",
    badge: "Promosi Lebih Konsisten",
    topics: [
      "Tujuan konten",
      "Pilar konten",
      "Kalender mingguan",
      "Caption",
      "CTA promosi",
      "Evaluasi konten",
      "Konsistensi posting",
      "Draft konten",
    ],
  }),
  buildModule({
    slug: "marketplace-dan-kanal-penjualan",
    title: "Marketplace dan Kanal Penjualan",
    shortTitle: "Kanal Jual",
    outcome:
      "UMKM memilih kanal penjualan yang tepat dan memiliki listing yang lebih siap.",
    summary:
      "Pilih kanal sesuai pelanggan, optimalkan listing, atur harga, fulfillment, chat, ulasan, dan repeat order.",
    icon: "Store",
    theme: "sky",
    estimatedMinutes: 35,
    lessonTitles: [
      "Pilih Kanal Sesuai Pelanggan",
      "Optimalkan Etalase dan Listing",
      "Atur Harga, Promo, dan Fulfillment",
      "Kelola Chat, Ulasan, dan Repeat Order",
    ],
    lessonFocuses: [
      "Kanal yang cocok dengan kebiasaan pelanggan.",
      "Judul, foto, deskripsi, dan kategori listing.",
      "Harga, promo, ongkir, stok, dan pengiriman.",
      "Template chat, ulasan, dan tindak lanjut pelanggan.",
    ],
    taskTitle: "Membuat Channel Priority Plan",
    taskInstruction:
      "Pilih kanal utama, tulis alasan, lalu siapkan satu draft listing yang bisa dipindahkan ke marketplace.",
    assetType: "sales_channel_plan",
    assetLabel: "Channel Priority Plan",
    badge: "Kanal Jual Lebih Siap",
    topics: [
      "Channel fit",
      "Etalase",
      "Listing title",
      "Listing description",
      "Promo plan",
      "Fulfillment",
      "Response template",
      "Repeat order",
    ],
  }),
  buildModule({
    slug: "operasional-dan-keuangan-dasar",
    title: "Operasional dan Keuangan Dasar",
    shortTitle: "Operasional",
    outcome:
      "UMKM memiliki alur order dan pencatatan keuangan dasar yang lebih rapi.",
    summary:
      "Petakan alur pesanan, stok, supplier, kas masuk-keluar, HPP, harga, dan laba dasar.",
    icon: "ClipboardList",
    theme: "mint",
    estimatedMinutes: 36,
    lessonTitles: [
      "Petakan Alur Pesanan",
      "Kelola Stok dan Supplier",
      "Catat Uang Masuk dan Keluar",
      "Hitung HPP, Harga, dan Laba Dasar",
    ],
    lessonFocuses: [
      "Tahapan order dari pelanggan bertanya sampai pesanan selesai.",
      "Stok penting, supplier, dan pengingat restock sederhana.",
      "Catatan uang masuk-keluar yang mudah diisi harian.",
      "HPP, harga jual, margin, dan catatan laba dasar.",
    ],
    taskTitle: "Membuat SOP Order dan Cashbook Sederhana",
    taskInstruction:
      "Susun alur order, checklist stok, dan contoh catatan uang masuk-keluar untuk satu produk atau layanan.",
    assetType: "operations_cashbook",
    assetLabel: "SOP Order dan Cashbook",
    badge: "Order Lebih Rapi",
    topics: [
      "SOP order",
      "Status pesanan",
      "Stok",
      "Supplier",
      "Uang masuk",
      "Uang keluar",
      "HPP",
      "Harga dan laba",
    ],
  }),
  buildModule({
    slug: "legalitas-usaha",
    title: "Legalitas Usaha",
    shortTitle: "Legalitas",
    outcome:
      "UMKM memahami kesiapan legalitas dan memiliki rencana dokumen yang perlu dipenuhi.",
    summary:
      "Pahami tujuan legalitas, identitas usaha, izin sesuai produk, checklist dokumen, dan masa berlaku.",
    icon: "FileCheck2",
    theme: "blue",
    estimatedMinutes: 28,
    lessonTitles: [
      "Mengapa Legalitas Penting",
      "Kenali Identitas dan Nomor Induk Usaha",
      "Petakan Izin Sesuai Jenis Produk",
      "Susun Checklist dan Masa Berlaku Dokumen",
    ],
    lessonFocuses: [
      "Manfaat legalitas untuk kepercayaan dan peluang usaha.",
      "Identitas usaha dan istilah umum yang sering ditemui.",
      "Pemetaan kebutuhan dokumen berdasarkan jenis produk.",
      "Checklist dokumen, pemilik tugas, dan target waktu.",
    ],
    taskTitle: "Membuat Legal Readiness Checklist",
    taskInstruction:
      "Catat status dokumen usaha, dokumen yang perlu dicek, pemilik tugas, dan target penyelesaian.",
    assetType: "legal_readiness_checklist",
    assetLabel: "Legal Readiness Checklist",
    badge: "Legalitas Terpetakan",
    topics: [
      "Tujuan legalitas",
      "Identitas usaha",
      "NIB",
      "Jenis produk",
      "Dokumen wajib",
      "Masa berlaku",
      "Pemilik tugas",
      "Validasi sumber resmi",
    ],
    legalNote:
      "Materi legalitas bersifat edukasi umum. Syarat produksi harus diverifikasi dari sumber resmi sebelum dirilis.",
  }),
  buildModule({
    slug: "komitmen-dan-growth-mindset",
    title: "Komitmen dan Growth Mindset",
    shortTitle: "Komitmen",
    outcome:
      "Pemilik memiliki target realistis, kebiasaan evaluasi, dan komitmen perbaikan.",
    summary:
      "Tentukan target 30/90 hari, kebiasaan kecil, feedback pelanggan, eksperimen, dan review mingguan.",
    icon: "Sprout",
    theme: "mint",
    estimatedMinutes: 26,
    lessonTitles: [
      "Tentukan Target 30 dan 90 Hari",
      "Bangun Kebiasaan Kecil yang Konsisten",
      "Gunakan Feedback Pelanggan",
      "Lakukan Eksperimen dan Review Mingguan",
    ],
    lessonFocuses: [
      "Target realistis yang bisa dicek tanpa tekanan berlebihan.",
      "Kebiasaan kecil yang membantu usaha bergerak rutin.",
      "Feedback pelanggan sebagai bahan perbaikan.",
      "Eksperimen mingguan dan pertanyaan evaluasi.",
    ],
    taskTitle: "Membuat Growth Plan 30 Hari",
    taskInstruction:
      "Tulis target 30 hari, target 90 hari, aksi mingguan, pertanyaan review, dan log eksperimen sederhana.",
    assetType: "growth_plan_30_days",
    assetLabel: "Growth Plan 30 Hari",
    badge: "Pelaku Usaha Konsisten",
    topics: [
      "Target 30 hari",
      "Target 90 hari",
      "Kebiasaan kecil",
      "Feedback pelanggan",
      "Eksperimen",
      "Review mingguan",
      "Komitmen realistis",
      "Evaluasi perkembangan",
    ],
  }),
]);

export function listFoundationalModules() {
  return foundationalModules;
}

export function getFoundationalModule(moduleSlug: string) {
  return foundationalModules.find((module) => module.slug === moduleSlug) ?? null;
}
