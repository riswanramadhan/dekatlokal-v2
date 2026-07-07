# CODEX XHIGH PLAN PROMPT — DEKATLOKAL UI, FLOW, CONTENT, AND SOUND

Use the highest available reasoning effort / XHigh mode.

Enter Plan mode.

Do not edit application code yet.

Read in this order:

1. `AGENTS.md`
2. All existing product and architecture documents
3. `docs/UI_REFERENCE_ANALYSIS.md`
4. `docs/CURRICULUM_8_MODULES.md`
5. Every image inside `docs/references/`
6. Existing routes, components, mock repositories, tests, and current implementation

## Mission

Plan a full UI and product-flow refinement for DekatLokal Platform V2.

The current implementation is functional, but the next version must become:

- simpler,
- more compact,
- clearer,
- modern,
- mobile-first,
- visually fun,
- dominated by DekatLokal blue and white,
- visually informed by the supplied onboarding and dashboard references,
- complete enough to demo from claim token through learning, testing, recheckup, and reward.

Do not copy third-party logos, mascot, text, or proprietary artwork. Recreate the interaction rhythm and visual principles using DekatLokal identity.

## Final product scope

### Public application landing page

`app.dekatlokal.com` must have a modern public landing page explaining:

- what happens after Digital Checkup,
- why users receive only three focus modules,
- how learning works,
- how practical tasks create Business Assets,
- how recheckup measures improvement,
- how the landing-page reward works.

The landing page should use a content rhythm similar to a modern education-product landing page:

- announcement strip optional,
- navigation,
- strong hero,
- product demo preview,
- 3-step journey,
- problem/solution section,
- showcase of learning modes,
- the eight available modules,
- how personalization works,
- testimonials placeholders,
- FAQ,
- final CTA.

Primary CTA:
`Mulai Digital Checkup`

Secondary CTA:
`Lihat Cara Kerjanya`

### Claim-token demo flow

The demo must start clearly from:

`/mulai?claim=demo-warung-rina`

Required states:

- valid,
- missing,
- invalid,
- expired,
- already claimed.

Flow:

landing page or Digital Checkup result
→ claim token
→ result-ready
→ recall the three recommended modules
→ preview path
→ signup/login
→ associate claim
→ dashboard
→ first assigned module
→ lessons
→ quiz
→ task
→ module completion
→ remaining assigned modules
→ final assessment
→ Digital Checkup ulang
→ before/after
→ certificate
→ reward.

### Eight-module system

The system contains exactly eight foundational modules:

1. Digitalisasi UMKM
2. Branding UMKM
3. Produk dan Kemasan
4. Konsistensi Promosi
5. Marketplace dan Kanal Penjualan
6. Operasional dan Keuangan Dasar
7. Legalitas Usaha
8. Komitmen dan Growth Mindset

A Digital Checkup assigns exactly three focus modules.

The dashboard emphasizes only the assigned three.

Other foundational modules may be visible as locked/reference content, but cannot distract from the active path.

### UI direction

Use the reference images as visual sources of truth for:

- compact card dimensions,
- narrow focused content,
- one main task per page,
- thin progress bar,
- small speech bubble/helper,
- subtle decorative background,
- fixed bottom CTA,
- minimal option containers,
- floating compact mobile navigation.

The UI must not use oversized cards, giant headings, excessive empty hero height, or large generic dashboard blocks.

### Mobile navigation

Plan a floating navigation with:

- Beranda
- Jalur
- central raised `Lanjut` action
- Progres
- Akun

Behavior:

- positioned slightly above the device safe area,
- expanded state shows icon and label,
- scrolling down collapses labels,
- scrolling up/top/focus restores labels,
- icons remain,
- transition without layout shift,
- content padding prevents overlap.

### Sound system

Plan short local UI sound effects:

- click,
- select,
- correct,
- incorrect-soft,
- unlock,
- complete,
- reward.

Rules:

- no autoplay before user gesture,
- sound preference toggle,
- persisted setting,
- low volume,
- visual feedback always remains,
- no sound on scroll,
- respect accessibility,
- files stored locally,
- no remote hotlink.

### Visual assets

Use:

- official DekatLokal brand assets,
- one consistent icon library,
- open-license temporary illustrations downloaded to local assets,
- centralized asset registry.

Do not hotlink images in production UI.

### Desktop

Desktop must preserve compactness:

- centered onboarding column around 480–520px,
- subtle decorative background,
- dashboard grid with restrained card dimensions,
- no giant admin panels,
- purposeful sidebar/topbar only where needed.

## Required planning output

Create:

1. `docs/UI_V3_IMPLEMENTATION_PLAN.md`
2. `docs/UI_V3_ROUTE_FLOW.md`
3. `docs/UI_V3_COMPONENT_INVENTORY.md`
4. `docs/UI_V3_SOUND_SPEC.md`
5. `docs/UI_V3_CONTENT_DATA_MODEL.md`
6. `docs/UI_V3_ACCEPTANCE_CRITERIA.md`

The implementation plan must contain:

- repository audit,
- gaps versus references,
- route-by-route redesign plan,
- landing-page plan,
- exact claim demo behavior,
- eight-module content integration,
- lesson/test/task generation plan,
- responsive plan,
- navigation-collapse algorithm,
- sound architecture,
- asset strategy,
- mock data scenarios,
- testing strategy,
- migration strategy that preserves working logic,
- exact files expected to change,
- milestone sequence,
- rollback risks,
- definition of done.

## Milestones

Use:

- V3.1 Visual tokens and compact component system
- V3.2 Public landing page
- V3.3 Claim and onboarding flow
- V3.4 Mobile dashboard and adaptive navigation
- V3.5 Eight-module content and module detail
- V3.6 Lesson, quiz, task, sound, and completion
- V3.7 Final assessment, recheckup, certificate, and reward
- V3.8 Responsive, accessibility, and release audit

At the end:

- summarize the plan,
- identify founder decisions,
- identify existing code that can be retained,
- identify components that must be replaced,
- do not implement code yet.
