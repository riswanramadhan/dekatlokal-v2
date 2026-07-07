import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { checkupResults } from "@/db/schema/checkups";
import {
  businessAssetStatusEnum,
  certificateStatusEnum,
  entitlementResourceTypeEnum,
  questionTypeEnum,
  rewardClaimStatusEnum,
} from "@/db/schema/enums";
import { businesses, users } from "@/db/schema/identity";
import { interventionPlans, modules } from "@/db/schema/learning";
import { taskSubmissions } from "@/db/schema/progress";
import { JsonRecord, lifecycleColumns } from "@/db/schema/shared";

export const businessAssets = pgTable(
  "business_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    sourceSubmissionId: uuid("source_submission_id").references(
      () => taskSubmissions.id,
      { onDelete: "set null" },
    ),
    assetType: varchar("asset_type", { length: 120 }).notNull(),
    label: text("label").notNull(),
    valueJson: jsonb("value_json").$type<JsonRecord>().notNull(),
    status: businessAssetStatusEnum("status").notNull().default("ready"),
    ...lifecycleColumns(),
  },
  (table) => [
    index("business_assets_business_status_idx").on(table.businessId, table.status),
    index("business_assets_source_submission_idx").on(table.sourceSubmissionId),
  ],
);

export const badges = pgTable(
  "badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 120 }).notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 80 }).notNull(),
    ruleJson: jsonb("rule_json").$type<JsonRecord>().notNull(),
    active: boolean("active").notNull().default(true),
    ...lifecycleColumns(),
  },
  (table) => [uniqueIndex("badges_key_unique").on(table.key)],
);

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
    source: text("source").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.badgeId],
      name: "user_badges_pk",
    }),
  ],
);

export const finalTests = pgTable(
  "final_tests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => interventionPlans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    passScore: integer("pass_score").notNull().default(80),
    version: integer("version").notNull().default(1),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("final_tests_plan_unique").on(table.planId),
    check("final_tests_pass_score_range", sql`${table.passScore} between 0 and 100`),
  ],
);

export const finalTestQuestions = pgTable(
  "final_test_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalTestId: uuid("final_test_id")
      .notNull()
      .references(() => finalTests.id, { onDelete: "cascade" }),
    focusModuleId: uuid("focus_module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    type: questionTypeEnum("type").notNull().default("scenario"),
    scenario: text("scenario").notNull(),
    prompt: text("prompt").notNull(),
    optionsJson: jsonb("options_json").$type<JsonRecord>().notNull(),
    answerJson: jsonb("answer_json").$type<JsonRecord>().notNull(),
    feedbackJson: jsonb("feedback_json").$type<JsonRecord>().notNull(),
  },
  (table) => [
    uniqueIndex("final_test_questions_position_unique").on(
      table.finalTestId,
      table.position,
    ),
    uniqueIndex("final_test_questions_focus_unique").on(
      table.finalTestId,
      table.focusModuleId,
    ),
    check("final_test_questions_position_check", sql`${table.position} between 1 and 3`),
  ],
);

export const finalTestAttempts = pgTable(
  "final_test_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalTestId: uuid("final_test_id")
      .notNull()
      .references(() => finalTests.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    answersJson: jsonb("answers_json").$type<JsonRecord>().notNull(),
    feedbackJson: jsonb("feedback_json").$type<JsonRecord>().notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("final_test_attempts_user_attempt_unique").on(
      table.finalTestId,
      table.userId,
      table.attemptNumber,
    ),
    check("final_test_attempts_score_range", sql`${table.score} between 0 and 100`),
    check(
      "final_test_attempts_attempt_number_positive",
      sql`${table.attemptNumber} > 0`,
    ),
  ],
);

export const recheckups = pgTable(
  "recheckups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    originalResultId: uuid("original_result_id")
      .notNull()
      .references(() => checkupResults.id, { onDelete: "restrict" }),
    latestResultId: uuid("latest_result_id")
      .notNull()
      .references(() => checkupResults.id, { onDelete: "restrict" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => interventionPlans.id, { onDelete: "restrict" }),
    changedHighlightsJson: jsonb("changed_highlights_json")
      .$type<JsonRecord>()
      .notNull(),
    contributingActionsJson: jsonb("contributing_actions_json")
      .$type<JsonRecord>()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("recheckups_business_completed_idx").on(table.businessId, table.completedAt),
    check(
      "recheckups_result_ids_differ",
      sql`${table.originalResultId} <> ${table.latestResultId}`,
    ),
  ],
);

export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => interventionPlans.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    verificationCode: varchar("verification_code", { length: 80 }).notNull(),
    status: certificateStatusEnum("status").notNull().default("issued"),
  },
  (table) => [
    uniqueIndex("certificates_verification_code_unique").on(table.verificationCode),
    uniqueIndex("certificates_user_plan_unique").on(table.userId, table.planId),
  ],
);

export const rewards = pgTable(
  "rewards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 120 }).notNull(),
    title: text("title").notNull(),
    eligibilityRuleJson: jsonb("eligibility_rule_json").$type<JsonRecord>().notNull(),
    active: boolean("active").notNull().default(true),
    ...lifecycleColumns(),
  },
  (table) => [uniqueIndex("rewards_key_unique").on(table.key)],
);

export const rewardClaims = pgTable(
  "reward_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rewardId: uuid("reward_id")
      .notNull()
      .references(() => rewards.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    status: rewardClaimStatusEnum("status").notNull().default("waiting_for_data"),
    selectedStyle: varchar("selected_style", { length: 80 }).notNull(),
    assetSnapshotJson: jsonb("asset_snapshot_json").$type<JsonRecord>().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reward_claims_reward_business_unique").on(
      table.rewardId,
      table.businessId,
    ),
    index("reward_claims_user_status_idx").on(table.userId, table.status),
  ],
);

export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceType: entitlementResourceTypeEnum("resource_type").notNull(),
    resourceId: uuid("resource_id").notNull(),
    source: text("source").notNull(),
    activeFrom: timestamp("active_from", { withTimezone: true }).notNull().defaultNow(),
    activeUntil: timestamp("active_until", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("entitlements_user_resource_unique").on(
      table.userId,
      table.resourceType,
      table.resourceId,
    ),
    index("entitlements_user_active_idx").on(table.userId, table.activeFrom),
  ],
);
