# DekatLokal V3 Acceptance Criteria

## Product

- `/` explains the post-Digital Checkup app journey and links to Digital Checkup plus demo claim.
- `/mulai?claim=demo-warung-rina` starts a complete value-first claim demo.
- Valid, missing, invalid, expired, and already-claimed claim states are visible.
- Recall shows exactly six choices, accepts exactly three, and preserves authoritative assignments.
- Dashboard focuses on one `Langkah Terbaik Hari Ini` and exactly three assigned modules.
- Required module completion requires lesson completion, post-test mastery, and business task approval/auto-approval.
- Locked modules can be previewed but cannot start and show prerequisites.
- Eight foundational modules exist exactly once in the catalog.
- Final test, Checkup ulang, before/after, certificate, reward, and premium preview remain demoable.

## UI

- Mobile-first at 390px, supported down to 360px.
- Floating nav has `Beranda`, `Jalur`, raised `Lanjut`, `Progres`, `Akun`.
- Nav labels collapse on downward scroll and restore on upward scroll/top/focus.
- Fixed CTA and nav never cover content.
- One dominant CTA per screen.
- No horizontal overflow at 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px.
- Copy is Indonesian, practical, and avoids customer-facing technical terms such as intervention.

## Accessibility And Reliability

- Keyboard focus visible and logical.
- Reduced motion supported.
- Sound toggle is accessible; no sound before gesture.
- Loading, empty, error, offline, retry, success, locked, unauthorized, and sync pending states remain represented where relevant.
- Mock mode works without Neon and without public-site dependency.

## Quality Gates

Required commands:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run check:client-bundle`
- `npm run build`
- explicit mock build with blank `DATABASE_URL` and `DIRECT_URL`
- `npm run test:e2e`

Failures caused by V3 must be fixed or documented with blockers.
