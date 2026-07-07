import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "disabled"]);
export const businessStatusEnum = pgEnum("business_status", [
  "active",
  "archived",
  "suspended",
]);
export const businessStageEnum = pgEnum("business_stage", [
  "starting",
  "operating",
  "growing",
]);
export const businessMemberRoleEnum = pgEnum("business_member_role", [
  "owner",
  "family",
  "staff",
  "mentor",
]);
export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "invited",
  "revoked",
]);
export const digitalComfortEnum = pgEnum("digital_comfort", [
  "guided",
  "standard",
  "fast",
]);
export const fontScaleEnum = pgEnum("font_scale", ["standard", "large"]);
export const preferredDaypartEnum = pgEnum("preferred_daypart", [
  "morning",
  "afternoon",
  "evening",
  "flexible",
]);
export const checkupSourceEnum = pgEnum("checkup_source", [
  "main_site",
  "repeat_mock",
  "recheckup",
]);
export const checkupClaimStatusEnum = pgEnum("checkup_claim_status", [
  "valid",
  "claimed",
  "expired",
  "revoked",
]);
export const checkupBandEnum = pgEnum("checkup_band", [
  "high_priority",
  "medium_priority",
  "reinforcement",
  "strong",
]);
export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "completed",
  "archived",
]);
export const planKindEnum = pgEnum("plan_kind", ["basic_three_focus"]);
export const planStepPriorityEnum = pgEnum("plan_step_priority", [
  "primary",
]);
export const moduleDifficultyEnum = pgEnum("module_difficulty", [
  "basic",
  "intermediate",
  "advanced",
]);
export const entitlementTypeEnum = pgEnum("entitlement_type", [
  "free",
  "premium_preview",
  "paid",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);
export const lessonTypeEnum = pgEnum("lesson_type", [
  "story",
  "reading",
  "video",
  "audio",
  "choice",
  "checklist",
  "template",
]);
export const prerequisiteRuleTypeEnum = pgEnum("prerequisite_rule_type", [
  "module_completed",
  "asset_created",
]);
export const assessmentTypeEnum = pgEnum("assessment_type", [
  "post_test",
  "final_test",
]);
export const questionTypeEnum = pgEnum("question_type", [
  "single_choice",
  "multiple_choice",
  "sequence",
  "scenario",
]);
export const moduleAssignmentStatusEnum = pgEnum("module_assignment_status", [
  "locked",
  "available",
  "active",
  "in_progress",
  "needs_retry",
  "awaiting_evidence",
  "awaiting_review",
  "completed",
]);
export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);
export const taskSubmissionStatusEnum = pgEnum("task_submission_status", [
  "not_started",
  "draft",
  "submitted",
  "needs_revision",
  "approved",
  "auto_approved",
]);
export const syncStateEnum = pgEnum("sync_state", ["synced", "pending", "failed"]);
export const businessAssetStatusEnum = pgEnum("business_asset_status", [
  "draft",
  "ready",
  "needs_review",
  "archived",
]);
export const certificateStatusEnum = pgEnum("certificate_status", [
  "issued",
  "revoked",
]);
export const rewardClaimStatusEnum = pgEnum("reward_claim_status", [
  "waiting_for_data",
  "data_complete",
  "in_progress",
  "owner_review",
  "live",
  "cancelled",
]);
export const entitlementResourceTypeEnum = pgEnum("entitlement_resource_type", [
  "module",
  "reward",
  "premium_path",
]);
export const auditEventTypeEnum = pgEnum("audit_event_type", [
  "claim_associated",
  "task_submitted",
  "asset_created",
  "final_test_passed",
  "recheckup_completed",
  "certificate_issued",
  "reward_claimed",
]);
