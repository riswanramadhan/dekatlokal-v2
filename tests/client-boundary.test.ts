import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "test-results",
]);

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (ignoredDirectories.has(entry)) {
        return [];
      }
      return collectSourceFiles(fullPath);
    }

    if (!entry.endsWith(".ts") && !entry.endsWith(".tsx")) {
      return [];
    }

    return [fullPath];
  });
}

describe("client bundle boundaries", () => {
  it("keeps database, Neon, and server env modules out of client files", () => {
    const forbiddenPatterns = [
      "@/db",
      "@/infrastructure/neon",
      "@/lib/env",
      "@neondatabase/serverless",
      "drizzle-orm",
      "process.env.DATABASE_URL",
      "process.env.DIRECT_URL",
    ];

    const violations = collectSourceFiles(repoRoot)
      .map((filePath) => ({
        filePath,
        source: readFileSync(filePath, "utf8"),
      }))
      .filter(({ source }) =>
        source.startsWith('"use client";') || source.startsWith("'use client';"),
      )
      .flatMap(({ filePath, source }) =>
        forbiddenPatterns
          .filter((pattern) => source.includes(pattern))
          .map((pattern) => `${path.relative(repoRoot, filePath)} imports ${pattern}`),
      );

    expect(violations).toEqual([]);
  });
});
