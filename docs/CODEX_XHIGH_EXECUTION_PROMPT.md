# CODEX XHIGH EXECUTION PROMPT — FULL DEKATLOKAL V3 DEMO

Use the highest available reasoning effort / XHigh mode.

Exit Plan mode and implement the approved V3 plan.

Read:

1. `AGENTS.md`
2. all original PRD/architecture documents,
3. `docs/UI_REFERENCE_ANALYSIS.md`,
4. `docs/CURRICULUM_8_MODULES.md`,
5. all `docs/UI_V3_*.md` plan files,
6. every image in `docs/references/`,
7. existing source code and tests.

## Primary objective

Deliver a complete high-fidelity frontend demo that can be presented immediately.

It must feel:

- simple,
- compact,
- modern,
- fun,
- clear,
- mobile-first,
- recognizably DekatLokal,
- visually close in rhythm and density to the supplied references.

Do not rebuild working business logic unnecessarily. Refactor surface and flow carefully.

## 1. Visual system

Use:

- primary `#0255F5`,
- white,
- soft blue surfaces,
- limited blue-violet, mint, coral, and yellow accents,
- modern sans typography,
- compact card sizes,
- 14–20px radii for common containers,
- restrained shadows,
- clear borders,
- subtle decorations.

Avoid:

- oversized containers,
- huge cards,
- giant hero text,
- generic SaaS dashboard,
- overuse of gradient,
- glassmorphism,
- tiny unreadable labels,
- random colors,
- decorative clutter.

## 2. Public landing page

Implement `/`.

Required sections:

### Navigation
- DekatLokal logo
- Cara Kerja
- Modul
- Dampak
- FAQ
- Masuk
- CTA `Mulai Digital Checkup`

### Hero
Headline:
`Dari hasil Digital Checkup menjadi langkah nyata untuk usahamu.`

Support:
`DekatLokal memilih tiga fokus utama, membimbingmu belajar singkat, menerapkannya ke usaha, lalu mengukur perkembanganmu.`

Primary CTA:
`Mulai Digital Checkup`

Secondary CTA:
`Coba Demo Jalur`

Demo CTA routes to:
`/mulai?claim=demo-warung-rina`

Include a product-demo visual built from actual app UI, not a fake generic illustration.

### Three-step journey
1. Isi Digital Checkup.
2. Selesaikan tiga fokus.
3. Ukur perkembangan dan dapatkan reward.

### Problem/solution
Explain that UMKM often receive too many generic materials. DekatLokal focuses on only three needs.

### Eight modules
Show all eight as compact cards with icon, one-line outcome, and status.

### Product showcase
Show:
- guided lessons,
- quiz,
- practical task,
- Business Asset,
- progress comparison.

### Reward
Explain the landing-page reward conditions clearly.

### Testimonials
Use clearly marked demo/placeholders unless real testimonials exist in the repository. Do not fabricate real identities.

### FAQ
Include:
- Apakah harus bayar?
- Kenapa hanya tiga modul?
- Apakah bisa belajar lewat HP?
- Bagaimana hasil Digital Checkup terhubung?
- Kapan bisa mendapatkan landing page?
- Apakah progres tersimpan?

### Final CTA
`Mulai dari Digital Checkup`

The public page must visually connect to `dekatlokal.com`, but remain optimized for the application.

## 3. Claim demo

Implement a clearly testable mock scenario:

`/mulai?claim=demo-warung-rina`

Assigned modules:

1. Digitalisasi UMKM
2. Branding UMKM
3. Konsistensi Promosi

Business:
`Warung Rina`

Owner:
`Bu Rina`

Other scenarios:

- `demo-saji-studio`
- `demo-bersihpro`
- `demo-expired`
- `demo-claimed`
- missing token.

The recall screen shows the three assigned modules plus three plausible distractors.

The authoritative modules always come from the claim result, never from recall choices.

## 4. Onboarding and claim UI

Match the supplied onboarding references in rhythm:

- narrow centered content on desktop,
- one message/question per page,
- slim top progress,
- small Tekap helper near a speech bubble,
- small option cards,
- fixed bottom action,
- subtle line/spark decoration,
- no oversized panels.

Required screens:

- claim validation,
- result ready,
- recall selection,
- partial feedback,
- reveal help,
- correct feedback,
- path preview,
- signup wall,
- signup,
- login,
- OTP.

## 5. Dashboard

### Mobile

Use a compact dashboard inspired by the supplied mobile dashboard reference:

- small top header,
- greeting and business name,
- sound toggle,
- notification,
- compact next-action hero,
- 2×2 quick actions,
- three assigned modules,
- compact progress,
- Business Asset preview,
- contextual empty states,
- floating mobile navigation.

Do not create large course cards.

### Desktop

Use a restrained responsive dashboard:

- compact sidebar,
- top actions,
- one next-action panel,
- three small progress cards,
- current learning list,
- right supporting panel,
- compact Asset/Reward blocks.

## 6. Adaptive mobile navigation

Implement:

- Beranda
- Jalur
- raised center `Lanjut`
- Progres
- Akun

Expanded:
- icons + labels.

On scroll down:
- labels fade/collapse,
- nav height shrinks,
- nav moves slightly higher,
- center action remains prominent.

On scroll up, top, keyboard focus, or navigation:
- labels return.

Technical requirements:

- use a reusable hook,
- requestAnimationFrame or efficient passive listener,
- threshold to avoid flicker,
- no layout shift,
- safe-area support,
- reduced-motion fallback,
- adequate bottom page padding.

## 7. Eight module catalog and assignment behavior

Implement exactly these modules:

1. Digitalisasi UMKM
2. Branding UMKM
3. Produk dan Kemasan
4. Konsistensi Promosi
5. Marketplace dan Kanal Penjualan
6. Operasional dan Keuangan Dasar
7. Legalitas Usaha
8. Komitmen dan Growth Mindset

Use `docs/CURRICULUM_8_MODULES.md` as source of truth.

Each module must have:

- real title,
- short outcome,
- icon,
- four lessons,
- lesson duration,
- knowledge checks,
- one task,
- one Business Asset output,
- 8–10 question post-test,
- corrective review,
- completion badge.

Do not use lorem ipsum or repeated generic content.

## 8. Module detail

Compact layout.

Show:

- title,
- one-line outcome,
- reason assigned,
- progress,
- lesson list,
- task,
- asset output,
- test status,
- primary CTA.

Assigned modules are active/sequential.

Unassigned modules are visibly locked or reference-only until the required path is complete.

## 9. Lesson player

Implement real demo content for all module lesson records.

Lesson types:

- story,
- short reading,
- image/example,
- interactive selection,
- checklist,
- template.

Rules:

- one concept per screen,
- short paragraphs,
- progress,
- resume,
- fixed CTA,
- no app navigation while learning,
- compact containers,
- mobile-first.

## 10. Quiz and test

Implement:

- lesson check,
- module post-test,
- corrective flow,
- final assessment after three modules.

Question types:

- multiple choice,
- scenario,
- sequence,
- select multiple.

Feedback:

- correct with explanation,
- incorrect-soft with explanation,
- no harsh failure language,
- retry,
- weak-topic review.

## 11. Practical tasks

Each module task must be functional in mock mode.

Support:

- text,
- checklist,
- link,
- image preview,
- save draft,
- submit,
- approved demo state.

Outputs enter Business Asset Bank.

## 12. Sound effects

Add a reusable local sound system.

Required sound events:

- `ui-click`
- `option-select`
- `answer-correct`
- `answer-incorrect-soft`
- `module-unlock`
- `lesson-complete`
- `reward-complete`

Requirements:

- local files under `public/sounds/`,
- use licensed/free audio or original generated simple tones,
- no remote hotlink,
- no autoplay before first user gesture,
- small file size,
- volume approximately 0.15–0.35,
- debounce repeated clicks,
- global mute toggle,
- persistent preference,
- visual feedback remains primary,
- sound unit tests where practical.

Do not play sound during scrolling.

## 13. Progress and outcome

Implement:

- three-focus progress,
- Jejak Tumbuh,
- Business Asset Bank,
- final assessment,
- recheckup,
- before/after,
- certificate preview,
- landing-page reward eligibility,
- claim tracking.

## 14. Realistic copy and data

All UI text must be written for Indonesian UMKM.

Do not fabricate verified statistics or real testimonials.

Use `Demo` or `Contoh` labels when content is simulated.

Legal content must remain general and include an official-source validation note before production use.

## 15. Images and icons

Use one icon library consistently.

Download only open-license temporary illustrations and keep them local.

Create:

- asset registry,
- attribution file if required by license,
- fallback illustration components.

Do not use random low-quality stock photos.
Do not copy third-party mascot or proprietary assets.

## 16. Required states

Implement:

- loading,
- empty,
- offline,
- invalid token,
- expired token,
- claimed token,
- locked,
- retry,
- success,
- sync pending,
- no assigned module,
- completed path.

## 17. Tests

Add/update:

- claim scenario tests,
- recall authoritative assignment tests,
- eight-module data validation,
- module completion rules,
- quiz corrective flow,
- sound preference and first-interaction behavior,
- navigation collapse behavior,
- refresh persistence,
- locked route guard,
- final assessment unlock,
- reward eligibility,
- mobile E2E.

Verify:

- 360×800,
- 390×844,
- 430×932,
- 768 tablet,
- 1024,
- 1280,
- 1440.

Run:

- lint,
- typecheck,
- unit tests,
- component tests,
- E2E tests,
- production build.

Fix all regressions caused by the implementation.

## 18. Documentation

Update/create:

- implementation plan status,
- decision log,
- route map,
- content map,
- sound documentation,
- asset attribution,
- demo scenario guide,
- release candidate report.

## Completion report

Report:

- routes completed,
- UI components changed,
- all eight modules generated,
- demo tokens,
- sound events,
- test commands and exact results,
- remaining limitations,
- manual testing instructions,
- confirmation that mock mode works without Neon,
- screenshots or route list for founder review.

Do not claim a check passed unless it actually ran.
