// Laporan Checkup Pro: isi (murni & teruji) lalu dirender ke PDF dengan penulis PDF sederhana.
// Sumbernya run TOPSIS berstatus RANKED milik pengguna; tidak ada matriks ahli (R) yang ditulis ke laporan.
import { instrument, type Decision } from "@/lib/decision-engine";
import { publicResult } from "@/lib/digital-checkup/public-result";
import { coursePreview } from "@/lib/digital-checkup/result-insight";
import { regions } from "@/lib/digital-checkup/regions";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";
import { buildActionPlan, type PlanWeek } from "./action-plan";
import { STATUS_LABEL, windowLabel, type RequestStatus } from "./request-schema";
import { createPdfWriter, PDF_COLORS } from "./pdf";

export interface ProReportSource {
  profile: Partial<BusinessProfile>;
  submittedAt: string | null;
  trace: Decision;
  consultation?: { status: RequestStatus; slots: { date: string; window: string }[]; topic: string } | null;
  generatedAt?: Date;
}

export type ConditionLevel = "Kuat" | "Cukup" | "Perlu dibenahi" | "Prioritas";
export interface ProReport {
  businessName: string;
  issuedAt: string;
  checkupDate: string;
  profileRows: [string, string][];
  conditions: { code: string; title: string; score: number; level: ConditionLevel; interpretation: string }[];
  gaps: { code: string; title: string; S: number; g: number; w: number; q: number }[];
  needSummary: string;
  ranking: { rank: number; code: string; title: string; C: number; reasons: string[]; output: string }[];
  plan: PlanWeek[];
  consultation: { status: string; slots: string[]; topic: string } | null;
}

const INTERPRETATION: Record<string, [strong: string, middle: string, low: string]> = {
  C1: ["Kamu sudah paham siapa pembeli utama dan alasan mereka memilihmu. Jaga dengan rutin mengecek masukan pelanggan.", "Gambaran pembeli dan penawaran sudah ada, tapi belum semuanya tertulis atau diuji ke pelanggan.", "Siapa pembeli utama dan alasan mereka memilihmu masih kabur. Ini fondasi yang perlu dirapikan lebih dulu."],
  C2: ["Kebutuhan administrasi sudah terpetakan dan arsipnya rapi. Pertahankan jadwal pengecekannya.", "Sebagian dokumen sudah ada, tapi tindak lanjut dan arsipnya belum rutin.", "Kebutuhan administrasi belum dipetakan. Mulai dari daftar hal yang perlu dikonfirmasi ke kanal resmi."],
  C3: ["Standar produk atau layananmu sudah jelas dan masukan pelanggan dipakai untuk perbaikan.", "Kualitas cukup terjaga, tapi standar dan cara memakai masukan pelanggan belum konsisten.", "Standar produk dan informasi penawaran perlu dipertegas supaya kualitasnya konsisten."],
  C4: ["Nama, pesan, dan tampilan usahamu sudah konsisten di kanal yang aktif.", "Identitas usaha sudah ada, tapi belum seragam di semua kanal dan materi promosi.", "Identitas dan pesan usaha belum konsisten, jadi orang lebih sulit mengenali dan mengingat usahamu."],
  C5: ["Kanal digitalmu sudah membantu orang bertanya dan membeli, dan hasilnya mulai diukur.", "Akun digital sudah ada, tapi alur pesanan, pengukuran hasil, atau keamanan aksesnya belum lengkap.", "Kehadiran online masih minim, jadi calon pembeli sulit menemukan info, lokasi, dan cara pesan."],
  C6: ["Kamu sudah punya ritme rutin untuk promosi, tindak lanjut, dan evaluasi.", "Rencana sudah berjalan, tapi belum rutin setiap minggu.", "Rencana sering terhenti di tengah jalan. Pilih target kecil dan jadwalkan pengecekan mingguan."],
  C7: ["Catatan transaksi, pemisahan uang, dan pembagian kerja sudah tertata.", "Pencatatan sudah dimulai, tapi pemisahan uang atau pembagian kerja belum rapi.", "Transaksi dan alur kerja harian belum tercatat rapi, sehingga kondisi usaha sulit dibaca."],
  C8: ["Waktu, penanggung jawab, dan kesiapan mencoba perbaikan sudah ada.", "Ada niat untuk berbenah, tapi waktu dan penanggung jawabnya belum dipastikan.", "Waktu dan penanggung jawab perbaikan belum disiapkan. Tentukan dulu siapa yang menjalankan rencana 30 hari."],
};

export function conditionLevel(score: number): ConditionLevel {
  return score >= 75 ? "Kuat" : score >= 50 ? "Cukup" : score >= 25 ? "Perlu dibenahi" : "Prioritas";
}
export function interpretCondition(code: string, score: number) {
  const copy = INTERPRETATION[code];
  if (!copy) return "";
  return score >= 75 ? copy[0] : score >= 50 ? copy[1] : copy[2];
}

const dateLabel = (value: string | Date | null | undefined) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Makassar" }).format(new Date(value)) : "-";
const slotDateLabel = (value: string) => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const ageLabel = (months?: number) => {
  if (months == null || !Number.isFinite(months)) return "-";
  const years = Math.floor(months / 12), rest = months % 12;
  return [years ? `${years} tahun` : "", rest || !years ? `${rest} bulan` : ""].filter(Boolean).join(" ");
};
const fixed = (value: number, digits: number) => (Number.isFinite(value) ? value : 0).toFixed(digits).replace(".", ",");

function locationLabel(profile: Partial<BusinessProfile>) {
  const province = regions.find((region) => region.code === profile.provinceCode);
  const city = province?.cities.find((item) => item.code === profile.cityCode);
  return [profile.district, city?.name, province?.name].map((item) => item?.trim()).filter(Boolean).join(", ") || "-";
}

export function proReportFileName(businessName: string) {
  const safe = businessName.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return `checkup-pro-${safe || "usaha-saya"}.pdf`;
}

/** Menyusun isi laporan Pro dari run RANKED. Melempar galat bila run belum berperingkat. */
export function buildProReport(source: ProReportSource): ProReport {
  const { trace, profile } = source;
  if (trace.status !== "RANKED" || !trace.ranking.length) throw new Error("Laporan Pro membutuhkan hasil checkup yang sudah berperingkat.");
  const dims = instrument.dimensions;
  const reasons = publicResult(trace).reasons as Record<string, string[]>;
  const gaps = dims.map((dimension, index) => ({ code: dimension.code, title: dimension.title, S: trace.S[index] ?? 0, g: trace.g[index] ?? 0, w: trace.w[index] ?? 0, q: trace.q[index] ?? 0 }));
  const topNeeds = [...gaps].sort((a, b) => b.q - a.q || a.code.localeCompare(b.code)).slice(0, 3).filter((item) => item.q > 0);
  const channels = profile.salesChannels?.filter(Boolean).join(", ");
  const social = [profile.instagram ? `Instagram ${profile.instagram}` : "", profile.tiktok ? `TikTok ${profile.tiktok}` : ""].filter(Boolean).join(" / ");
  return {
    businessName: profile.businessName?.trim() || "Usaha Saya",
    issuedAt: dateLabel(source.generatedAt ?? new Date()),
    checkupDate: dateLabel(source.submittedAt),
    profileRows: [
      ["Nama usaha", profile.businessName?.trim() || "-"],
      ["Bidang usaha", profile.sector?.trim() || "-"],
      ["Lokasi", locationLabel(profile)],
      ["Lama usaha", ageLabel(profile.businessAgeMonths)],
      ["Jumlah orang", profile.peopleCount ? `${profile.peopleCount} orang` : "-"],
      ["Peran pengisi", profile.respondentRole ?? "-"],
      ["Tempat berjualan", channels || "-"],
      ["Media sosial", social || "-"],
      ["Google Maps", profile.googleMaps?.trim() ? "Tautan sudah dicantumkan" : "Belum dicantumkan"],
      ["Target 30 hari", profile.goal?.trim() || "-"],
    ],
    conditions: dims.map((dimension, index) => {
      const score = Math.round(trace.S[index] ?? 0);
      return { code: dimension.code, title: dimension.title, score, level: conditionLevel(score), interpretation: interpretCondition(dimension.code, score) };
    }),
    gaps,
    needSummary: topNeeds.length
      ? `Kebutuhan terbesarmu ada di ${topNeeds.map((item) => `${item.title.toLowerCase()} (q ${fixed(item.q, 3)})`).join(", ")}. Bagian inilah yang paling memengaruhi urutan modul.`
      : "Belum ada celah yang menonjol pada delapan bagian usaha.",
    ranking: trace.ranking.map((item) => {
      const course = coursePreview(item.code), intervention = instrument.modules.find((module) => module.code === item.code);
      return { rank: item.rank, code: item.code, title: course?.title ?? intervention?.name ?? item.code, C: item.C, reasons: reasons[item.code] ?? [], output: course?.outcome ?? intervention?.output ?? "" };
    }),
    plan: buildActionPlan(trace.ranking, profile.goal ?? ""),
    consultation: source.consultation
      ? { status: STATUS_LABEL[source.consultation.status], slots: source.consultation.slots.map((slot) => `${slotDateLabel(slot.date)}, ${windowLabel(slot.window)}`), topic: source.consultation.topic }
      : null,
  };
}

export function createProReportPdf(report: ProReport) {
  const pdf = createPdfWriter({ header: "DEKATLOKAL / LAPORAN CHECKUP PRO", footer: "Checkup Pro DekatLokal - panduan pendampingan, bukan jaminan hasil usaha." });
  const { blue, white, navy } = PDF_COLORS;

  // Sampul
  pdf.rect(0, 0, pdf.width, 250, blue);
  pdf.text("DEKATLOKAL", pdf.left, 48, 11, true, white);
  pdf.text("Laporan Checkup Pro", pdf.left, 104, 28, true, white);
  pdf.text(report.businessName, pdf.left, 136, 15, false, white);
  pdf.text(`Checkup dikirim: ${report.checkupDate}`, pdf.left, 176, 9, false, white);
  pdf.text(`Laporan dibuat: ${report.issuedAt}`, pdf.left, 192, 9, false, white);
  pdf.text("Skor 8 bagian usaha - kebutuhan - urutan 7 modul - rencana 30 hari - konsultasi", pdf.left, 224, 8.5, false, white);
  pdf.top = 285;
  pdf.heading("Isi laporan", 14, 0);
  ["1. Profil usaha", "2. Kondisi 8 bagian usaha", "3. Celah dan kebutuhan (S, g, w, q)", "4. Urutan lengkap 7 modul", "5. Rencana aksi 30 hari", "6. Jadwal konsultasi"].forEach((item) => pdf.paragraph(item, 10.5, navy, 2));
  pdf.space(6);
  pdf.paragraph("Laporan ini disusun dari jawaban Digital Checkup dan model penilaian tiga ahli (Fuzzy AHP + TOPSIS). Angka di dalamnya membantu memilih urutan belajar dan langkah kerja, bukan peluang sukses atau jaminan hasil usaha.", 9.5);

  // 1. Profil
  pdf.newPage();
  pdf.heading("1. Profil usaha");
  pdf.table([{ label: "Data", width: 30 }, { label: "Isi", width: 70 }], report.profileRows, 9);

  // 2. Kondisi
  pdf.heading("2. Kondisi 8 bagian usaha");
  pdf.paragraph("Nilai 0-100 dihitung dari 4 pertanyaan per bagian. Kuat = 75 ke atas, Cukup = 50-74, Perlu dibenahi = 25-49, Prioritas = di bawah 25.", 9);
  for (const item of report.conditions) pdf.meter(`${item.code} - ${item.title} (${item.level})`, item.score, item.interpretation);

  // 3. Gap
  pdf.heading("3. Celah dan kebutuhan");
  pdf.paragraph("S = nilai kondisi (0-100). g = celah, yaitu 1 - S/100; makin besar makin perlu dibenahi. w = bobot kepentingan bagian dari penilaian tiga ahli (sama untuk semua UMKM). q = bobot kebutuhanmu, yaitu w x g yang dinormalkan sehingga totalnya 1.", 9);
  pdf.table(
    [{ label: "Bagian usaha", width: 40 }, { label: "S", width: 13, align: "right" }, { label: "g", width: 15, align: "right" }, { label: "w", width: 15, align: "right" }, { label: "q", width: 17, align: "right" }],
    report.gaps.map((item) => [`${item.code} ${item.title}`, fixed(item.S, 1), fixed(item.g, 3), fixed(item.w, 3), fixed(item.q, 3)]),
  );
  pdf.paragraph(report.needSummary, 9.5, navy);

  // 4. Ranking
  pdf.heading("4. Urutan lengkap 7 modul");
  pdf.paragraph("C = kedekatan relatif modul dengan kebutuhan idealmu (0-1). Makin tinggi, makin cocok modul itu dikerjakan lebih dulu. Alasan menunjukkan bagian usaha dengan kebutuhan terbesar yang dinilai ahli sangat relevan dengan modul tersebut.", 9);
  pdf.table(
    [{ label: "#", width: 6 }, { label: "Modul", width: 30 }, { label: "C", width: 11, align: "right" }, { label: "Alasan utama", width: 53 }],
    report.ranking.map((item) => [String(item.rank), `${item.code} ${item.title}`, fixed(item.C, 4), item.reasons.length ? `Membantu ${item.reasons.map((reason) => reason.toLowerCase()).join(" dan ")}. Hasil: ${item.output}` : `Hasil: ${item.output}`]),
  );

  // 5. Rencana aksi
  pdf.heading("5. Rencana aksi 30 hari", 16, 220);
  pdf.paragraph("Disusun dari tiga modul teratas. Kerjakan satu minggu satu fokus; boleh digeser, asal urutannya tetap.", 9);
  for (const week of report.plan) {
    pdf.label(`Minggu ${week.week} - ${week.days}`);
    pdf.heading(week.focus, 12, 40);
    week.tasks.forEach((task) => pdf.bullet(task.text));
    pdf.paragraph(`Tanda selesai: ${week.done}`, 9, navy, 14, 14);
  }

  // 6. Konsultasi
  pdf.heading("6. Jadwal konsultasi", 16, 150);
  if (report.consultation) {
    pdf.paragraph(`Status: ${report.consultation.status}. Admin akan mengonfirmasi satu jadwal lewat WhatsApp.`, 9.5, navy);
    report.consultation.slots.forEach((slot, index) => pdf.bullet(`Pilihan ${index + 1}: ${slot}`));
    pdf.paragraph(`Topik: ${report.consultation.topic}`, 9.5);
  } else {
    pdf.paragraph("Konsultasi online 30 menit sudah termasuk dalam Checkup Pro. Pilih tiga jadwal (WITA) di halaman Layanan Pro: digitalcheckup.dekatlokal.com/layanan-pro. Admin akan mengonfirmasi satu jadwal lewat WhatsApp.", 9.5, navy);
  }
  pdf.paragraph("Bawa catatan dari rencana aksi minggu ini ke sesi konsultasi supaya waktunya terpakai untuk hal yang paling kamu butuhkan.", 9);
  return pdf.output();
}
