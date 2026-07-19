import { siteRoutes } from "@/lib/site-config";
import type { CommercialFaqItem, CommercialIconName } from "./config";
import { commercialLinks } from "./config";

export interface ServiceContentCard {
  title: string;
  description: string;
  icon?: CommercialIconName;
  items?: readonly string[];
}

export interface ProfessionalServiceConfig {
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  problemTitle: string;
  problemDescription: string;
  problems: readonly ServiceContentCard[];
  consultationHref: string;
  consultationLabel: string;
  heroPoints: readonly string[];
  heroTheme?: "blue" | "white";
  heroVisual?: "website-orbit" | "system-frames";
  heroPanel: {
    label: string;
    title: string;
    items: readonly string[];
  };
  audienceTitle: string;
  audienceDescription: string;
  audiences: readonly ServiceContentCard[];
  valueTitle: string;
  valueDescription: string;
  values: readonly ServiceContentCard[];
  scopeTitle: string;
  scopeDescription: string;
  scopes: readonly ServiceContentCard[];
  pricing?: {
    eyebrow: string;
    title: string;
    priceNote: string;
    price: string;
    normalPrice?: string;
    deliveryLabel?: string;
    description: string;
    badge: string;
    benefits: readonly string[];
    ctaLabel: string;
  };
  scenarios: readonly ServiceContentCard[];
  process: readonly ServiceContentCard[];
  estimationDescription: string;
  estimationFactors: readonly string[];
  scopeBoundaries: readonly string[];
  faq: readonly CommercialFaqItem[];
  closingTitle: string;
  closingDescription: string;
}

export const servicesOverviewFaq: readonly CommercialFaqItem[] = [
  {
    question: "Bagaimana memilih layanan yang paling sesuai?",
    answer:
      "Mulai dari Digital Checkup untuk memetakan prioritas, atau ceritakan kondisi usaha melalui konsultasi. Tim membantu membedakan kebutuhan website cepat, website custom, dan sistem operasional sebelum cakupan kerja disusun.",
  },
  {
    question: "Apakah harga dan waktu kerja sudah tetap untuk semua layanan?",
    answer:
      "Website UMKM memiliki harga awal yang jelas. Website custom dan sistem digital disusun setelah kebutuhan, fitur, materi, integrasi, dan jadwal review dipetakan.",
  },
  {
    question: "Apakah konsultasi awal langsung mengikat saya pada proyek berbayar?",
    answer:
      "Tidak. Konsultasi awal digunakan untuk memahami kebutuhan. Pekerjaan berbayar dimulai setelah cakupan, tanggung jawab, estimasi, dan waktu kerja disepakati.",
  },
  {
    question: "Bisakah solusi dikembangkan bertahap?",
    answer:
      "Bisa. Untuk kebutuhan yang luas, DekatLokal dapat membagi pekerjaan menjadi versi awal dan tahap lanjutan agar biaya, waktu, dan prioritas lebih mudah dikendalikan.",
  },
];

export const servicesOverviewPrinciples = [
  {
    title: "Mulai dari masalah yang nyata",
    description:
      "Tujuan bisnis, kebutuhan pengguna, dan hambatan proses dipetakan sebelum memilih bentuk solusi.",
    icon: "search" as const,
  },
  {
    title: "Cakupan terlihat sejak awal",
    description:
      "Fitur, materi, integrasi, tanggung jawab, dan batas pekerjaan dirangkum sebelum pembangunan dimulai.",
    icon: "catalog" as const,
  },
  {
    title: "Nyaman untuk pengguna",
    description:
      "Struktur informasi dan antarmuka dirancang responsif, mudah dipahami, dan relevan dengan alur pengguna.",
    icon: "mobile" as const,
  },
  {
    title: "Siap diteruskan dengan jelas",
    description:
      "Dokumentasi, akses, dukungan, dan rencana pengembangan dibicarakan sesuai kebutuhan proyek.",
    icon: "system" as const,
  },
] as const;

export const websiteCustomService: ProfessionalServiceConfig = {
  route: siteRoutes.websiteCustomService,
  heroTheme: "white",
  heroVisual: "website-orbit",
  eyebrow: "WEBSITE CUSTOM",
  title: "Website custom yang siap dikelola dan dikembangkan",
  description:
    "Bangun website CMS, website dinamis multipage dengan admin panel, portofolio dinamis, atau platform khusus untuk kebutuhan personal dan bisnis. Struktur, fitur, dan pengelolaan kontennya dirancang sesuai tujuan Anda.",
  problemTitle: "Saat template membuat kebutuhan penting terasa dipaksakan",
  problemDescription:
    "Website custom relevan ketika struktur informasi, pengalaman pengguna, dan cara pengelolaan konten perlu dirancang lebih matang.",
  problems: [
    {
      title: "Audiens datang dengan tujuan yang berbeda",
      description: "Pelanggan, mitra, komunitas, dan tim internal membutuhkan jalur informasi yang tidak sama.",
      icon: "contact",
    },
    {
      title: "Konten penting sulit disusun menjadi alur",
      description: "Program, layanan, publikasi, dan studi kasus mudah menjadi tumpukan halaman tanpa prioritas.",
      icon: "catalog",
    },
    {
      title: "Fitur khusus membutuhkan bentuk yang tepat",
      description: "Form bertahap, direktori, kalkulator, atau integrasi dirancang agar alurnya mudah digunakan sejak versi awal.",
      icon: "custom",
    },
    {
      title: "Website lama tidak lagi mendukung strategi",
      description: "Identitas dan kebutuhan bisnis berkembang, tetapi struktur digital belum ikut bergerak.",
      icon: "search",
    },
  ],
  consultationHref: commercialLinks.customWebsiteConsultation,
  consultationLabel: "Diskusikan website custom",
  heroPoints: [
    "CMS dan admin panel agar konten mudah dikelola",
    "Struktur multipage dan UI yang disusun khusus",
    "Fitur serta integrasi mengikuti kebutuhan",
  ],
  heroPanel: {
    label: "RENCANA PROJECT",
    title: "Website dinamis dengan admin panel",
    items: ["Kelola konten", "Halaman multipage", "Fitur terpilih"],
  },
  audienceTitle: "Cocok untuk personal dan bisnis yang membutuhkan kendali lebih",
  audienceDescription:
    "Website custom tepat ketika struktur, fitur, atau proses pengelolaan konten perlu dirancang dari konteks bisnis.",
  audiences: [
    {
      title: "Brand dengan banyak audiens",
      description:
        "Informasi untuk pelanggan, mitra, investor, atau komunitas disusun dalam beberapa halaman yang tetap konsisten dan mudah dijelajahi.",
    },
    {
      title: "Tim yang ingin mengelola konten sendiri",
      description:
        "CMS dan admin panel membantu tim memperbarui halaman, artikel, katalog, portofolio, atau informasi penting tanpa mengubah kode.",
    },
    {
      title: "Personal, profesional, dan bisnis dengan alur khusus",
      description:
        "Kebutuhan seperti formulir bertahap, direktori, kalkulator, personalisasi, atau integrasi perlu dikaji secara khusus.",
    },
  ],
  valueTitle: "Keputusan desain memiliki alasan yang bisa dijelaskan",
  valueDescription:
    "Setiap bagian diarahkan pada tujuan pengguna, kebutuhan bisnis, dan alur konversi yang jelas.",
  values: [
    {
      title: "Struktur informasi yang terarah",
      description:
        "Konten dikelompokkan berdasarkan kebutuhan audiens sehingga pengunjung lebih mudah menemukan langkah berikutnya.",
      icon: "catalog",
    },
    {
      title: "Pengalaman yang sesuai identitas",
      description:
        "Visual, interaksi, dan hierarchy dikembangkan dari karakter brand dengan tetap menjaga aksesibilitas dan responsivitas.",
      icon: "custom",
    },
    {
      title: "Konten mudah dikelola",
      description:
        "CMS, admin panel, hak akses, dan struktur data disesuaikan dengan konten yang perlu diperbarui setelah website tayang.",
      icon: "website",
    },
    {
      title: "Ruang pengembangan yang jelas",
      description:
        "Versi awal dan kebutuhan lanjutan dapat dipisahkan agar prioritas, biaya, dan risiko tetap terbaca.",
      icon: "system",
    },
  ],
  scopeTitle: "Cakupan disusun setelah pemetaan kebutuhan",
  scopeDescription:
    "Area pekerjaan disusun agar strategi, desain, teknologi, dan peluncuran berjalan dalam satu rencana yang jelas.",
  scopes: [
    {
      title: "Strategi dan struktur",
      description: "Fondasi sebelum desain visual dimulai.",
      items: [
        "Pemetaan tujuan dan audiens",
        "Pemetaan konten dan user journey",
        "Arsitektur informasi serta prioritas halaman",
      ],
    },
    {
      title: "Desain dan antarmuka",
      description: "Pengalaman lintas perangkat yang mengikuti identitas brand.",
      items: [
        "Arah visual dan komponen UI",
        "Prototype untuk alur utama",
        "Implementasi responsif dan aksesibilitas dasar",
      ],
    },
    {
      title: "CMS, admin panel, dan peluncuran",
      description: "Website disiapkan agar konten dinamis dapat dikelola sesuai peran dan kebutuhan.",
      items: [
        "CMS dan admin panel sesuai cakupan kerja",
        "Integrasi pihak ketiga setelah feasibility check",
        "QA, peluncuran, dan handover sesuai kesepakatan",
      ],
    },
  ],
  pricing: {
    eyebrow: "HARGA WEBSITE",
    title: "Website custom dengan harga awal yang jelas",
    priceNote: "Mulai dari",
    normalPrice: "Rp5.259.000",
    price: "Rp1.999.999",
    deliveryLabel: "Jadi dalam 3-4 hari",
    description:
      "Harga awal untuk website custom sederhana dengan struktur khusus. Estimasi final mengikuti jumlah halaman, fitur, konten, integrasi, dan jadwal review.",
    badge: "Bonus AI Assistant",
    benefits: [
      "Pemetaan struktur website",
      "Desain halaman sesuai brand",
      "Fitur prioritas sesuai kebutuhan",
      "Bonus AI Assistant chat",
    ],
    ctaLabel: "Diskusi custom",
  },
  scenarios: [
    {
      title: "Website bisnis multipage dengan CMS",
      description:
        "Kelola halaman layanan, artikel, studi kasus, tim, dan formulir inquiry melalui admin panel yang disusun sesuai kebutuhan.",
    },
    {
      title: "Portofolio dinamis untuk personal atau studio",
      description:
        "Tampilkan proyek, layanan, profil, kategori karya, dan cerita proses yang dapat diperbarui tanpa membangun ulang halaman.",
    },
    {
      title: "Website khusus untuk proses bisnis",
      description:
        "Bangun katalog, direktori, formulir bertahap, membership ringan, atau integrasi tertentu berdasarkan goals bisnis.",
    },
  ],
  process: [
    {
      title: "Pemetaan kebutuhan",
      description: "Memahami tujuan, audiens, konten, alur, risiko, dan indikator keberhasilan yang dapat dievaluasi.",
    },
    {
      title: "Pemetaan cakupan",
      description: "Menyusun prioritas halaman, fitur, integrasi, tanggung jawab konten, estimasi, dan batas pekerjaan.",
    },
    {
      title: "Desain dan validasi",
      description: "Mengembangkan struktur serta prototype untuk ditinjau sebelum implementasi penuh.",
    },
    {
      title: "Pembangunan dan QA",
      description: "Menerapkan cakupan kerja, menguji alur utama, responsivitas, konten, dan kesiapan peluncuran.",
    },
    {
      title: "Peluncuran dan handover",
      description: "Mempublikasikan hasil serta menyerahkan akses, panduan, dan dukungan sesuai kesepakatan.",
    },
  ],
  estimationDescription:
    "Estimasi website custom dibentuk setelah tujuan, struktur halaman, fitur, konten, integrasi, dan jadwal review dipahami.",
  estimationFactors: [
    "Jumlah dan kedalaman tipe halaman",
    "Kesiapan identitas, copy, foto, serta data",
    "Kompleksitas interaksi dan pengelolaan konten",
    "Integrasi, migrasi, serta ketergantungan pihak ketiga",
    "Putaran review dan jadwal pengambil keputusan",
  ],
  scopeBoundaries: [
    "Produksi foto, video, ilustrasi, dan copy panjang kecuali tercantum dalam proposal",
    "Lisensi font, aset premium, domain, hosting, serta biaya layanan pihak ketiga",
    "Integrasi yang membutuhkan akses API, pengaturan keamanan, dan koordinasi pihak ketiga",
    "Pemeliharaan lanjutan di luar periode dukungan yang disepakati",
  ],
  faq: [
    {
      question: "Apa bedanya Website UMKM Cepat dan Website Custom?",
      answer:
        "Website UMKM Cepat memakai cakupan awal yang lebih terstruktur untuk profil, katalog, dan kontak. Website Custom dimulai dari pemetaan kebutuhan karena struktur, desain, fitur, atau integrasinya perlu disusun khusus.",
    },
    {
      question: "Apakah saya harus sudah memiliki brief lengkap?",
      answer:
        "Tidak. Informasi dasar tentang bisnis, audiens, masalah, dan tujuan sudah cukup untuk memulai percakapan. Pemetaan kebutuhan membantu merapikan prioritas sebelum cakupan final dibuat.",
    },
    {
      question: "Apakah website dapat terhubung dengan sistem lain?",
      answer:
        "Dapat. Integrasi dibahas berdasarkan ketersediaan API, akses teknis, keamanan, biaya pihak ketiga, dan kualitas data agar implementasinya jelas sejak awal.",
    },
    {
      question: "Apakah Website Custom sudah termasuk CMS dan admin panel?",
      answer:
        "Bisa. CMS dan admin panel dapat disiapkan untuk mengelola halaman, artikel, katalog, portofolio, atau data lain sesuai cakupan. Hak akses, jenis konten, dan alur pengelolaannya dibahas sebelum pembangunan dimulai.",
    },
    {
      question: "Berapa harga dan waktu pengerjaannya?",
      answer:
        "Website custom mulai dari Rp1.999.999 dari harga normal Rp5.259.000. Pengerjaan umumnya 3-4 hari setelah cakupan, materi, dan jadwal review disepakati.",
    },
    {
      question: "Siapa yang mengelola konten setelah website tayang?",
      answer:
        "Model pengelolaan dibahas saat pemetaan kebutuhan. Dashboard, bentuk handover, dokumentasi, pelatihan, dan dukungan disesuaikan dengan cakupan kerja yang disepakati.",
    },
  ],
  closingTitle: "Punya kebutuhan website yang tidak muat dalam paket standar?",
  closingDescription:
    "Ceritakan tujuan, audiens, dan alur utamanya. Kami membantu menyusun prioritas website, fitur penting, dan estimasi pekerjaan dengan jelas.",
};

export const digitalSystemService: ProfessionalServiceConfig = {
  route: siteRoutes.digitalSystemService,
  heroTheme: "blue",
  heroVisual: "system-frames",
  eyebrow: "SISTEM DIGITAL",
  title: "Sistem digital untuk alur kerja yang rapi",
  description:
    "Bangun dashboard, booking, otomasi, atau sistem internal dengan coding dari nol dan sesuai proses tim. Kebutuhan dipetakan berdasarkan keinginan dan goals bisnis.",
  problemTitle: "Ketika pekerjaan tumbuh, cara mencatatnya mulai tertinggal",
  problemDescription:
    "Sistem digital dibangun untuk mengurangi kebingungan operasional dan membantu tim mengambil keputusan dari informasi yang lebih rapi.",
  problems: [
    {
      title: "Data yang sama dicatat berkali-kali",
      description: "Informasi berpindah dari chat ke spreadsheet lalu ke laporan, sehingga rawan tertinggal atau tidak konsisten.",
      icon: "catalog",
    },
    {
      title: "Status pekerjaan sulit dilihat bersama",
      description: "Order, booking, atau permintaan berjalan tanpa satu gambaran tentang penanggung jawab dan langkah berikutnya.",
      icon: "system",
    },
    {
      title: "Laporan baru tersedia setelah dirangkum manual",
      description: "Waktu tim habis mengumpulkan data ketika seharusnya dipakai untuk menyelesaikan pekerjaan.",
      icon: "search",
    },
    {
      title: "Alur kerja bergantung pada satu orang",
      description: "Pengetahuan operasional perlu dirapikan menjadi proses yang bisa dipahami dan diteruskan oleh tim.",
      icon: "contact",
    },
  ],
  consultationHref: commercialLinks.digitalSystemConsultation,
  consultationLabel: "Diskusikan proses operasional",
  heroPoints: [
    "Pemetaan proses, peran, data, dan hambatan",
    "Prototype alur inti sebelum pembangunan penuh",
    "Pengembangan bertahap sesuai prioritas operasional",
  ],
  heroPanel: {
    label: "ALUR INTERNAL",
    title: "Order masuk hingga selesai",
    items: ["Intake terpusat", "Status pekerjaan", "Ringkasan operasional"],
  },
  audienceTitle: "Cocok ketika pekerjaan mulai sulit dipantau dengan alat terpisah",
  audienceDescription:
    "Sistem yang baik dimulai dari proses yang dipahami. Teknologi dipilih setelah peran, keputusan, data, dan pengecualian kerja dipetakan bersama.",
  audiences: [
    {
      title: "Tim dengan pencatatan berulang",
      description:
        "Data yang sama sering disalin antara chat, formulir, spreadsheet, dan laporan sehingga rawan tertinggal atau tidak konsisten.",
    },
    {
      title: "Layanan dengan banyak status",
      description:
        "Booking, order, permintaan, atau pekerjaan lapangan membutuhkan status, penanggung jawab, dan riwayat yang mudah ditelusuri.",
    },
    {
      title: "Pengelola yang butuh ringkasan",
      description:
        "Keputusan operasional tertunda karena informasi tersebar dan laporan harus dirangkum secara manual.",
    },
  ],
  valueTitle: "Bangun alur yang dipakai tim dan ringkasan yang bisa ditindaklanjuti",
  valueDescription:
    "Prioritas awal adalah mengurangi langkah yang membingungkan dan membuat informasi penting dapat ditindaklanjuti.",
  values: [
    {
      title: "Satu alur yang lebih terbaca",
      description:
        "Input, status, penanggung jawab, dan tindak lanjut dapat dirancang dalam jalur yang konsisten.",
      icon: "system",
    },
    {
      title: "Data sesuai kebutuhan keputusan",
      description:
        "Field dan ringkasan dipilih berdasarkan pekerjaan nyata agar data yang masuk mudah dipakai untuk keputusan.",
      icon: "catalog",
    },
    {
      title: "Akses berdasarkan peran",
      description:
        "Kebutuhan hak akses dan data sensitif dipetakan dalam cakupan kerja; implementasinya mengikuti risiko dan konteks penggunaan.",
      icon: "contact",
    },
    {
      title: "Bertahap dan dapat dievaluasi",
      description:
        "Alur inti dapat diprioritaskan lebih dulu sebelum modul atau integrasi lanjutan diputuskan.",
      icon: "search",
    },
  ],
  scopeTitle: "Modul yang dapat diprioritaskan",
  scopeDescription:
    "Modul dipilih berdasarkan proses kerja, peran pengguna, data penting, dan integrasi yang paling berdampak untuk operasional.",
  scopes: [
    {
      title: "Operasional dan layanan",
      description: "Merapikan alur pekerjaan yang memiliki status dan penanggung jawab.",
      items: [
        "Intake order, permintaan, atau booking",
        "Penugasan serta pembaruan status",
        "Riwayat aktivitas dan tindak lanjut",
      ],
    },
    {
      title: "Administrasi dan data",
      description: "Mengurangi pencatatan ganda dan membantu pencarian informasi.",
      items: [
        "Formulir serta database internal sesuai cakupan kerja",
        "Dokumen dan data referensi terstruktur",
        "Ekspor atau ringkasan laporan terpilih",
      ],
    },
    {
      title: "Monitoring dan integrasi",
      description: "Memberi gambaran yang cukup untuk tindakan berikutnya.",
      items: [
        "Dashboard indikator operasional yang disepakati",
        "Notifikasi untuk kejadian prioritas",
        "Integrasi setelah akses dan feasibility dikonfirmasi",
      ],
    },
  ],
  pricing: {
    eyebrow: "HARGA SISTEM",
    title: "Sistem digital dibahas sesuai kebutuhan",
    priceNote: "Estimasi",
    price: "Custom",
    deliveryLabel: "Versi awal siap dalam 1 pekan",
    description:
      "Biaya sistem digital disusun setelah proses, peran, data, integrasi, dan prioritas versi awal dipahami bersama.",
    badge: "Bonus AI Assistant",
    benefits: [
      "Pemetaan proses dan peran",
      "Prototype alur prioritas",
      "Modul dibangun bertahap",
      "Bonus AI Assistant chat",
    ],
    ctaLabel: "Diskusi sistem",
  },
  scenarios: [
    {
      title: "Dashboard order dan produksi",
      description:
        "Mencatat permintaan, tahapan pengerjaan, penanggung jawab, tenggat, dan kendala tanpa menjanjikan modul manufaktur penuh.",
    },
    {
      title: "Sistem booking layanan",
      description:
        "Mengatur permintaan jadwal, data pelanggan, status konfirmasi, dan catatan layanan sesuai aturan operasional.",
    },
    {
      title: "Monitoring program lapangan",
      description:
        "Mengumpulkan laporan terstruktur, memantau kelengkapan, dan menampilkan ringkasan untuk tim pengelola.",
    },
  ],
  process: [
    {
      title: "Pemetaan proses",
      description: "Mengikuti alur kerja saat ini, peran yang terlibat, data yang dipakai, hambatan, serta pengecualian.",
    },
    {
      title: "Prioritas versi awal",
      description: "Menentukan alur inti, risiko, kebutuhan akses, integrasi, dan indikator penerimaan yang realistis.",
    },
    {
      title: "Prototype dan uji alur",
      description: "Menguji struktur serta langkah utama bersama calon pengguna sebelum pembangunan penuh.",
    },
    {
      title: "Pembangunan dan pengujian",
      description: "Mengimplementasikan cakupan kerja serta menguji fungsi, peran, data, skenario gagal, dan perangkat yang relevan.",
    },
    {
      title: "Rollout dan evaluasi",
      description: "Menyiapkan penggunaan awal, handover, dukungan, dan daftar perbaikan berdasarkan temuan nyata.",
    },
  ],
  estimationDescription:
    "Estimasi dibuat setelah alur, jumlah peran, jenis data, integrasi, dan kebutuhan operasional dipahami. Proyek dapat dibagi bertahap bila cakupan awal terlalu luas.",
  estimationFactors: [
    "Jumlah peran serta aturan hak akses",
    "Keragaman alur, status, dan pengecualian",
    "Volume, kualitas, serta kebutuhan migrasi data",
    "Integrasi, notifikasi, dan ketergantungan pihak ketiga",
    "Kebutuhan keamanan, audit, backup, dan dukungan operasional",
  ],
  scopeBoundaries: [
    "Migrasi atau pembersihan data lama sebelum kualitas dan volumenya diperiksa",
    "Integrasi tanpa dokumentasi, kredensial, atau akses resmi dari penyedia terkait",
    "Perangkat keras, lisensi, layanan pesan, dan biaya pihak ketiga kecuali tertulis",
    "Jaminan kepatuhan khusus tanpa audit serta kebutuhan regulasi yang disepakati",
  ],
  faq: [
    {
      question: "Apakah semua proses manual harus langsung dipindahkan ke sistem?",
      answer:
        "Tidak. Proses perlu ditinjau lebih dulu karena langkah manual yang tidak efektif sebaiknya tidak langsung didigitalisasi. Versi awal dapat fokus pada alur yang paling penting dan stabil.",
    },
    {
      question: "Apakah sistem bisa menggantikan spreadsheet yang kami pakai?",
      answer:
        "Bisa menjadi salah satu tujuan. Keputusan dibuat berdasarkan cara spreadsheet dipakai, kualitas data, kebutuhan kolaborasi, laporan, dan integrasi yang dibutuhkan.",
    },
    {
      question: "Apakah sistem dapat terhubung ke WhatsApp, pembayaran, atau aplikasi lain?",
      answer:
        "Integrasi dapat dirancang setelah penyedia, akses API resmi, biaya, batas penggunaan, keamanan, dan skenario gagal dipahami dengan jelas.",
    },
    {
      question: "Bagaimana dengan keamanan dan hak akses?",
      answer:
        "Jenis data, peran pengguna, kebutuhan login, riwayat aktivitas, backup, dan risiko akses dipetakan saat pemetaan kebutuhan. Kontrol final mengikuti sensitivitas data dan cakupan kerja yang disepakati.",
    },
    {
      question: "Berapa harga dan waktu pengembangan sistem?",
      answer:
        "Estimasi disusun setelah proses, modul, peran, data, integrasi, dan kriteria penerimaan dipahami. Versi awal biasanya bisa siap dalam 1 pekan setelah prioritas dan materi utama disepakati.",
    },
  ],
  closingTitle: "Proses operasionalmu mulai sulit dipantau?",
  closingDescription:
    "Bawa alur, formulir, atau spreadsheet yang sekarang digunakan. Kami membantu merapikan masalah utama dan menyusun versi awal sistem yang paling berdampak.",
};
