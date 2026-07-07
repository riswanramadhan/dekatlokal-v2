import "server-only";

import { sql } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";

export type DatabaseHealth =
  | {
      status: "disabled";
      checked: false;
      reason: string;
    }
  | {
      status: "ok";
      checked: true;
    }
  | {
      status: "error";
      checked: true;
      message: string;
    };

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!isDatabaseConfigured()) {
    return {
      status: "disabled",
      checked: false,
      reason: "DATABASE_URL is empty, so the Neon health check is disabled.",
    };
  }

  try {
    await getDatabase().execute(sql`select 1`);
    return { status: "ok", checked: true };
  } catch (error) {
    return {
      status: "error",
      checked: true,
      message: error instanceof Error ? error.message : "Unknown database error.",
    };
  }
}
