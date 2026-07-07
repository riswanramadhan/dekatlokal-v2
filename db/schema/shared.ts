import { timestamp } from "drizzle-orm/pg-core";

export type JsonRecord = Record<string, unknown>;

export function lifecycleColumns() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  };
}
