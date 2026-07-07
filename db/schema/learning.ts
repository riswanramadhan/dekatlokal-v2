import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { checkupResults } from "@/db/schema/checkups";
import {
  assessmentTypeEnum,
  contentStatusEnum,
  entitlementTypeEnum,
  lessonTypeEnum,
  moduleDifficultyEnum,
  planKindEnum,
  planStatusEnum,
  planStepPriorityEnum,
  prerequisiteRuleTypeEnum,
  questionTypeEnum,
} from "@/db/schema/enums";
import { businesses } from "@/db/schema/identity";
import { JsonRecord, lifecycleColumns } from "@/db/schema/shared";

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: text("title").notNull(),
    outcome: text("outcome").notNull(),
    description: text("description").notNull(),
    difficulty: moduleDifficultyEnum("difficulty").notNull().default("basic"),
    entitlementType: entitlementTypeEnum("entitlement_type").notNull().default("free"),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    publishedVersion: integer("published_version").notNull().default(1),
    status: contentStatusEnum("status").notNull().default("draft"),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("modules_slug_unique").on(table.slug),
    check(
      "modules_estimated_minutes_positive",
      sql`${table.estimatedMinutes} > 0`,
    ),
  ],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    type: lessonTypeEnum("type").notNull(),
    title: text("title").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    contentJson: jsonb("content_json").$type<JsonRecord>().notNull(),
    version: integer("version").notNull().default(1),
    status: contentStatusEnum("status").notNull().default("published"),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("lessons_module_position_unique").on(table.moduleId, table.position),
    check("lessons_position_positive", sql`${table.position} > 0`),
    check(
      "lessons_estimated_minutes_positive",
      sql`${table.estimatedMinutes} > 0`,
    ),
  ],
);

export const modulePrerequisites = pgTable(
  "module_prerequisites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    prerequisiteModuleId: uuid("prerequisite_module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "restrict" }),
    ruleType: prerequisiteRuleTypeEnum("rule_type").notNull(),
  },
  (table) => [
    uniqueIndex("module_prerequisites_unique").on(
      table.moduleId,
      table.prerequisiteModuleId,
      table.ruleType,
    ),
    check(
      "module_prerequisites_not_self",
      sql`${table.moduleId} <> ${table.prerequisiteModuleId}`,
    ),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    instructions: text("instructions").notNull(),
    evidenceSchema: jsonb("evidence_schema").$type<JsonRecord>().notNull(),
    createsAssetType: varchar("creates_asset_type", { length: 120 }).notNull(),
    required: boolean("required").notNull().default(true),
    ...lifecycleColumns(),
  },
  (table) => [index("tasks_module_idx").on(table.moduleId)],
);

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    type: assessmentTypeEnum("type").notNull(),
    passScore: integer("pass_score").notNull().default(80),
    version: integer("version").notNull().default(1),
    status: contentStatusEnum("status").notNull().default("published"),
    ...lifecycleColumns(),
  },
  (table) => [
    index("assessments_module_idx").on(table.moduleId),
    check(
      "assessments_pass_score_range",
      sql`${table.passScore} between 0 and 100`,
    ),
  ],
);

export const assessmentQuestions = pgTable(
  "assessment_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    type: questionTypeEnum("type").notNull(),
    prompt: text("prompt").notNull(),
    optionsJson: jsonb("options_json").$type<JsonRecord>().notNull(),
    answerJson: jsonb("answer_json").$type<JsonRecord>().notNull(),
    feedbackJson: jsonb("feedback_json").$type<JsonRecord>().notNull(),
  },
  (table) => [
    uniqueIndex("assessment_questions_assessment_position_unique").on(
      table.assessmentId,
      table.position,
    ),
    check("assessment_questions_position_positive", sql`${table.position} > 0`),
  ],
);

export const interventionPlans = pgTable(
  "intervention_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    basedOnResultId: uuid("based_on_result_id")
      .notNull()
      .references(() => checkupResults.id, { onDelete: "restrict" }),
    kind: planKindEnum("kind").notNull().default("basic_three_focus"),
    version: integer("version").notNull().default(1),
    status: planStatusEnum("status").notNull().default("active"),
    headline: text("headline").notNull(),
    rationale: text("rationale").notNull(),
    ...lifecycleColumns(),
  },
  (table) => [
    index("intervention_plans_business_status_idx").on(
      table.businessId,
      table.status,
    ),
  ],
);

export const interventionPlanSteps = pgTable(
  "intervention_plan_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => interventionPlans.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    priority: planStepPriorityEnum("priority").notNull().default("primary"),
    required: boolean("required").notNull().default(true),
    unlockRule: jsonb("unlock_rule").$type<JsonRecord>().notNull(),
    reason: text("reason").notNull(),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("intervention_plan_steps_plan_position_unique").on(
      table.planId,
      table.position,
    ),
    uniqueIndex("intervention_plan_steps_plan_module_unique").on(
      table.planId,
      table.moduleId,
    ),
    check(
      "intervention_plan_steps_basic_three_focus_position",
      sql`${table.position} between 1 and 3`,
    ),
  ],
);
