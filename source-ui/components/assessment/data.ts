import { QuestionGroup } from "./types";

export const questionGroups: QuestionGroup[] = [
  {
    id: "identity",
    sidebarTitle: "Identitas",
    title: "Identitas Usaha",
    description: "Isi data dasar UMKM dengan benar agar DekatLokal dapat memahami profil usaha, lokasi, dan kebutuhan digital bisnis Anda.",
    questions: [
      {
        id: "umkm-name",
        type: "text",
        question: "Nama UMKM",
        placeholder: "Tulis jawaban di sini",
        textInput: {
          autoComplete: "organization",
          autoCapitalize: "words",
        },
        required: true,
      },
      {
        id: "owner-name",
        type: "text",
        question: "Nama Pemilik",
        placeholder: "Tulis jawaban di sini",
        textInput: {
          autoComplete: "name",
          autoCapitalize: "words",
        },
        required: true,
      },
      {
        id: "whatsapp",
        type: "text",
        question: "Nomor WhatsApp",
        placeholder: "Tulis nomor WhatsApp",
        helper: "Format: 0821234567 atau +6282123456789",
        textInput: {
          type: "tel",
          autoComplete: "tel",
          inputMode: "tel",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: true,
        validator: {
          pattern: /^(0|\+62)[0-9]{9,14}$/,
          customValidator: (value: string) => {
            const digits = value.replace(/\D/g, "");
            if (digits.length < 10) {
              return { valid: false, message: "Nomor WhatsApp minimal 10 angka" };
            }
            if (digits.length > 15) {
              return { valid: false, message: "Nomor WhatsApp maksimal 15 angka" };
            }
            return { valid: true, message: "" };
          },
        },
      },
      {
        id: "email",
        type: "text",
        question: "Email",
        placeholder: "Tulis email aktif",
        textInput: {
          type: "email",
          autoComplete: "email",
          inputMode: "email",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: true,
        validator: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      },
    ],
  },
  {
    id: "legality",
    sidebarTitle: "Legalitas",
    title: "Legalitas Usaha",
    description: "Informasi legalitas membantu melihat kesiapan administrasi usaha, termasuk ketersediaan dokumen dasar seperti NIB.",
    questions: [
      {
        id: "nib",
        type: "single",
        question: "Apakah UMKM Anda sudah memiliki NIB?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
    ],
  },
  {
    id: "product",
    sidebarTitle: "Produk",
    title: "Kesiapan Produk",
    description: "Website bekerja lebih efektif ketika produk aktif dijual, harga jelas, dan sistem stok atau pre-order sudah dipahami.",
    questions: [
      {
        id: "product-active",
        type: "single",
        question: "Apakah produk sudah dijual secara aktif?",
        options: [
          { id: "yes", label: "Sudah aktif", score: 1.5 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "product-price-clear",
        type: "single",
        question: "Apakah harga produk sudah jelas dan konsisten?",
        options: [
          { id: "yes", label: "Jelas dan konsisten", score: 1 },
          { id: "sometimes", label: "Masih berubah", score: 0.5 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "product-stock-system",
        type: "single",
        question: "Apakah produk memiliki stok atau sistem pre-order yang jelas?",
        options: [
          { id: "ready-stock", label: "Ready stock", score: 0.5 },
          { id: "pre-order", label: "Pre-Order", score: 0.5 },
          { id: "both", label: "Keduanya", score: 0.5 },
        ],
        required: true,
      },
    ],
  },
  {
    id: "branding",
    sidebarTitle: "Branding",
    title: "Identitas Brand",
    description: "Bagian ini melihat kesiapan nama brand, logo, dan konsistensi visual yang digunakan pada produk maupun kanal digital.",
    questions: [
      {
        id: "brand-name",
        type: "single",
        question: "Apakah UMKM Anda sudah memiliki nama brand yang tetap?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "brand-logo",
        type: "single",
        question: "Apakah UMKM Anda sudah memiliki logo usaha?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "brand-visual-consistency",
        type: "single",
        question: "Apakah kemasan atau tampilan visual produk sudah konsisten?",
        options: [
          { id: "yes", label: "Konsisten", score: 1 },
          { id: "partial", label: "Sebagian", score: 0.5 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
    ],
  },
  {
    id: "digitalization",
    sidebarTitle: "Digitalisasi",
    title: "Jejak Digital Bisnis",
    description: "Masukkan kanal digital yang aktif agar hasil Checkup dapat membaca kehadiran bisnis Anda di platform publik yang relevan.",
    questions: [
      {
        id: "instagram-username",
        type: "text",
        question: "Username Instagram Bisnis",
        helper: "Format: dekatlokal",
        placeholder: "Masukkan username tanpa @",
        textInput: {
          autoComplete: "off",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: false,
        validator: {
          pattern: /^[a-zA-Z0-9._-]{3,30}$/,
          minLength: 3,
          maxLength: 30,
        },
      },
      {
        id: "tiktok-username",
        type: "text",
        question: "Username TikTok Bisnis",
        helper: "Format: dekatlokal",
        placeholder: "Masukkan username tanpa @",
        textInput: {
          autoComplete: "off",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: false,
        validator: {
          pattern: /^[a-zA-Z0-9._-]{3,30}$/,
          minLength: 3,
          maxLength: 30,
        },
      },
      {
        id: "google-business-url",
        type: "text",
        question: "Link Google Maps Bisnis",
        placeholder: "Masukkan link Google Maps",
        helper: "Gunakan link Google Maps seperti https://maps.app.goo.gl/xxx atau https://www.google.com/maps/place/xxx",
        textInput: {
          type: "url",
          autoComplete: "url",
          inputMode: "url",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: false,
        validator: {
          customValidator: (value: string) => {
            // Allow empty (optional field)
            if (!value || value.trim() === "") {
              return { valid: true, message: "" };
            }

            // Check if it's a valid URL
            try {
              const url = new URL(value);
              const hostname = url.hostname.toLowerCase();
              
              // Accept Google Maps URLs and shortened URLs
              if (
                hostname.includes("google.com") ||
                hostname.includes("maps.app.goo.gl") ||
                hostname.includes("goo.gl")
              ) {
                return { valid: true, message: "" };
              }

              return { 
                valid: false, 
                message: "Link harus berupa URL Google Maps (google.com/maps atau maps.app.goo.gl)" 
              };
            } catch {
              return { 
                valid: false, 
                message: "Format URL tidak valid. Pastikan URL dimulai dengan https://" 
              };
            }
          },
        },
      },
      // ── Temporary manual fallback for Google Business scoring ──────────
      // Added while GOOGLE_PLACES_API_KEY is unavailable.
      // These 4 questions mirror the 4 scraped scoring rules in scoring.ts
      // (gb-exists, gb-reviews, gb-rating, gb-website), each worth 1 point.
      // When Google scraping is re-enabled (GOOGLE_SCRAPING_ENABLED = true
      // in scoring.ts), remove ALL questions below with "gb-manual-" prefix.
      {
        id: "gb-manual-registered",
        type: "single",
        question: "Apakah bisnis Anda sudah terdaftar di Google Maps?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "gb-manual-reviews",
        type: "single",
        question: "Apakah bisnis Anda sudah memiliki ulasan dari pelanggan di Google?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "gb-manual-rating",
        type: "single",
        question: "Berapa rata-rata rating bisnis Anda di Google?",
        options: [
          { id: "above-4", label: "≥ 4.0 bintang", score: 1 },
          { id: "below-4", label: "< 4.0 bintang", score: 0 },
          { id: "unknown", label: "Tidak tahu / belum ada", score: 0 },
        ],
        required: true,
      },
      {
        id: "facebook",
        type: "single",
        question: "Apakah UMKM Anda sudah memiliki halaman Facebook untuk bisnis?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "whatsapp-business",
        type: "single",
        question: "Apakah Anda menggunakan WhatsApp Business untuk berkomunikasi dengan pelanggan?",
        options: [
          { id: "yes", label: "Menggunakan", score: 1 },
          { id: "no", label: "Tidak menggunakan", score: 0 },
        ],
        required: true,
      },
      {
        id: "e-commerce-platform",
        type: "multiple",
        question: "Platform e-commerce apa yang digunakan untuk menjual produk secara online?",
        options: [
          { id: "shopee", label: "Shopee", score: 0.5 },
          { id: "tokopedia", label: "Tokopedia", score: 0.5 },
          { id: "bukalapak", label: "Bukalapak", score: 0.5 },
          { id: "lazada", label: "Lazada", score: 0.5 },
          { id: "blibli", label: "Blibli", score: 0.5 },
          { id: "tiktok_shop", label: "TikTok Shop", score: 0.5 },
          { id: "e-commerce-lainnya", label: "Platform e-commerce lainnya", score: 0.5 },
        ],
        required: false,
      },
      {
        id: "e-commerce-platform-other",
        type: "text",
        question: "Sebutkan platform e-commerce lainnya",
        placeholder: "Shopify, WooCommerce, website sendiri",
        helper: "Isi jika Anda memilih \"Platform e-commerce lainnya\" di atas.",
        textInput: {
          autoComplete: "off",
          autoCapitalize: "none",
          autoCorrect: "off",
          spellCheck: false,
        },
        required: false,
        validator: {
          maxLength: 100,
        },
      }
    ],
  },
  {
    id: "consistency",
    sidebarTitle: "Konsistensi",
    title: "Konsistensi Aktivitas Digital",
    description: "Bagian ini melihat aktivitas bisnis di kanal digital dan kebiasaan berkomunikasi dengan pelanggan secara rutin.",
    questions: [
      {
        id: "social-media-activity",
        type: "single",
        question: "Apakah akun media sosial bisnis masih aktif dalam 1-3 bulan terakhir?",
        options: [
          { id: "active", label: "Aktif", score: 1 },
          { id: "inactive", label: "Tidak", score: 0 },
        ],
        required: true,
      },
      {
        id: "social-media-consistency",
        type: "single",
        question: "Apakah UMKM Anda rutin mengunggah konten?",
        options: [
          { id: "regular", label: "Rutin", score: 1 },
          { id: "sometimes", label: "Kadang", score: 0.5 },
          { id: "never", label: "Tidak", score: 0 },
        ],
        required: true,
      }
    ],
  },
  {
    id: "operations",
    sidebarTitle: "Operasional",
    title: "Kesiapan Operasional",
    description: "Bagian ini melihat kesiapan metode pembayaran, pengiriman, dan jalur pemesanan yang digunakan pelanggan.",
    questions: [
      {
        id: "payment-method",
        type: "single",
        question: "Metode pembayaran apa yang disediakan untuk pelanggan?",
        options: [
          { id: "cash", label: "Tunai", score: 0.3 },
          { id: "qris-transfer", label: "QRIS/Transfer", score: 1 },
          { id: "both", label: "Keduanya", score: 1 },
        ],
        required: true,
      },
      {
        id: "order-delivery",
        type: "single",
        question: "Apakah UMKM Anda sudah terbiasa mengirim pesanan ke pelanggan?",
        options: [
          { id: "yes", label: "Sudah", score: 1 },
          { id: "no", label: "Belum", score: 0 },
        ],
        required: true,
      },
      {
        id: "order-channel",
        type: "single",
        question: "Melalui channel apa pelanggan biasanya melakukan pemesanan?",
        // helper: "Pilih semua yang sesuai",
        options: [
          { id: "whatsapp", label: "Chat WhatsApp", score: 1 },
          { id: "in-store", label: "Hanya langsung di toko", score: 0.3 },
          { id: "social-media", label: "DM media sosial", score: 1 },
        ],
        required: true,
      },
    ],
  },
  {
    id: "commitment",
    sidebarTitle: "Komitmen",
    title: "Komitmen Pengelolaan",
    description: "Bagian ini melihat kesiapan pemilik usaha untuk mengelola informasi, memperbarui produk, dan merawat website setelah diluncurkan.",
    questions: [
      {
        id: "manage-website",
        type: "single",
        question: "Saya siap mengelola website UMKM saya",
        options: [
          { id: "yes", label: "Ya, Siap", score: 1 },
          { id: "no", label: "Tidak Siap", score: 0 },
        ],
        required: true,
      },
      {
        id: "update-information",
        type: "single",
        question: "Saya siap memperbarui informasi dan produk secara berkala",
        options: [
          { id: "yes", label: "Ya, Siap", score: 1 },
          { id: "no", label: "Tidak Siap", score: 0 },
        ],
        required: true,
      },
      {
        id: "learn-and-grow",
        type: "single",
        question: "Saya siap belajar dan berkembang secara digital",
        options: [
          { id: "yes", label: "Ya, Siap", score: 1 },
          { id: "no", label: "Tidak Siap", score: 0 },
        ],
        required: true,
      },
    ],
  },
];

// ── Scoring Utilities ──────────────────────────────────────

/**
 * Calculate the maximum possible score from manual questions.
 * This dynamically calculates max per question type:
 * - single: highest option score
 * - multiple: sum of all option scores
 * ensuring consistency with questionGroups data.
 * 
 * @returns Maximum possible score from all manual checkup questions
 */
export function calculateManualMaxScore(): number {
  let maxScore = 0;

  for (const group of questionGroups) {
    for (const question of group.questions) {
      if (question.options && question.options.length > 0) {
        const questionMax = question.type === "multiple"
          ? question.options.reduce((sum, option) => sum + option.score, 0)
          : question.options.reduce((max, option) => Math.max(max, option.score), 0);

        maxScore += questionMax;
      }
    }
  }

  // Round to 1 decimal to guard against floating-point accumulation errors
  return Math.round(maxScore * 10) / 10;
}

/**
 * Get the maximum possible score, calculated once and cached.
 * Use this constant for consistent scoring across the application.
 */
export const MANUAL_MAX_SCORE = calculateManualMaxScore();
