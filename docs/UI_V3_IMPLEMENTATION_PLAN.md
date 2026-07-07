# DekatLokal V3 Implementation Plan

Status: implementation in progress  
Default data source: `mock`  
Target demo entry: `/mulai?claim=demo-warung-rina`

## Summary

V3 refines the working P0.5/P0.6 frontend demo into a compact, mobile-first DekatLokal experience. The architecture stays mock-first and contract-first: UI routes use repository/service contracts, Neon remains guarded, and production auth, OTP, payment, live AI, mentor review, and real uploads stay inactive.

## Repository Audit

- Existing app uses Next.js App Router, TypeScript strict, Tailwind v4, Zod, lucide-react, Vitest, and Playwright.
- Existing business logic already covers claim, recall, onboarding, dashboard, locked modules, lesson resume, quiz correction, task evidence, Aset Usaha, final test, recheckup, certificate, reward, premium preview, mock storage, and Neon boundaries.
- Current gaps versus V3 references:
  - `/` redirects to `/masuk` instead of showing a public application landing page.
  - Dashboard and path use large hero/course-card patterns instead of compact mobile task rhythm.
  - Bottom navigation has four gradient tabs and no raised `Lanjut` action or collapse behavior.
  - Learning content is generated from scenario steps, not the exact eight foundational modules.
  - Claim demo token names do not match the V3 demo tokens.
  - No local sound system or sound preference exists.
  - Assets are local, but there is no central registry or attribution placeholder.

## Milestones

- **V3.1 Visual tokens and compact component system:** tighten radii, shadows, gradients, compact option cards, helper bubble, thin progress, compact stat/action blocks, asset registry.
- **V3.2 Public landing page:** replace `/` redirect with landing page sections, product demo preview, eight modules, FAQ, and CTAs.
- **V3.3 Claim and onboarding flow:** restyle `/mulai`, auth, OTP, onboarding; support V3 demo claim tokens and authoritative three-module recall.
- **V3.4 Mobile dashboard and adaptive navigation:** compact dashboard and floating 5-item nav with scroll collapse.
- **V3.5 Eight-module content and module detail:** exact eight foundational modules, three assigned per claim, unassigned modules locked/reference-only.
- **V3.6 Lesson, quiz, task, sound, and completion:** real demo lessons, 8-question post-tests, corrective review, tasks, assets, and UI sounds.
- **V3.7 Final assessment, recheckup, certificate, and reward:** preserve existing completion logic while aligning copy/layout to V3.
- **V3.8 Responsive, accessibility, and release audit:** update tests and run quality gates.

## Migration Strategy

- Keep current repository contracts and add catalog/content read methods.
- Replace the generic module generator with an eight-module catalog, while keeping existing completion/session services.
- Map each claim scenario to exactly three authoritative foundational modules.
- Preserve existing cookie-backed mock persistence and production-gated scenario tooling.
- Update tests with V3 copy, demo tokens, nav behavior, catalog validation, sound preference, and viewport checks.

## Rollback Risks

- Broad UI replacements may break existing Playwright copy assertions; tests must be rebaselined with V3 labels.
- Changing module IDs/slugs affects saved mock cookies; demo persistence can be reset safely because it is mock-only.
- Sound must not autoplay or create test flakiness; preference defaults muted until interaction.
- Eight-module catalog must keep exactly three active assignments or final/reward rules will fail.

## Definition Of Done

- `/` landing page and `/mulai?claim=demo-warung-rina` demo work without Neon or public site.
- Active path contains exactly three assigned modules from the eight-module catalog.
- Locked/reference modules preview but cannot start.
- Completion still requires lessons, post-test mastery, and business action.
- Sound preference is persisted, muted by default, and never plays before user gesture.
- 360px, 390px, 430px, tablet, and desktop layouts have no horizontal overflow.
- Lint, typecheck, tests, client-boundary check, build, explicit mock blank-DB build, and E2E pass or blockers are reported.
