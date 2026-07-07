import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  checkupBandEnum,
  checkupClaimStatusEnum,
  checkupSourceEnum,
} from "@/db/schema/enums";
import { businesses, users } from "@/db/schema/identity";
import { JsonRecord, lifecycleColumns } from "@/db/schema/shared";

export const checkupDefinitions = pgTable(
  "checkup_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: varchar("version", { length: 32 }).notNull(),
    title: text("title").notNull(),
    active: boolean("active").notNull().default(false),
    ...lifecycleColumns(),
  },
  (table) => [uniqueIndex("checkup_definitions_version_unique").on(table.version)],
);

export const checkupResults = pgTable(
  "checkup_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    definitionId: uuid("definition_id")
      .notNull()
      .references(() => checkupDefinitions.id, { onDelete: "restrict" }),
    totalScore: integer("total_score").notNull(),
    level: varchar("level", { length: 80 }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    source: checkupSourceEnum("source").notNull(),
    payloadSnapshot: jsonb("payload_snapshot").$type<JsonRecord>().notNull(),
    ...lifecycleColumns(),
  },
  (table) => [
    index("checkup_results_business_completed_idx").on(
      table.businessId,
      table.completedAt,
    ),
    check(
      "checkup_results_total_score_range",
      sql`${table.totalScore} between 0 and 100`,
    ),
  ],
);

export const checkupPillarScores = pgTable(
  "checkup_pillar_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resultId: uuid("result_id")
      .notNull()
      .references(() => checkupResults.id, { onDelete: "cascade" }),
    pillarKey: varchar("pillar_key", { length: 80 }).notNull(),
    score: integer("score").notNull(),
    band: checkupBandEnum("band").notNull(),
    explanation: text("explanation").notNull(),
  },
  (table) => [
    uniqueIndex("checkup_pillar_scores_result_pillar_unique").on(
      table.resultId,
      table.pillarKey,
    ),
    check(
      "checkup_pillar_scores_score_range",
      sql`${table.score} between 0 and 100`,
    ),
  ],
);

export const checkupClaimTokens = pgTable(
  "checkup_claim_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    resultId: uuid("result_id")
      .notNull()
      .references(() => checkupResults.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    claimedBy: uuid("claimed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    status: checkupClaimStatusEnum("status").notNull().default("valid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("checkup_claim_tokens_hash_unique").on(table.tokenHash),
    index("checkup_claim_tokens_result_idx").on(table.resultId),
    index("checkup_claim_tokens_claimed_by_idx").on(table.claimedBy),
    check(
      "checkup_claim_tokens_claimed_status_check",
      sql`(${table.status} <> 'claimed') or (${table.claimedBy} is not null and ${table.claimedAt} is not null)`,
    ),
  ],
);
