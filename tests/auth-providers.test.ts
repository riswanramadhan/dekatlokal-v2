import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { googleEnabledFrom } = await import("@/lib/digital-checkup/auth-providers");

describe("googleEnabledFrom (status provider Google dari /auth/v1/settings)", () => {
  it("membaca status aktif/nonaktif", () => {
    expect(googleEnabledFrom({ external: { google: true, email: true } })).toBe(true);
    expect(googleEnabledFrom({ external: { google: false, email: true } })).toBe(false);
    expect(googleEnabledFrom({ external: { email: true } })).toBe(false);
  });
  it("tidak menyimpulkan apa pun dari respons aneh", () => {
    for (const value of [null, undefined, "x", 1, {}, { external: null }]) expect(googleEnabledFrom(value)).toBeNull();
  });
});
