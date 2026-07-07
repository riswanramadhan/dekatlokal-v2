import { defineConfig } from "drizzle-kit";

const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      migrationUrl ??
      "postgresql://placeholder:placeholder@localhost:5432/dekatlokal_placeholder",
  },
  strict: true,
  verbose: true,
});
