import { instrument } from "@/lib/decision-engine";
import { freeCourses } from "./curriculum";
import { websiteProgramPotential } from "./regions";
import type { BusinessProfile } from "./validation";

export type ResultInsight = {
  strongest: { code: string; title: string; score: number; story: string };
  focus: { code: string; title: string; score: number; story: string };
  overview: string;
  website: { state: "ready" | "prepare" | "learning"; title: string; description: string };
};

const strengthCopy: Record<string, string> = {
  C1: "Arah usaha dan nilai yang kamu tawarkan sudah cukup kebaca.",
  C2: "Kebiasaan merapikan administrasi sudah jadi modal yang baik.",
  C3: "Produk atau layananmu punya dasar yang cukup kuat untuk dikembangkan.",
  C4: "Identitas dan tampilan usahamu sudah mulai mudah dikenali.",
  C5: "Kanal digitalmu sudah cukup siap membantu pelanggan menemukan usaha.",
  C6: "Kamu sudah punya ritme untuk menjalankan rencana secara rutin.",
  C7: "Cara kerja harian usahamu sudah cukup tertata.",
  C8: "Kesiapanmu untuk belajar dan mencoba perbaikan jadi modal utama.",
};

const focusCopy: Record<string, string> = {
  C1: "Mulai dengan memperjelas siapa pelanggan utama dan alasan mereka memilihmu.",
  C2: "Buat daftar dokumen, status, dan langkah lanjut supaya administrasi nggak tercecer.",
  C3: "Rapikan standar produk atau layanan agar kualitasnya lebih konsisten.",
  C4: "Samakan nama, pesan, foto, dan tampilan di kanal yang aktif.",
  C5: "Lengkapi profil digital dan buat jalur bertanya atau membeli yang jelas.",
  C6: "Pilih satu target kecil, masukkan ke jadwal, lalu cek hasilnya tiap minggu.",
  C7: "Mulai dari catatan transaksi dan alur kerja yang paling sering dipakai.",
  C8: "Siapkan waktu, penanggung jawab, dan satu perubahan yang siap dicoba.",
};

export function resultInsight(scores: number[], profile: BusinessProfile): ResultInsight {
  const ranked = instrument.dimensions.map((dimension, index) => ({ code: dimension.code, title: dimension.title, score: Number.isFinite(scores[index]) ? scores[index] : 0 }));
  const strongest = [...ranked].sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))[0];
  const focus = [...ranked].sort((a, b) => a.score - b.score || a.code.localeCompare(b.code))[0];
  const profileReady = scores[0] >= 50 && Boolean(profile.businessName?.trim() && profile.email?.trim() && profile.whatsapp?.trim());
  const inProgramArea = websiteProgramPotential(profile.provinceCode, profile.cityCode);
  const website = inProgramArea && profileReady
    ? { state: "ready" as const, title: "Siap masuk tahap verifikasi website gratis", description: "Lokasi dan profil dasarmu sudah siap. Tim DekatLokal tetap akan mengecek syarat serta kuota program sebelum menyetujui." }
    : inProgramArea
      ? { state: "prepare" as const, title: "Daerahmu masuk, profil dasarnya tinggal dirapikan", description: "Mulai dari modul Website untuk memperjelas pelanggan, penawaran, katalog, dan kontak sebelum tahap verifikasi." }
      : { state: "learning" as const, title: "Modul Website tetap bisa kamu pelajari", description: "Program pembuatan website mengikuti wilayah dan kuota. Semua UMKM tetap bisa membuka materi Website selama masa akses gratis." };
  return {
    strongest: { ...strongest, story: strengthCopy[strongest.code] },
    focus: { ...focus, story: focusCopy[focus.code] },
    overview: strongest.code === focus.code ? "Kondisi usahamu terlihat cukup merata. Pilih satu langkah yang paling dekat dengan target 30 harimu." : `Modal terbaikmu ada di ${strongest.title.toLowerCase()}. Supaya langkah berikutnya lebih terasa, mulai bereskan ${focus.title.toLowerCase()} lebih dulu.`,
    website,
  };
}

export function coursePreview(code: string) {
  return freeCourses.find((course) => course.code === code);
}
