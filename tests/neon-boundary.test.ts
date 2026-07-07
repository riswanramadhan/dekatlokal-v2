import { describe, expect, it } from "vitest";
import { getDatabaseHealth } from "@/db/health";
import { createRepositories } from "@/infrastructure/repositories";

describe("Neon boundary", () => {
  it("keeps the database health check disabled without DATABASE_URL", async () => {
    if (process.env.DATABASE_URL) {
      return;
    }

    await expect(getDatabaseHealth()).resolves.toMatchObject({
      status: "disabled",
      checked: false,
    });
  });

  it("fails closed when Neon repositories are requested without DATABASE_URL", () => {
    if (process.env.DATABASE_URL) {
      return;
    }

    expect(() => createRepositories("neon", "culinary-new-user")).toThrow(
      /DATABASE_URL/,
    );
  });
});
