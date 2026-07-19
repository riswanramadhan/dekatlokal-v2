import type {
  Answers,
  QuestionGroup,
} from "@/components/assessment/types";
import { calculateGroupScores, toPercent } from "./scoring";

export const CTA_SCORE_THRESHOLD = 60;
export const LOW_SCORE_THRESHOLD = 60;

const CATEGORY_ICONS: Record<string, string> = {
  product: "mdi:package-variant",
  branding: "mdi:palette-outline",
  digitalization: "mdi:google-maps",
  consistency: "mdi:chart-timeline-variant",
  operations: "mdi:cog-outline",
  commitment: "mdi:handshake-outline",
};

const CATEGORY_RECOMMENDATIONS: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  product: {
    title: "Persiapan Produk",
    description:
      "Pastikan produk sudah aktif dijual, harga konsisten, dan stok atau sistem pre-order jelas sebelum go digital.",
    icon: "mdi:package-variant",
  },
  branding: {
    title: "Identitas Brand",
    description:
      "Buat nama brand tetap, logo, dan tampilan visual yang konsisten agar bisnis lebih mudah dikenali pelanggan.",
    icon: "mdi:palette-outline",
  },
  consistency: {
    title: "Konsistensi Digital",
    description:
      "Aktifkan kembali media sosial bisnis dan rutin mengunggah konten agar pelanggan tetap terhubung.",
    icon: "mdi:chart-timeline-variant",
  },
  operations: {
    title: "Kesiapan Operasional",
    description:
      "Sediakan metode pembayaran digital dan pastikan sistem pemesanan serta pengiriman sudah berjalan.",
    icon: "mdi:cog-outline",
  },
  commitment: {
    title: "Komitmen Pemilik",
    description:
      "Siapkan diri untuk mengelola website, memperbarui informasi secara berkala, dan terus belajar secara digital.",
    icon: "mdi:handshake-outline",
  },
  digitalization: {
    title: "Google Business",
    description:
      "Daftarkan bisnis di Google Maps / Google Business agar mudah ditemukan pelanggan dan meningkatkan kredibilitas digital.",
    icon: "mdi:google-maps",
  },
  "digital-presence": {
    title: "Jejak Digital",
    description:
      "Daftarkan bisnis di Instagram, TikTok, dan Google Business untuk memulai jejak digital. Sertakan username saat checkup agar skor terisi otomatis.",
    icon: "mdi:cellphone-link",
  },
};

export interface CategoryItem {
  id: string;
  label: string;
  percent: number;
  earned: number;
  max: number;
  icon: string;
}

export interface ResultRecommendation {
  title: string;
  description: string;
  icon: string;
  percent: number;
  priority: "high" | "medium";
}

export function buildCategoryBreakdown(
  questionGroups: QuestionGroup[],
  answers: Answers,
  digitalEarned: number,
  digitalMax: number,
): CategoryItem[] {
  const categories = questionGroups
    .filter((group) =>
      group.questions.some(
        (question) => question.options && question.options.length > 0,
      ),
    )
    .map((group) => {
      const { earned, max } = calculateGroupScores(
        [group.id],
        questionGroups,
        answers,
      );

      return {
        id: group.id,
        label: group.sidebarTitle,
        percent: toPercent(earned, max),
        earned,
        max,
        icon: CATEGORY_ICONS[group.id] ?? "mdi:help-circle-outline",
      };
    });

  categories.push({
    id: "digital-presence",
    label: "Jejak Digital",
    percent: toPercent(digitalEarned, digitalMax),
    earned: digitalEarned,
    max: digitalMax,
    icon: "mdi:cellphone-link",
  });

  return categories;
}

export function getRecommendations(
  categories: CategoryItem[],
): ResultRecommendation[] {
  return categories
    .filter(
      (category) =>
        category.percent < LOW_SCORE_THRESHOLD &&
        CATEGORY_RECOMMENDATIONS[category.id],
    )
    .sort((a, b) => a.percent - b.percent)
    .map((category) => ({
      ...CATEGORY_RECOMMENDATIONS[category.id],
      percent: category.percent,
      priority: category.percent < 30 ? "high" : "medium",
    }));
}

export function getScoreCategory(score: number) {
  if (score >= 80) {
    return {
      label: "Sangat Siap",
      color: "text-success",
      bg: "bg-success/10",
      barColor: "bg-success",
      icon: "mdi:star-circle",
    };
  }

  if (score >= 60) {
    return {
      label: "Siap",
      color: "text-primary",
      bg: "bg-primary/10",
      barColor: "bg-primary",
      icon: "mdi:thumb-up",
    };
  }

  if (score >= 40) {
    return {
      label: "Cukup Siap",
      color: "text-warning",
      bg: "bg-warning/10",
      barColor: "bg-warning",
      icon: "mdi:progress-clock",
    };
  }

  return {
    label: "Perlu Persiapan",
    color: "text-warning",
    bg: "bg-warning/10",
    barColor: "bg-warning",
    icon: "mdi:alert-circle",
  };
}

export function getBarColor(percent: number): string {
  if (percent >= 80) return "bg-success";
  if (percent >= 60) return "bg-primary";
  return "bg-warning";
}

export function getResultCtaConfig(score: number, businessName: string) {
  const isReady = score >= CTA_SCORE_THRESHOLD;

  return {
    isReady,
    config: isReady
      ? {
          badge: {
            icon: "mdi:rocket-launch-outline",
            text: "Langkah Selanjutnya",
            color: "text-success",
            bg: "bg-success/10",
          },
          heading: `${businessName.toUpperCase()}, SIAP MEMILIKI WEBSITE`,
          body: `Berdasarkan hasil Digital Checkup, ${businessName} sudah berada di tahap siap digital dan dapat masuk tahap website.`,
          primaryLabel:
            "Hubungi Tim DekatLokal via WhatsApp untuk Verifikasi",
          whatsappMessage: `Halo Tim DekatLokal!\n\nSaya baru saja menyelesaikan Digital Checkup UMKM untuk bisnis *${businessName}* dan mendapatkan skor *${score}/100* dengan kategori Siap.\n\nSaya ingin melanjutkan ke tahap verifikasi untuk memiliki website.`,
        }
      : {
          badge: {
            icon: "mdi:school-outline",
            text: "Langkah Selanjutnya",
            color: "text-warning",
            bg: "bg-warning/10",
          },
          heading: `${businessName.toUpperCase()}, PERLU PERSIAPAN SEBELUM WEBSITE`,
          body: "Website akan lebih optimal jika beberapa dasar digital disiapkan lebih dulu. Tim DekatLokal dapat membantu melalui pembinaan digital dasar yang sesuai hasil Checkup.",
          primaryLabel:
            "Hubungi Tim DekatLokal via WhatsApp untuk Mulai Pembinaan Digital Dasar",
          whatsappMessage: `Halo Tim DekatLokal!\n\nSaya baru saja menyelesaikan Digital Checkup UMKM untuk bisnis *${businessName}* dan mendapatkan skor *${score}/100*.\n\nSaya tertarik mengikuti program pembinaan digital dasar agar bisnis saya siap memiliki website.`,
        },
  };
}
