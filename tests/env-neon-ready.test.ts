import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("environment validation", () => {
  it("defaults to mock mode with no database URL", () => {
    const parsed = parseEnv({});

    expect(parsed.DATA_SOURCE).toBe("mock");
    expect(parsed.NEXT_PUBLIC_DATA_SOURCE).toBe("mock");
    expect(parsed.DATABASE_URL).toBeUndefined();
  });

  it("keeps NEXT_PUBLIC_DATA_SOURCE mock-only", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_DATA_SOURCE: "neon",
      }),
    ).toThrow(/NEXT_PUBLIC_DATA_SOURCE/);
  });

  it("requires Neon URLs only when server-side DATA_SOURCE is neon", () => {
    expect(() =>
      parseEnv({
        DATA_SOURCE: "neon",
      }),
    ).toThrow(/DATABASE_URL/);

    const parsed = parseEnv({
      DATA_SOURCE: "neon",
      DATABASE_URL: "postgresql://app:secret@example.neon.tech/app",
      DIRECT_URL: "postgresql://app:secret@example.neon.tech/app",
    });

    expect(parsed.DATA_SOURCE).toBe("neon");
  });
});
