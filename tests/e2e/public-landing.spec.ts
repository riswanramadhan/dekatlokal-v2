import { expect, test, type Page } from "@playwright/test";

const landingSectionIds = [
  "beranda",
  "akses-belajar",
  "pengalaman",
  "course",
  "paket",
  "mulai",
] as const;

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
}

test("public landing exposes all seven sections and its primary journeys on desktop", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi landing page" })).toBeVisible();

  for (const id of landingSectionIds) {
    const section = page.locator(`section#${id}`);
    await expect(section).toHaveCount(1);
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading").first()).toBeVisible();
  }

  const footer = page.getByTestId("landing-footer");
  await expect(footer).toHaveCount(1);
  await expect(footer).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const packageSection = page.locator("#paket");
  await expect(packageSection.getByText(/gratis/i).first()).toBeVisible();
  await expect(packageSection.getByText(/premium|berbayar/i).first()).toBeVisible();

  const primaryCta = page.getByRole("link", { name: /mulai digital checkup/i }).first();
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute("href", /\/digital-checkup\/?$/);
  await expect(page.getByRole("link", { name: /masuk/i }).first()).toHaveAttribute("href", "/masuk");

  await expectNoHorizontalOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

for (const width of [360, 390]) {
  test(`public landing is usable without overflow at ${width}px`, async ({ page }) => {
    const runtimeErrors = collectRuntimeErrors(page);

    await page.setViewportSize({ width, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigasi landing page" })).toBeHidden();

    const primaryCta = page.getByRole("link", { name: /mulai digital checkup/i }).first();
    await expect(primaryCta).toBeVisible();

    const ctaBox = await primaryCta.boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(ctaBox?.height).toBeGreaterThanOrEqual(44);

    const menuToggle = page.locator("summary").filter({ hasText: "Buka menu utama" });
    const mobileNavigation = page.getByRole("navigation", {
      name: "Navigasi landing page mobile",
    });

    await expect(menuToggle).toBeVisible();
    await expect(mobileNavigation).toBeHidden();
    await menuToggle.click();
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: "Beranda" })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /mulai digital checkup/i })).toBeVisible();

    await expectNoHorizontalOverflow(page);

    const bodyFontSize = await page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.body).fontSize),
    );
    expect(bodyFontSize).toBeGreaterThanOrEqual(16);

    const mobileBodySizes = await page
      .locator(
        [
          ".dl-access-column > p:last-child",
          ".dl-course-heading > p",
          ".dl-course-body > p",
          ".dl-demo-note",
          ".dl-final-copy > p",
          ".dl-footer-about > p",
          ".dl-price-body > p",
          ".dl-price-body li",
          ".dl-pricing-heading > p",
          ".dl-pricing-note",
        ].join(", "),
      )
      .evaluateAll((elements) =>
        elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
      );
    expect(mobileBodySizes.length).toBeGreaterThan(0);
    expect(mobileBodySizes.every((size) => size >= 16)).toBe(true);
    expect(runtimeErrors).toEqual([]);
  });
}

test("public landing starts with a visible keyboard focus target", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Lewati ke konten utama" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  expect(await skipLink.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Ke beranda DekatLokal" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#konten-utama")).toBeFocused();
  expect(runtimeErrors).toEqual([]);
});

test("course filters expose locked prerequisites and functional bookmarks", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  const premiumFilter = page.getByRole("button", { name: "Premium", exact: true });
  await premiumFilter.click();
  await expect(premiumFilter).toHaveAttribute("aria-pressed", "true");
  const premiumCards = page.locator("#course .dl-course-card");
  await expect(premiumCards).toHaveCount(4);

  for (const card of await premiumCards.all()) {
    await expect(card.getByText(/prasyarat:/i)).toBeVisible();
    await expect(card.getByRole("link", { name: /lihat preview/i })).toHaveAttribute(
      "href",
      /\/app\/modul\//,
    );
  }

  const bookmark = premiumCards.first().locator(".dl-bookmark-button");
  await expect(bookmark).toHaveAccessibleName(/^simpan /i);
  await expect(bookmark).toHaveAttribute("aria-pressed", "false");
  await bookmark.click();
  await expect(bookmark).toHaveAttribute("aria-pressed", "true");
  await expect(bookmark).toHaveAccessibleName(/^hapus /i);
  expect(runtimeErrors).toEqual([]);
});

test("public landing respects reduced-motion preferences", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  expect(
    await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  ).toBe(true);

  await page.getByRole("link", { name: /mulai digital checkup/i }).first().hover();
  await page.waitForTimeout(100);

  const motionState = await page.evaluate(() => ({
    runningAnimations: document
      .querySelector(".dl-landing")
      ?.getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running").length,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));

  expect(motionState.runningAnimations).toBe(0);
  expect(motionState.scrollBehavior).not.toBe("smooth");
  expect(runtimeErrors).toEqual([]);
});
