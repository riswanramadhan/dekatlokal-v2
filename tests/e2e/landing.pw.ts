import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("desktop navigation, carousel, and legal links work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const navbar = page.locator(".dl-navbar");
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(navbar).toHaveClass(/is-scrolled/);
    await expect(navbar).toHaveCSS("border-radius", "999px", { timeout: 10_000 });

    const story = page.locator(".dl-story-live-region");
    const firstStory = await story.textContent();
    await expect(story).not.toHaveText(firstStory ?? "", { timeout: 7_000 });
    const autoplayStory = await story.textContent();
    await page.locator(".dl-story-arrows button").last().click();
    await expect(story).not.toHaveText(autoplayStory ?? "");

    await expect(page.getByRole("link", { name: "Kebijakan Privasi" })).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Syarat & Ketentuan" })).toHaveAttribute("target", "_blank");
  });

  test("mobile layout has no horizontal overflow and menu is usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator(".dl-navbar")).toBeVisible();
    await page.getByRole("button", { name: "Buka menu utama" }).click();
    await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeVisible();
    await page.getByRole("dialog", { name: "DekatLokal" }).getByRole("button", { name: "Tutup menu utama" }).click();
    await expect(page.getByRole("dialog", { name: "DekatLokal" })).toBeHidden();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
