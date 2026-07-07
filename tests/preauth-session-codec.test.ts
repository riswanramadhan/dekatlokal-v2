import { describe, expect, it } from "vitest";
import {
  decodePreAuthJourney,
  encodePreAuthJourney,
} from "@/infrastructure/storage/preauth-session-codec";

describe("pre-auth journey codec", () => {
  it("persists stage, selections, attempts, completion, and help", () => {
    const encoded = encodePreAuthJourney({
      claimToken: "opaque-token",
      stage: "recall",
      selectedModuleIds: ["module-one", "module-two", "module-three"],
      attemptCount: 2,
      completedRecall: false,
      helpRevealed: true,
    });

    expect(decodePreAuthJourney(encoded)).toMatchObject({
      claimToken: "opaque-token",
      stage: "recall",
      attemptCount: 2,
      helpRevealed: true,
    });
  });

  it("fails safely for corrupt or oversized selection state", () => {
    expect(decodePreAuthJourney("%not-json%")).toBeNull();
    expect(
      decodePreAuthJourney(
        encodeURIComponent(
          JSON.stringify({
            claimToken: "opaque-token",
            stage: "recall",
            selectedModuleIds: ["1", "2", "3", "4"],
            attemptCount: 0,
            completedRecall: false,
          }),
        ),
      ),
    ).toBeNull();
  });
});
