import { describe, expect, it } from "vitest";
import { createMockRepositories } from "@/infrastructure/mock/repositories";

describe("mock repositories", () => {
  it("returns personalized dashboard data through the repository contract", async () => {
    const repositories = createMockRepositories("culinary-new-user");
    const dashboard = await repositories.dashboard.getDashboard("demo-user");

    expect(dashboard.business.name).toBe("Warung Rina");
    expect(dashboard.activePlan?.nextBestAction.title).toBe(
      "Rapikan Fondasi Digital Warung Rina",
    );
    expect(dashboard.activePlan?.steps).toHaveLength(3);
  });

  it("keeps expired claim state out of UI fixtures", async () => {
    const repositories = createMockRepositories("expired-claim");
    const claim = await repositories.checkup.previewClaim({ token: "expired" });

    expect(claim.status).toBe("expired");
  });

  it("covers P0.2 claim edge states", async () => {
    const repositories = createMockRepositories("culinary-new-user");

    await expect(
      repositories.checkup.previewClaim({ token: "claimed" }),
    ).resolves.toMatchObject({ status: "already_claimed" });
    await expect(
      repositories.checkup.previewClaim({ token: "invalid" }),
    ).resolves.toMatchObject({ status: "invalid" });
    await expect(
      repositories.checkup.previewClaim({ token: "missing" }),
    ).resolves.toMatchObject({ status: "missing" });
    await expect(
      repositories.checkup.previewClaim({ token: "network-error" }),
    ).resolves.toMatchObject({ status: "network_error" });
  });

  it("returns exactly three authoritative modules and ignores recall answers during association", async () => {
    const repositories = createMockRepositories("culinary-new-user");
    const preview = await repositories.checkup.previewClaim({
      token: "demo-warung-rina",
    });
    expect(preview.status).toBe("valid");
    if (preview.status !== "valid") return;

    expect(preview.preview.recommendedModules).toHaveLength(3);
    expect(preview.preview.distractorModules).toHaveLength(3);

    const association = await repositories.checkup.associateClaim({
      token: "mock-claim-token",
      userId: "user-rina",
    });
    expect(association.status).toBe("success");
    if (association.status !== "success") return;
    expect(association.association.moduleAssignments.map((item) => item.moduleId)).toEqual(
      preview.preview.recommendedModules.map((item) => item.id),
    );
  });

  it("maps V3 demo tokens to their authoritative business modules", async () => {
    const repositories = createMockRepositories("culinary-new-user");
    const rina = await repositories.checkup.previewClaim({ token: "demo-warung-rina" });
    const saji = await repositories.checkup.previewClaim({ token: "demo-saji-studio" });
    const bersih = await repositories.checkup.previewClaim({ token: "demo-bersihpro" });

    expect(rina.status).toBe("valid");
    expect(saji.status).toBe("valid");
    expect(bersih.status).toBe("valid");
    if (rina.status !== "valid" || saji.status !== "valid" || bersih.status !== "valid") return;

    expect(rina.preview.recommendedModules.map((module) => module.title)).toEqual([
      "Digitalisasi UMKM",
      "Branding UMKM",
      "Konsistensi Promosi",
    ]);
    expect(saji.preview.businessHint?.name).toBe("Saji Studio");
    expect(bersih.preview.businessHint?.name).toBe("BersihPro Makassar");
  });
});
