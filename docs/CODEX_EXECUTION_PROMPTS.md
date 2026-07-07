# CODEX EXECUTION PROMPTS
# DekatLokal Platform V2

Run each prompt separately. Do not paste all prompts at once.

---

# PROMPT 0 — Audit, Brand Alignment, and Plan

```text
Act as the lead product engineer, frontend architect, and senior mobile-first product designer for DekatLokal Platform V2.

Read in this order:

1. AGENTS.md
2. docs/PRD_DEKATLOKAL_PLATFORM_V2.md
3. docs/BRAND_AND_UI_GUIDE.md
4. docs/TECHNICAL_ARCHITECTURE_NEON_READY.md
5. package.json and existing repository structure
6. official brand assets in public/brand

If a local sibling repository containing the current dekatlokal.com source is explicitly available, inspect it read-only for tokens, typography, and reusable brand assets. Do not modify it. Do not block the task if it is unavailable.

This task is planning only. Do not build product screens.

Create:

- docs/IMPLEMENTATION_PLAN.md
- docs/DECISIONS.md
- docs/ROUTE_MAP.md

The implementation plan must include:

- Repository audit
- Brand-alignment strategy
- Architecture and data boundaries
- Mock-first and Neon-ready strategy
- Route structure
- Component and feature boundaries
- Domain models
- State management approach
- Accessibility strategy
- Mobile verification strategy
- Test strategy
- Exact milestone scope
- Expected files per milestone
- Risks and assumptions
- Definition of done

Use milestones:

P0.1 Foundation, brand system, repository contracts, and app shell
P0.2 Auth UI, checkup claim, and onboarding
P0.3 Personalized dashboard, checkup result, path, and module detail
P0.4 Lesson engine, assessment, correction, tasks, and Asset Bank
P0.5 Progress, final test, certificate, recheckup, reward, and premium preview
P0.6 Neon schema/adapter preparation with mock mode remaining default
P0.7 Final audit and stakeholder demo readiness

Constraints:

- app.dekatlokal.com is the target application domain.
- dekatlokal.com remains the public site and Digital Checkup origin.
- Current work is a high-fidelity frontend demo.
- Do not activate database, production auth, payment, OTP, or AI.
- Use Indonesian product copy.
- The first dashboard viewport must prioritize one next action.
- UI must match the DekatLokal brand family.
- Avoid generic SaaS/course catalog design.
- Components must use repository contracts.
- Neon credentials must never reach client code.

At the end report:
- Key architecture decisions
- Decisions needing founder review
- Whether P0.1 can start
- Any missing brand assets
```

---

# PROMPT 1 — Foundation, Brand System, and App Shell

```text
Implement P0.1 from docs/IMPLEMENTATION_PLAN.md.

Read all project documentation before editing.

Build:

1. Next.js App Router foundation
2. TypeScript strict setup
3. Tailwind brand tokens aligned with DekatLokal
4. Global styles and typography
5. Accessible UI primitives
6. App shell for app.dekatlokal.com
7. Mobile header and four-item bottom navigation
8. Desktop sidebar
9. Notification entry point
10. Contextual Tekap helper entry point
11. Safe-area and fixed-CTA foundations
12. Loading, empty, error, offline, retry, locked, and sync states
13. Development-only design system page
14. Domain models and Zod schemas
15. Repository/service contracts
16. Mock repositories and fixtures separated from UI
17. Development-only scenario selector
18. .env.example and validated environment module

Create meaningful initial routes:

- /masuk
- /daftar
- /verifikasi
- /hubungkan-checkup
- /app/beranda
- /app/jalur
- /app/progres
- /app/akun

Use actual Indonesian DekatLokal copy, not lorem ipsum.

Visual requirements:

- Official logo from public/brand
- Primary #0255F5 unless official token differs
- White/soft-neutral surfaces
- Modern rounded cards
- Controlled shadows
- Clear focus states
- No generic admin template
- No excessive gradient/glassmorphism
- Correct at 360px and 390px

Do not connect Neon.

Verification:

- lint
- typecheck
- unit/component tests
- production build
- responsive checks
- keyboard and reduced-motion checks

Update IMPLEMENTATION_PLAN and DECISIONS.
Report changed files and exact command results.
```

---

# PROMPT 2 — Auth, Claim, and Onboarding

```text
Implement P0.2 without breaking P0.1.

Build the full mocked journey:

Digital Checkup result from dekatlokal.com
→ app.dekatlokal.com/daftar?claim=...
→ signup/login
→ OTP mock
→ claim
→ confirm business
→ learning preferences
→ path reveal
→ personalized dashboard

Required:

- WhatsApp-first login UI
- Google visual alternative
- Email fallback
- Signup
- Six-digit OTP
- Invalid, expired, resend, success
- Claim loading, success, expired, claimed, missing, mismatch
- Maximum five onboarding steps
- Guided/standard/fast mode
- 5/10/15 minute preference
- Video/audio/text/mixed
- Standard/large text
- Reminder daypart
- Path reveal
- Persistence through refresh using a storage adapter
- No direct localStorage access in page components
- No real auth or OTP

Scenarios:

- Guided culinary new user
- Existing account
- Expired claim
- No checkup
- Large-text mode

Ensure customer copy explains why recommendations are assigned.

Test:

- Validation
- Claim state transitions
- Refresh persistence
- Full E2E happy path
- Mobile/keyboard
- lint/typecheck/test/build
```

---

# PROMPT 3 — Personalized Dashboard and Path

```text
Implement P0.3.

The dashboard must not be a course catalog.

Build:

- /app/beranda
- /app/hasil-checkup
- /app/jalur
- /app/jalur/[planId]
- /app/modul/[moduleSlug]

Dashboard order:

1. Greeting and business identity
2. Dominant Langkah Terbaik Hari Ini
3. Why this is recommended
4. Next three path steps
5. Learning and action progress
6. Digital Checkup score bars
7. Jejak Tumbuh
8. Reward landing-page preview
9. Tekap message

Use at least three scenarios and ensure their dashboards differ.

Create a configurable rule-based personalization service using:

- score severity
- dependency
- expected impact
- quick win
- readiness
- learning preference

Path:

- Vertical on mobile
- Completed, active, available, retry, evidence, review, locked
- Preview allowed
- Start blocked when locked
- Clear prerequisite explanation
- Future steps collapsible

Module detail:

- Outcome-first
- Reason assigned
- Duration
- Lessons
- Required task
- Asset created
- Prerequisite
- Entitlement
- One CTA

Protect locked routes from manual URL access.

Test recommendation ordering, state rendering, and gating.
Run all quality gates.
```

---

# PROMPT 4 — Learning, Assessment, Tasks, Asset Bank

```text
Implement P0.4.

Routes:

- /app/belajar/[lessonId]
- /app/kuis/[assessmentId]
- /app/tugas/[taskId]
- /app/hasil-modul/[moduleId]
- /app/aset-usaha

Lesson engine:

- One concept per screen
- Story, reading, video placeholder, audio, interactive choice, checklist, template
- Progress header
- Resume
- Autosave/sync
- Transcript
- Low bandwidth fallback
- Fixed CTA
- Safe close
- Reduced motion

Assessment:

- Immediate feedback
- Explain correct/incorrect
- Pass
- Fail
- Strong/weak topics
- Corrective micro-lessons
- Targeted retry
- No point penalty

Task:

- Instruction
- Business-specific example
- Template
- Text/link/image/checklist evidence
- Draft
- Preview
- Retry
- Submitted/revision/approved
- Privacy copy

Asset Bank:

- Approved or auto-approved outputs become structured Business Assets
- Show source module
- Show future usage for landing page
- Keep architecture ready for Neon

Critical rule:
Watching lessons alone cannot complete a required module.

Test:

- Resume after refresh
- Failure -> correction -> pass
- Draft persistence
- Upload retry
- Module completion gating
- Asset creation
- All quality gates
```

---

# PROMPT 5 — Progress, Recheckup, Certificate, Reward

```text
Implement P0.5.

Routes:

- /app/progres
- /app/ujian-akhir
- /app/sertifikat/[certificateId]
- /app/checkup-ulang
- /app/reward/landing-page
- /app/premium

Progress:

- Learning
- Business action
- Pillar scores
- Before/after
- Assets
- Jejak Tumbuh timeline
- Personalized insight
- No public leaderboard

Final test:

- Locked by prerequisites
- Scenario-based
- Targeted review
- Pass/fail

Certificate:

- Completion certificate, not official competency certification
- Name
- Business
- Path
- Date
- Mock ID
- Share/download states

Recheckup:

- Reuse old data
- Mark changed answers
- Old vs new
- Explain contributing actions
- Generate updated mock plan

Reward:

- Eligibility checklist
- Qualified/not qualified
- Asset Bank preview
- Missing data resolution
- Style selection
- Claim
- Status tracking

Premium:

- Personalized advanced modules
- No broad marketplace
- Outcome, reason, prerequisite
- No payment

Use restrained adult celebration with reduced-motion alternative.

Test final gating, comparison, eligibility, and E2E journey.
Run all quality gates.
```

---

# PROMPT 6 — Neon-ready Preparation, Mock Remains Default

```text
Implement P0.6.

This milestone prepares Neon but must not make the demo depend on a database.

Read docs/TECHNICAL_ARCHITECTURE_NEON_READY.md.

Add:

- Drizzle ORM setup
- Neon serverless package
- server-only database client module
- Environment validation
- db/schema modules
- Initial migration files or generated migration structure
- Seed blueprint
- Neon repository adapter skeletons
- Repository contract tests
- Data source factory
- Health-check code available only server-side and disabled without DATABASE_URL

Rules:

- DATA_SOURCE=mock remains default
- The app must build and run with empty DATABASE_URL
- No database query during mock mode
- No credential in client bundle
- Do not create production users
- Do not run destructive migrations
- Do not activate real auth
- Do not change user-facing behavior

Implement the domain tables specified in the technical architecture, but split schemas into coherent files.

Document:

- Local/mock usage
- Future Neon setup
- Migration commands
- Seed commands
- Rollback precautions
- Environment variables

Run:

- bundle/client exposure checks if available
- lint
- typecheck
- tests
- build

Report whether the app still works fully in mock mode.
```

---

# PROMPT 7 — Final Audit

```text
Perform P0.7 final audit.

Compare implementation against:

- AGENTS.md
- PRD
- Brand guide
- Technical architecture
- Implementation plan
- Decision log

Audit:

1. End-to-end flow
2. Brand consistency with DekatLokal
3. Mobile 360/390/430
4. Desktop
5. One next action
6. Personalization
7. Locked route enforcement
8. Resume and persistence
9. Assessment correction
10. Business Asset generation
11. Recheckup before/after
12. Reward eligibility
13. Loading/empty/error/offline/retry
14. Accessibility
15. Indonesian copy
16. Server/client boundaries
17. Secret exposure
18. Mock/Neon replaceability
19. Performance
20. Tests and build

Fix P0 and P1 issues only. Do not add unrelated features.

Run all tests, E2E, lint, typecheck, and production build.

Provide:

- Findings by severity
- Fixes
- Remaining limitations
- Route inventory
- Commands and results
- Stakeholder-demo readiness
- Recommended backend activation sequence
```

---

# TARGETED FEEDBACK PROMPT

Use this when Codex creates a generic dashboard:

```text
The current screen feels like a generic course catalog and does not satisfy the DekatLokal product thesis.

Refactor only the personalized dashboard. Preserve the existing repository contracts, routes, and working behavior.

At 360px and 390px, the first viewport must contain:

- business identity
- one dominant Langkah Terbaik Hari Ini
- duration
- progress
- a reason derived from the Digital Checkup
- one primary CTA

Move course/module collections below the first viewport and show no more than three next steps.

Use the DekatLokal brand tokens and adult, supportive Indonesian copy.

Run lint, typecheck, tests, and build, then report the exact results.
```
