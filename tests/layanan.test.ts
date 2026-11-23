import { describe, expect, it } from "vitest";
import type { AccessState } from "@/lib/commerce/access";
import {
  consultationSchema, gbpSchema, looksLikeSecret, planRequestWrite, requestInputSchema, websiteCareSchema, witaDate,
} from "@/lib/layanan/request-schema";
import { nextStepCards, SIGN_IN_TO_PRO, VISIBILITY_DIMENSION } from "@/lib/layanan/next-steps";
import { serviceState } from "@/lib/layanan/service-status";
import { AccessRequiredError, ensureAccess } from "@/lib/layanan/gating";
import { customerWhatsApp, describeRequest } from "@/lib/layanan/request-format";
import { instrument } from "@/lib/decision-engine";

const day = (offset: number) => witaDate(new Date(), offset);
const consultation = (patch: Record<string, unknown> = {}) => ({
  slots: [{ date: day(2), window: "09-11" }, { date: day(3), window: "13-15" }, { date: day(5), window: "19-21" }],
  topic: "Urutan modul mana yang dikerjakan dulu",
  whatsapp: "0812-3456-7890",
  ...patch,
});
const gbp = (patch: Record<string, unknown> = {}) => ({
  mapsUrl: "https://maps.app.goo.gl/abc123", managerAccess: "bisa", category: "Kedai kopi", openingHours: "Setiap hari 08.00–22.00",
  mainProducts: "Kopi susu gula aren", problems: ["Foto sedikit atau kurang jelas"], problemNote: "", whatsapp: "081234567890", ...patch,
});
const care = (patch: Record<string, unknown> = {}) => ({ websiteUrl: "https://kopiteko.id", platform: "wordpress", accessMethod: "panduan_whatsapp", updates: "Ganti harga menu dan tambah 3 foto", whatsapp: "+6281234567890", ...patch });
const access = (active: boolean, expiresAt: string | null = null): AccessState => ({ active, paid: active, trialUsed: false, expiresAt, daysLeft: active ? (expiresAt ? 20 : null) : 0 });

describe("skema permintaan layanan", () => {
  it("konsultasi: tepat 3 jadwal unik dari besok sampai 45 hari, WhatsApp dinormalkan", () => {
    const parsed = consultationSchema.parse(consultation());
    expect(parsed.whatsapp).toBe("081234567890");
    expect(consultationSchema.safeParse(consultation({ slots: consultation().slots.slice(0, 2) })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ slots: [{ date: day(0), window: "09-11" }, ...consultation().slots.slice(1)] })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ slots: [{ date: day(60), window: "09-11" }, ...consultation().slots.slice(1)] })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ slots: [{ date: day(2), window: "09-11" }, { date: day(2), window: "09-11" }, { date: day(4), window: "11-13" }] })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ slots: [{ date: day(2), window: "03-05" }, ...consultation().slots.slice(1)] })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ slots: [{ date: "2026-02-30", window: "09-11" }, ...consultation().slots.slice(1)] })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ whatsapp: "12345" })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ topic: "  " })).success).toBe(false);
  });

  it("GBP: tautan Maps opsional tapi harus Google, minimal satu masalah", () => {
    expect(gbpSchema.safeParse(gbp()).success).toBe(true);
    expect(gbpSchema.safeParse(gbp({ mapsUrl: "" })).success).toBe(true);
    expect(gbpSchema.safeParse(gbp({ mapsUrl: "https://evil.example/maps" })).success).toBe(false);
    expect(gbpSchema.safeParse(gbp({ mapsUrl: "http://maps.google.com/x" })).success).toBe(false);
    expect(gbpSchema.safeParse(gbp({ problems: [], problemNote: "" })).success).toBe(false);
    expect(gbpSchema.safeParse(gbp({ problems: [], problemNote: "Alamat lama masih muncul" })).success).toBe(true);
    expect(gbpSchema.safeParse(gbp({ problems: ["Masalah karangan"] })).success).toBe(false);
    expect(gbpSchema.safeParse(gbp({ managerAccess: "mungkin" })).success).toBe(false);
  });

  it("Website Care: URL lengkap, platform & cara akses dari daftar, tanpa kata sandi", () => {
    expect(websiteCareSchema.safeParse(care()).success).toBe(true);
    expect(websiteCareSchema.safeParse(care({ websiteUrl: "kopiteko" })).success).toBe(false);
    expect(websiteCareSchema.safeParse(care({ platform: "joomla" })).success).toBe(false);
    expect(websiteCareSchema.safeParse(care({ accessMethod: "kirim_password" })).success).toBe(false);
    // Disusun saat tes berjalan agar pemindai secret (GitGuardian) tidak menganggapnya kata sandi sungguhan.
    const fakeCredential = ["Login admin, password", "contoh-bukan-asli"].join(": ");
    const secret = websiteCareSchema.safeParse(care({ updates: fakeCredential }));
    expect(secret.success).toBe(false);
    expect(secret.error?.issues[0].message).toMatch(/kata sandi/);
  });

  it("pola rahasia ditolak di semua jenis, tapi kata biasa tetap boleh", () => {
    for (const value of ["password: abc", "Kata sandi = 1234", "pin:9999", "OTP : 123456", "pwd=xx"]) expect(looksLikeSecret(value)).toBe(true);
    for (const value of ["Bypass: jalan utama", "Ganti harga menu", "Pinjam foto produk"]) expect(looksLikeSecret(value)).toBe(false);
    expect(gbpSchema.safeParse(gbp({ problemNote: "email bisnis@x.id sandi: abc" })).success).toBe(false);
    expect(consultationSchema.safeParse(consultation({ topic: "password = 123" })).success).toBe(false);
  });

  it("input API membedakan jenis dan menolak payload jenis lain", () => {
    expect(requestInputSchema.safeParse({ kind: "gbp", payload: gbp() }).success).toBe(true);
    expect(requestInputSchema.safeParse({ kind: "gbp", payload: care() }).success).toBe(false);
    expect(requestInputSchema.safeParse({ kind: "seo", payload: {} }).success).toBe(false);
  });
});

describe("aturan penulisan permintaan", () => {
  const rows = (...items: [string, string][]) => items.map(([kind, status], index) => ({ id: `r${index}`, kind, status })) as Parameters<typeof planRequestWrite>[1];
  it("permintaan 'Baru masuk' diperbarui, bukan diduplikasi", () => {
    expect(planRequestWrite("gbp", rows(["gbp", "new"]), 1)).toEqual({ action: "update", id: "r0" });
  });
  it("konsultasi & GBP: satu permintaan per pesanan berbayar; yang dibatalkan tidak dihitung", () => {
    expect(planRequestWrite("consultation", [], 1)).toEqual({ action: "insert" });
    expect(planRequestWrite("consultation", rows(["consultation", "scheduled"]), 1).action).toBe("reject");
    expect(planRequestWrite("consultation", rows(["consultation", "done"]), 2)).toEqual({ action: "insert" });
    expect(planRequestWrite("consultation", rows(["consultation", "cancelled"]), 1)).toEqual({ action: "insert" });
    expect(planRequestWrite("gbp", rows(["gbp", "done"], ["consultation", "new"]), 1).action).toBe("reject");
    // Hak akses dari admin tanpa pesanan tetap mendapat satu kuota.
    expect(planRequestWrite("gbp", [], 0)).toEqual({ action: "insert" });
  });
  it("Website Care: satu permintaan terbuka per waktu, bisa diulang setelah selesai", () => {
    expect(planRequestWrite("website_care", rows(["website_care", "in_progress"]), 1).action).toBe("reject");
    expect(planRequestWrite("website_care", rows(["website_care", "done"], ["website_care", "done"]), 1)).toEqual({ action: "insert" });
  });
});

describe("gerbang akses", () => {
  it("menolak fitur yang belum aktif dengan galat 403", () => {
    expect(() => ensureAccess(access(false), "checkup_pro")).toThrow(AccessRequiredError);
    try { ensureAccess(access(false), "gbp"); } catch (e) { expect((e as AccessRequiredError).status).toBe(403); }
    expect(ensureAccess(access(true), "website_care").active).toBe(true);
  });
});

describe("status layanan", () => {
  const order = (status: "pending" | "active" | "cancelled", code = "DL-AAAA1111", createdAt = "2026-11-20T00:00:00Z") => ({ code, productCode: "gbp_optimization" as const, status, createdAt });
  it("aktif, menunggu pembayaran dengan kode, belum dibeli, dan masa aktif berakhir", () => {
    expect(serviceState(access(true), [], "gbp_optimization")).toMatchObject({ state: "active", label: "Aktif" });
    expect(serviceState(access(false), [order("pending", "DL-OLD00001", "2026-11-01T00:00:00Z"), order("pending", "DL-NEW00002")], "gbp_optimization")).toMatchObject({ state: "pending", label: "Menunggu pembayaran · DL-NEW00002", pendingCode: "DL-NEW00002" });
    expect(serviceState(access(false), [order("cancelled")], "gbp_optimization")).toMatchObject({ state: "none", label: "Belum dibeli" });
    expect(serviceState(access(false), [order("active")], "gbp_optimization").label).toBe("Masa aktif berakhir");
    expect(serviceState(access(false), [order("pending")], "checkup_pro").state).toBe("none");
    expect(serviceState(access(true, "2026-12-24T00:00:00Z"), [], "website_care_monthly").label).toMatch(/^Aktif · sampai /);
  });
});

describe("Langkah lanjut di hasil Checkup", () => {
  const c5 = instrument.dimensions.findIndex((d) => d.code === VISIBILITY_DIMENSION);
  const scores = (visibility: number) => instrument.dimensions.map((_, index) => index === c5 ? visibility : 80);
  it("memakai C5 Pemakaian digital sebagai dimensi visibilitas", () => {
    expect(instrument.dimensions[c5].title).toBe("Pemakaian digital");
  });
  it("Checkup Pro selalu ada; GBP muncul bila tanpa tautan Maps atau C5 rendah; website selalu ke /templates", () => {
    const withMaps = { googleMaps: "https://maps.app.goo.gl/x" };
    expect(nextStepCards({ scores: scores(75), profile: withMaps, signedIn: true }).map((c) => c.key)).toEqual(["checkup_pro", "website"]);
    expect(nextStepCards({ scores: scores(31.25), profile: withMaps, signedIn: true }).map((c) => c.key)).toEqual(["checkup_pro", "gbp", "website"]);
    expect(nextStepCards({ scores: scores(90), profile: {}, signedIn: true }).map((c) => c.key)).toEqual(["checkup_pro", "gbp", "website"]);
    const cards = nextStepCards({ scores: scores(90), profile: {}, signedIn: true });
    expect(cards[0].href).toBe("/layanan-pro#checkup-pro");
    expect(cards[0].price).toBe("Rp79.000");
    expect(cards[1].price).toBe("Rp149.000");
    expect(cards.at(-1)?.href).toBe("/templates");
  });
  it("tamu diarahkan masuk dulu, tanpa janji peringkat Google", () => {
    const cards = nextStepCards({ scores: scores(10), profile: {}, signedIn: false });
    expect(cards.filter((c) => c.key !== "website").every((c) => c.href === SIGN_IN_TO_PRO)).toBe(true);
    expect(SIGN_IN_TO_PRO).toBe("/masuk?next=/layanan-pro");
    expect(cards.map((c) => c.body).join(" ")).not.toMatch(/pasti|dijamin tampil|terbatas|segera habis/i);
  });
});

describe("format permintaan untuk admin", () => {
  it("merangkum isi dan membuat tautan WhatsApp pelanggan", () => {
    const rows = describeRequest("consultation", consultationSchema.parse(consultation()));
    expect(rows.map((r) => r.label)).toEqual(["Pilihan 1", "Pilihan 2", "Pilihan 3", "Topik", "WhatsApp"]);
    expect(rows[0].value).toMatch(/09\.00–11\.00 WITA$/);
    const gbpRows = describeRequest("gbp", gbpSchema.parse(gbp()));
    expect(gbpRows.find((r) => r.label === "Google Maps")?.href).toBe("https://maps.app.goo.gl/abc123");
    expect(gbpRows.find((r) => r.label === "Akses pengelola")?.value).toMatch(/pemilik/);
    expect(customerWhatsApp("0812-3456-7890", "gbp", "Kopi Teko", "DL-ABCD1234")).toMatch(/^https:\/\/wa\.me\/6281234567890\?text=.*DL-ABCD1234/);
    expect(customerWhatsApp("+62 812 3456 7890", "website_care")).toMatch(/^https:\/\/wa\.me\/6281234567890/);
    expect(customerWhatsApp("", "website_care")).toBe("");
  });
});
