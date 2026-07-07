import { describe, expect, it } from "vitest";
import {
  decodeSession,
  encodeSession,
} from "@/infrastructure/storage/session-codec";

describe("mock journey session codec", () => {
  it("round trips persisted onboarding state", () => {
    const encoded = encodeSession({
      auth: {
        mode: "signup",
        ownerName: "Bu Rina",
        businessName: "Warung Rina",
        phone: "081234567890",
        claimToken: "mock-claim-token",
        verified: true,
      },
      onboarding: {
        completed: false,
        business: {
          name: "Dapur Rina Baru",
          category: "Kuliner",
          city: "Makassar",
          whatsapp: "081234567890",
          role: "owner",
        },
      },
      claimedResultId: "checkup-rina-001",
    });

    expect(decodeSession(encoded).onboarding?.business?.name).toBe(
      "Dapur Rina Baru",
    );
  });

  it("returns an empty session for invalid input", () => {
    expect(decodeSession("%not-json%")).toEqual({});
  });
});
