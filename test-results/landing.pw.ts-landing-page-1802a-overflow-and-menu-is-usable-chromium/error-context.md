# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.pw.ts >> landing page >> mobile layout has no horizontal overflow and menu is usable
- Location: tests\e2e\landing.pw.ts:39:7

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('dialog', { name: 'DekatLokal' }).getByRole('button', { name: 'Tutup menu utama' })
Expected: focused
Received: inactive
Timeout:  120000ms

Call log:
  - Expect "toBeFocused" with timeout 120000ms
  - waiting for getByRole('dialog', { name: 'DekatLokal' }).getByRole('button', { name: 'Tutup menu utama' })
    221 × locator resolved to <button type="button" data-menu-close="true" aria-label="Tutup menu utama">…</button>
        - unexpected value "inactive"

```

```yaml
- button "Tutup menu utama"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("landing page", () => {
  4  |   test("desktop navigation, carousel, and legal links work", async ({ page }) => {
  5  |     await page.setViewportSize({ width: 1440, height: 900 });
  6  |     await page.goto("/");
  7  | 
  8  |     const navbar = page.locator(".dl-navbar");
  9  |     await expect(navbar).toBeVisible();
  10 |     await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });
  11 |     const compactWidth = (await navbar.boundingBox())?.width ?? 0;
  12 | 
  13 |     await page.evaluate(() => window.scrollTo(0, 400));
  14 |     await expect(navbar).toHaveClass(/is-scrolled/);
  15 |     await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });
  16 |     await expect.poll(async () => (await navbar.boundingBox())?.width ?? 0).toBeGreaterThan(compactWidth + 100);
  17 | 
  18 |     const storyTrack = page.locator(".dl-story-track");
  19 |     const storyIndex = () => storyTrack.evaluate((element) => getComputedStyle(element).getPropertyValue("--story-index"));
  20 |     const firstStoryIndex = await storyIndex();
  21 |     await expect.poll(storyIndex, { timeout: 7_000 }).not.toBe(firstStoryIndex);
  22 |     const autoplayStoryIndex = await storyIndex();
  23 |     await page.locator(".dl-story-arrows button").last().click();
  24 |     await expect.poll(storyIndex).not.toBe(autoplayStoryIndex);
  25 |     await expect(page.getByRole("button", { name: /Jeda|Putar otomatis cerita/ })).toHaveCount(0);
  26 | 
  27 |     const faqItems = page.locator(".dl-faq-item");
  28 |     await faqItems.nth(1).locator("summary").click();
  29 |     await expect(faqItems.nth(1)).toHaveAttribute("open", "");
  30 |     await expect(faqItems.nth(0)).not.toHaveAttribute("open", "");
  31 |     await faqItems.nth(2).locator("summary").click();
  32 |     await expect(faqItems.nth(2)).toHaveAttribute("open", "");
  33 |     await expect(faqItems.nth(1)).not.toHaveAttribute("open", "");
  34 | 
  35 |     await expect(page.getByRole("link", { name: "Kebijakan Privasi" })).toHaveAttribute("target", "_blank");
  36 |     await expect(page.getByRole("link", { name: "Syarat & Ketentuan" })).toHaveAttribute("target", "_blank");
  37 |   });
  38 | 
  39 |   test("mobile layout has no horizontal overflow and menu is usable", async ({ page }) => {
  40 |     await page.setViewportSize({ width: 390, height: 844 });
  41 |     await page.goto("/");
  42 | 
  43 |     const navbar = page.locator(".dl-navbar");
  44 |     await expect(navbar).toBeVisible();
  45 |     const compactWidth = (await navbar.boundingBox())?.width ?? 0;
  46 |     await page.locator("#akses-belajar").scrollIntoViewIfNeeded();
  47 |     await expect(navbar).toHaveClass(/is-scrolled/, { timeout: 10_000 });
  48 |     await expect.poll(async () => (await navbar.boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThan(compactWidth + 10);
  49 | 
  50 |     const menuButton = page.getByRole("button", { name: "Buka menu utama" });
  51 |     await menuButton.click();
  52 |     await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeVisible();
  53 |     const dialog = page.getByRole("dialog", { name: "DekatLokal" });
  54 |     const closeButton = dialog.getByRole("button", { name: "Tutup menu utama" });
> 55 |     await expect(closeButton).toBeFocused();
     |                               ^ Error: expect(locator).toBeFocused() failed
  56 |     await page.keyboard.press("Shift+Tab");
  57 |     await expect(dialog.getByRole("link", { name: "Ke beranda DekatLokal" })).toBeFocused();
  58 |     await page.keyboard.press("Shift+Tab");
  59 |     await expect(dialog.getByRole("link", { name: "Mulai Cek Gratis" })).toBeFocused();
  60 |     await page.keyboard.press("Tab");
  61 |     await expect(dialog.getByRole("link", { name: "Ke beranda DekatLokal" })).toBeFocused();
  62 |     await page.keyboard.press("Escape");
  63 |     await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeHidden();
  64 |     await expect(menuButton).toBeFocused();
  65 | 
  66 |     const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  67 |     expect(overflow).toBeLessThanOrEqual(1);
  68 |   });
  69 | });
  70 | 
```