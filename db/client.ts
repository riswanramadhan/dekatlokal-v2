import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

export type Database = NeonHttpDatabase<typeof schema>;

let database: Database | null = null;

export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

export function getDatabase(): Database {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is empty. Database access is disabled while DATA_SOURCE=mock.",
    );
  }

  if (!database) {
    database = drizzle(neon(env.DATABASE_URL), { schema });
  }

  return database;
}
