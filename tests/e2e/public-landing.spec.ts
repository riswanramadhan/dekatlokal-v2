import { expect, test, type Page } from "@playwright/test";

const sectionIds = ["beranda", "akses-belajar", "pengalaman", "course", "paket", "mulai"] as const;

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && !response.ok()) {
      errors.push(`image ${response.status()}: ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.resourceType() === "image") errors.push(`image failed: ${request.url()}`);
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport);
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
}

test("landing is full-bleed, production-toned, and exposes every primary journey", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const hero = page.locator("#beranda");
  const heroBox = await hero.boundingBox();
  expect(heroBox?.x).toBe(0);
  expect(heroBox?.width).toBe(1600);
  expect(heroBox?.height).toBeGreaterThanOrEqual(900);
  expect(await hero.evaluate((node) => getComputedStyle(node).backgroundImage)).not.toContain("url(");
  const transparentPixels = await page.locator(".dl-owner-cutout").evaluate(async (node) => {
    const image = node as HTMLImageElement;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    context?.drawImage(image, 0, 0, 64, 64);
    const alpha = context?.getImageData(0, 0, 64, 64).data;
    if (!alpha) return 0;
    let count = 0;
    for (let index = 3; index < alpha.length; index += 4) {
      if (alpha[index]! < 250) count += 1;
    }
    return count;
  });
  expect(transparentPixels).toBeGreaterThan(300);

  for (const id of sectionIds) {
    const section = page.locator(`section#${id}`);
    await expect(section).toHaveCount(1);
    await expect(section.getByRole("heading").first()).toBeVisible();
    expect((await section.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(890);
  }

  await expect(page.getByRole("navigation", { name: "Navigasi landing page" })).toBeVisible();
  await expect(page.getByRole("link", { name: /mulai digital checkup/i }).first()).toHaveAttribute("href", /\/digital-checkup\/?$/);
  await expect(page.getByTestId("landing-footer")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/\b(?:demo|mock)\b/i);
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("iOS navbar changes after scrolling and tracks the active section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const navbar = page.locator(".dl-navbar");
  await expect(navbar).toHaveAttribute("data-scrolled", "false");
  const initial = await navbar.boundingBox();
  expect(Math.round(initial?.height ?? 0)).toBe(64);

  await page.evaluate(() => window.scrollTo(0, 180));
  await expect(navbar).toHaveAttribute("data-scrolled", "true");
  const compact = await navbar.boundingBox();
  expect(Math.round(compact?.height ?? 0)).toBe(56);
  expect(compact?.width ?? 0).toBeGreaterThan(initial?.width ?? 0);

  await page.locator("#course").scrollIntoViewIfNeeded();
  await expect(page.locator('.dl-navbar-links a[href="#course"]')).toHaveAttribute("aria-current", "page");
});

test("ticker includes 18 UMKM logos and pauses on interaction", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('.dl-logo-item[aria-hidden="false"]')).toHaveCount(18);
  await expect(page.locator('.dl-logo-item img[alt="Banangih"]')).toHaveCount(1);
  const track = page.locator(".dl-logo-track");
  expect(await track.evaluate((node) => getComputedStyle(node).animationName)).toBe("dl-logo-marquee");
  await page.locator(".dl-logo-ticker").hover();
  expect(await track.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe("paused");
});

test("eight UMKM stories have manual controls and a compact identity gap", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const carousel = page.getByTestId("story-carousel");
  await expect(carousel.locator(".dl-story-card")).toHaveCount(8);
  const firstTransform = await carousel.locator(".dl-story-track").evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(5_300);
  await expect.poll(() => carousel.locator(".dl-story-track").evaluate((node) => getComputedStyle(node).transform)).not.toBe(firstTransform);
  await carousel.getByRole("button", { name: "Jeda putar otomatis" }).click();
  await page.waitForTimeout(700);
  const pausedTransform = await carousel.locator(".dl-story-track").evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(5_300);
  expect(await carousel.locator(".dl-story-track").evaluate((node) => getComputedStyle(node).transform)).toBe(pausedTransform);
  await carousel.getByRole("button", { name: "Cerita berikutnya" }).click();
  await expect.poll(() => carousel.locator(".dl-story-track").evaluate((node) => getComputedStyle(node).transform)).not.toBe(pausedTransform);
  const gap = await carousel.locator(".dl-story-content footer").first().evaluate((node) => Number.parseFloat(getComputedStyle(node).marginTop));
  expect(gap).toBeGreaterThanOrEqual(16);
  expect(gap).toBeLessThanOrEqual(32);
});

test("course cards use unique original covers, stable filters, bookmarks, and prerequisites", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const cards = page.locator("#course .dl-course-card");
  await expect(cards).toHaveCount(8);
  const sources = await cards.locator(".dl-course-image img").evaluateAll((images) => images.map((image) => {
    const element = image as HTMLImageElement;
    const source = element.currentSrc || element.src;
    const optimizedSource = new URL(source).searchParams.get("url");
    return optimizedSource ?? source;
  }));
  expect(new Set(sources).size).toBe(8);
  expect(sources.every((src) => src.includes("/platform-v2/courses/"))).toBe(true);
  const cardHeights = await cards.evaluateAll((nodes) => nodes.slice(0, 4).map((node) => node.getBoundingClientRect().height));
  expect(Math.max(...cardHeights) - Math.min(...cardHeights)).toBeLessThanOrEqual(2);

  await page.getByRole("button", { name: "Geser course ke kanan" }).click();
  await expect.poll(() => page.locator(".dl-course-grid").evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  const premiumFilter = page.getByRole("button", { name: "Premium", exact: true });
  await premiumFilter.click();
  await expect.poll(() => page.locator(".dl-course-grid").evaluate((node) => node.scrollLeft)).toBe(0);
  await expect(cards).toHaveCount(4);
  await expect(cards.first().getByText(/prasyarat/i)).toBeVisible();
  const bookmark = cards.first().locator(".dl-bookmark-button");
  await bookmark.click();
  await expect(bookmark).toHaveAttribute("aria-pressed", "true");
});

test("featured price is a true ticket with two side notches and a perforated seam", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const ticket = page.getByTestId("featured-ticket");
  const notches = ticket.locator(".dl-ticket-notch");
  await expect(notches).toHaveCount(2);
  await expect(ticket.locator(".dl-perforation")).toHaveCSS("border-top-style", "dotted");
  await expect(ticket).toHaveCSS("overflow", "visible");

  const [ticketBox, leftNotch, rightNotch] = await Promise.all([
    ticket.boundingBox(),
    notches.nth(0).boundingBox(),
    notches.nth(1).boundingBox(),
  ]);
  expect(ticketBox).not.toBeNull();
  expect(leftNotch).not.toBeNull();
  expect(rightNotch).not.toBeNull();
  expect(leftNotch!.x).toBeLessThan(ticketBox!.x);
  expect(leftNotch!.x + leftNotch!.width).toBeGreaterThan(ticketBox!.x);
  expect(rightNotch!.x).toBeLessThan(ticketBox!.x + ticketBox!.width);
  expect(rightNotch!.x + rightNotch!.width).toBeGreaterThan(ticketBox!.x + ticketBox!.width);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 800 }]) {
  test(`landing remains usable at ${viewport.width}px`, async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const menu = page.locator(".dl-navbar-menu-button");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAccessibleName("Buka menu utama");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await expect(menu).toHaveAccessibleName("Tutup menu utama");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Navigasi landing page mobile" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");

    if (viewport.width === 390) {
      const carousel = page.getByTestId("story-carousel");
      await carousel.scrollIntoViewIfNeeded();
      const track = carousel.locator(".dl-story-track");
      const beforeSwipe = await track.evaluate((node) => getComputedStyle(node).transform);
      await carousel.dispatchEvent("pointerdown", { clientX: 310 });
      await carousel.dispatchEvent("pointerup", { clientX: 120 });
      await expect.poll(() => track.evaluate((node) => getComputedStyle(node).transform)).not.toBe(beforeSwipe);
    }

    const bodySizes = await page.locator(".dl-hero-description, .dl-access-heading > p:last-child, .dl-access-copy small, .dl-story-heading > p, .dl-story-content > p, .dl-course-heading > p, .dl-course-body > p, .dl-price-body > p, .dl-price-body li, .dl-pricing-note, .dl-final-copy > p:not(.dl-section-kicker), .dl-footer-about > p").evaluateAll((nodes) => nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)));
    expect(bodySizes.length).toBeGreaterThan(0);
    expect(bodySizes.every((size) => size >= 16)).toBe(true);
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
}

test("landing honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.locator(".dl-logo-track").evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  await expect(page.getByRole("button", { name: "Jeda putar otomatis" })).toHaveCount(0);
});

test("skip link is the first keyboard focus target", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Lewati ke konten utama" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#konten-utama")).toBeFocused();
});
