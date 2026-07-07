# BRAND AND UI GUIDE
# DekatLokal Platform V2

## 1. Objective

`app.dekatlokal.com` must feel like the logged-in product extension of `dekatlokal.com`, not a separate startup template.

The visual experience should communicate:

- Trust.
- Simplicity.
- Local growth.
- Technology that feels approachable.
- Professional support.
- Optimism.

“Fun” comes from progress, interaction, personalized copy, and rewarding motion—not from childish illustrations or visual noise.

---

## 2. Brand Source of Truth

Use official assets copied from the current DekatLokal repository:

```text
public/brand/
├── logo-horizontal.*
├── logo-mark.*
├── favicon.*
├── og-image.*
└── illustrations/
```

Do not recreate the logo through CSS or AI.

If actual tokens are available in the main repository, use them. The following tokens are safe starting points and must be reviewed against the current website.

---

## 3. Design Tokens

```css
:root {
  --brand-primary: #0255f5;
  --brand-primary-hover: #0147d6;
  --brand-primary-active: #013bb3;
  --brand-primary-soft: #edf4ff;

  --surface-page: #f7f9fc;
  --surface-card: #ffffff;
  --surface-subtle: #f1f5f9;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --border-default: #e2e8f0;

  --success: #15803d;
  --success-soft: #ecfdf3;
  --warning: #b45309;
  --warning-soft: #fff7ed;
  --danger: #b91c1c;
  --danger-soft: #fef2f2;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-pill: 999px;

  --shadow-card: 0 8px 24px rgba(15, 23, 42, 0.06);
  --shadow-floating: 0 16px 40px rgba(15, 23, 42, 0.12);
}
```

---

## 4. Typography

Preferred:

1. Use the current site font when legally and technically available.
2. Otherwise use Plus Jakarta Sans.
3. Fallback: Inter, system sans-serif.

Mobile scale:

```text
Display: 32/38, 700
H1: 28/34, 700
H2: 24/30, 700
H3: 20/26, 650
Body large: 18/28
Body: 16/25
Small: 14/21
Caption: 12/18 only for non-critical metadata
```

Never use 12px for primary information or controls.

---

## 5. Layout

### Mobile

- 16px page padding at 360px.
- 20px page padding at 390px+.
- 12–16px card gap.
- Bottom navigation.
- Fixed CTA with safe area.
- Maximum four primary tabs.
- One column.

### Desktop

- Sidebar.
- Content max width 1180px.
- Dashboard may use two columns.
- Lesson reading width 720px maximum.
- Preserve hierarchy and focus.

---

## 6. Component Character

### Buttons

- Strong blue primary.
- White label.
- Minimum 48px height for primary.
- Rounded 14–16px.
- Clear loading and disabled state.
- No tiny ghost CTA for critical actions.

### Cards

- White.
- Soft border.
- Controlled shadow.
- 16–22px radius.
- Avoid stacking too many nested cards.

### Progress

- Horizontal bars for pillar scores.
- Vertical path for learning journey.
- Circular progress only when it adds clarity.
- Never use chart-heavy dashboard.

### Icons

- Use one library consistently.
- Rounded modern icons.
- Always provide label for unfamiliar icons.
- Do not use emoji as navigation icons.

---

## 7. App Shell

### Mobile header

- Small logo.
- Business identity/avatar.
- Notification.
- No full website nav.

### Bottom navigation

- Beranda.
- Jalur Saya.
- Progres.
- Akun.

### Tekap

A contextual floating/helper control. It should not overlap primary CTA.

---

## 8. Dashboard Visual Hierarchy

First viewport:

1. Greeting.
2. Business.
3. Next-action card.
4. Primary CTA.

The next-action card may use:

- Primary blue surface or blue accent.
- Soft illustration.
- Progress.
- Time.
- Rationale.

Do not place five equal cards above the fold.

---

## 9. Learning UI

- One concept per screen.
- Media card.
- Large interactive options.
- Immediate feedback.
- Fixed CTA.
- No distracting navigation.
- Progress at top.
- Close/back confirms unsaved work only when needed.

---

## 10. Motion

- 150–300ms.
- Use for state transitions and feedback.
- Gentle completion celebration.
- Respect reduced motion.
- No infinite decorative animation.
- No mandatory animation before action.

---

## 11. Illustration

Use illustration to:

- Reduce fear.
- Explain a process.
- Celebrate progress.
- Visualize local business contexts.

Avoid generic tech 3D assets that do not reflect UMKM.

---

## 12. Copy UI Examples

### Greeting

> Selamat pagi, Bu Rina. Hari ini cukup satu langkah kecil untuk membuat Warung Rina lebih mudah ditemukan.

### Locked

> Modul ini menggunakan katalog yang akan Anda buat pada langkah sebelumnya.

### Failure

> Sedikit lagi. Dua topik perlu diperkuat sebelum melanjutkan.

### Recovery

> Tidak apa-apa sempat berhenti. Lanjutkan 4 menit dari bagian terakhir.

### Success

> Selesai! Deskripsi usaha ini sekarang tersimpan di Aset Usaha dan dapat digunakan untuk landing page.

---

## 13. Visual Anti-patterns

Reject implementation when:

- It looks like a generic SaaS admin template.
- It contains a wall of course cards.
- It uses unrelated purple/pink neon gradients.
- It relies on glassmorphism.
- It uses text smaller than 14px extensively.
- It hides primary actions.
- It has more than one competing primary CTA.
- It uses desktop sidebar on mobile.
- It creates a childish game aesthetic.
