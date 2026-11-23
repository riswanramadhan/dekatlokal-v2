import { expect as baseExpect, test } from "@playwright/test";

const expect = baseExpect.configure({ timeout: 60_000 });

test.describe("landing page", () => {
  test.setTimeout(180_000);

  test("desktop navigation, pricing, FAQ, and legal links work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("#hero-title")).toContainText("Agar lebih Dekat dengan");

    const navbar = page.locator(".dl-navbar");
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });
    await expect(navbar).not.toHaveClass(/is-scrolled/);
    await expect(navbar.getByRole("link", { name: "Cara Kerja" })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(navbar).toHaveClass(/is-scrolled/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(navbar).not.toHaveClass(/is-scrolled/);

    // Harga: memilih paket mengganti kartu detail.
    await page.locator("#paket").scrollIntoViewIfNeeded();
    const tumbuh = page.getByRole("button", { name: /Tumbuh/ });
    await expect(tumbuh).toContainText("Rp499.000");
    await tumbuh.click();
    await expect(tumbuh).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".dl-plan-detail h3")).toHaveText("Tumbuh");
    await expect(page.locator(".dl-plan-detail-price strong")).toHaveText("Rp499.000");
    await expect(page.locator(".dl-plan-detail").getByRole("link", { name: /Tanya Paket Ini/ })).toHaveAttribute("href", /wa\.me\/6289516335023/);

    // FAQ: hanya satu item terbuka pada satu waktu.
    const faqItems = page.locator(".dl-faq-item");
    await expect(faqItems).toHaveCount(6);
    await expect(faqItems.nth(0)).toHaveAttribute("open", "");
    await faqItems.nth(1).locator("summary").click();
    await expect(faqItems.nth(1)).toHaveAttribute("open", "");
    await expect(faqItems.nth(0)).not.toHaveAttribute("open", "");
    await faqItems.nth(4).locator("summary").click();
    await expect(faqItems.nth(4)).toHaveAttribute("open", "");
    await expect(faqItems.nth(1)).not.toHaveAttribute("open", "");
    await faqItems.nth(4).locator("summary").click();
    await expect(faqItems.nth(4)).not.toHaveAttribute("open", "");

    // CTA akhir dan footer.
    const cta = page.locator(".dl-cta-refined");
    await cta.scrollIntoViewIfNeeded();
    await expect(cta.getByRole("link", { name: "Mulai Checkup Gratis" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kebijakan Privasi" })).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Syarat & Ketentuan" })).toHaveAttribute("target", "_blank");
    const contact = page.getByTestId("landing-footer").getByRole("link", { name: "Hubungi DekatLokal", exact: true });
    await expect(contact).toHaveAttribute("href", /wa\.me\/6289516335023\?text=/);
    await contact.hover();
    await expect(contact).toHaveCSS("color", "rgb(2, 85, 245)");
  });

  test("stories carousel moves with buttons and autoplay pauses on hover", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const carousel = page.getByTestId("story-carousel");
    await carousel.scrollIntoViewIfNeeded();
    const activeDot = () => carousel.locator(".dl-stories-dots button.is-active").getAttribute("aria-label");
    const first = await activeDot();
    await carousel.getByRole("button", { name: "Cerita berikutnya" }).click();
    await expect.poll(activeDot).not.toBe(first);
    const afterClick = await activeDot();
    await carousel.getByRole("button", { name: "Cerita sebelumnya" }).click();
    await expect.poll(activeDot).toBe(first);

    // Autoplay bergerak sendiri saat tidak di-hover.
    await page.mouse.move(10, 10);
    await expect.poll(activeDot, { timeout: 8_000 }).not.toBe(first);

    // Saat di-hover, autoplay berhenti.
    await carousel.locator(".dl-stories-viewport").hover();
    const hovered = await activeDot();
    await page.waitForTimeout(5_500);
    expect(await activeDot()).toBe(hovered);
    expect(afterClick).not.toBe(first);
  });

  test("mobile layout has no horizontal overflow and menu dialog is accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const navbar = page.locator(".dl-navbar");
    await expect(navbar).toBeVisible();
    await expect(navbar.getByRole("link", { name: "Cara Kerja" })).toBeHidden();
    await page.locator("#akses-belajar").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect(navbar).toHaveClass(/is-scrolled/, { timeout: 10_000 });

    const menuButton = page.locator(".dl-navbar-menu-button");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const dialog = page.getByRole("dialog", { name: "Menu utama DekatLokal" });
    await expect(dialog).toBeVisible();
    const firstLink = dialog.getByRole("link", { name: /Beranda/ });
    await expect(firstLink).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Mulai Checkup Gratis" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(firstLink).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");

    // Membuka menu lalu memilih tautan menutup menu.
    await menuButton.click();
    await dialog.getByRole("link", { name: /Harga/ }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
