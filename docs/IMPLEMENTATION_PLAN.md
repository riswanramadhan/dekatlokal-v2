# DekatLokal Platform V2 Implementation Plan

Status: P0.5.1 implemented, P0.6 next  
Target domain: app.dekatlokal.com  
Current delivery: high-fidelity frontend demo with realistic mock data  
Default data source: mock  
Language: Indonesian customer-facing copy

## 1. Repository Audit

### Current app repository

The repository is a very lean Next.js App Router project.

- Framework: Next.js 16 App Router, React 19, TypeScript strict.
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`.
- Current app files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- Current UI: default Create Next App landing content. It should be replaced during P0.1, but no product screens are built in this planning task.
- Existing path alias: `@/*` maps to repository root.
- Scripts available now: `dev`, `build`, `start`, `lint`.
- Missing quality scripts: `typecheck`, `test`, `test:e2e`, `check`.
- Existing env example: `env.example`; expected future name should be `.env.example` unless the team intentionally keeps `env.example`.
- Current docs present: PRD, brand/UI guide, technical architecture.
- Current brand assets in this repo:
  - `public/brand/dekat-lokal.svg`
  - `public/brand/dekat-lokal.png`
  - `public/brand/dekat-lokal-2.png`
  - `public/brand/dekat-lokal-icon.png`
  - root favicon and Android icons

### Read-only sibling public-site audit

The local sibling repository `C:\dekat-lokal-web` appears to contain the current public `dekatlokal.com` source and was inspected read-only.

Relevant brand findings:

- Public site uses Poppins as the primary brand font, with Geist Sans and Geist Mono as supporting fonts.
- Primary token is `#0255F5`.
- Primary scale used by public site:
  - `#EBF1FE`
  - `#B7CFFC`
  - `#83AEFA`
  - `#4F8DF8`
  - `#1B6CF6`
  - `#0255F5`
  - `#0244C4`
  - `#013393`
  - `#012262`
  - `#001131`
- Public site assets include:
  - `public/image/brand/*`
  - `public/image/illustrations/welcome-illustration.png`
  - `public/image/logos/partners/*`
  - `public/image/logos/umkm/*`
  - `public/image/system/splashscreen-dekatlokal.gif`
- Public site style language uses white surfaces, soft blue accents, rounded cards, controlled shadows, practical Indonesian copy, and restrained branded motion.

The app repository should not import from or modify the sibling repository. Any needed assets should be intentionally copied into `public/brand` or a future `public/brand/illustrations` folder.

## 2. Brand Alignment Strategy

### Source of truth

Use the app repository's `public/brand` assets first. Use sibling public-site tokens as reference only.

### Visual direction

The product should feel like the signed-in extension of DekatLokal:

- Mobile-first, calm, clear, and supportive.
- White and soft neutral background.
- Primary blue `#0255F5` with the public-site blue scale.
- Poppins as the preferred sans font if approved for the app, with Geist fallback.
- Cards with soft border, controlled shadow, and 16px to 22px radius.
- Focused product hierarchy, especially on the dashboard first viewport.
- Adult gamification through progress, outcomes, and encouraging copy.

### Anti-patterns to avoid

- Generic SaaS dashboard layout.
- Course marketplace grid.
- Wall of equal cards above the fold.
- Unrelated purple/pink neon gradients.
- Heavy glassmorphism.
- Childish reward language or mascot-heavy UI.
- Hover-only interactions.
- Tiny supporting text that carries essential information.

### Product language

Use customer-facing terms consistently:

- Ruang Tumbuh
- Jalur Naik Kelas
- Langkah Terbaik Hari Ini
- Jejak Tumbuh
- Poin Tumbuh
- Aset Usaha
- Checkup ulang

Avoid in customer-facing UI:

- intervention
- LMS
- remedial
- failed
- funnel
- compliance

## 3. Architecture and Data Boundaries

### Layering

The app should follow the contract-first architecture from the technical architecture doc:

```text
UI
-> application services
-> repository interfaces
-> mock adapter by default
-> Neon adapter boundary for later
-> Neon Postgres later
```

Rules:

- UI components never import fixtures.
- Server Components fetch initial data through services/repositories.
- Client Components are used only for interaction, local draft state, browser APIs, and form behavior.
- Repository selection is server-side.
- Database modules import `server-only`.
- Client code never imports database clients, Drizzle schema, Neon adapters, or server env.
- All request/response and repository payloads are validated with Zod.

### Suggested source structure

The current repo has `app/` at root. P0.1 should either keep root `app/` or migrate to `src/app/`. Recommendation: keep root `app/` for P0 to reduce churn, while adding root-level `components`, `features`, `domain`, `infrastructure`, `lib`, `db`, and `tests`.

```text
app/
  (public)/
  (auth)/
  (app)/
  api/
components/
  ui/
  app-shell/
  dashboard/
  checkup/
  learning/
  assessment/
  tasks/
  progress/
  rewards/
features/
  auth/
  claim/
  onboarding/
  personalization/
  learning-path/
  lesson/
  assessment/
  evidence/
  assets/
  certificate/
  rewards/
domain/
  entities/
  schemas/
  repositories/
  services/
infrastructure/
  mock/
  neon/
  storage/
lib/
  env.ts
  analytics/
  utils/
db/
  schema/
  migrations/
tests/
```

## 4. Mock-first and Neon-ready Strategy

### Runtime modes

`DATA_SOURCE=mock` remains the default for local, preview, and demo.

`DATA_SOURCE=neon` is prepared structurally but not activated in P0 demo work.

### Mock mode

Mock mode must provide realistic stateful scenarios:

- Guided culinary new user.
- Fast fashion user.
- Returning service business.
- Expired claim.
- No checkup.
- Offline.
- Upload failure.
- Quiz failure.
- Reward eligible.

Implementation approach:

- Mock fixtures live under `infrastructure/mock`.
- Mock repositories implement the same interfaces as future Neon repositories.
- Scenario selection is development-only and unavailable in production.
- Mock mutation behavior can use in-memory/session storage for demo continuity, with clear reset behavior.

### Neon-ready boundary

Prepare but do not activate:

- Drizzle schema files under `db/schema`.
- Empty migrations folder.
- Neon repository placeholders under `infrastructure/neon`.
- Repository factory that rejects or is guarded when `DATA_SOURCE=neon` lacks required server env.
- `.env.example` values for future `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`.

## 5. Route Structure

Route details are maintained in `docs/ROUTE_MAP.md`. Summary:

- Public bridge and auth routes live outside the signed-in app group.
- Signed-in routes live under `/app`.
- Mobile bottom tabs map to:
  - `/app/beranda`
  - `/app/jalur`
  - `/app/progres`
  - `/app/akun`
- The root `/` should route to the right entry state for the demo, such as `/masuk` or `/app/beranda` depending on mock session.
- Claim tokens are opaque and can appear as `?token=...`; scores and private checkup data never appear in query strings.

## 6. Component and Feature Boundaries

### `components/ui`

Reusable primitives:

- Button
- IconButton
- Card
- Input
- Select
- Checkbox
- RadioGroup
- SegmentedControl
- Tabs
- Dialog
- Toast
- Progress
- Skeleton
- EmptyState
- ErrorState
- OfflineBanner
- FixedCta

These components are data-agnostic.

### `components/app-shell`

App chrome:

- MobileHeader
- BottomNavigation
- DesktopShell
- AccountMenu
- NotificationButton
- TekapButton
- SafeAreaSpacer

### Feature components

Feature components may receive typed view models but should not import mock fixtures.

- Dashboard: next action, insight, weekly path, progress glimpse.
- Checkup: score interpretation, pillar bars, priority explanation.
- Learning path: path timeline, locked preview, prerequisite messaging.
- Module: detail, lessons, task requirement, completion rules.
- Lesson: concept screen, media shell, interaction blocks, fixed CTA.
- Assessment: quiz, feedback, corrective route.
- Evidence: draft, upload mock, submit, retry, sync pending.
- Assets: list, detail, source module.
- Progress: Jejak Tumbuh, before/after, badges, Poin Tumbuh.
- Rewards: eligibility checklist, landing page claim, tracking.

## 7. Domain Models

Domain models should be defined as TypeScript types plus Zod schemas. Initial model groups:

- User
- AuthIdentity
- Business
- BusinessMember
- LearningPreference
- PendingCheckupClaim
- CheckupResult
- CheckupPillarScore
- InterventionPlan
- PlanStep
- NextBestAction
- LearningModule
- Lesson
- LessonProgress
- Assessment
- AssessmentAttempt
- AssessmentResult
- CorrectiveAssignment
- BusinessTask
- EvidenceDraft
- EvidenceSubmission
- BusinessAsset
- ProgressSummary
- Badge
- Certificate
- RecheckupComparison
- RewardEligibility
- RewardClaim
- Notification
- AnalyticsEvent

Important enums:

- `DigitalComfort`: `guided`, `standard`, `fast`
- `BusinessStage`: `starting`, `operating`, `growing`
- `ModuleState`: `locked`, `available`, `in_progress`, `needs_retry`, `awaiting_evidence`, `awaiting_review`, `completed`
- `TaskStatus`: `not_started`, `draft`, `submitted`, `needs_revision`, `approved`, `auto_approved`
- `SyncState`: `synced`, `pending`, `failed`
- `DataSource`: `mock`, `neon`

## 8. State Management Approach

Prefer server data and URL state first.

- Server Components load route-level view models through services.
- Client state is limited to UI interaction, forms, lesson step state, upload mocks, optimistic draft state, and scenario switching in development.
- Forms use React Hook Form plus Zod when dependencies are added.
- Avoid global client stores in P0 unless interaction complexity proves it is needed.
- Persist resumable lesson/task draft state through repository methods, not direct fixture mutation from UI.
- Offline and sync pending states should be modeled in repositories and surfaced through view models.

## 9. Accessibility Strategy

Target WCAG 2.2 AA.

Implementation requirements:

- `<html lang="id">`.
- Semantic headings and landmarks.
- Visible focus states on all interactive elements.
- 44px minimum interactive target, 48px for dominant CTA.
- Body text at least 16px.
- Form labels and error associations.
- No color-only status.
- Reduced motion support.
- Keyboard access for bottom nav, dialogs, quizzes, segmented controls, and fixed CTAs.
- Transcript/caption placeholders for media lessons.
- Large text preference supported through learner preference.
- Fixed CTA never covers content because pages include safe-area spacers.

## 10. Mobile Verification Strategy

Primary widths:

- 360px minimum.
- 390px primary design width.
- 430px large mobile sanity check.

Critical checks:

- No horizontal overflow.
- First dashboard viewport contains greeting, business identity, one next action, rationale, time, and one CTA.
- Bottom navigation does not overlap fixed CTA.
- Safe-area padding works.
- Text does not overflow cards or buttons.
- Locked modules are previewable but cannot be started.
- Loading, empty, error, offline, retry, success, locked, unauthorized, and sync pending states are reachable.
- Keyboard focus order remains logical on mobile and desktop.
- Console has no runtime errors.

Use Playwright once P0.1 adds it. Until then, manually verify with browser devtools after running `npm run dev`.

## 11. Test Strategy

### P0.1 test infrastructure

Add scripts:

- `typecheck`: `tsc --noEmit`
- `test`: `vitest run`
- `test:e2e`: `playwright test`
- `check`: lint, typecheck, tests, build

Recommended dependencies to explain before installing:

- `zod`: schema validation for env, domain payloads, and repository contracts.
- `server-only`: prevents database/server modules from entering client bundles.
- `lucide-react`: consistent icon system.
- `clsx` and `tailwind-merge`: safe class composition.
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`: unit/component tests.
- `@playwright/test`, optionally `@axe-core/playwright`: route, viewport, and accessibility checks.
- Later: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`.

### Test coverage by risk

- Unit: personalization, gating, completion, reward eligibility, env parsing.
- Contract: repository behavior against mock first, Neon later.
- Component: next action, locked path node, quiz feedback, evidence retry, score bars.
- E2E: claim to onboarding, dashboard next action, locked preview, quiz failure and correction, task submit, asset creation, reward eligible.

## 12. Exact Milestone Scope

### P0.1 Foundation, brand system, repository contracts, and app shell

Goal: create the app foundation without building full product screens.

Implementation status: complete.

Scope:

- Replace default metadata with DekatLokal app metadata.
- Set `lang="id"`.
- Add app tokens from brand guide and sibling audit.
- Add font setup, likely Poppins plus Geist fallback.
- Establish folder boundaries.
- Add env validation.
- Add domain schemas and repository interfaces.
- Add mock repository factory skeleton.
- Add app shell layout with mobile header/bottom nav placeholders.
- Add state primitives for loading, empty, error, offline, locked, unauthorized, sync pending.
- Add initial quality scripts and test setup.

Expected files:

- `app/layout.tsx`
- `app/globals.css`
- `app/(app)/layout.tsx`
- `app/(app)/app/beranda/page.tsx` placeholder only
- `components/ui/*`
- `components/app-shell/*`
- `domain/entities/*`
- `domain/schemas/*`
- `domain/repositories/*`
- `domain/services/*`
- `infrastructure/mock/*`
- `infrastructure/neon/*`
- `lib/env.ts`
- `.env.example`
- `tests/*`
- `package.json`
- test config files

Done when:

- App shell renders branded but not feature-complete product screens.
- Repository contracts compile.
- `DATA_SOURCE=mock` is default.
- Lint, typecheck, tests, and build run.

Implemented files and outcomes:

- Replaced the default Next.js landing page with a `/masuk` redirect.
- Added Indonesian metadata, `lang="id"`, Poppins plus Geist fallback, and DekatLokal tokens in `app/globals.css`.
- Added accessible UI primitives for buttons, cards, inputs, progress, fixed CTA, offline banner, and reusable app states.
- Added signed-in app shell with mobile header, four-item bottom navigation, desktop sidebar, notification entry point, Tekap helper entry point, safe-area spacing, and development-only scenario selector.
- Added meaningful foundation routes: `/masuk`, `/daftar`, `/verifikasi`, `/hubungkan-checkup`, `/app/beranda`, `/app/jalur`, `/app/progres`, `/app/akun`.
- Added development-only `/dev/design-system`; the route returns not found in production.
- Added Zod domain schemas, TypeScript model exports, repository contracts, mock repositories, mock scenario fixtures, and a server-only Neon adapter boundary placeholder.
- Added `.env.example`, `lib/env.ts`, and `.gitignore` exception for the env template.
- Added Vitest, Testing Library, and Playwright configuration plus unit, component, and responsive/keyboard checks.
- Did not connect Neon, production auth, OTP, payment, AI, or mentor review.

### P0.2 Auth UI, checkup claim, and onboarding

Goal: make the entry journey believable with mock auth and opaque claim.

Implementation status: complete.

Scope:

- Mock login/signup UI.
- Mock OTP verification.
- Claim token states: loading, success, expired, already claimed, no result, offline.
- Onboarding maximum five steps.
- Business confirmation.
- Learning preference.
- Path reveal.
- Scenario switcher in development only.

Expected files:

- `app/(auth)/masuk/page.tsx`
- `app/(auth)/daftar/page.tsx`
- `app/(auth)/verifikasi/page.tsx`
- `app/(public)/hubungkan-checkup/page.tsx`
- `app/(public)/onboarding/page.tsx`
- `features/auth/*`
- `features/claim/*`
- `features/onboarding/*`
- `components/checkup/*`
- `infrastructure/mock/scenarios/*`
- repository contract tests for claim/onboarding

Done when:

- Claim flow does not expose scores in query strings.
- Expired claim and no-checkup scenarios are demoable.
- Onboarding completion creates/loads an active mock plan.

Implemented files and outcomes:

- `/daftar?claim=...` starts the mocked handoff from the public Digital Checkup.
- `/masuk` now supports WhatsApp-first login, Google visual mock alternative, and email fallback.
- `/daftar` supports signup with claim token carry-forward.
- `/verifikasi` supports six-digit mock OTP states: invalid, expired, resend, and success.
- `/hubungkan-checkup` renders success, expired, already claimed, missing, mismatch, and offline claim states without exposing scores in query strings.
- `/onboarding` implements five steps: welcome, business confirmation, learning preferences, reminder rhythm, and path reveal.
- Onboarding supports guided/standard/fast, 5/10/15 minutes, video/audio/text/mixed, standard/large text, and reminder daypart.
- Persistence uses a server-side mock session cookie through `infrastructure/storage`; page components do not access `localStorage` or cookies directly.
- Dashboard/app view applies persisted business and preference overrides after refresh.
- Added P0.2 tests for validation, claim transitions, session persistence, OTP states, and full E2E happy path.

### P0.3 Personalized dashboard, checkup result, path, and module detail

Goal: prove the central product thesis.

Implementation status: complete.

Scope:

- Ruang Tumbuh dashboard.
- First viewport prioritizes one `Langkah Terbaik Hari Ini`.
- Recommendation rationale shown.
- Checkup result page with human interpretation and pillar bars.
- Jalur Naik Kelas timeline.
- Module detail with locked preview and prerequisite explanation.
- Route guard for locked start attempts.

Expected files:

- `app/(app)/app/beranda/page.tsx`
- `app/(app)/app/hasil-checkup/page.tsx`
- `app/(app)/app/jalur/page.tsx`
- `app/(app)/app/jalur/[planId]/page.tsx`
- `app/(app)/app/modul/[moduleSlug]/page.tsx`
- `features/personalization/*`
- `features/learning-path/*`
- `components/dashboard/*`
- `components/checkup/*`
- `components/learning-path/*`
- personalization and gating tests

Done when:

- Dashboard is personalized per scenario.
- Locked modules can be previewed but not started.
- The page does not look like a course catalog.

Implemented files and outcomes:

- Rebuilt `/app/beranda` around one dominant `Langkah Terbaik Hari Ini`, followed by rationale, three upcoming path steps, learning/action progress, Digital Checkup bars, Jejak Tumbuh, reward preview, and Tekap guidance.
- Added `/app/hasil-checkup`, `/app/jalur`, `/app/jalur/[planId]`, `/app/modul/[moduleSlug]`, and the guarded `/app/modul/[moduleSlug]/mulai` boundary.
- Added configurable rule-based personalization using score severity, dependency state, expected impact, quick-win duration, learner readiness, and learning preference.
- Added distinct culinary, fashion, and returning-service paths and dashboard recommendations.
- Added vertical mobile path rendering for completed, active, available, retry, evidence, review, and locked states, with collapsible future steps on the overview.
- Added outcome-first module previews with reason assigned, duration, lessons, required task, created asset, prerequisite, entitlement, completion rule, and one CTA.
- Locked modules remain previewable, explain prerequisites, omit a start action, and fail closed at the manual start boundary.
- Added unit/component tests for recommendation ordering, scenario variation, state rendering, and gating.
- Added Playwright coverage for dashboard sections, scenario variation, checkup detail, path detail, module preview, locked gating, 360px and 390px layouts, keyboard focus, and reduced motion.

### P0.4 Lesson engine, assessment, correction, tasks, and Asset Bank

Goal: make learning produce useful business outputs.

Implementation status: complete.

Scope:

- Lesson runner for short content and interactions.
- Knowledge check and post-test.
- Quiz failure creates corrective path.
- Action task with draft, evidence, mock upload failure, submit, retry.
- Business asset creation from approved/auto-approved task.
- Aset Usaha list and detail.

Expected files:

- `app/(app)/app/belajar/[lessonId]/page.tsx`
- `app/(app)/app/kuis/[assessmentId]/page.tsx`
- `app/(app)/app/tugas/[taskId]/page.tsx`
- `app/(app)/app/hasil-modul/[moduleId]/page.tsx`
- `app/(app)/app/aset-usaha/page.tsx`
- `features/lesson/*`
- `features/assessment/*`
- `features/evidence/*`
- `features/assets/*`
- `components/learning/*`
- `components/assessment/*`
- `components/tasks/*`
- `components/assets/*`
- tests for assessment, correction, task completion, asset creation

Done when:

- Required module completion needs learning, mastery, and action.
- Upload failure and quiz failure scenarios are demoable.
- Free modules create useful business assets.

Implemented files and outcomes:

- Added `/app/belajar/[lessonId]` with one-concept screens for story, reading, video placeholder, audio, interactive choice, checklist, and template content.
- Added progress header, exact-screen resume, debounced autosave, split cookie persistence, transcript, low-bandwidth fallback, safe close, fixed mobile CTA, hydration-safe controls, and reduced-motion support.
- Added `/app/kuis/[assessmentId]` with immediate answer feedback, explanatory pass/fail results, strong and weak topics, assigned corrective micro-lessons, and targeted retry without Poin Tumbuh penalties.
- Added `/app/tugas/[taskId]` with contextual instruction, business example, reusable template, text/link/image/checklist evidence, autosaved drafts, preview, privacy copy, upload failure retry, and submitted/revision/approved/auto-approved states across scenarios.
- Added `/app/hasil-modul/[moduleId]` with independent learning, mastery, and business-action gates. Lesson completion alone cannot complete a required module.
- Added `/app/aset-usaha`; approved or auto-approved outputs become structured Aset Usaha records with source module and future landing-page usage.
- Extended domain schemas, repository contracts, mock content adapters, server-side learning session storage, and completion services without activating Neon.
- Added unit tests for resume, correction, mastery gating, asset creation, and learning-session persistence plus Playwright journeys at 360px and 390px.

### P0.5 Progress, final test, certificate, recheckup, reward, and premium preview

Goal: show growth, reward readiness, and ethical next step.

Implementation status: complete as P0.5.1.

Scope:

- Jejak Tumbuh progress.
- Poin Tumbuh and adult badges.
- Final test mock.
- Certificate mock.
- Checkup ulang unlock and result comparison.
- Reward landing page eligibility and claim tracking.
- Premium preview based on prerequisites and relevance.

Expected files:

- `app/(app)/app/progres/page.tsx`
- `app/(app)/app/ujian-akhir/page.tsx`
- `app/(app)/app/sertifikat/[certificateId]/page.tsx`
- `app/(app)/app/checkup-ulang/page.tsx`
- `app/(app)/app/reward/landing-page/page.tsx`
- `app/(app)/app/premium/page.tsx`
- `features/progress/*`
- `features/certificate/*`
- `features/rewards/*`
- `components/progress/*`
- `components/rewards/*`
- tests for final test, recheckup unlock, reward eligibility

Done when:

- Before/after improvement is visible.
- Reward eligible scenario is demoable.
- Premium preview is relevant and non-aggressive.

Implemented files and outcomes:

- Rebuilt `/app/progres` around the revised three-focus model: `0 dari 3` through `3 dari 3`, current focus, completed modules, post-test mastery, action tasks, Aset Usaha, final-test readiness, Checkup ulang readiness, reward readiness, Poin Tumbuh, sync state, and Jejak Tumbuh timeline.
- Added `/app/ujian-akhir` with a hard lock before 3/3 required module completions. The test uses only the three assigned focus areas, scenario questions, immediate feedback, targeted review after failure, and no point loss.
- Added `/app/checkup-ulang` with previous business data reuse, before/after comparison, changed highlights, contributing actions/assets, updated recommendation preview, and explicit historical preservation of the completed three-module path.
- Added `/app/sertifikat/[certificateId]` as a completion certificate, not an official competency certification, including learner name, business name, path modules, issue date, mock ID, share/download mock UI states, and future verification placeholder.
- Added `/app/reward/landing-page` with eligibility checks for three modules, final test, recheckup, required Aset Usaha, profile completeness, terms acceptance, and program capacity. The page includes eligible/not-yet-eligible states, missing requirements, Asset Bank preview, style selection, claim submission, and tracking states.
- Added `/app/premium` as personalized advanced recommendations only. It stays de-emphasized before three-focus foundation completion and contains no broad marketplace or real payment.
- Added P0.5.1 domain schemas, repository contracts, mock growth-session storage, final-test/recheckup/reward actions, pure business-rule helpers, unit coverage, and Playwright coverage for the completion journey.

### P0.6 Neon schema/adapter preparation with mock mode remaining default

Goal: prepare production data structure without activating production data access.

Scope:

- Drizzle schema structure.
- Empty or generated initial migration structure.
- Neon adapter classes with server-only guard.
- Repository factory supports mock default and Neon guarded mode.
- Contract tests remain mock-only unless Neon test branch is intentionally configured.
- Validate env and fail closed if Neon env is incomplete.

Expected files:

- `db/schema/*`
- `db/migrations/.gitkeep` or generated migration files when approved
- `db/client.ts`
- `infrastructure/neon/*`
- `domain/repositories/*` updates
- `lib/env.ts` updates
- `.env.example` updates
- adapter boundary tests

Done when:

- Neon credentials cannot reach client code.
- Mock remains default.
- Build passes without Neon credentials.

### P0.7 Final audit and stakeholder demo readiness

Goal: harden the demo for review.

Scope:

- Mobile viewport verification at 360px and 390px.
- Keyboard focus review.
- Console error review.
- Accessibility pass for critical routes.
- Copy review for Indonesian terms.
- Scenario coverage review.
- Final route guard review.
- Build and smoke test.
- Demo script and known limitations.

Expected files:

- `docs/DEMO_SCRIPT.md`
- `docs/QA_REPORT.md`
- test updates
- small UI fixes only

Done when:

- Quality gates pass or blockers are documented.
- Stakeholder can run the demo without Neon or public-site dependency.
- All required mock scenarios are reachable.

## 13. Risks and Assumptions

### Risks

- Brand assets are incomplete in this app repo; app may need illustration and OG assets copied intentionally from the public site.
- Dependency footprint is currently minimal; adding test, schema, and UI primitives requires package changes.
- Route scope is broad for P0; strict milestone control is needed.
- Mock state can become inconsistent if UI bypasses repository contracts.
- Locked states may frustrate users unless preview and prerequisite copy are strong.
- Overusing charts could make progress feel like a generic dashboard.
- Neon preparation could accidentally leak server concerns into client code if boundaries are not reviewed.

### Assumptions

- Poppins is approved for app usage because the public site uses it.
- `C:\dekat-lokal-web` is the current public-site source.
- The P0 demo does not need production auth, real OTP, payment, live AI, live mentor review, or production Neon.
- Development scenario tooling can be hidden by checking `NODE_ENV !== "production"` and/or a server env flag.
- Root `app/` structure can be kept for P0 instead of migrating to `src/app`.

## 14. Definition of Done

Each milestone is done only when:

- Scope is complete and no unrelated product work is mixed in.
- Customer-facing copy is Indonesian and uses approved product terms.
- UI uses repository/service contracts instead of fixtures.
- Mock mode works without Neon.
- Required states for touched features are represented.
- Locked flows explain prerequisites and block start.
- Mobile checks at 360px and 390px pass.
- Keyboard focus is visible and ordered.
- Console has no relevant runtime errors.
- Lint passes.
- Typecheck passes.
- Tests pass.
- Production build passes.
- Changed files, commands, results, assumptions, and limitations are reported.
