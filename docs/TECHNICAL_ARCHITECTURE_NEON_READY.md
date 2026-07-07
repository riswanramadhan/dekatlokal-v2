# TECHNICAL ARCHITECTURE — NEON READY, MOCK FIRST
# DekatLokal Platform V2

## 1. Architecture Decision

Use a contract-first modular frontend:

```text
UI
→ application services
→ repository interfaces
→ mock adapters (demo default)
→ Neon adapters (future)
→ Neon Postgres
```

The UI must not know whether data comes from fixtures, API routes, or Neon.

---

## 2. Recommended Stack

- Next.js App Router.
- TypeScript strict.
- Tailwind CSS.
- Radix UI or shadcn/ui primitives.
- React Hook Form.
- Zod.
- Mock Service Worker.
- Drizzle ORM for Neon schema.
- `@neondatabase/serverless`.
- Vitest.
- React Testing Library.
- Playwright.
- Optional Storybook.

### Rules

- Server Components for initial data and secret-bearing operations.
- Client Components only for interaction/browser state.
- Route Handlers or Server Actions for future mutations.
- Database connection never imported into browser bundles.
- `server-only` protection for database modules.
- Pooled Neon URL for application queries.
- Direct URL reserved for migration tooling when required.

---

## 3. Runtime Modes

```env
DATA_SOURCE=mock
```

### Mock mode

- Default.
- No database.
- MSW/repository fixtures.
- Suitable for Vercel preview.
- Scenario switcher in development only.

### Neon mode

```env
DATA_SOURCE=neon
DATABASE_URL=...
DIRECT_URL=...
```

- Server-side only.
- Activated after product approval.
- Repository factory chooses API/Neon adapter.
- Client never reads `DATABASE_URL`.

Do not expose data-source switching through public UI.

---

## 4. Suggested Folder Structure

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (app)/
│   └── api/
├── components/
│   ├── ui/
│   ├── app-shell/
│   ├── dashboard/
│   ├── checkup/
│   ├── learning/
│   ├── assessment/
│   ├── tasks/
│   ├── progress/
│   └── rewards/
├── features/
│   ├── auth/
│   ├── claim/
│   ├── onboarding/
│   ├── personalization/
│   ├── learning-path/
│   ├── lesson/
│   ├── assessment/
│   ├── evidence/
│   ├── assets/
│   ├── certificate/
│   └── rewards/
├── domain/
│   ├── entities/
│   ├── schemas/
│   ├── repositories/
│   └── services/
├── infrastructure/
│   ├── mock/
│   ├── api/
│   ├── neon/
│   └── storage/
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── client.ts
│   └── seed.ts
├── lib/
│   ├── env.ts
│   ├── auth/
│   ├── analytics/
│   └── utils/
└── tests/
```

---

## 5. Repository Contracts

```ts
export interface DashboardRepository {
  getDashboard(userId: string): Promise<DashboardView>;
}

export interface CheckupRepository {
  claim(input: ClaimCheckupInput): Promise<ClaimResult>;
  getLatest(businessId: string): Promise<CheckupResult>;
  repeat(input: RepeatCheckupInput): Promise<CheckupResult>;
}

export interface LearningRepository {
  getActivePlan(userId: string): Promise<InterventionPlan>;
  getModule(moduleId: string): Promise<LearningModule>;
  startModule(moduleId: string): Promise<ModuleProgress>;
  completeLesson(input: CompleteLessonInput): Promise<LessonProgress>;
}

export interface AssessmentRepository {
  submitAttempt(input: SubmitAssessmentInput): Promise<AssessmentResult>;
}

export interface EvidenceRepository {
  saveDraft(input: EvidenceDraftInput): Promise<EvidenceSubmission>;
  submit(input: SubmitEvidenceInput): Promise<EvidenceSubmission>;
}

export interface AssetRepository {
  listBusinessAssets(businessId: string): Promise<BusinessAsset[]>;
}

export interface RewardRepository {
  getEligibility(userId: string): Promise<RewardEligibility>;
  claim(input: RewardClaimInput): Promise<RewardClaim>;
}
```

---

## 6. Data Source Factory

```ts
export function createRepositories(mode: "mock" | "neon") {
  if (mode === "neon") {
    return createNeonRepositories();
  }

  return createMockRepositories();
}
```

Repository selection occurs server-side whenever possible.

---

## 7. Neon Database Blueprint

### Identity

#### users

- id.
- name.
- phone.
- email.
- avatar_url.
- status.
- created_at.
- updated_at.

#### auth_identities

- id.
- user_id.
- provider.
- provider_subject.
- verified_at.

#### businesses

- id.
- owner_user_id.
- name.
- slug.
- category.
- stage.
- city.
- logo_url.
- status.
- profile_completeness.
- created_at.
- updated_at.

#### business_members

- business_id.
- user_id.
- role.
- status.

#### learning_preferences

- user_id.
- daily_minutes.
- digital_comfort.
- preferred_formats.
- preferred_daypart.
- font_scale.
- reminders_enabled.

### Digital Checkup

#### checkup_definitions

- id.
- version.
- title.
- active.

#### checkup_results

- id.
- business_id.
- definition_id.
- total_score.
- level.
- completed_at.
- source.
- payload_snapshot.

#### checkup_pillar_scores

- result_id.
- pillar_key.
- score.
- band.
- explanation.

#### checkup_claim_tokens

- id.
- token_hash.
- result_id.
- expires_at.
- claimed_by.
- claimed_at.
- status.

### Personalization

#### intervention_plans

- id.
- business_id.
- based_on_result_id.
- version.
- status.
- headline.
- rationale.
- created_at.

#### intervention_plan_steps

- id.
- plan_id.
- module_id.
- position.
- priority.
- required.
- unlock_rule.
- reason.

### Learning content

#### modules

- id.
- slug.
- title.
- outcome.
- description.
- difficulty.
- entitlement_type.
- estimated_minutes.
- published_version.
- status.

#### lessons

- id.
- module_id.
- position.
- type.
- title.
- estimated_minutes.
- content_json.
- version.

#### module_prerequisites

- module_id.
- prerequisite_module_id.
- rule_type.

#### tasks

- id.
- module_id.
- title.
- instructions.
- evidence_schema.
- creates_asset_type.
- required.

#### assessments

- id.
- module_id.
- type.
- pass_score.
- version.

#### assessment_questions

- id.
- assessment_id.
- position.
- type.
- prompt.
- options_json.
- answer_json.
- feedback_json.

### Progress

#### module_assignments

- id.
- plan_step_id.
- user_id.
- status.
- assigned_at.
- started_at.
- completed_at.

#### lesson_progress

- user_id.
- lesson_id.
- status.
- last_position.
- completed_at.
- updated_at.

#### assessment_attempts

- id.
- user_id.
- assessment_id.
- score.
- passed.
- answers_json.
- feedback_json.
- attempt_number.
- submitted_at.

#### task_submissions

- id.
- user_id.
- task_id.
- status.
- text_content.
- links_json.
- files_json.
- reviewer_feedback.
- submitted_at.
- updated_at.

### Assets and outcomes

#### business_assets

- id.
- business_id.
- source_submission_id.
- asset_type.
- label.
- value_json.
- status.
- created_at.
- updated_at.

#### badges

- id.
- key.
- name.
- description.
- icon.
- rule_json.

#### user_badges

- user_id.
- badge_id.
- awarded_at.
- source.

#### certificates

- id.
- user_id.
- business_id.
- plan_id.
- title.
- issued_at.
- verification_code.
- status.

### Rewards and premium

#### rewards

- id.
- key.
- title.
- eligibility_rule_json.
- active.

#### reward_claims

- id.
- reward_id.
- user_id.
- business_id.
- status.
- selected_style.
- asset_snapshot_json.
- submitted_at.
- updated_at.

#### entitlements

- id.
- user_id.
- resource_type.
- resource_id.
- source.
- active_from.
- active_until.

#### purchases

Future only.

### Communication

#### notifications

- id.
- user_id.
- type.
- title.
- body.
- action_url.
- read_at.
- created_at.

#### audit_events

- id.
- actor_user_id.
- business_id.
- event_type.
- metadata_json.
- created_at.

---

## 8. Database Constraints

- Unique phone/email where appropriate.
- Unique active slug.
- Foreign keys.
- Check score range 0–100.
- Unique lesson progress per user+lesson.
- Unique assignment per user+plan step.
- Single-use claim token.
- Idempotency keys for submissions.
- Soft delete/status for content.
- Version snapshots for checkup and content.

---

## 9. Security Preparation

- Database server-side only.
- Environment validated with Zod.
- No secret with `NEXT_PUBLIC_`.
- Token hashes stored, not raw token.
- Rate limiting planned for auth and claim.
- Authorization checks on every business resource.
- Audit claim, evidence, certificate, reward.
- File upload uses signed URL later.
- Sanitize rich content.
- Data retention policy.
- Consent and privacy.
- RLS may be added, but server authorization remains mandatory.

---

## 10. API Contract

```text
POST /api/v1/auth/mock-login
POST /api/v1/checkups/claim
GET  /api/v1/me/dashboard
GET  /api/v1/me/checkups/latest
GET  /api/v1/me/plans/active
GET  /api/v1/modules/:id
POST /api/v1/modules/:id/start
POST /api/v1/lessons/:id/complete
POST /api/v1/assessments/:id/attempts
PUT  /api/v1/tasks/:id/evidence/draft
POST /api/v1/tasks/:id/evidence/submit
GET  /api/v1/me/assets
GET  /api/v1/me/progress
POST /api/v1/checkups/repeat
GET  /api/v1/me/rewards/eligibility
POST /api/v1/rewards/:id/claim
```

Mock and production must follow the same request/response schemas.

---

## 11. Environment Example

```env
NEXT_PUBLIC_MAIN_SITE_URL=https://dekatlokal.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATA_SOURCE=mock
NEXT_PUBLIC_DEMO_SCENARIO=culinary-new-user

DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=

# Future
BLOB_READ_WRITE_TOKEN=
WHATSAPP_PROVIDER_TOKEN=
ANALYTICS_WRITE_KEY=
```

---

## 12. Database Implementation Phase

When activated:

1. Create Neon project.
2. Create development branch.
3. Configure pooled `DATABASE_URL`.
4. Configure direct `DIRECT_URL` for migration if needed.
5. Generate initial migration.
6. Seed learning content.
7. Run smoke query in server environment.
8. Implement Neon repositories one domain at a time.
9. Keep contract tests against both adapters.
10. Switch preview environment only.
11. Run security and authorization tests.
12. Switch production after rollback plan.

---

## 13. Testing

### Unit

- Recommendation.
- Gating.
- Progress.
- Eligibility.
- Schema.

### Contract

Run the same repository behavior tests against:

- Mock.
- Neon test branch later.

### Component

- Next action.
- Path nodes.
- Quiz.
- Evidence.
- Scores.

### E2E

- Claim to dashboard.
- Resume.
- Fail and correct.
- Task.
- Final.
- Recheckup.
- Reward.

---

## 14. Performance

- Server-render initial shell/data.
- Minimize Client Components.
- Dynamic import heavy interactions.
- Image optimization.
- No dashboard overfetch.
- Prefetch only next action.
- Cache static content.
- Avoid shipping database/ORM to client.
