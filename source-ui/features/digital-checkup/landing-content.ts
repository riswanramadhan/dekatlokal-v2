import type { FaqItem } from "@/components/sections/faq-data";

export const digitalCheckupBenefits = [
  {
    title: "Melihat kondisi saat ini",
    description:
      "Dapatkan ringkasan kesiapan digital berdasarkan informasi usaha dan kanal digital yang Anda miliki.",
  },
  {
    title: "Menentukan prioritas",
    description:
      "Kenali aspek yang sudah kuat dan area yang sebaiknya dikerjakan lebih dahulu.",
  },
  {
    title: "Mendapat langkah berikutnya",
    description:
      "Terima rekomendasi yang membantu Anda memilih langkah website, konten, dan operasional berikutnya.",
  },
] as const;

export const digitalCheckupAspects = [
  {
    title: "Identitas",
    description: "Informasi dasar usaha dan pemilik untuk memahami konteks bisnis.",
  },
  {
    title: "Legalitas",
    description: "Kesiapan dokumen dasar usaha seperti Nomor Induk Berusaha.",
  },
  {
    title: "Produk",
    description: "Keaktifan penjualan, kejelasan harga, serta sistem stok atau pre-order.",
  },
  {
    title: "Branding",
    description: "Nama, logo, dan konsistensi identitas visual yang digunakan usaha.",
  },
  {
    title: "Jejak Digital",
    description: "Kehadiran usaha di media sosial, Google Business, dan kanal digital lain.",
  },
  {
    title: "Konsistensi",
    description: "Aktivitas dan keteraturan komunikasi usaha di kanal digital.",
  },
  {
    title: "Operasional",
    description: "Kesiapan pembayaran, pemesanan, serta pengiriman atau pelayanan.",
  },
  {
    title: "Komitmen",
    description: "Kesiapan pemilik untuk merawat informasi dan terus belajar setelah go digital.",
  },
] as const;

export const digitalCheckupSteps = [
  {
    title: "Jawab pertanyaan sederhana",
    description:
      "Isi delapan aspek secara bertahap dengan informasi usaha yang paling penting.",
  },
  {
    title: "Sistem menyusun ringkasan",
    description:
      "Jawaban diproses untuk membentuk gambaran kesiapan digital dan prioritas pengembangan.",
  },
  {
    title: "Lihat hasil dan rekomendasi",
    description:
      "Baca skor per aspek, prioritas pengembangan, dan peluang mengikuti program website gratis.",
  },
] as const;

export const digitalCheckupFaq: readonly FaqItem[] = [
  {
    question: "Apakah Digital Checkup berbayar?",
    answer:
      "Tidak. Digital Checkup gratis dan tidak memerlukan akun untuk memulai.",
  },
  {
    question: "Berapa lama proses pengisiannya?",
    answer:
      "Waktu pengisian bergantung pada kesiapan informasi usaha. Pertanyaannya dibagi bertahap agar mudah diikuti.",
  },
  {
    question: "Apakah hasilnya menentukan usaha saya baik atau buruk?",
    answer:
      "Hasil Digital Checkup berisi panduan prioritas untuk melihat kondisi usaha dan langkah digital yang paling perlu dikerjakan.",
  },
  {
    question: "Informasi apa yang perlu disiapkan?",
    answer:
      "Siapkan informasi dasar usaha, produk, kanal pemesanan, aktivitas digital, serta username atau tautan profil bisnis bila tersedia.",
  },
  {
    question: "Apakah saya bisa mendapatkan website gratis?",
    answer:
      "Bisa melalui program dampak sosial DekatLokal. Lengkapi Digital Checkup agar kebutuhan usaha Anda dapat diprioritaskan dan ditinjau oleh tim.",
  },
  {
    question: "Apa yang dilakukan setelah melihat hasil?",
    answer:
      "Gunakan rekomendasi sebagai daftar prioritas. Jika membutuhkan arahan lebih lanjut, Anda dapat berkonsultasi dengan tim DekatLokal melalui WhatsApp.",
  },
];
