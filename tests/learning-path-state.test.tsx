import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PathList } from "@/components/learning-path/path-list";
import type { PlanStep } from "@/domain/entities";
import { canStartModule, moduleStartLabel } from "@/features/learning-path/state";

const states: PlanStep["state"][] = [
  "completed",
  "active",
  "available",
  "needs_retry",
  "awaiting_evidence",
  "awaiting_review",
  "locked",
];

const steps = states.map((state, index): PlanStep => ({
  id: `step-${state}`,
  title: `Modul ${state}`,
  summary: `Ringkasan ${state}`,
  moduleSlug: `modul-${state}`,
  position: index + 1,
  state,
  required: true,
  estimatedMinutes: 8,
  reason: `Alasan ${state}`,
  prerequisite:
    state === "locked" ? "Selesaikan modul sebelumnya terlebih dahulu." : undefined,
  entitlement: "free",
}));

describe("learning path states", () => {
  it(
    "renders all required P0.3 path states with preview links",
    () => {
      render(<PathList steps={steps} />);

      for (const step of steps) {
        expect(
          screen.getByRole("heading", { name: step.title }),
        ).toBeInTheDocument();
      }

      expect(screen.getByText("Selesai")).toBeInTheDocument();
      expect(screen.getByText("Aktif")).toBeInTheDocument();
      expect(screen.getByText("Tersedia")).toBeInTheDocument();
      expect(screen.getByText("Perkuat lagi")).toBeInTheDocument();
      expect(screen.getByText("Butuh bukti")).toBeInTheDocument();
      expect(screen.getByText("Menunggu review")).toBeInTheDocument();
      expect(screen.getByText("Terkunci")).toBeInTheDocument();
      expect(
        screen.getByText("Selesaikan modul sebelumnya terlebih dahulu."),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("link", { name: "Preview" })).toHaveLength(7);
    },
    30_000,
  );

  it("blocks starting locked and review modules while preserving preview states", () => {
    expect(canStartModule("locked")).toBe(false);
    expect(canStartModule("awaiting_review")).toBe(false);
    expect(canStartModule("available")).toBe(true);
    expect(canStartModule("awaiting_evidence")).toBe(true);
    expect(moduleStartLabel("needs_retry")).toBe("Perkuat lagi");
    expect(moduleStartLabel("completed")).toBe("Lihat hasil");
  });
});
