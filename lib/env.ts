import "server-only";

import { z } from "zod";
import { scenarioKeySchema } from "@/domain/schemas";

const optionalSecretSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrlSecretSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const publicDataSourceSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? "mock" : value),
  z.literal("mock", {
    error: "NEXT_PUBLIC_DATA_SOURCE must stay mock. Use server-only DATA_SOURCE to prepare Neon.",
  }),
);

const urlSchema = z.string().url();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXT_PUBLIC_MAIN_SITE_URL: urlSchema.default("https://dekatlokal.com"),
    NEXT_PUBLIC_APP_URL: urlSchema.default("http://localhost:3000"),
    NEXT_PUBLIC_DATA_SOURCE: publicDataSourceSchema,
    DATA_SOURCE: z.enum(["mock", "neon"]).default("mock"),
    NEXT_PUBLIC_DEMO_SCENARIO: scenarioKeySchema.default("culinary-new-user"),
    DATABASE_URL: optionalUrlSecretSchema,
    DIRECT_URL: optionalUrlSecretSchema,
    AUTH_SECRET: optionalSecretSchema,
    BLOB_READ_WRITE_TOKEN: optionalSecretSchema,
    WHATSAPP_PROVIDER_TOKEN: optionalSecretSchema,
    ANALYTICS_WRITE_KEY: optionalSecretSchema,
  })
  .superRefine((value, context) => {
    if (value.DATA_SOURCE === "neon") {
      if (!value.DATABASE_URL) {
        context.addIssue({
          code: "custom",
          message: "DATABASE_URL is required when DATA_SOURCE=neon.",
          path: ["DATABASE_URL"],
        });
      }

      if (!value.DIRECT_URL) {
        context.addIssue({
          code: "custom",
          message: "DIRECT_URL is required when DATA_SOURCE=neon.",
          path: ["DIRECT_URL"],
        });
      }
    }
  });

export function parseEnv(source: Partial<NodeJS.ProcessEnv>) {
  return envSchema.parse({
    NODE_ENV: source.NODE_ENV,
    NEXT_PUBLIC_MAIN_SITE_URL: source.NEXT_PUBLIC_MAIN_SITE_URL,
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DATA_SOURCE: source.NEXT_PUBLIC_DATA_SOURCE,
    DATA_SOURCE: source.DATA_SOURCE,
    NEXT_PUBLIC_DEMO_SCENARIO: source.NEXT_PUBLIC_DEMO_SCENARIO,
    DATABASE_URL: source.DATABASE_URL,
    DIRECT_URL: source.DIRECT_URL,
    AUTH_SECRET: source.AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: source.BLOB_READ_WRITE_TOKEN,
    WHATSAPP_PROVIDER_TOKEN: source.WHATSAPP_PROVIDER_TOKEN,
    ANALYTICS_WRITE_KEY: source.ANALYTICS_WRITE_KEY,
  });
}

export const env = parseEnv(process.env);

export type AppEnv = typeof env;
