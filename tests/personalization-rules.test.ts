import { describe, expect, it } from "vitest";
import type { InterventionPlan } from "@/domain/entities";
import { personalizePlan } from "@/features/personalization/rules";
import { mockScenarios } from "@/infrastructure/mock/scenarios";

describe("personalization rules", () => {
  it("orders recommendations from score severity, dependency, impact, quick win, readiness, and preference", () => {
    const dashboard = mockScenarios["culinary-new-user"];

    const personalized = personalizePlan({
      plan: dashboard.activePlan!,
      checkup: dashboard.checkup,
      learningPreference: dashboard.learningPreference,
    });

    expect(personalized.nextBestAction.title).toBe("Digitalisasi UMKM");
    expect(personalized.nextBestAction.href).toBe("/app/modul/digitalisasi-umkm");
    expect(personalized.nextBestAction.scoring).toMatchObject({
      dependency: 100,
      expectedImpact: 92,
      quickWin: 54,
      learningPreference: 90,
    });
  });

  it("keeps dashboard recommendations distinct across business scenarios", () => {
    const scenarioKeys = [
        "culinary-new-user",
        "fast-fashion",
        "returning-service",
    ] as const;

    const titles = scenarioKeys.map((scenarioKey) => {
      const dashboard = mockScenarios[scenarioKey];
      return personalizePlan({
        plan: dashboard.activePlan!,
        checkup: dashboard.checkup,
        learningPreference: dashboard.learningPreference,
      }).nextBestAction.title;
    });

    expect(new Set(titles)).toEqual(
      new Set([
        "Digitalisasi UMKM",
        "Branding UMKM",
        "Operasional dan Keuangan Dasar",
      ]),
    );
  });

  it("allows learning preference to change priority when candidates are close", () => {
    const dashboard = mockScenarios["culinary-new-user"];
    const plan: InterventionPlan = {
      ...dashboard.activePlan!,
      steps: [
        {
          id: "step-short-text",
          title: "Template Chat Singkat",
          summary: "Buat balasan singkat untuk pertanyaan harga.",
          moduleSlug: "template-chat-singkat",
          position: 1,
          state: "available",
          required: true,
          estimatedMinutes: 5,
          reason: "Quick win untuk mengurangi chat berulang.",
          assetCreated: "Template Chat",
          entitlement: "free",
        },
        {
          id: "step-long-video",
          title: "Audit Profil Lengkap",
          summary: "Periksa profil usaha secara lengkap.",
          moduleSlug: "audit-profil-lengkap",
          position: 2,
          state: "available",
          required: true,
          estimatedMinutes: 15,
          reason: "Dampaknya lebih besar tetapi butuh waktu lebih panjang.",
          assetCreated: "Catatan Audit",
          entitlement: "free",
        },
      ],
    };

    const personalized = personalizePlan({
      plan,
      checkup: dashboard.checkup,
      learningPreference: {
        ...dashboard.learningPreference,
        dailyMinutes: 5,
        preferredFormats: ["text"],
      },
    });

    expect(personalized.nextBestAction.title).toBe("Template Chat Singkat");
    expect(personalized.nextBestAction.scoring?.readiness).toBeGreaterThan(80);
  });
});
