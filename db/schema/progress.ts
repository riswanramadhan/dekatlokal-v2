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
  lessonProgressStatusEnum,
  moduleAssignmentStatusEnum,
  syncStateEnum,
  taskSubmissionStatusEnum,
} from "@/db/schema/enums";
import { users } from "@/db/schema/identity";
import {
  assessments,
  interventionPlanSteps,
  lessons,
  tasks,
} from "@/db/schema/learning";
import { JsonRecord, lifecycleColumns } from "@/db/schema/shared";

export const moduleAssignments = pgTable(
  "module_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planStepId: uuid("plan_step_id")
      .notNull()
      .references(() => interventionPlanSteps.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: moduleAssignmentStatusEnum("status").notNull().default("locked"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    syncState: syncStateEnum("sync_state").notNull().default("synced"),
  },
  (table) => [
    uniqueIndex("module_assignments_user_plan_step_unique").on(
      table.userId,
      table.planStepId,
    ),
    index("module_assignments_user_status_idx").on(table.userId, table.status),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: lessonProgressStatusEnum("status").notNull().default("not_started"),
    lastPosition: integer("last_position").notNull().default(0),
    responsesJson: jsonb("responses_json").$type<JsonRecord>().notNull().default({}),
    syncState: syncStateEnum("sync_state").notNull().default("synced"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_unique").on(
      table.userId,
      table.lessonId,
    ),
    check("lesson_progress_last_position_positive", sql`${table.lastPosition} >= 0`),
  ],
);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    answersJson: jsonb("answers_json").$type<JsonRecord>().notNull(),
    feedbackJson: jsonb("feedback_json").$type<JsonRecord>().notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 120 }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_attempts_user_assessment_attempt_unique").on(
      table.userId,
      table.assessmentId,
      table.attemptNumber,
    ),
    uniqueIndex("assessment_attempts_idempotency_unique").on(table.idempotencyKey),
    index("assessment_attempts_assessment_user_idx").on(
      table.assessmentId,
      table.userId,
    ),
    check("assessment_attempts_score_range", sql`${table.score} between 0 and 100`),
    check(
      "assessment_attempts_attempt_number_positive",
      sql`${table.attemptNumber} > 0`,
    ),
  ],
);

export const taskSubmissions = pgTable(
  "task_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    status: taskSubmissionStatusEnum("status").notNull().default("draft"),
    textContent: text("text_content"),
    linksJson: jsonb("links_json").$type<JsonRecord>().notNull().default({}),
    filesJson: jsonb("files_json").$type<JsonRecord>().notNull().default({}),
    reviewerFeedback: text("reviewer_feedback"),
    syncState: syncStateEnum("sync_state").notNull().default("synced"),
    idempotencyKey: varchar("idempotency_key", { length: 120 }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("task_submissions_user_task_unique").on(table.userId, table.taskId),
    uniqueIndex("task_submissions_idempotency_unique").on(table.idempotencyKey),
    index("task_submissions_task_status_idx").on(table.taskId, table.status),
  ],
);
