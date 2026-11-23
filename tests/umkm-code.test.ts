import { describe, expect, it } from "vitest";
import { assignUmkmCodes, sessionLabel, umkmCode } from "@/lib/digital-checkup/umkm-code";

describe("nomor UMKM untuk pengelola", () => {
  it("gives one code per business, only for businesses with a submitted session, ordered by first submission", () => {
    const codes = assignUmkmCodes([
      { id: "s1", umkm_id: "late", status: "submitted", submitted_at: "2026-09-20T00:00:00Z" },
      { id: "s2", umkm_id: "early", status: "submitted", submitted_at: "2026-09-10T00:00:00Z" },
      { id: "s3", umkm_id: "early", status: "submitted", submitted_at: "2026-09-25T00:00:00Z" },
      { id: "s4", umkm_id: "draft-only", status: "draft", submitted_at: null, started_at: "2026-09-01T00:00:00Z" },
      { id: "s5", umkm_id: "late", status: "draft", submitted_at: null },
    ]);
    expect([...codes.entries()]).toEqual([["early", "U001"], ["late", "U002"]]);
    expect(codes.has("draft-only")).toBe(false);
  });
  it("breaks ties by umkm id and keeps codes stable regardless of input order", () => {
    const rows = [
      { id: "a", umkm_id: "b-business", status: "submitted", submitted_at: "2026-09-10T00:00:00Z" },
      { id: "b", umkm_id: "a-business", status: "submitted", submitted_at: "2026-09-10T00:00:00Z" },
    ];
    expect(assignUmkmCodes(rows).get("a-business")).toBe("U001");
    expect(assignUmkmCodes([...rows].reverse()).get("a-business")).toBe("U001");
  });
  it("tolerates a submitted session without a timestamp and grows past 999", () => {
    expect(assignUmkmCodes([{ id: "x", umkm_id: "no-date", status: "submitted" }]).get("no-date")).toBe("U001");
    expect(umkmCode(1000)).toBe("U1000");
    expect(umkmCode(7)).toBe("U007");
  });
  it("labels sessions in plain language", () => {
    expect(sessionLabel("U001", 1)).toBe("U001");
    expect(sessionLabel("U001", 2)).toBe("U001 · revisi 2");
    expect(sessionLabel(null, 1)).toBe("Draf");
  });
});
