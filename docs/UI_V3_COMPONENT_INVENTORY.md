# DekatLokal V3 Component Inventory

## Keep And Refine

- `Button`, `ButtonLink`, `FixedCta`, `ProgressBar`, `StateBlock`, `OfflineBanner`, `Input`, `Badge`.
- App shell repository/service loading.
- Lesson, assessment, task, final-test, reward client runners.

## Add

- `CompactCard`, `CompactStat`, `CompactActionTile`, `CompactModuleCard`.
- `HelperBubble` for small Tekap-style guidance.
- `SlimProgressHeader` for onboarding and lesson screens.
- `AdaptiveBottomNavigation` and `useAdaptiveNav`.
- `SoundToggle` and `SoundProvider` or a client-side sound hook.
- `LandingProductPreview`, `LandingSection`, `ModuleCatalogGrid`.
- `AssetRegistryImage` or registry helper.

## Replace Or Deprecate In V3 Screens

- Large `HeroBanner` usage above the mobile fold.
- Large image-led `CourseCard` on dashboard/path.
- Four-item gradient mobile bottom nav.
- Gradient-heavy panels where simple blue/white cards are clearer.

## Component Rules

- One dominant CTA per screen.
- Body text at least 16px.
- Touch targets at least 44px.
- Cards should be compact, mostly 14-20px radius, with controlled shadows.
- UI components must not import fixtures directly.
- Icons use lucide-react consistently.
