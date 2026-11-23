import { describe, expect, it } from "vitest";
import { openStatus, parseDays, parseTime } from "@/lib/sites/hours";
import { MOTIF_IDS, MOTIFS, motifStyle } from "@/lib/sites/motifs";
import { orderLink, orderMessage, orderTotals } from "@/lib/sites/order";

// 2026-11-25 adalah hari Rabu.
const at = (day: number, time: string) => { const [h, m] = time.split(":").map(Number); return new Date(2026, 10, 22 + day, h, m); };

describe("jam buka (teks bebas pemilik)", () => {
  it("membaca rentang & daftar hari", () => {
    expect([...parseDays("Senin–Sabtu")]).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...parseDays("Jumat - Senin")].sort()).toEqual([0, 1, 5, 6]);
    expect([...parseDays("Setiap hari")]).toHaveLength(7);
    expect([...parseDays("Sabtu, Minggu")].sort()).toEqual([0, 6]);
    expect([...parseDays("Senin s/d Kamis")]).toEqual([1, 2, 3, 4]);
    expect(parseDays("kapan saja").size).toBe(0);
  });
  it("membaca jam, 24 jam, tutup, dan lewat tengah malam", () => {
    expect(parseTime("07.00–20.00")).toEqual({ allDay: false, intervals: [{ open: 420, close: 1200 }] });
    expect(parseTime("08:00-12:00 & 13:00-17:00")).toMatchObject({ intervals: [{ open: 480, close: 720 }, { open: 780, close: 1020 }] });
    expect(parseTime("24 jam")).toEqual({ allDay: true, intervals: [] });
    expect(parseTime("Libur")).toBe("closed");
    expect(parseTime("18.00–02.00")).toEqual({ allDay: false, intervals: [{ open: 1080, close: 1560 }] });
    expect(parseTime("pagi sampai sore")).toBeNull();
  });
  it("status buka/tutup beserta label", () => {
    const rows = [{ days: "Senin–Sabtu", time: "07.00–20.00" }, { days: "Minggu", time: "Tutup" }];
    expect(openStatus(rows, at(3, "10:15"))).toEqual({ state: "open", label: "Buka · tutup 20.00" });
    expect(openStatus(rows, at(3, "06:30"))).toEqual({ state: "closed", label: "Tutup · buka lagi 07.00" });
    expect(openStatus(rows, at(3, "21:00"))).toEqual({ state: "closed", label: "Tutup · buka besok 07.00" });
    expect(openStatus(rows, at(6, "21:00"))).toEqual({ state: "closed", label: "Tutup · buka Senin 07.00" });
    expect(openStatus([{ days: "Setiap hari", time: "18.00–02.00" }], at(4, "01:30"))).toEqual({ state: "open", label: "Buka · tutup 02.00" });
    expect(openStatus([{ days: "Setiap hari", time: "24 jam" }], at(1, "03:00"))).toEqual({ state: "open", label: "Buka 24 jam" });
    expect(openStatus([{ days: "Tiap waktu", time: "fleksibel" }], at(1, "10:00"))).toEqual({ state: "unknown" });
  });
});

describe("motif Nusantara", () => {
  it("setiap motif adalah SVG valid dan menghasilkan variabel CSS", () => {
    for (const id of MOTIF_IDS) {
      expect(MOTIFS[id].svg.startsWith("<svg")).toBe(true);
      expect(MOTIFS[id].svg).not.toMatch(/<script|on\w+=/i);
      const style = motifStyle(id);
      expect(style["--motif"]).toMatch(/^url\("data:image\/svg\+xml,/);
      expect(style["--motif-size"]).toMatch(/^\d+px$/);
    }
  });
});

describe("pesanan via WhatsApp", () => {
  const lines = [{ name: "Nasi Kuning", price: 15000, qty: 2 }, { name: "Es Teh", price: 5000, qty: 1 }, { name: "Nasi Kotak", price: null, qty: 10 }];
  it("menghitung total dan menandai item tanpa harga", () => {
    expect(orderTotals(lines)).toEqual({ items: 13, total: 35000, hasUnpriced: true });
  });
  it("menyusun pesan yang rapi", () => {
    const message = orderMessage({ businessName: "Dapur Sekar" }, lines);
    expect(message).toContain("Halo Dapur Sekar, saya mau pesan:");
    expect(message).toContain("• 2× Nasi Kuning — Rp30.000");
    expect(message).toContain("• 10× Nasi Kotak (tanya harga)");
    expect(message).toContain("Total: Rp35.000 + item yang perlu ditanyakan harganya");
  });
  it("tautan hanya dibuat bila nomor WhatsApp valid", () => {
    expect(orderLink({ businessName: "X", whatsapp: "081234567890" }, lines)).toMatch(/^https:\/\/wa\.me\/6281234567890\?text=/);
    expect(orderLink({ businessName: "X", whatsapp: "" }, lines)).toBeNull();
  });
});

describe("identitas template DekatLokal", async () => {
  const { TEMPLATES } = await import("@/lib/sites/templates");
  it("delapan template, semuanya memakai font karya desainer Indonesia dan punya motif", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(8);
    for (const template of TEMPLATES) {
      const families = template.fonts.split("+").map((part) => part.trim());
      for (const family of families) expect(family).toMatch(/^(Plus Jakarta Sans|Gantari)\b/);
      expect(MOTIF_IDS).toContain(template.motif);
    }
  });
  it("motif tiap template berbeda supaya mudah dikenali", () => {
    expect(new Set(TEMPLATES.map((t) => t.motif)).size).toBe(TEMPLATES.length);
  });
});
