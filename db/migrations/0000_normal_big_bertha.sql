CREATE TYPE "public"."assessment_type" AS ENUM('post_test', 'final_test');--> statement-breakpoint
CREATE TYPE "public"."audit_event_type" AS ENUM('claim_associated', 'task_submitted', 'asset_created', 'final_test_passed', 'recheckup_completed', 'certificate_issued', 'reward_claimed');--> statement-breakpoint
CREATE TYPE "public"."business_asset_status" AS ENUM('draft', 'ready', 'needs_review', 'archived');--> statement-breakpoint
CREATE TYPE "public"."business_member_role" AS ENUM('owner', 'family', 'staff', 'mentor');--> statement-breakpoint
CREATE TYPE "public"."business_stage" AS ENUM('starting', 'operating', 'growing');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('active', 'archived', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."certificate_status" AS ENUM('issued', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."checkup_band" AS ENUM('high_priority', 'medium_priority', 'reinforcement', 'strong');--> statement-breakpoint
CREATE TYPE "public"."checkup_claim_status" AS ENUM('valid', 'claimed', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."checkup_source" AS ENUM('main_site', 'repeat_mock', 'recheckup');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."digital_comfort" AS ENUM('guided', 'standard', 'fast');--> statement-breakpoint
CREATE TYPE "public"."entitlement_resource_type" AS ENUM('module', 'reward', 'premium_path');--> statement-breakpoint
CREATE TYPE "public"."entitlement_type" AS ENUM('free', 'premium_preview', 'paid');--> statement-breakpoint
CREATE TYPE "public"."font_scale" AS ENUM('standard', 'large');--> statement-breakpoint
CREATE TYPE "public"."lesson_progress_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('story', 'reading', 'video', 'audio', 'choice', 'checklist', 'template');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('active', 'invited', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."module_assignment_status" AS ENUM('locked', 'available', 'active', 'in_progress', 'needs_retry', 'awaiting_evidence', 'awaiting_review', 'completed');--> statement-breakpoint
CREATE TYPE "public"."module_difficulty" AS ENUM('basic', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."plan_kind" AS ENUM('basic_three_focus');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."plan_step_priority" AS ENUM('primary');--> statement-breakpoint
CREATE TYPE "public"."preferred_daypart" AS ENUM('morning', 'afternoon', 'evening', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."prerequisite_rule_type" AS ENUM('module_completed', 'asset_created');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_choice', 'multiple_choice', 'sequence', 'scenario');--> statement-breakpoint
CREATE TYPE "public"."reward_claim_status" AS ENUM('waiting_for_data', 'data_complete', 'in_progress', 'owner_review', 'live', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sync_state" AS ENUM('synced', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_submission_status" AS ENUM('not_started', 'draft', 'submitted', 'needs_revision', 'approved', 'auto_approved');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "checkup_claim_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"result_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"claimed_by" uuid,
	"claimed_at" timestamp with time zone,
	"status" "checkup_claim_status" DEFAULT 'valid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkup_claim_tokens_claimed_status_check" CHECK (("checkup_claim_tokens"."status" <> 'claimed') or ("checkup_claim_tokens"."claimed_by" is not null and "checkup_claim_tokens"."claimed_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "checkup_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkup_pillar_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"pillar_key" varchar(80) NOT NULL,
	"score" integer NOT NULL,
	"band" "checkup_band" NOT NULL,
	"explanation" text NOT NULL,
	CONSTRAINT "checkup_pillar_scores_score_range" CHECK ("checkup_pillar_scores"."score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "checkup_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"total_score" integer NOT NULL,
	"level" varchar(80) NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"source" "checkup_source" NOT NULL,
	"payload_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkup_results_total_score_range" CHECK ("checkup_results"."total_score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"business_id" uuid,
	"event_type" "audit_event_type" NOT NULL,
	"metadata_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"action_url" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"provider_subject" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_members" (
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "business_member_role" NOT NULL,
	"status" "membership_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_members_pk" PRIMARY KEY("business_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(120) NOT NULL,
	"category" text NOT NULL,
	"stage" "business_stage" NOT NULL,
	"city" text,
	"logo_url" text,
	"status" "business_status" DEFAULT 'active' NOT NULL,
	"profile_completeness" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_profile_completeness_range" CHECK ("businesses"."profile_completeness" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "learning_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"daily_minutes" integer NOT NULL,
	"digital_comfort" "digital_comfort" NOT NULL,
	"preferred_formats" jsonb NOT NULL,
	"preferred_daypart" "preferred_daypart" NOT NULL,
	"font_scale" "font_scale" DEFAULT 'standard' NOT NULL,
	"reminders_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(32),
	"email" varchar(320),
	"avatar_url" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_or_email_check" CHECK ("users"."phone" is not null or "users"."email" is not null)
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "question_type" NOT NULL,
	"prompt" text NOT NULL,
	"options_json" jsonb NOT NULL,
	"answer_json" jsonb NOT NULL,
	"feedback_json" jsonb NOT NULL,
	CONSTRAINT "assessment_questions_position_positive" CHECK ("assessment_questions"."position" > 0)
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"type" "assessment_type" NOT NULL,
	"pass_score" integer DEFAULT 80 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessments_pass_score_range" CHECK ("assessments"."pass_score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "intervention_plan_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"priority" "plan_step_priority" DEFAULT 'primary' NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"unlock_rule" jsonb NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "intervention_plan_steps_basic_three_focus_position" CHECK ("intervention_plan_steps"."position" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "intervention_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"based_on_result_id" uuid NOT NULL,
	"kind" "plan_kind" DEFAULT 'basic_three_focus' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"headline" text NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "lesson_type" NOT NULL,
	"title" text NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"content_json" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_position_positive" CHECK ("lessons"."position" > 0),
	CONSTRAINT "lessons_estimated_minutes_positive" CHECK ("lessons"."estimated_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "module_prerequisites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"prerequisite_module_id" uuid NOT NULL,
	"rule_type" "prerequisite_rule_type" NOT NULL,
	CONSTRAINT "module_prerequisites_not_self" CHECK ("module_prerequisites"."module_id" <> "module_prerequisites"."prerequisite_module_id")
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" text NOT NULL,
	"outcome" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" "module_difficulty" DEFAULT 'basic' NOT NULL,
	"entitlement_type" "entitlement_type" DEFAULT 'free' NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"published_version" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modules_estimated_minutes_positive" CHECK ("modules"."estimated_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text NOT NULL,
	"evidence_schema" jsonb NOT NULL,
	"creates_asset_type" varchar(120) NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(80) NOT NULL,
	"rule_json" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"source_submission_id" uuid,
	"asset_type" varchar(120) NOT NULL,
	"label" text NOT NULL,
	"value_json" jsonb NOT NULL,
	"status" "business_asset_status" DEFAULT 'ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"title" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verification_code" varchar(80) NOT NULL,
	"status" "certificate_status" DEFAULT 'issued' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_type" "entitlement_resource_type" NOT NULL,
	"resource_id" uuid NOT NULL,
	"source" text NOT NULL,
	"active_from" timestamp with time zone DEFAULT now() NOT NULL,
	"active_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "final_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_test_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers_json" jsonb NOT NULL,
	"feedback_json" jsonb NOT NULL,
	"attempt_number" integer NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "final_test_attempts_score_range" CHECK ("final_test_attempts"."score" between 0 and 100),
	CONSTRAINT "final_test_attempts_attempt_number_positive" CHECK ("final_test_attempts"."attempt_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "final_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_test_id" uuid NOT NULL,
	"focus_module_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "question_type" DEFAULT 'scenario' NOT NULL,
	"scenario" text NOT NULL,
	"prompt" text NOT NULL,
	"options_json" jsonb NOT NULL,
	"answer_json" jsonb NOT NULL,
	"feedback_json" jsonb NOT NULL,
	CONSTRAINT "final_test_questions_position_check" CHECK ("final_test_questions"."position" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "final_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pass_score" integer DEFAULT 80 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "final_tests_pass_score_range" CHECK ("final_tests"."pass_score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "recheckups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"original_result_id" uuid NOT NULL,
	"latest_result_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"changed_highlights_json" jsonb NOT NULL,
	"contributing_actions_json" jsonb NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recheckups_result_ids_differ" CHECK ("recheckups"."original_result_id" <> "recheckups"."latest_result_id")
);
--> statement-breakpoint
CREATE TABLE "reward_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reward_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"status" "reward_claim_status" DEFAULT 'waiting_for_data' NOT NULL,
	"selected_style" varchar(80) NOT NULL,
	"asset_snapshot_json" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"title" text NOT NULL,
	"eligibility_rule_json" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text NOT NULL,
	CONSTRAINT "user_badges_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers_json" jsonb NOT NULL,
	"feedback_json" jsonb NOT NULL,
	"attempt_number" integer NOT NULL,
	"idempotency_key" varchar(120),
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_attempts_score_range" CHECK ("assessment_attempts"."score" between 0 and 100),
	CONSTRAINT "assessment_attempts_attempt_number_positive" CHECK ("assessment_attempts"."attempt_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" "lesson_progress_status" DEFAULT 'not_started' NOT NULL,
	"last_position" integer DEFAULT 0 NOT NULL,
	"responses_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sync_state" "sync_state" DEFAULT 'synced' NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_last_position_positive" CHECK ("lesson_progress"."last_position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "module_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_step_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "module_assignment_status" DEFAULT 'locked' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"sync_state" "sync_state" DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"status" "task_submission_status" DEFAULT 'draft' NOT NULL,
	"text_content" text,
	"links_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"files_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reviewer_feedback" text,
	"sync_state" "sync_state" DEFAULT 'synced' NOT NULL,
	"idempotency_key" varchar(120),
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkup_claim_tokens" ADD CONSTRAINT "checkup_claim_tokens_result_id_checkup_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."checkup_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_claim_tokens" ADD CONSTRAINT "checkup_claim_tokens_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_pillar_scores" ADD CONSTRAINT "checkup_pillar_scores_result_id_checkup_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."checkup_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_results" ADD CONSTRAINT "checkup_results_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_results" ADD CONSTRAINT "checkup_results_definition_id_checkup_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."checkup_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_preferences" ADD CONSTRAINT "learning_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_plan_steps" ADD CONSTRAINT "intervention_plan_steps_plan_id_intervention_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."intervention_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_plan_steps" ADD CONSTRAINT "intervention_plan_steps_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_plans" ADD CONSTRAINT "intervention_plans_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_plans" ADD CONSTRAINT "intervention_plans_based_on_result_id_checkup_results_id_fk" FOREIGN KEY ("based_on_result_id") REFERENCES "public"."checkup_results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_prerequisite_module_id_modules_id_fk" FOREIGN KEY ("prerequisite_module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_assets" ADD CONSTRAINT "business_assets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_assets" ADD CONSTRAINT "business_assets_source_submission_id_task_submissions_id_fk" FOREIGN KEY ("source_submission_id") REFERENCES "public"."task_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_plan_id_intervention_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."intervention_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_test_attempts" ADD CONSTRAINT "final_test_attempts_final_test_id_final_tests_id_fk" FOREIGN KEY ("final_test_id") REFERENCES "public"."final_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_test_attempts" ADD CONSTRAINT "final_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_test_questions" ADD CONSTRAINT "final_test_questions_final_test_id_final_tests_id_fk" FOREIGN KEY ("final_test_id") REFERENCES "public"."final_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_test_questions" ADD CONSTRAINT "final_test_questions_focus_module_id_modules_id_fk" FOREIGN KEY ("focus_module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_tests" ADD CONSTRAINT "final_tests_plan_id_intervention_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."intervention_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recheckups" ADD CONSTRAINT "recheckups_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recheckups" ADD CONSTRAINT "recheckups_original_result_id_checkup_results_id_fk" FOREIGN KEY ("original_result_id") REFERENCES "public"."checkup_results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recheckups" ADD CONSTRAINT "recheckups_latest_result_id_checkup_results_id_fk" FOREIGN KEY ("latest_result_id") REFERENCES "public"."checkup_results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recheckups" ADD CONSTRAINT "recheckups_plan_id_intervention_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."intervention_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_assignments" ADD CONSTRAINT "module_assignments_plan_step_id_intervention_plan_steps_id_fk" FOREIGN KEY ("plan_step_id") REFERENCES "public"."intervention_plan_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_assignments" ADD CONSTRAINT "module_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "checkup_claim_tokens_hash_unique" ON "checkup_claim_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "checkup_claim_tokens_result_idx" ON "checkup_claim_tokens" USING btree ("result_id");--> statement-breakpoint
CREATE INDEX "checkup_claim_tokens_claimed_by_idx" ON "checkup_claim_tokens" USING btree ("claimed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "checkup_definitions_version_unique" ON "checkup_definitions" USING btree ("version");--> statement-breakpoint
CREATE UNIQUE INDEX "checkup_pillar_scores_result_pillar_unique" ON "checkup_pillar_scores" USING btree ("result_id","pillar_key");--> statement-breakpoint
CREATE INDEX "checkup_results_business_completed_idx" ON "checkup_results" USING btree ("business_id","completed_at");--> statement-breakpoint
CREATE INDEX "audit_events_business_created_idx" ON "audit_events" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_actor_created_idx" ON "audit_events" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_subject_unique" ON "auth_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "auth_identities_user_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "business_members_user_idx" ON "business_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_active_slug_unique" ON "businesses" USING btree ("slug") WHERE "businesses"."status" = 'active';--> statement-breakpoint
CREATE INDEX "businesses_owner_user_idx" ON "businesses" USING btree ("owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_questions_assessment_position_unique" ON "assessment_questions" USING btree ("assessment_id","position");--> statement-breakpoint
CREATE INDEX "assessments_module_idx" ON "assessments" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "intervention_plan_steps_plan_position_unique" ON "intervention_plan_steps" USING btree ("plan_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "intervention_plan_steps_plan_module_unique" ON "intervention_plan_steps" USING btree ("plan_id","module_id");--> statement-breakpoint
CREATE INDEX "intervention_plans_business_status_idx" ON "intervention_plans" USING btree ("business_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_module_position_unique" ON "lessons" USING btree ("module_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "module_prerequisites_unique" ON "module_prerequisites" USING btree ("module_id","prerequisite_module_id","rule_type");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_slug_unique" ON "modules" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tasks_module_idx" ON "tasks" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_key_unique" ON "badges" USING btree ("key");--> statement-breakpoint
CREATE INDEX "business_assets_business_status_idx" ON "business_assets" USING btree ("business_id","status");--> statement-breakpoint
CREATE INDEX "business_assets_source_submission_idx" ON "business_assets" USING btree ("source_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_verification_code_unique" ON "certificates" USING btree ("verification_code");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_user_plan_unique" ON "certificates" USING btree ("user_id","plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entitlements_user_resource_unique" ON "entitlements" USING btree ("user_id","resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "entitlements_user_active_idx" ON "entitlements" USING btree ("user_id","active_from");--> statement-breakpoint
CREATE UNIQUE INDEX "final_test_attempts_user_attempt_unique" ON "final_test_attempts" USING btree ("final_test_id","user_id","attempt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "final_test_questions_position_unique" ON "final_test_questions" USING btree ("final_test_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "final_test_questions_focus_unique" ON "final_test_questions" USING btree ("final_test_id","focus_module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "final_tests_plan_unique" ON "final_tests" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "recheckups_business_completed_idx" ON "recheckups" USING btree ("business_id","completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_claims_reward_business_unique" ON "reward_claims" USING btree ("reward_id","business_id");--> statement-breakpoint
CREATE INDEX "reward_claims_user_status_idx" ON "reward_claims" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "rewards_key_unique" ON "rewards" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_attempts_user_assessment_attempt_unique" ON "assessment_attempts" USING btree ("user_id","assessment_id","attempt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_attempts_idempotency_unique" ON "assessment_attempts" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "assessment_attempts_assessment_user_idx" ON "assessment_attempts" USING btree ("assessment_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_user_lesson_unique" ON "lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "module_assignments_user_plan_step_unique" ON "module_assignments" USING btree ("user_id","plan_step_id");--> statement-breakpoint
CREATE INDEX "module_assignments_user_status_idx" ON "module_assignments" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "task_submissions_user_task_unique" ON "task_submissions" USING btree ("user_id","task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_submissions_idempotency_unique" ON "task_submissions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "task_submissions_task_status_idx" ON "task_submissions" USING btree ("task_id","status");