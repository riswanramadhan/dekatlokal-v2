import { describe, expect, it } from "vitest";
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from "@/lib/decision-engine";
import { freeCourses } from "@/lib/digital-checkup/curriculum";
import { buildActionPlan, topThree } from "@/lib/layanan/action-plan";
import { buildProReport, conditionLevel, createProReportPdf, interpretCondition, proReportFileName } from "@/lib/layanan/pro-report";
import { wrapText } from "@/lib/layanan/pdf";

// Panel simulasi (bukan data penelitian): perbandingan setara, relevansi bervariasi.
const expert = (offset: number): ExpertInput => ({ pairs: PAIRS.map((pair) => ({ ...pair, preferred: "equal", intensity: 1 })), relevance: Object.fromEntries(MODULES.map((module, i) => [module, Object.fromEntries(DIMENSIONS.map((dimension, j) => [dimension, (i + j + offset) % 5]))])) });
const model = buildModel([expert(0), expert(1), expert(2)]);
// C5 (Pemakaian digital) paling lemah, C1 paling kuat.
const answers = Object.fromEntries(instrument.questions.map((q) => [q.code, q.dimension === "C5" ? 0 : q.dimension === "C1" ? 4 : q.dimension === "C7" ? 1 : 2]));
const trace = topsis(answers, model.w, model.R);
const profile = { businessName: "Kopi Teko", sector: "Makanan & minuman", district: "Panakkukang", provinceCode: "73", cityCode: "73.71", businessAgeMonths: 27, peopleCount: 3, respondentRole: "Pemilik" as const, salesChannels: ["Toko fisik", "Instagram"], goal: "Pesanan online naik dua kali lipat", instagram: "@kopiteko", googleMaps: "", consent: true as const, note: "" };

describe("rencana aksi 30 hari", () => {
  it("deterministik dan hanya memakai tiga modul teratas", () => {
    expect(trace.status).toBe("RANKED");
    const plan = buildActionPlan(trace.ranking, profile.goal);
    expect(buildActionPlan(trace.ranking, profile.goal)).toEqual(plan);
    const top = topThree(trace.ranking);
    expect(plan.map((week) => week.week)).toEqual([1, 2, 3, 4]);
    expect(new Set(plan.flatMap((week) => week.tasks.map((task) => task.module)))).toEqual(new Set([...top, "EVAL"]));
    expect(plan[0].tasks.every((task) => task.module === top[0])).toBe(true);
    expect(plan[3].tasks.at(-1)?.text).toContain(profile.goal);
  });

  it("isi tugas diambil dari kurikulum modul", () => {
    const ranking = [{ code: "A6", rank: 1 }, { code: "A2", rank: 2 }, { code: "A4", rank: 3 }, { code: "A1", rank: 4 }];
    const plan = buildActionPlan(ranking);
    const finance = freeCourses.find((course) => course.code === "A6")!;
    expect(plan[0].focus).toBe(`Fondasi: ${finance.title}`);
    expect(plan[0].tasks[1].text).toBe(`${finance.lessons[0].title}: ${finance.lessons[0].task}`);
    expect(plan[1].done).toContain(finance.outcome.slice(1, 20));
    expect(plan[3].tasks.at(-1)?.text).not.toContain('("")');
  });

  it("peringkat seri diurutkan berdasarkan kode; kurang dari tiga modul ditolak", () => {
    expect(topThree([{ code: "A3", rank: 1 }, { code: "A1", rank: 1 }, { code: "A2", rank: 3 }, { code: "A7", rank: 2 }])).toEqual(["A1", "A3", "A7"]);
    expect(() => buildActionPlan([{ code: "A1", rank: 1 }])).toThrow(/tiga modul/);
  });
});

describe("isi laporan Checkup Pro", () => {
  const report = buildProReport({ profile, submittedAt: "2026-11-20T03:00:00Z", trace, generatedAt: new Date("2026-11-24T02:00:00Z"), consultation: { status: "new", slots: [{ date: "2026-12-01", window: "09-11" }, { date: "2026-12-02", window: "13-15" }, { date: "2026-12-03", window: "19-21" }], topic: "Mulai jualan online" } });

  it("menolak run yang belum berperingkat", () => {
    expect(() => buildProReport({ profile, submittedAt: null, trace: { ...trace, status: "NO_IDENTIFIED_GAP", ranking: [] } })).toThrow(/berperingkat/);
  });

  it("profil, 8 kondisi dengan interpretasi, dan tabel S g w q sesuai trace", () => {
    expect(report.businessName).toBe("Kopi Teko");
    expect(report.profileRows).toContainEqual(["Lama usaha", "2 tahun 3 bulan"]);
    expect(report.profileRows).toContainEqual(["Google Maps", "Belum dicantumkan"]);
    expect(report.profileRows.find(([label]) => label === "Lokasi")?.[1]).toMatch(/^Panakkukang, /);
    expect(report.conditions).toHaveLength(8);
    const c5 = report.conditions.find((item) => item.code === "C5")!;
    expect(c5).toMatchObject({ score: 0, level: "Prioritas", interpretation: interpretCondition("C5", 0) });
    expect(report.conditions.find((item) => item.code === "C1")).toMatchObject({ score: 100, level: "Kuat" });
    report.gaps.forEach((gap, index) => { expect(gap.S).toBe(trace.S[index]); expect(gap.g).toBeCloseTo(1 - trace.S[index] / 100, 12); expect(gap.w).toBe(trace.w[index]); expect(gap.q).toBe(trace.q[index]); });
    expect(report.gaps.reduce((sum, gap) => sum + gap.q, 0)).toBeCloseTo(1, 10);
    expect(report.needSummary).toMatch(/pemakaian digital/);
  });

  it("urutan lengkap 7 modul dengan C dan alasan, rencana dari tiga teratas, jadwal WITA", () => {
    expect(report.ranking).toHaveLength(7);
    expect(report.ranking.map((item) => item.code).sort()).toEqual([...MODULES].sort());
    report.ranking.forEach((item) => { expect(item.C).toBeGreaterThanOrEqual(0); expect(item.C).toBeLessThanOrEqual(1); expect(item.reasons.length).toBeLessThanOrEqual(2); });
    expect(report.plan[0].tasks[0].module).toBe(topThree(trace.ranking)[0]);
    expect(report.consultation?.slots[0]).toBe("Selasa, 1 Desember 2026, 09.00–11.00 WITA");
  });

  it("ambang level kondisi", () => {
    expect([100, 75, 74.9, 50, 49, 25, 24, 0].map(conditionLevel)).toEqual(["Kuat", "Kuat", "Cukup", "Cukup", "Perlu dibenahi", "Perlu dibenahi", "Prioritas", "Prioritas"]);
  });
});

describe("PDF Checkup Pro", () => {
  const pdf = createProReportPdf(buildProReport({ profile, submittedAt: "2026-11-20T03:00:00Z", trace }));

  it("PDF valid, ASCII, berisi semua bagian", () => {
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.endsWith("%%EOF")).toBe(true);
    expect(/^[\x09\x0A\x0D\x20-\x7E]*$/.test(pdf)).toBe(true);
    for (const text of ["Laporan Checkup Pro", "Kopi Teko", "Profil usaha", "Kondisi 8 bagian usaha", "Celah dan kebutuhan", "Urutan lengkap 7 modul", "Rencana aksi 30 hari", "MINGGU 4", "Evaluasi:", "Jadwal konsultasi", "Pemakaian digital"]) expect(pdf).toContain(text);
    // Tanpa jadwal tersimpan, laporan mengarahkan ke halaman layanan.
    expect(pdf).toContain("digitalcheckup.dekatlokal.com/layanan-pro");
  });

  it("tabel xref menunjuk ke setiap objek", () => {
    const start = Number(/startxref\n(\d+)/.exec(pdf)?.[1]);
    expect(pdf.slice(start, start + 4)).toBe("xref");
    const offsets = pdf.slice(start).split("\n").filter((line) => / 00000 n $/.test(line)).map((line) => Number(line.slice(0, 10)));
    offsets.forEach((offset, index) => expect(pdf.slice(offset, offset + 12)).toMatch(new RegExp(`^${index + 1} 0 obj`)));
    expect(Number(/\/Count (\d+)/.exec(pdf)?.[1])).toBeGreaterThanOrEqual(3);
  });

  it("nama berkas aman dan teks panjang dibungkus", () => {
    expect(proReportFileName("Kopi Teko / Cabang #2")).toBe("checkup-pro-kopi-teko-cabang-2.pdf");
    expect(proReportFileName("  ")).toBe("checkup-pro-usaha-saya.pdf");
    expect(wrapText("https://maps.app.goo.gl/sangat-panjang-sekali-tanpa-spasi", 20).every((line) => line.length <= 20)).toBe(true);
  });
});
