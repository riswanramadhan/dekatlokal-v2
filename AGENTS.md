# AGENTS.md — DekatLokal Platform V2

## Mission

Build `app.dekatlokal.com`, a mobile-first personalized UMKM learning-and-intervention platform that is visually connected to `dekatlokal.com`.


## Read first

Before planning or editing, read:

1. `docs/PRD_DEKATLOKAL_PLATFORM_V2.md`
2. `docs/BRAND_AND_UI_GUIDE.md`
3. `docs/TECHNICAL_ARCHITECTURE_NEON_READY.md`
4. `docs/IMPLEMENTATION_PLAN.md` when it exists
5. `docs/DECISIONS.md` when it exists
6. Existing code and project conventions
7. documentation include codex, with 'React in Incluyde'

## Product rules

- This is not a generic course marketplace.
- The dashboard leads with one personalized `Langkah Terbaik Hari Ini`.
- Recommendations must explain why they were assigned.
- Users can preview locked modules but cannot start them.
- Locked states must show prerequisites.
- Required module completion requires learning, assessment mastery, and business action.
- Free modules must create useful business assets.
- Progress emphasizes business actions and before/after improvement.
- Use Indonesian copy and real product language.
- Use `Ruang Tumbuh`, `Jalur Naik Kelas`, `Jejak Tumbuh`, `Poin Tumbuh`, and `Aset Usaha`.
- Keep technical terms such as intervention out of customer-facing copy.
- Gamification must feel adult, supportive, and outcome-oriented.

## Domain rules

- Public website and Digital Checkup remain at `dekatlokal.com`.
- The logged-in application is designed for `app.dekatlokal.com`.
- UMKM websites may use `{slug}.dekatlokal.com`.
- Demo must work without the main site and without Neon.
- Claim flow must be represented through a mock opaque token.
- Never put checkup scores or private data directly in a public query string.

## Brand rules

- Match the current DekatLokal visual family.
- Use official assets from `public/brand`.
- Use `#0255F5` as the primary starting token unless official source tokens differ.
- Prefer white, soft neutral, clean spacing, rounded cards, and controlled shadows.
- Avoid generic SaaS dashboard aesthetics.
- Avoid unrelated neon gradients, heavy glassmorphism, and childish UI.
- “Fun” comes from interaction, progress, copy, and restrained motion.

## Mobile rules

- Primary design width: 390px.
- Minimum supported: 360px.
- Bottom navigation: Beranda, Jalur Saya, Progres, Akun.
- One dominant CTA per screen.
- Body text at least 16px.
- Primary controls at least 44px.
- No hover-only interaction.
- Support large text and reduced motion.
- Check safe areas and fixed CTA overlap.

## Current scope

Build a high-fidelity frontend demo with realistic mocks.

Do not activate:

- Production Neon access.
- Production authentication.
- Real OTP.
- Payment.
- Live AI.
- Live mentor review.

However, prepare:

- Domain models.
- Zod schemas.
- Repository interfaces.
- Mock adapter.
- Neon adapter boundary.
- Drizzle schema/migration structure.
- `.env.example`.

The default data source must remain `mock`.

## Engineering rules

- Next.js App Router.
- TypeScript strict.
- Use Server Components by default.
- Use Client Components only when interaction requires them.
- UI components never import fixtures directly.
- All data access goes through repository/service contracts.
- Protect database modules with `server-only`.
- Never expose database credentials to client code.
- Validate environment variables.
- Avoid `any`.
- Do not install dependencies without explaining their role.
- Preserve existing behavior unless the task explicitly changes it.
- Do not modify the sibling/main DekatLokal repository.

## Mock requirements

Provide at least:

- Guided culinary new user.
- Fast fashion user.
- Returning service business.
- Expired claim.
- No checkup.
- Offline.
- Upload failure.
- Quiz failure.
- Reward eligible.

Development scenario tooling must not be available in production.

## Required states

Every relevant feature must consider:

- Loading.
- Empty.
- Error.
- Offline.
- Retry.
- Success.
- Locked.
- Unauthorized.
- Sync pending.

## Quality gates

Before completing a milestone:

1. Run lint.
2. Run typecheck.
3. Run tests.
4. Run production build.
5. Fix regressions caused by the task.
6. Verify critical routes at 360px and 390px.
7. Check keyboard focus.
8. Check console errors.
9. Report changed files, commands, results, assumptions, and limitations.

If a command cannot run, state the blocker. Never claim success without output.

## Git discipline

- Work on a feature branch.
- Keep milestone scope focused.
- Do not delete unrelated work.
- Do not commit secrets, `.env.local`, build output, or caches.
- Do not rewrite protected branch history.
