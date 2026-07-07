import { describe, expect, it } from "vitest";
import {
  businessConfirmationInputSchema,
  learningPreferenceInputSchema,
  otpInputSchema,
  signupInputSchema,
} from "@/domain/schemas";

describe("P0.2 validation", () => {
  it("requires signup identity fields", () => {
    const result = signupInputSchema.safeParse({
      mode: "signup",
      ownerName: "",
      businessName: "Warung Rina",
      phone: "081234567890",
    });

    expect(result.success).toBe(false);
  });

  it("accepts six digit OTP", () => {
    expect(otpInputSchema.parse({ code: "123456" }).code).toBe("123456");
    expect(otpInputSchema.safeParse({ code: "12345" }).success).toBe(false);
  });

  it("validates onboarding business and learning preferences", () => {
    expect(
      businessConfirmationInputSchema.parse({
        name: "Warung Rina",
        category: "Kuliner",
        city: "Makassar",
        whatsapp: "081234567890",
        role: "owner",
      }).name,
    ).toBe("Warung Rina");

    expect(
      learningPreferenceInputSchema.parse({
        digitalComfort: "guided",
        dailyMinutes: "5",
        preferredFormats: ["mixed"],
        fontScale: "large",
      }).dailyMinutes,
    ).toBe(5);
  });
});
