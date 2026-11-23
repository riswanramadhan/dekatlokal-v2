import { expect, test } from "@playwright/test";

test.setTimeout(180_000);

for (const width of [320, 390, 768, 1440]) {
  test(`brand layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Hero
    await expect(page.locator("#hero-title")).toContainText("Agar lebih Dekat dengan");
    await expect(page.locator(".dl-hero").getByRole("link", { name: "Mulai Checkup Gratis" })).toBeVisible();
    await expect(page.locator(".dl-float-main")).toBeVisible();
    await expect(page.locator(".dl-float-main")).toContainText("Hasil Digital Checkup");
    await expect(page.locator(".dl-score-row")).toHaveCount(8);
    await expect(page.locator(".dl-float-modules")).toContainText("3 modul prioritas");
    await expect(page.locator(".dl-float-pill")).toContainText("Akses modul gratis 7 hari");
    await expect(page.locator(".dl-logos-label")).toHaveCSS("text-align", "center");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("hero.png") });

    // Semua bagian utama ada dan tidak melebar.
    for (const id of ["akses-belajar", "manfaat", "pengalaman", "course", "paket", "faq", "mulai"]) {
      const box = await page.locator(`#${id}`).boundingBox();
      expect(box, id).not.toBeNull();
      expect(box!.width, id).toBeLessThanOrEqual(width + 1);
    }

    // Modul: 8 kartu, gambar pertama termuat.
    await page.locator("#course").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect(page.locator(".dl-course")).toHaveCount(8);
    await expect.poll(
      () => page.locator(".dl-course-media img").first().evaluate((element) => (element as HTMLImageElement).naturalWidth),
      { timeout: 20_000 },
    ).toBeGreaterThan(0);
    await page.screenshot({ path: testInfo.outputPath("courses.png") });

    if (width === 1440) {
      // Semua section sejajar dengan container navbar.
      const rail = await page.locator(".dl-navbar").boundingBox();
      for (const selector of [".dl-steps", ".dl-benefits", ".dl-stories", "#course .dl-courses", ".dl-pricing", ".dl-faq", ".dl-cta-box", ".dl-footer-grid"]) {
        const box = await page.locator(selector).boundingBox();
        expect(Math.abs(box!.x - rail!.x), selector).toBeLessThan(2);
        expect(Math.abs(box!.width - rail!.width), selector).toBeLessThan(2);
      }
      // Grid modul 4 kolom: baris sejajar.
      const cards = await page.locator(".dl-course").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().y));
      expect(new Set(cards.map((y) => Math.round(y))).size).toBe(2);
    }

    // CTA akhir dan footer.
    await page.locator("#mulai").scrollIntoViewIfNeeded();
    await expect(page.locator(".dl-cta-refined").getByRole("link", { name: "Mulai Checkup Gratis" })).toBeVisible();
    await expect(page.getByTestId("landing-footer")).toContainText("© 2026 DekatLokal");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("cta.png") });
  });
}

test("headline rotates words in order without moving the hero visual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const word = page.locator(".dl-changing-word");
  const words = ["pelanggan", "cuan", "pesanan", "peluang", "pasar", "pertumbuhan"];
  const first = (await word.first().textContent())!;
  expect(words).toContain(first);
  const y = (await page.locator(".dl-hero-visual").boundingBox())!.y;
  await expect(page.locator(".dl-changing-word", { hasText: words[(words.indexOf(first) + 1) % words.length] })).toBeVisible({ timeout: 4_500 });
  expect(Math.abs((await page.locator(".dl-hero-visual").boundingBox())!.y - y)).toBeLessThan(1);
});

test("reduced motion keeps the headline static and the logo strip still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const word = page.locator(".dl-changing-word");
  await expect(word).toHaveText("pelanggan");
  await page.waitForTimeout(3_500);
  await expect(word).toHaveText("pelanggan");
  await expect(page.locator(".dl-logos-track")).toHaveCSS("animation-name", "none");
});

test("logo marquee runs and the navbar highlights the active section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".dl-logos-track")).toHaveCSS("animation-name", "marquee");
  await expect(page.locator(".dl-logo img").first()).toHaveAttribute("alt", "Aroma Bakery");
  await page.locator("#paket").evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect(page.locator(".dl-navbar-links a.is-active")).toHaveText("Harga");
});
