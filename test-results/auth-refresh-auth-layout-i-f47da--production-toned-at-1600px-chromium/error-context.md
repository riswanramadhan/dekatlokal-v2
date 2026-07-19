# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-refresh.spec.ts >> auth layout is responsive and production-toned at 1600px
- Location: tests\e2e\auth-refresh.spec.ts:12:7

# Error details

```
Test timeout of 600000ms exceeded.
```

```
Error: page.goto: Test timeout of 600000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/masuk", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - link "Lewati ke formulir" [ref=e3] [cursor=pointer]:
      - /url: "#auth-content"
    - complementary "Perjalanan Ruang Tumbuh" [ref=e4]:
      - generic [ref=e5]:
        - link "Kembali ke DekatLokal" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "DekatLokal" [ref=e7]
        - generic [ref=e8]:
          - paragraph [ref=e9]: Ruang Tumbuh untuk UMKM
          - heading "Lanjutkan hasil Checkup menjadi langkah nyata." [level=1] [ref=e10]:
            - text: Lanjutkan hasil
            - generic [ref=e11]: Checkup
            - text: menjadi langkah nyata.
          - paragraph [ref=e12]: Masuk untuk melihat fokus usaha, mengikuti course yang relevan, dan menyimpan setiap aksi yang sudah diterapkan.
        - list "Tahap perjalanan usaha" [ref=e13]:
          - listitem [ref=e14]:
            - img [ref=e16]
            - generic [ref=e20]:
              - strong [ref=e21]: Checkup
              - generic [ref=e22]: Kenali kondisi dan prioritas usahamu.
          - listitem [ref=e23]:
            - img [ref=e25]
            - generic [ref=e26]:
              - strong [ref=e27]: Jalur Naik Kelas
              - generic [ref=e28]: Dapatkan langkah yang disusun sesuai kebutuhan.
          - listitem [ref=e29]:
            - img [ref=e31]
            - generic [ref=e34]:
              - strong [ref=e35]: Course & Aksi Usaha
              - generic [ref=e36]: Belajar singkat, terapkan, lalu lihat perkembangannya.
        - generic [ref=e37]:
          - img [ref=e38]
          - generic [ref=e41]: Data hasil Checkup tetap terhubung secara aman ke akunmu.
    - region "Akses akun Ruang Tumbuh" [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44]: DekatLokal · Ruang Tumbuh
        - article [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e48]: Selamat datang kembali
            - heading "Masuk ke Ruang Tumbuh" [level=2] [ref=e49]
            - paragraph [ref=e50]: Lanjutkan Jalur Naik Kelas dan aksi usaha berdasarkan hasil Digital Checkup milikmu.
          - generic [ref=e51]:
            - generic [ref=e52]:
              - generic [ref=e53]: Nomor WhatsApp
              - textbox "Nomor WhatsApp" [active] [ref=e54]:
                - /placeholder: "Contoh: 0812 3456 7890"
              - paragraph [ref=e55]: Gunakan nomor yang terhubung dengan hasil Digital Checkup.
            - button "Kirim kode verifikasi" [ref=e56]:
              - img [ref=e57]
              - text: Kirim kode verifikasi
          - generic [ref=e59]: atau
          - button "Lanjut dengan Google" [ref=e61]:
            - generic [ref=e62]: G
            - text: Lanjut dengan Google
          - group [ref=e63]:
            - generic "Masuk dengan email" [ref=e64] [cursor=pointer]:
              - generic [ref=e65]:
                - img [ref=e66]
                - text: Masuk dengan email
              - img [ref=e69]
          - paragraph [ref=e71]:
            - text: Belum punya akun?
            - link "Buat akun baru" [ref=e72] [cursor=pointer]:
              - /url: /daftar
        - paragraph [ref=e73]:
          - text: Butuh bantuan?
          - link "Hubungi tim DekatLokal" [ref=e74] [cursor=pointer]:
            - /url: mailto:hello@dekatlokal.com
  - button "Open Next.js Dev Tools" [ref=e80] [cursor=pointer]:
    - generic [ref=e83]:
      - text: Compiling
      - generic [ref=e84]:
        - generic [ref=e85]: .
        - generic [ref=e86]: .
        - generic [ref=e87]: .
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function expectNoOverflow(page: Page) {
  4  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  5  | }
  6  | 
  7  | for (const viewport of [
  8  |   { width: 1600, height: 900 },
  9  |   { width: 390, height: 844 },
  10 |   { width: 360, height: 800 },
  11 | ]) {
  12 |   test(`auth layout is responsive and production-toned at ${viewport.width}px`, async ({ page }) => {
  13 |     await page.setViewportSize(viewport);
> 14 |     await page.goto("/masuk", { waitUntil: "networkidle" });
     |                ^ Error: page.goto: Test timeout of 600000ms exceeded.
  15 |     await expect(page.getByRole("heading", { name: "Masuk ke Ruang Tumbuh" })).toBeVisible();
  16 |     await expect(page.getByText("Lanjutkan hasil Checkup menjadi langkah nyata.")).toBeVisible();
  17 |     await expect(page.getByRole("button", { name: "Kirim kode verifikasi" })).toBeVisible();
  18 |     await expect(page.locator("body")).not.toContainText(/\b(?:demo|mock)\b/i);
  19 |     const phoneHeight = await page.getByLabel("Nomor WhatsApp").evaluate((node) => node.getBoundingClientRect().height);
  20 |     expect(phoneHeight).toBeGreaterThanOrEqual(52);
  21 |     await expectNoOverflow(page);
  22 |   });
  23 | }
  24 | 
  25 | test("WhatsApp validation, pending destination, and verification states remain functional", async ({ page }) => {
  26 |   await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  27 |   await page.getByLabel("Nomor WhatsApp").fill("12");
  28 |   await page.getByRole("button", { name: "Kirim kode verifikasi" }).click();
  29 |   await expect(page).toHaveURL(/status=invalid/);
  30 |   await expect(page.getByRole("alert")).toContainText("Nomor WhatsApp belum valid");
  31 | 
  32 |   await page.getByLabel("Nomor WhatsApp").fill("081234567890");
  33 |   await page.getByRole("button", { name: "Kirim kode verifikasi" }).click();
  34 |   await expect(page).toHaveURL(/\/verifikasi\?status=sent/);
  35 |   await page.getByLabel("Kode verifikasi").fill("000000");
  36 |   await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();
  37 |   await expect(page.getByRole("alert")).toContainText("tidak cocok");
  38 | });
  39 | 
  40 | test("Google and email alternatives retain their explicit states", async ({ page }) => {
  41 |   await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  42 |   await page.getByRole("button", { name: "Lanjut dengan Google" }).click();
  43 |   await expect(page).toHaveURL(/\/verifikasi\?status=google/);
  44 |   await expect(page.getByRole("status")).toContainText("Akun Google dipilih");
  45 | 
  46 |   await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  47 |   await page.getByText("Masuk dengan email").click();
  48 |   await page.getByLabel("Email").fill("tidak-valid");
  49 |   await page.getByRole("button", { name: "Lanjut dengan email" }).click();
  50 |   await expect(page).toHaveURL(/status=email-invalid/);
  51 |   await expect(page.getByRole("alert")).toContainText("Alamat email belum valid");
  52 | });
  53 | 
  54 | test("offline notice and legacy claim redirect are explicit", async ({ page, context }) => {
  55 |   await context.setOffline(true);
  56 |   await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  57 |   await expect(page.getByRole("status")).toContainText("Koneksi internet terputus");
  58 |   await context.setOffline(false);
  59 | 
  60 |   await page.goto("/masuk?claim=clm_7N4k9Q2vY8pR5tX1", { waitUntil: "domcontentloaded" });
  61 |   await expect(page).toHaveURL(/\/mulai\?claim=clm_7N4k9Q2vY8pR5tX1/);
  62 | });
  63 | 
  64 | test("auth keyboard order starts with its skip link and reduced motion disables animation", async ({ page }) => {
  65 |   await page.emulateMedia({ reducedMotion: "reduce" });
  66 |   await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  67 |   await page.keyboard.press("Tab");
  68 |   await expect(page.getByRole("link", { name: "Lewati ke formulir" })).toBeFocused();
  69 |   const activeAnimations = await page.locator(".auth-shell").evaluate((root) => root.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length);
  70 |   expect(activeAnimations).toBe(0);
  71 | });
  72 | 
  73 | for (const route of ["/masuk", "/daftar", "/verifikasi"]) {
  74 |   test(`${route} exposes no customer-facing demo or mock wording`, async ({ page }) => {
  75 |     await page.goto(route, { waitUntil: "domcontentloaded" });
  76 |     await expect(page.locator("body")).not.toContainText(/\b(?:demo|mock)\b/i);
  77 |   });
  78 | }
  79 | 
```