import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecallChallenge } from "@/components/preauth/recall-challenge";
import type { CheckupClaimPreview, PreAuthJourney } from "@/domain/entities";

vi.mock("@/features/preauth/actions", () => ({
  continueToPathPreview: vi.fn(),
  revealRecallHelp: vi.fn(),
  submitRecall: vi.fn(),
}));

const preview: CheckupClaimPreview = {
  claimToken: "opaque",
  resultId: "result-one",
  businessHint: { name: "Warung Rina", category: "Kuliner" },
  recommendedModules: [1, 2, 3].map((number) => ({
    id: `recommended-${number}`,
    title: `Rekomendasi ${number}`,
    shortOutcome: `Hasil rekomendasi ${number}`,
    estimatedMinutes: 5,
    reason: `Alasan ${number}`,
    assetType: `Aset ${number}`,
  })),
  distractorModules: [1, 2, 3].map((number) => ({
    id: `distractor-${number}`,
    title: `Pengecoh ${number}`,
    shortOutcome: `Hasil pengecoh ${number}`,
  })),
  expiresAt: "2026-07-08T00:00:00.000Z",
  status: "valid",
};

const journey: PreAuthJourney = {
  claimToken: "opaque",
  stage: "recall",
  selectedModuleIds: [],
  attemptCount: 0,
  completedRecall: false,
  helpRevealed: false,
};

describe("RecallChallenge", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it("enables checking only after exactly three choices and blocks a fourth", () => {
    render(<RecallChallenge evaluation={null} journey={journey} preview={preview} />);

    const submitButtons = screen.getAllByRole("button", { name: "Periksa Pilihan" });
    expect(submitButtons.every((button) => button.hasAttribute("disabled"))).toBe(true);

    const choices = screen.getAllByRole("checkbox");
    fireEvent.click(choices[0]);
    fireEvent.click(choices[1]);
    fireEvent.click(choices[2]);

    expect(screen.getByText("3 dari 3 dipilih")).toBeInTheDocument();
    expect(submitButtons.every((button) => !button.hasAttribute("disabled"))).toBe(true);
    expect(choices[3]).toBeDisabled();
  });

  it("renders non-color-only reveal help with the authoritative labels", () => {
    render(
      <RecallChallenge
        evaluation={null}
        journey={{ ...journey, helpRevealed: true, attemptCount: 2 }}
        preview={preview}
      />,
    );

    expect(screen.getByRole("heading", { name: "Ini tiga fokus utama usahamu." })).toBeVisible();
    expect(screen.getByText("Rekomendasi 1")).toBeVisible();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByText("Hasil rekomendasi 3")).toBeVisible();
  });
});
