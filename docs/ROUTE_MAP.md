# DekatLokal Platform V2 Route Map

Status: P0.5.1 implemented  
Target app domain: app.dekatlokal.com  
Public origin: dekatlokal.com

## Route Principles

- Public website and Digital Checkup stay on `dekatlokal.com`.
- Logged-in learning app lives on `app.dekatlokal.com`.
- The app demo must run without the public site and without Neon.
- Claim handoff uses an opaque token only.
- Checkup scores, private answers, and business-sensitive data never appear in query strings.
- Signed-in app routes are grouped under `/app`.
- Mobile bottom navigation has exactly four tabs: Beranda, Jalur Saya, Progres, Akun.
- Product routes should render loading, empty, error, offline, retry, success, locked, unauthorized, and sync pending states where relevant.

## Public Site Context

These routes remain owned by `dekatlokal.com` and are not implemented in this app repo for P0.

| Public route | Owner | App relationship |
| --- | --- | --- |
| `/` | dekatlokal.com | Acquisition and brand homepage |
| `/digital-checkup` | dekatlokal.com | Checkup origin |
| `/hasil-checkup/[resultId]` | dekatlokal.com | Shows initial public-safe result and CTA to app claim |
| `/program` | dekatlokal.com | Public program information |
| `/partner` | dekatlokal.com | Public partner information |
| `/galeri` | dekatlokal.com | Public gallery |
| `/artikel` | dekatlokal.com | SEO and education |
| `/kebijakan` | dekatlokal.com | Public policy pages |

## App Entry and Auth Routes

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/` | App entry redirect or lightweight landing bridge | Public | Mock session status | Loading, unauthenticated, authenticated | P0.1 |
| `/masuk` | Mock login | Public | AuthRepository | Loading, error, offline, success | P0.2 |
| `/daftar` | Mock signup | Public | AuthRepository | Loading, error, offline, success | P0.2 |
| `/verifikasi` | Mock OTP verification | Public, pending auth | AuthRepository | Loading, error, retry, success | P0.2 |
| `/hubungkan-checkup` | Claim Digital Checkup result from opaque token | Public or authenticated | CheckupRepository | Loading, expired, already claimed, no result, offline, success | P0.2 |
| `/onboarding` | Confirm business and learning preferences | Authenticated or mock pending session | Onboarding service | Loading, empty, error, offline, sync pending, success | P0.2 |

Query rule for `/hubungkan-checkup`:

```text
/hubungkan-checkup?token=opaque_mock_claim_token
```

Allowed: opaque token.  
Not allowed: score, pillar scores, business private data, owner phone, or raw result payload.

## Signed-in App Routes

### App Shell

All `/app/*` routes use the signed-in app shell.

Mobile shell:

- Header with logo, business identity, and notification access.
- Bottom navigation with Beranda, Jalur Saya, Progres, Akun.
- Tekap helper can appear contextually but must not overlap fixed CTA.

Desktop shell:

- Purposeful responsive layout.
- Sidebar may replace bottom nav.
- Content should not look like stretched mobile.

### Primary Navigation Routes

| Route | Nav label | Purpose | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/beranda` | Beranda | Ruang Tumbuh dashboard with one next action | DashboardRepository | Loading, empty, error, offline, sync pending, success | P0.3 |
| `/app/jalur` | Jalur Saya | Active Jalur Naik Kelas overview | LearningRepository | Loading, empty, error, offline, locked, success | P0.3 |
| `/app/progres` | Progres | Jejak Tumbuh, before/after, actions, assets, points | Progress service | Loading, empty, error, offline, sync pending, success | P0.5 |
| `/app/akun` | Akun | Profile, business, preferences, help links | User/Business repositories | Loading, error, offline, unauthorized, success | P0.5 |

### Checkup and Personalization

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/hasil-checkup` | Latest claimed checkup result and recommended priorities | Authenticated | CheckupRepository | Loading, no checkup, error, offline, success | P0.3 |
| `/app/checkup-ulang` | Recheckup unlock, flow, and comparison | Authenticated, gated | CheckupRepository | Loading, locked, error, offline, retry, success | P0.5 |

### Learning Path and Modules

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/jalur/[planId]` | Detailed plan timeline | Authenticated | LearningRepository | Loading, not found, error, offline, locked, success | P0.3 |
| `/app/modul/[moduleSlug]` | Module detail, outcome, reason assigned, preview, lock state | Authenticated | LearningRepository | Loading, not found, error, offline, locked, success | P0.3 |
| `/app/hasil-modul/[moduleId]` | Module completion result and next step | Authenticated, completed or in-progress | LearningRepository | Loading, not found, error, offline, sync pending, success | P0.4 |

Lock behavior:

- Locked module detail is viewable.
- Start CTA is disabled or replaced with prerequisite CTA.
- Direct attempts to start a locked module render a locked state with prerequisite guidance and a link back to the preview.

### Lesson, Assessment, and Tasks

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/belajar/[lessonId]` | Lesson engine | Authenticated, gated | LearningRepository | Loading, not found, locked, offline, sync pending, success | P0.4 |
| `/app/kuis/[assessmentId]` | Knowledge check or post-test | Authenticated, gated | AssessmentRepository | Loading, not found, locked, quiz failure, retry, success | P0.4 |
| `/app/tugas/[taskId]` | Business action task and evidence | Authenticated, gated | EvidenceRepository | Loading, draft, upload failure, offline, sync pending, submitted, success | P0.4 |

Completion behavior:

- Lesson completion alone does not complete a required module.
- Post-test mastery is required.
- Action task submission or approval is required.
- Corrective flow appears after failed assessment without punishment.
- Lesson position, correction attempts, and evidence drafts persist through the server-side mock storage adapter.
- Only approved or auto-approved evidence creates an Aset Usaha record; submitted and revision states remain incomplete.

### Assets

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/aset-usaha` | Business Asset Bank list | Authenticated | AssetRepository | Loading, empty, error, offline, sync pending, success | P0.4 |
| `/app/aset-usaha/[assetId]` | Asset detail and source | Authenticated | AssetRepository | Loading, not found, error, offline, success | P0.4 or P0.5 |

### Final Test and Certificate

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/ujian-akhir` | Final mastery test | Authenticated, gated | AssessmentRepository | Loading, locked, failed, retry, success | P0.5 |
| `/app/sertifikat/[certificateId]` | Mock certificate | Authenticated, earned | Certificate repository/service | Loading, not found, unauthorized, success | P0.5 |

### Reward and Premium

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/reward/landing-page` | Landing page reward eligibility, asset checklist, claim tracking | Authenticated, gated | RewardRepository | Loading, not eligible, missing assets, error, offline, claimed, success | P0.5 |
| `/app/premium` | Personalized premium preview | Authenticated | LearningRepository/Entitlement service | Loading, empty, locked, preview, success | P0.5 |

P0.5.1 implementation notes:

- `/app/progres` now presents the exact three-focus foundation state, including module count, current focus, completed modules, post-test mastery, action tasks, Aset Usaha, final-test readiness, Checkup ulang readiness, reward readiness, and Jejak Tumbuh timeline.
- `/app/ujian-akhir` is locked before 3/3 required module completions and uses scenario questions only from the three assigned focus areas. Failure creates targeted review without point loss; pass unlocks Checkup ulang.
- `/app/checkup-ulang` reuses existing business data, compares original and latest mock checkup results, explains contributing actions/assets, and keeps the completed three-module path as historical progress.
- `/app/sertifikat/[certificateId]` renders a mock completion certificate with learner/business/path data, issue date, mock ID, share/download UI states, and future verification placeholder.
- `/app/reward/landing-page` evaluates every reward requirement, shows eligible/not-yet-eligible states, previews Asset Bank inputs, supports style selection and mock claim submission, and displays the five tracking states.
- `/app/premium` shows only personalized advanced recommendations and remains de-emphasized before the three-focus foundation is complete.

### Support and Notifications

| Route | Purpose | Access | Primary data | Required states | Milestone |
| --- | --- | --- | --- | --- | --- |
| `/app/notifikasi` | Notifications and reminders | Authenticated | Notification repository | Loading, empty, error, offline, success | P0.5 |
| `/app/bantuan` | Help and Tekap support content | Authenticated | Static/mock support content | Loading, empty, error, offline, success | P0.5 |

## API Route Preparation

P0 may use direct repository calls from Server Components for the demo. Route Handlers should be added where client mutations need a stable boundary or future API compatibility.

Planned API contracts:

| API route | Method | Purpose | Milestone |
| --- | --- | --- | --- |
| `/api/v1/auth/mock-login` | POST | Mock auth session | P0.2 |
| `/api/v1/checkups/claim` | POST | Claim opaque token | P0.2 |
| `/api/v1/me/dashboard` | GET | Dashboard view model | P0.3 |
| `/api/v1/me/checkups/latest` | GET | Latest checkup | P0.3 |
| `/api/v1/me/plans/active` | GET | Active plan | P0.3 |
| `/api/v1/modules/:id` | GET | Module detail | P0.3 |
| `/api/v1/modules/:id/start` | POST | Start module if unlocked | P0.3 |
| `/api/v1/lessons/:id/complete` | POST | Complete lesson | P0.4 |
| `/api/v1/assessments/:id/attempts` | POST | Submit assessment | P0.4 |
| `/api/v1/tasks/:id/evidence/draft` | PUT | Save evidence draft | P0.4 |
| `/api/v1/tasks/:id/evidence/submit` | POST | Submit evidence | P0.4 |
| `/api/v1/me/assets` | GET | List assets | P0.4 |
| `/api/v1/me/progress` | GET | Progress summary | P0.5 |
| `/api/v1/checkups/repeat` | POST | Mock recheckup | P0.5 |
| `/api/v1/me/rewards/eligibility` | GET | Reward eligibility | P0.5 |
| `/api/v1/rewards/:id/claim` | POST | Claim reward | P0.5 |

## Route Guard Matrix

| Condition | Behavior |
| --- | --- |
| Unauthenticated user opens `/app/*` | Redirect to `/masuk` with return target |
| Authenticated user without checkup opens `/app/beranda` | Show no-checkup state with claim/checkup CTA |
| Expired claim token | Show expired state and recovery CTA |
| Locked module | Show preview and prerequisite; block start |
| Failed quiz | Show feedback and corrective assignment |
| Offline during read | Show offline banner and cached/mock-safe content when available |
| Offline during mutation | Save draft or show sync pending when possible |
| Upload failure scenario | Show retry and preserve selected evidence metadata |
| Unauthorized business resource | Show safe unauthorized state, no private data |

## Analytics Event Map

Events should be emitted through a typed analytics adapter. In P0 they can log to mock analytics only.

| Route/action | Event |
| --- | --- |
| Claim starts | `checkup_claim_started` |
| Claim completes | `checkup_claim_completed` |
| Onboarding completes | `onboarding_completed` |
| Dashboard viewed | `dashboard_viewed` |
| Next action clicked | `next_action_clicked` |
| Module started | `module_started` |
| Module completed | `module_completed` |
| Lesson started | `lesson_started` |
| Lesson resumed | `lesson_resumed` |
| Lesson completed | `lesson_completed` |
| Quiz passed | `quiz_passed` |
| Quiz failed | `quiz_failed` |
| Corrective path starts | `corrective_started` |
| Evidence saved | `evidence_saved` |
| Evidence submitted | `evidence_submitted` |
| Asset created | `asset_created` |
| Final test passed | `final_test_passed` |
| Recheckup completed | `recheckup_completed` |
| Reward eligible | `reward_eligible` |
| Reward claimed | `reward_claimed` |
| Premium preview viewed | `premium_previewed` |
| Help opened | `help_opened` |
