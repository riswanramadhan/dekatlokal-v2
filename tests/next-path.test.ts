import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/digital-checkup/next-path";

describe("safeNextPath (tujuan setelah masuk)", () => {
  it("menerima path produk UMKM", () => {
    for (const path of ["/layanan-pro", "/dashboard/website", "/templates?kategori=kuliner", "/dashboard"]) expect(safeNextPath(path)).toBe(path);
  });
  it("menolak open redirect, path admin, dan input aneh", () => {
    for (const path of ["//evil.com", "https://evil.com", "/admin", "/ahli", "javascript:alert(1)", "/dashboard\\evil", "", null, 42, `/dashboard/${"a".repeat(400)}`]) expect(safeNextPath(path)).toBeNull();
  });
});
