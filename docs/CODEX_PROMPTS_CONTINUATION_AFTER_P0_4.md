# CODEX PROMPTS — Continuation After Prompt 4

## Important

Prompt 1 through Prompt 4 are already complete.

Do not run the old Prompt 5.

Run in this order:

1. Prompt 4.5
2. Prompt 5.1
3. Prompt 6.1
4. Prompt 7.1

---

# PROMPT 4.5 — PRE-AUTH RECALL AND DEFERRED SIGNUP

```text
Implement a product-flow revision named:

P0.4.5 — Pre-auth Module Recall and Deferred Signup

You have already completed the foundation, old auth/onboarding, personalized dashboard/path, and learning/task engine.

Read:

1. `AGENTS.md`
2. `docs/PRD_DEKATLOKAL_PLATFORM_V2.md`
3. `docs/PRD_REVISION_V2_1_THREE_FOCUS_FLOW.md`
4. `docs/FLOW_SPEC_PREAUTH_RECALL.md`
5. `docs/BRAND_AND_UI_GUIDE.md`
6. `docs/IMPLEMENTATION_PLAN.md`
7. `docs/DECISIONS.md`
8. Existing auth, claim, onboarding, dashboard, path, mock repository, and storage-adapter code

Do not rewrite completed learning, assessment, task, Asset Bank, or progress foundations unless this revised flow requires a targeted integration change.

## Product decision

Digital Checkup remains public at `dekatlokal.com` and requires no login.

The public result page shows three recommended interventions and redirects through:

`app.dekatlokal.com/mulai?claim={opaqueClaimToken}`

The application must provide a short value-first flow before requiring signup.

The three authoritative module IDs come from the claim result. The user's selections in the recall challenge are only an educational confirmation interaction and must never become the source of truth for assignments.

## Required flow

1. Validate the claim token at `/mulai`
2. Show a short result-ready success screen
3. Ask the user to recall and select exactly three focus modules
4. Show six module choices:
   - three correct recommendations from the claim
   - three contextually relevant distractors
5. Disable the CTA until exactly three options are selected
6. Compare the selection with the authoritative recommendations
7. Show supportive states:
   - fully correct
   - partially correct
   - contextual hint
   - reveal-help after repeated attempts
8. Show a concise preview of the three-module `Jalur Naik Kelas`
9. Explain why an account is needed
10. Route to signup or login
11. After authentication, consume and associate the claim token
12. Associate:
    - user
    - business
    - Digital Checkup result
    - authoritative three-module plan
    - module assignments
13. Route to the dashboard
14. The dashboard must focus on exactly those three required modules
15. Unlock modules sequentially through prerequisites

## Suggested customer-facing routes

- `/mulai`
- `/daftar`
- `/masuk`
- `/verifikasi`
- `/hubungkan-checkup`
- `/app/beranda`

The pre-auth experience may use an internal state machine under `/mulai`, but browser back, refresh, and direct-entry behavior must be safe.

## Required screens and states

### Claim

- loading
- valid
- missing
- invalid
- expired
- already claimed
- network error

### Result-ready

Title:
`Hasil usahamu sudah siap!`

Body:
`Digital Checkup menemukan tiga fokus utama yang dapat membantu usaha berkembang lebih terarah.`

CTA:
`Lihat Fokus Usaha Saya`

### Recall

Title:
`Masih ingat tiga fokus usahamu?`

Body:
`Pilih tiga rekomendasi yang muncul pada hasil Digital Checkup tadi.`

CTA:
`Periksa Pilihan`

Show a selection counter.

### Partial feedback

Title:
`Hampir tepat!`

The body must explain how many selections match and provide one contextual hint without exposing raw score data.

After repeated attempts, provide:
`Tampilkan bantuan`

The user must never become permanently blocked.

### Correct state

Title:
`Pas! Kamu mengingat ketiga fokus usahamu.`

### Path preview

Title:
`Ini Jalur Naik Kelas usahamu`

Show exactly three ordered modules with:

- outcome
- duration
- reason
- asset produced
- lock/dependency state

Body:
`Kamu tidak perlu menyelesaikannya sekaligus. Progres akan tersimpan setelah membuat akun.`

CTA:
`Simpan Jalur Saya`

### Signup wall

Title:
`Simpan perjalanan usahamu`

Body:
`Buat akun agar hasil Digital Checkup, tiga fokus usaha, dan progres belajarmu tidak hilang.`

Options:

- `Daftar dengan WhatsApp`
- Google visual alternative
- `Saya sudah punya akun`

## No-claim behavior

When `/mulai` is opened without a valid claim:

- explain that Digital Checkup is needed for an accurate path
- primary CTA: `Mulai Digital Checkup`
- use configured `NEXT_PUBLIC_MAIN_SITE_URL`
- secondary CTA: `Saya sudah punya akun`
- do not let an unauthenticated user create a fake personalized path by randomly choosing modules

## UX direction

Use a Duolingo-inspired interaction rhythm without copying Duolingo's visual identity:

- full-screen mobile flow
- one focused action per screen
- compact top progress bar
- short Indonesian copy
- large selectable cards
- fixed bottom primary CTA
- immediate supportive feedback
- restrained animation
- no app bottom navigation during pre-auth
- official DekatLokal logo
- DekatLokal blue tokens
- Tekap guidance where useful
- adult, professional, warm presentation

Support:

- 360px
- 390px
- large-text mode
- reduced motion
- keyboard navigation
- visible focus
- screen-reader labels
- no color-only answer feedback

## State and persistence

Use existing repository and storage adapters.

Do not call `localStorage` directly from page components.

Persist:

- claim token
- current pre-auth stage
- selected module IDs
- attempt count
- recall completion

Do not place scores, business private data, or module IDs in public query parameters.

## Dashboard revision

Refactor the primary dashboard to show:

- `Fokus 1 dari 3`
- one dominant `Langkah Terbaik Hari Ini`
- current module
- reason assigned
- two remaining required modules
- progress toward final test
- progress toward recheckup
- landing-page reward preview

Do not show a general module catalog on the primary dashboard.

## Documentation updates

Update:

- `docs/PRD_DEKATLOKAL_PLATFORM_V2.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DECISIONS.md`
- `docs/ROUTE_MAP.md`
- relevant API/mock contract documentation

Record this milestone as P0.4.5.

## Required tests

Add or update tests for:

- valid claim
- missing claim
- invalid claim
- expired claim
- already-claimed token
- exactly three selections
- fully correct selection
- partially correct selection
- reveal-help flow
- refresh persistence
- browser back behavior
- signup after path preview
- login after path preview
- claim association after authentication
- authoritative modules cannot be replaced by recall selection
- dashboard contains exactly the assigned three required modules
- locked modules cannot be opened manually
- no private data in URL
- 360px and 390px
- large-text mode
- reduced-motion mode

Run all available quality gates:

- lint
- typecheck
- unit tests
- component tests
- end-to-end tests
- production build

Fix regressions caused by this revision.

At completion report:

- previous flow versus new flow
- routes changed
- contracts changed
- files changed
- tests added
- exact command results
- remaining limitations
- confirmation that mock mode still works with empty database credentials

Do not implement Prompt 5.1, Neon, or the final audit in this task.
```

---

# PROMPT 5.1 — THREE-FOCUS PROGRESS, FINAL TEST, RECHECKUP, CERTIFICATE, AND REWARD

```text
Implement milestone P0.5.1 after P0.4.5 is complete.

Read all project documentation, especially:

- `docs/PRD_REVISION_V2_1_THREE_FOCUS_FLOW.md`
- `docs/FLOW_SPEC_PREAUTH_RECALL.md`
- the updated implementation plan and decision log

Preserve the new pre-auth recall flow.

## Product model

Each basic active path contains exactly three required focus modules derived from the Digital Checkup.

The completion journey is:

three modules
→ final test
→ Digital Checkup ulang
→ before-and-after result
→ completion certificate
→ landing-page reward eligibility
→ optional advanced/premium recommendations

## Required routes

- `/app/progres`
- `/app/ujian-akhir`
- `/app/sertifikat/[certificateId]`
- `/app/checkup-ulang`
- `/app/reward/landing-page`
- `/app/premium`

## Progress

Show:

- `0 dari 3`, `1 dari 3`, `2 dari 3`, or `3 dari 3`
- current focus
- completed modules
- post-test mastery
- action tasks
- Business Assets
- final-test readiness
- recheckup readiness
- reward readiness
- Jejak Tumbuh timeline

Do not use a public leaderboard.

## Final test

- locked until all three required modules satisfy completion rules
- covers only the three assigned intervention areas
- scenario based
- targeted review after failure
- no punitive point loss
- pass state clearly unlocks recheckup

## Digital Checkup ulang

- reuse previous business data
- show what changed
- compare original and latest results
- explain which actions and assets contributed
- create an updated recommendation preview
- do not silently replace the completed three-module historical path

## Certificate

The certificate is a completion certificate, not an official competency certification.

Show:

- learner name
- business name
- completed three-focus path
- issue date
- mock certificate ID
- share and download UI states
- future verification placeholder

## Landing-page reward

Eligibility should evaluate:

- all three modules completed
- final test passed
- recheckup completed
- required Business Assets available
- business profile sufficiently complete
- terms accepted
- program capacity state

Build:

- eligible state
- not-yet-eligible state
- missing requirements
- Asset Bank preview
- missing-data resolution
- style selection
- claim submission
- tracking:
  - Menunggu data
  - Data lengkap
  - Dalam pengerjaan
  - Review pemilik
  - Live

## Premium

- personalized advanced recommendations only
- no broad marketplace
- do not distract before three required modules are completed
- explain outcome, reason, prerequisite, and expected business value
- no real payment

## Required tests

- final test locked before 3/3
- final test unlock at 3/3
- targeted review after failure
- recheckup unlock after pass
- before/after comparison
- certificate data
- reward eligible
- reward not eligible
- missing Business Asset
- premium hidden or de-emphasized before foundation completion
- end-to-end three-focus completion flow

Run lint, typecheck, tests, E2E, and production build.

Update documentation and report exact results.
```

---

# PROMPT 6.1 — NEON-READY PREPARATION

```text
Implement P0.6.1.

Prepare Neon/Postgres architecture without making the demo depend on a database.

Read:

- `docs/TECHNICAL_ARCHITECTURE_NEON_READY.md`
- revised three-focus flow documents
- existing repository contracts

Add or refine:

- Drizzle ORM configuration
- Neon serverless dependency
- `server-only` database client
- validated environment variables
- coherent schema files
- migration structure
- seed blueprint
- Neon repository adapter skeletons
- repository factory
- contract tests
- server-only health check disabled without DATABASE_URL

Ensure the schema supports:

- users
- businesses
- checkup results
- claim tokens
- exactly three primary plan assignments for the basic path
- modules
- lessons
- assessments
- task submissions
- Business Assets
- final test
- recheckup
- certificate
- reward claims
- notifications
- audit events

Rules:

- `NEXT_PUBLIC_DATA_SOURCE=mock` remains default
- app builds with empty DATABASE_URL
- no database query in mock mode
- no secret reaches client code
- no destructive migration
- no production auth
- no user-facing behavior regression

Run lint, typecheck, tests, build, and available client-bundle checks.

Document future Neon activation and migration commands.

Report confirmation that mock mode remains fully functional.
```

---

# PROMPT 7.1 — FINAL AUDIT

```text
Perform P0.7.1 final audit after P0.4.5, P0.5.1, and P0.6.1.

Read all documentation and compare implementation against the revised three-focus flow.

Audit:

1. Digital Checkup handoff concept
2. `/mulai?claim=...`
3. claim validation states
4. recall challenge
5. exactly-three selection rule
6. supportive partial feedback
7. reveal-help
8. path preview
9. deferred signup/login
10. claim association
11. dashboard showing exactly three required modules
12. locked-route enforcement
13. learning/task completion
14. final test
15. recheckup
16. before-and-after
17. certificate
18. reward eligibility
19. premium timing
20. mobile 360/390/430
21. large text
22. keyboard and reduced motion
23. loading/empty/error/offline/retry
24. Indonesian copy
25. mock/Neon separation
26. secret exposure
27. console and hydration errors
28. production build

Fix only P0 and P1 issues.

Run all available:

- lint
- typecheck
- unit tests
- component tests
- end-to-end tests
- production build

Create:

`docs/RELEASE_CANDIDATE_REPORT.md`

Include:

- routes tested
- scenarios tested
- exact command results
- issues found
- fixes applied
- remaining limitations
- responsive status
- accessibility status
- mock-mode confirmation
- stakeholder demo readiness
- recommended next backend steps

Do not claim a check passed unless it was actually executed.
```
