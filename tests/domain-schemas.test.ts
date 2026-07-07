import { describe, expect, it } from "vitest";
import {
  dashboardViewSchema,
  moduleCatalogSchema,
  scenarioKeySchema,
} from "@/domain/schemas";
import { foundationalModules } from "@/infrastructure/mock/foundational-modules";
import { mockScenarios } from "@/infrastructure/mock/scenarios";

describe("domain schemas", () => {
  it("accepts known demo scenarios", () => {
    expect(scenarioKeySchema.parse("culinary-new-user")).toBe(
      "culinary-new-user",
    );
  });

  it("validates mock dashboard fixtures", () => {
    const parsed = dashboardViewSchema.parse(mockScenarios["fast-fashion"]);

    expect(parsed.business.name).toBe("Saji Studio");
    expect(parsed.activePlan?.nextBestAction.rationale).toContain(
      "Branding",
    );
  });

  it("validates exactly eight V3 foundational modules", () => {
    const parsed = moduleCatalogSchema.parse(foundationalModules);

    expect(parsed).toHaveLength(8);
    expect(parsed.map((module) => module.title)).toEqual([
      "Digitalisasi UMKM",
      "Branding UMKM",
      "Produk dan Kemasan",
      "Konsistensi Promosi",
      "Marketplace dan Kanal Penjualan",
      "Operasional dan Keuangan Dasar",
      "Legalitas Usaha",
      "Komitmen dan Growth Mindset",
    ]);
    expect(parsed.every((module) => module.lessons.length === 4)).toBe(true);
    expect(parsed.every((module) => module.postTestQuestions.length >= 8)).toBe(true);
  });
});
