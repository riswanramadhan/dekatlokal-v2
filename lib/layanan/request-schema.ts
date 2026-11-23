// Skema permintaan layanan berbayar (konsultasi, GBP, Website Care). Murni dan aman di client:
// dipakai form untuk umpan balik cepat dan di server sebagai validasi yang dipercaya.
import { z } from "zod";
import type { Feature, ProductCode } from "@/lib/commerce/catalog";

export const REQUEST_KINDS = ["consultation", "gbp", "website_care"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];
export const REQUEST_STATUSES = ["new", "scheduled", "in_progress", "done", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const OPEN_STATUSES: RequestStatus[] = ["new", "scheduled", "in_progress"];

export const KIND_LABEL: Record<RequestKind, string> = { consultation: "Konsultasi Checkup Pro", gbp: "Optimasi Google Business Profile", website_care: "Website Care" };
export const STATUS_LABEL: Record<RequestStatus, string> = { new: "Baru masuk", scheduled: "Terjadwal", in_progress: "Sedang dikerjakan", done: "Selesai", cancelled: "Dibatalkan" };
/** Fitur hak akses yang wajib aktif sebelum permintaan boleh dibuat. */
export const FEATURE_FOR_KIND: Record<RequestKind, Feature> = { consultation: "checkup_pro", gbp: "gbp", website_care: "website_care" };
export const PRODUCT_FOR_KIND: Record<RequestKind, ProductCode> = { consultation: "checkup_pro", gbp: "gbp_optimization", website_care: "website_care_monthly" };

export const TIME_WINDOWS = [
  ["09-11", "09.00–11.00"],
  ["11-13", "11.00–13.00"],
  ["13-15", "13.00–15.00"],
  ["15-17", "15.00–17.00"],
  ["19-21", "19.00–21.00"],
] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number][0];
export const windowLabel = (value: string) => `${TIME_WINDOWS.find(([code]) => code === value)?.[1] ?? value} WITA`;
/** Jadwal konsultasi paling cepat besok dan paling lambat 45 hari ke depan (zona WITA). */
export const BOOKING_HORIZON_DAYS = 45;

export const GBP_PROBLEMS = [
  "Usaha belum muncul di Google Maps",
  "Profil tidak bisa diakses / dikelola orang lain",
  "Alamat, jam buka, atau kontak salah",
  "Foto sedikit atau kurang jelas",
  "Ulasan belum dibalas atau ada ulasan buruk",
  "Produk/menu belum tampil",
] as const;
export const MANAGER_ACCESS = [["bisa", "Bisa, saya pemilik/pengelola profilnya"], ["tidak_bisa", "Belum bisa, profil belum saya pegang"], ["belum_tahu", "Belum tahu caranya"]] as const;
export const WEBSITE_PLATFORMS = [["dekatlokal", "Website dari DekatLokal"], ["wordpress", "WordPress"], ["wix", "Wix"], ["shopify", "Shopify"], ["blogger", "Blogger"], ["google_sites", "Google Sites"], ["lainnya", "Lainnya"], ["tidak_tahu", "Tidak tahu"]] as const;
export const ACCESS_METHODS = [
  ["undang_editor", "Saya bisa mengundang email tim DekatLokal sebagai editor/admin"],
  ["panduan_whatsapp", "Mohon dipandu lewat WhatsApp untuk berbagi akses dengan aman"],
  ["dashboard_dekatlokal", "Website dibuat di DekatLokal (tidak perlu akses tambahan)"],
  ["belum_tahu", "Belum tahu, perlu dibantu cek"],
] as const;

const codes = <T extends readonly (readonly [string, string])[]>(items: T) => items.map(([code]) => code) as [T[number][0], ...T[number][0][]];

// Formulir tidak pernah boleh menampung kata sandi atau kode. Tiga bentuk yang ditolak:
// 1) kata kunci + ":" / "=" ("password: …", "sandi = …", "OTP : 123456");
// 2) PIN/OTP/kode verifikasi + 4–8 digit tanpa tanda baca ("PIN 123456");
// 3) kata sandi + spasi + satu kata yang mirip sandi: memuat angka/simbol, atau menjadi kata
//    terakhir kalimat dan bukan kata biasa ("password mysecret"). Kalimat wajar seperti
//    "tolong reset kata sandi admin" atau "pin lokasi salah" tetap boleh.
const SECRET_ASSIGN = /\b(?:pass(?:word)?|passcode|pwd|kata\s*sandi|sandi|pin|otp)(?:-?nya)?\s*[:=]/i;
const SECRET_CODE = /\b(?:pin|otp|kode\s+(?:otp|verifikasi|akses|pin))(?:-?nya)?\s+(?:(?:adalah|ialah|is)\s+)?\d{4,8}\b/i;
const SECRET_WORD = /\b(?:password|passcode|pwd|kata\s*sandi|sandi)(?:-?nya)?\s+(?:(?:adalah|ialah|is|saya|admin|login|akun|email|wifi|wp|website|web)\s+)?([^\s,;!?]+)([^\n]*)/gi;
const COMMON_WORDS = new Set(["admin", "akun", "atau", "bantu", "baru", "belum", "benar", "berubah", "bisa", "dari", "default", "diganti", "direset", "dulu", "email", "hilang", "jadi", "juga", "kami", "kamu", "kuat", "lagi", "lama", "lemah", "login", "lupa", "masuk", "mohon", "reset", "salah", "saya", "sementara", "sudah", "tidak", "tolong", "untuk", "website", "wordpress", "yang"]);

export function looksLikeSecret(value: string) {
  if (SECRET_ASSIGN.test(value) || SECRET_CODE.test(value)) return true;
  for (const [, raw, rest] of value.matchAll(SECRET_WORD)) {
    const word = raw.replace(/\.+$/, "");
    if (word.length < 4 || COMMON_WORDS.has(word.toLowerCase())) continue;
    if (/[\d@#$%^&*_+=~!]/.test(word)) return true;
    const endsClause = raw.endsWith(".") || /^\s*(?:$|[,;!?])/.test(rest);
    if (endsClause) return true;
  }
  return false;
}
const secretMessage = "Jangan tulis kata sandi atau kode di formulir. Admin akan memandu berbagi akses yang aman lewat WhatsApp.";
const text = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`).refine((value) => !looksLikeSecret(value), secretMessage);
const required = (max: number, message = "Bagian ini perlu diisi.") => text(max).refine((value) => value.length > 0, message);
const whatsapp = z.string().trim().transform((value) => value.replace(/[\s-]/g, "")).refine((value) => /^(?:\+?62|0)8\d{7,11}$/.test(value), "Masukkan nomor WhatsApp aktif, misalnya 081234567890.");

const MAPS_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.page", "g.co", "maps.google.com", "www.google.com", "google.com", "maps.google.co.id", "www.google.co.id", "google.co.id"];
export const isGoogleMapsUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" && MAPS_HOSTS.includes(url.hostname); } catch { return false; }
};
const isWebUrl = (value: string) => {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && url.hostname.includes("."); } catch { return false; }
};

/** Tanggal hari ini di zona WITA (Asia/Makassar) dalam format YYYY-MM-DD. */
export const witaDate = (now: Date = new Date(), addDays = 0) => new Date(now.getTime() + addDays * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
const validDate = (value: string) => { const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; };

const slotSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal."), window: z.enum(codes(TIME_WINDOWS), { error: "Pilih rentang jam." }) });
export const consultationSchema = z.object({
  slots: z.array(slotSchema).length(3, "Pilih tepat 3 jadwal pilihan."),
  topic: required(600, "Tulis topik yang ingin dibahas."),
  whatsapp,
}).superRefine((value, ctx) => {
  const earliest = witaDate(new Date(), 1), latest = witaDate(new Date(), BOOKING_HORIZON_DAYS), seen = new Set<string>();
  value.slots.forEach((slot, index) => {
    if (!validDate(slot.date)) ctx.addIssue({ code: "custom", path: ["slots", index, "date"], message: "Tanggal belum valid." });
    else if (slot.date < earliest || slot.date > latest) ctx.addIssue({ code: "custom", path: ["slots", index, "date"], message: `Pilih tanggal mulai besok sampai ${BOOKING_HORIZON_DAYS} hari ke depan.` });
    const key = `${slot.date}|${slot.window}`;
    if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["slots", index], message: "Jadwal pilihan tidak boleh sama." });
    seen.add(key);
  });
});

export const gbpSchema = z.object({
  mapsUrl: text(500).refine((value) => !value || isGoogleMapsUrl(value), "Gunakan tautan HTTPS Google Maps dari tombol Bagikan, atau kosongkan bila belum ada."),
  managerAccess: z.enum(codes(MANAGER_ACCESS), { error: "Pilih salah satu." }),
  category: required(120, "Tulis kategori usaha, misalnya Kedai kopi."),
  openingHours: required(300, "Tulis jam buka, misalnya Senin–Sabtu 08.00–21.00."),
  mainProducts: required(1000, "Tulis produk atau layanan utama."),
  problems: z.array(z.enum(GBP_PROBLEMS)).max(GBP_PROBLEMS.length),
  problemNote: text(1000),
  whatsapp,
}).superRefine((value, ctx) => {
  if (!value.problems.length && !value.problemNote) ctx.addIssue({ code: "custom", path: ["problems"], message: "Pilih atau tulis minimal satu masalah yang ingin dibereskan." });
});

export const websiteCareSchema = z.object({
  websiteUrl: required(300, "Isi alamat website.").refine((value) => !value || isWebUrl(value), "Gunakan alamat lengkap, misalnya https://usahaku.com."),
  platform: z.enum(codes(WEBSITE_PLATFORMS), { error: "Pilih platform website." }),
  accessMethod: z.enum(codes(ACCESS_METHODS), { error: "Pilih cara berbagi akses." }),
  updates: required(1500, "Tulis perubahan yang kamu inginkan bulan ini."),
  whatsapp,
});

/** Membaca payload konsultasi yang sudah tersimpan (tanpa aturan tanggal, karena jadwal bisa sudah lewat). */
export const storedConsultationSchema = z.object({ slots: z.array(z.object({ date: z.string(), window: z.string() })).max(3), topic: z.string().max(600) });

export const PAYLOAD_SCHEMAS ={ consultation: consultationSchema, gbp: gbpSchema, website_care: websiteCareSchema } as const;
export type ConsultationPayload = z.infer<typeof consultationSchema>;
export type GbpPayload = z.infer<typeof gbpSchema>;
export type WebsiteCarePayload = z.infer<typeof websiteCareSchema>;
export type RequestPayload = ConsultationPayload | GbpPayload | WebsiteCarePayload;

export const requestInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("consultation"), payload: consultationSchema }),
  z.object({ kind: z.literal("gbp"), payload: gbpSchema }),
  z.object({ kind: z.literal("website_care"), payload: websiteCareSchema }),
]);
export type RequestInput = z.infer<typeof requestInputSchema>;

export interface ServiceRequest {
  id: string;
  kind: RequestKind;
  status: RequestStatus;
  payload: Record<string, unknown>;
  orderId: string | null;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Menentukan apakah permintaan baru boleh dibuat (murni, dipakai server dan test).
 * - Permintaan berstatus "Baru masuk" untuk jenis yang sama diperbarui, bukan diduplikasi.
 * - Konsultasi & GBP: satu permintaan aktif per pesanan yang sudah dibayar.
 * - Website Care: satu permintaan terbuka per waktu (diulang tiap bulan).
 */
export function planRequestWrite(kind: RequestKind, existing: Pick<ServiceRequest, "id" | "kind" | "status">[], paidOrders: number):
  { action: "update"; id: string } | { action: "insert" } | { action: "reject"; message: string } {
  const sameKind = existing.filter((item) => item.kind === kind);
  const fresh = sameKind.find((item) => item.status === "new");
  if (fresh) return { action: "update", id: fresh.id };
  if (kind === "website_care") {
    return sameKind.some((item) => OPEN_STATUSES.includes(item.status))
      ? { action: "reject", message: "Permintaan Website Care bulan ini masih dikerjakan. Kirim permintaan baru setelah selesai." }
      : { action: "insert" };
  }
  const used = sameKind.filter((item) => item.status !== "cancelled").length;
  if (used >= Math.max(1, paidOrders)) {
    return { action: "reject", message: kind === "consultation" ? "Jadwal konsultasi untuk pesanan ini sudah tercatat. Hubungi admin bila perlu mengubahnya." : "Data optimasi GBP sudah kami terima dan sedang diproses. Hubungi admin bila ada perubahan." };
  }
  return { action: "insert" };
}
