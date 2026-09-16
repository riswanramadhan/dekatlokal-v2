import { describe, expect, it } from "vitest";
import { createReportPdf, reportFileName } from "@/lib/digital-checkup/report-pdf";
import type { PublicAssessment } from "@/lib/digital-checkup/service";

describe("nama laporan Digital Checkup", () => {
  it("memakai nama bisnis yang aman dan mudah dikenali", () => {
    expect(reportFileName("Kopi Teko Makassar")).toBe("digital-checkup-kopi-teko-makassar.pdf");
    expect(reportFileName(" Dapur Ibu / Cabang #2 ")).toBe("digital-checkup-dapur-ibu-cabang-2.pdf");
  });

  it("tidak pernah memakai kode UMKM saat nama kosong", () => {
    expect(reportFileName(" ")).toBe("digital-checkup-usaha-saya.pdf");
  });

  it("membuat dokumen PDF berisi nama usaha dan delapan dimensi", () => {
    const assessment = {
      code: "UMKM-KODE-INTERNAL",
      submittedAt: "2026-09-16T00:00:00Z",
      payload: { profile: { businessName: "Kopi Teko", email: "demo@example.org", whatsapp: "0812", provinceCode: "73", cityCode: "7371" }, answers: {} },
      scores: [25, 50, 75, 100, 25, 50, 75, 100],
      run: null,
    } as unknown as PublicAssessment;
    const pdf = createReportPdf(assessment);
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf).toContain("Kopi Teko");
    expect(pdf).toContain("Legalitas dan administrasi");
    expect(pdf).not.toContain("UMKM-KODE-INTERNAL");
    expect(pdf.endsWith("%%EOF")).toBe(true);
  });
});
