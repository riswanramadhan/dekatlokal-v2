# DekatLokal Platform V2 Decisions

Status: P0.5.1 implemented  
Last updated: 2026-07-07

## Accepted Decisions

### D001 - App and public site remain separate domains

Decision: `dekatlokal.com` remains the public website and Digital Checkup origin. `app.dekatlokal.com` is the logged-in learning and action platform.

Rationale: keeps acquisition/public SEO separate from focused signed-in workflows while preserving brand continuity.

Implications:

- Claim handoff uses an opaque token.
- No private score or checkup payload appears in public query strings.
- App demo must work without the public site running.

### D002 - Mock-first delivery

Decision: `DATA_SOURCE=mock` is the default data source for P0.

Rationale: the current scope is a high-fidelity frontend demo, not production data activation.

Implications:

- All demos must work without Neon.
- Repository contracts must be implemented by mock adapters first.
- Neon adapter preparation must not change the default runtime mode.

### D003 - Contract-first data access

Decision: UI components access data through services and repository interfaces, never direct fixtures.

Rationale: preserves a clean path from mock to Neon and prevents brittle demo-only coupling.

Implications:

- Fixtures live only in `infrastructure/mock`.
- Domain schemas and repository interfaces are created before feature screens.
- Contract tests should run against mock first and Neon later.

### D004 - Server Components by default

Decision: Route-level data loading should use Server Components by default.

Rationale: app data, authorization, and future database access are safer server-side.

Implications:

- Client Components are used for forms, quizzes, lesson interactions, upload mocks, local draft state, and browser-only status.
- Secret-bearing modules must be server-only.

### D005 - Root `app/` structure remains for P0

Decision: keep the existing root `app/` folder rather than migrating to `src/app` during P0.

Rationale: the repository already uses root `app/`; keeping it reduces planning and migration churn.

Implications:

- New folders such as `components`, `features`, `domain`, `infrastructure`, `lib`, `db`, and `tests` can sit at root.
- A future move to `src/` is possible but should be a separate refactor.

### D006 - Brand tokens follow public-site source

Decision: use `#0255F5` as primary and adopt the public-site blue scale as the app's starting token set.

Rationale: the sibling public-site source confirms the same primary color and token family.

Implications:

- Poppins should be the preferred app font if founder/design approval holds.
- App UI should use white, neutral, and controlled blue accents.
- Avoid unrelated gradient palettes.

### D007 - Dashboard first viewport has one dominant next action

Decision: the first dashboard viewport must prioritize `Langkah Terbaik Hari Ini`.

Rationale: the platform is not a course marketplace; its core promise is reducing decision fatigue.

Implications:

- No course-card wall above the fold.
- Recommendation rationale is mandatory.
- One dominant CTA per screen.

### D008 - Locked modules are previewable but not startable

Decision: locked modules allow preview but block starting and show prerequisites.

Rationale: preview reduces frustration while preserving action-to-unlock learning progression.

Implications:

- Route guards must block direct start URLs.
- Lock copy must explain the business reason and prerequisite.

### D009 - Completion requires learning, mastery, and business action

Decision: required module completion needs lesson progress, assessment mastery, and task/evidence completion.

Rationale: DekatLokal measures practical business action, not passive watch time.

Implications:

- Progress models must distinguish learning, assessment, and action states.
- Aset Usaha must receive outputs from free modules.

### D010 - Development scenario tooling is production-blocked

Decision: scenario switching is allowed only in development/demo-safe contexts and must not be available in production.

Rationale: scenario tooling is useful for review but unsafe and confusing in production.

Implications:

- Gate by server env and production checks.
- Never expose scenario controls as normal app navigation.

### D011 - Neon is prepared but guarded

Decision: Drizzle/Neon structure may be prepared, but Neon mode must fail closed without required server env and must never ship credentials to client code.

Rationale: the architecture needs a clean production path without accidentally activating production data access.

Implications:

- `server-only` protects database modules.
- Env validation rejects incomplete Neon configuration.
- Mock mode builds without database credentials.

### D012 - P0.1 dependency set is accepted

Decision: P0.1 adds only foundation dependencies: Zod, server-only, lucide-react, clsx, tailwind-merge, Vitest, Testing Library, jsdom, and Playwright.

Rationale: these packages support schema validation, server/client boundary protection, accessible iconography, class composition, and required quality gates without introducing production auth, database, payment, or AI dependencies.

Implications:

- Drizzle, Neon, React Hook Form, Radix/shadcn, MSW, and upload/storage packages remain deferred until their milestone requires them.
- Unit/component tests and responsive browser checks are available from P0.1 onward.

### D013 - Development tooling must be route-gated and runtime-gated

Decision: development-only tools may exist as routes or controls, but they must check `NODE_ENV !== "production"` and never expose scenario switching as normal production navigation.

Rationale: scenario switching and design-system review are useful for demo development but should not appear in the user-facing product.

Implications:

- `/dev/design-system` calls `notFound()` in production.
- `/api/dev/scenario` returns 404 in production.
- The scenario selector only renders from the app shell outside production.

### D014 - P0.2 persistence uses a server-side mock session cookie

Decision: mocked auth, claim, and onboarding persistence use an HTTP-only cookie through `infrastructure/storage`, with page components reading only through services and server actions.

Rationale: P0.2 needs refresh persistence without production auth or direct browser storage, and this keeps storage details outside UI components.

Implications:

- No page component uses `localStorage` or direct cookie manipulation.
- The persisted data is demo-only and should be replaced by production session/database persistence later.
- Server actions own auth, OTP, claim continuation, and onboarding mutation flow.

### D015 - OTP and provider flows are visual mocks only

Decision: WhatsApp, Google, and email routes intentionally use mock verification and do not contact external providers.

Rationale: P0 scope excludes production authentication and real OTP.

Implications:

- `000000` demonstrates invalid OTP, `999999` demonstrates expired OTP, and any other six-digit code can pass.
- Google and email alternatives route through the same mock verification state rather than creating real identities.

### D016 - P0.3 personalization is deterministic and rule-based

Decision: `Langkah Terbaik Hari Ini` is selected by a configurable service that scores eligible plan steps using checkup severity, dependency state, expected business impact, quick-win potential, learner readiness, and learning preference.

Rationale: the demo must explain why a recommendation was assigned without activating live AI or hiding logic inside UI fixtures.

Implications:

- Personalization runs behind the application service boundary.
- UI receives a typed recommendation and scoring explanation, not raw fixtures.
- Completed and locked steps are excluded from recommendation candidates.
- The same plan can produce different recommendations when checkup or learning preferences change.
- Live AI remains deferred and is not required for P0.4.

### D017 - Locked start access fails closed while preview remains open

Decision: locked and review-pending modules can be previewed, but their start boundary renders a locked state and never opens lesson content.

Rationale: users need context and prerequisites without being able to bypass path dependencies through a manually entered URL.

Implications:

- Module detail exposes outcome, reason, task, asset, entitlement, and prerequisite.
- Locked detail replaces the start CTA with a path/prerequisite CTA.
- The `/mulai` boundary checks module state again instead of trusting the previous page.
- P0.4 may replace the allowed start branch with the lesson engine without changing the gating contract.

### D018 - Resumable demo state uses server-owned split cookies

Decision: lesson progress, assessment attempts, and task/assets are persisted through the storage adapter in separate HTTP-only mock cookies.

Rationale: P0.4 requires refresh persistence without direct browser storage, while splitting state keeps each cookie below common per-cookie size limits.

Implications:

- Page and client components never call `localStorage` or manipulate cookies directly.
- Server actions and repositories own mutation and persistence.
- The adapter remains replaceable by Neon-backed repositories later.
- Mock persistence is device/browser-local and is not production identity storage.

### D019 - Required module completion is a three-gate invariant

Decision: a required module completes only when all required lessons are complete, the assessment is passed, and the business task is approved or auto-approved.

Rationale: the platform measures business application and mastery rather than passive watch time.

Implications:

- Lesson, assessment, and task progress are modeled independently.
- Module result pages expose every missing requirement.
- Only approved or auto-approved task output creates a structured Aset Usaha record.
- Submitted and revision states remain incomplete.

### D020 - Interactive controls wait for hydration

Decision: client-owned lesson, assessment, and evidence controls render disabled until hydration completes.

Rationale: on slow devices or low-bandwidth connections, server-rendered controls can appear before event handlers are ready; accepting input during that window risks ignored actions or lost values.

Implications:

- The UI remains visible during hydration but does not pretend to accept interaction early.
- Keyboard and browser tests wait on the same enabled state a real user receives.
- Links and server-rendered reading content remain available without client interaction.

### D021 - P0.5.1 progress follows the exact three-focus foundation

Decision: progress, final-test readiness, recheckup readiness, certificate readiness, reward readiness, and premium timing are all derived from the same three required modules assigned by the Digital Checkup claim.

Rationale: the revised V2.1 product model depends on a focused foundation rather than a broad course catalog or loosely related progress counters.

Implications:

- `/app/progres` must show `0 dari 3` through `3 dari 3`.
- Module completion still requires lesson completion, assessment mastery, and approved or auto-approved business action.
- Public leaderboard patterns remain out of scope.

### D022 - Final test is scenario-based and non-punitive

Decision: the final test covers only the three assigned focus areas, is locked until all three modules satisfy completion rules, and creates targeted review after failure without Poin Tumbuh loss.

Rationale: the final step should validate practical decision making without shaming or distracting the learner.

Implications:

- Failure stores weak focus areas and shows only relevant review.
- Passing the final test clearly unlocks Digital Checkup ulang.
- The final test is separate from per-module post-tests.

### D023 - Checkup ulang preserves historical path

Decision: Checkup ulang creates a before/after comparison and updated recommendation preview, but it does not silently replace the completed three-module historical path.

Rationale: the user needs proof of progress while retaining the story of what they completed.

Implications:

- Original and latest checkup results are shown together.
- Contributing actions and Aset Usaha explain why results changed.
- Premium recommendations may use the updated preview without mutating the completed foundation path.

### D024 - Certificate is completion evidence only

Decision: the certificate is a mock completion certificate for the three-focus path, not an official competency certification.

Rationale: P0 must avoid overclaiming certification authority while still giving learners a useful completion artifact.

Implications:

- Certificate copy must include the non-official disclaimer.
- Verification is shown as a future placeholder.
- Share and download are UI states only in the demo.

### D025 - Landing-page reward uses transparent eligibility

Decision: landing-page reward eligibility is an explicit checklist covering three modules, final test, Checkup ulang, required Aset Usaha, business profile completeness, terms acceptance, and program capacity.

Rationale: users should understand exactly why they are eligible or not yet eligible, and the reward should not feel guaranteed before requirements are met.

Implications:

- Missing requirements are shown with resolution paths.
- Claim submission is mock-only and creates tracking states: Menunggu data, Data lengkap, Dalam pengerjaan, Review pemilik, Live.
- No payment, production website creation, or live mentor review is activated.

### D026 - Premium is personalized and quiet before foundation completion

Decision: premium recommendations are personalized advanced next steps and remain hidden or de-emphasized before the three required modules are complete.

Rationale: premium should support the outcome journey rather than compete with the active foundation path.

Implications:

- `/app/premium` is not a marketplace.
- Each recommendation explains outcome, reason, prerequisite, and expected business value.
- Demo premium has no real payment.

## Decisions Needing Founder or Stakeholder Review

### F001 - Font approval

Question: should the app use Poppins as the primary typeface to match the current public site, or Plus Jakarta Sans as suggested fallback in the brand guide?

Recommendation: use Poppins for brand continuity unless there is a licensing, performance, or design reason to choose Plus Jakarta Sans.

### F002 - Asset copy approval

Question: which public-site assets may be copied into this app repo?

Recommendation: copy only approved brand files and the welcome illustration into `public/brand`, then add app-specific illustrations later if needed.

### F003 - Default demo entry

Question: should `/` open login/claim first, or go straight to `/app/beranda` with a mock session for stakeholder demos?

Recommendation: route `/` to `/masuk` by default, with a documented demo scenario shortcut in development.

### F004 - Claim handoff URL shape

Question: should the public site link to `/hubungkan-checkup?token=...` or a path token such as `/hubungkan-checkup/[token]`?

Recommendation: use `?token=` for opaque non-sensitive token handoff, while never including scores or private values.

### F005 - Reward landing page promise

Question: what exact copy and eligibility wording should be used so users understand the reward is capacity- and terms-dependent?

Recommendation: use a transparent checklist and status tracker, not a guaranteed instant reward message.

### F006 - Tekap scope in P0

Question: should Tekap be a contextual helper shell only, or include scripted mock guidance in P0?

Recommendation: include a lightweight scripted helper in key states only if it does not compete with primary CTAs.

### F007 - Premium preview timing

Question: when should premium content appear in the demo?

Recommendation: show premium only after prerequisites or as a locked future path with clear relevance, never as a marketplace.

## Deferred Decisions

### X001 - Production authentication provider

Deferred because P0 uses mock auth only.

### X002 - Payment provider

Deferred because P0 has no payment.

### X003 - Live AI or mentor review

Deferred because P0 uses mock/scripted guidance only.

### X004 - Admin and partner dashboard

Deferred because P0 is user-facing.

### X005 - Public certificate verification

Deferred because P0 certificate is mock/demo only.
