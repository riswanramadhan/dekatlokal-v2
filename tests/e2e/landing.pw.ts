import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("desktop navigation, carousel, and legal links work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const navbar = page.locator(".dl-navbar");
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });
    const compactWidth = (await navbar.boundingBox())?.width ?? 0;

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(navbar).toHaveClass(/is-scrolled/);
    await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });
    await expect.poll(async () => (await navbar.boundingBox())?.width ?? 0).toBeGreaterThan(compactWidth + 100);

    const storyTrack = page.locator(".dl-story-track");
    const storyIndex = () => storyTrack.evaluate((element) => getComputedStyle(element).getPropertyValue("--story-index"));
    const firstStoryIndex = await storyIndex();
    await expect.poll(storyIndex, { timeout: 7_000 }).not.toBe(firstStoryIndex);
    const autoplayStoryIndex = await storyIndex();
    await page.locator(".dl-story-arrows button").last().click();
    await expect.poll(storyIndex).not.toBe(autoplayStoryIndex);
    await expect(page.getByRole("button", { name: /Jeda|Putar otomatis cerita/ })).toHaveCount(0);

    const faqItems = page.locator(".dl-faq-item");
    await faqItems.nth(1).locator("summary").click();
    await expect(faqItems.nth(1)).toHaveAttribute("open", "");
    await expect(faqItems.nth(0)).not.toHaveAttribute("open", "");
    await faqItems.nth(2).locator("summary").click();
    await expect(faqItems.nth(2)).toHaveAttribute("open", "");
    await expect(faqItems.nth(1)).not.toHaveAttribute("open", "");

    await expect(page.getByRole("link", { name: "Kebijakan Privasi" })).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Syarat & Ketentuan" })).toHaveAttribute("target", "_blank");
  });

  test("mobile layout has no horizontal overflow and menu is usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const navbar = page.locator(".dl-navbar");
    await expect(navbar).toBeVisible();
    const compactWidth = (await navbar.boundingBox())?.width ?? 0;
    await page.locator("#akses-belajar").scrollIntoViewIfNeeded();
    await expect(navbar).toHaveClass(/is-scrolled/, { timeout: 10_000 });
    await expect.poll(async () => (await navbar.boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThan(compactWidth + 10);

    const menuButton = page.getByRole("button", { name: "Buka menu utama" });
    await menuButton.click();
    await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeVisible();
    const dialog = page.getByRole("dialog", { name: "DekatLokal" });
    const closeButton = dialog.getByRole("button", { name: "Tutup menu utama" });
    await expect(closeButton).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Ke beranda DekatLokal" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Mulai Cek Gratis" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("link", { name: "Ke beranda DekatLokal" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeHidden();
    await expect(menuButton).toBeFocused();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
