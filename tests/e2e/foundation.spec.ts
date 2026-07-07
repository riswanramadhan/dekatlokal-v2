import { expect, test } from "@playwright/test";

const mobileWidths = [360, 390];

for (const width of mobileWidths) {
  test(`dashboard is usable at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/beranda", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: /Ruang Tumbuh/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Langkah Terbaik Hari Ini"),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(horizontalOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });
}

test("keyboard focus and reduced motion remain supported", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");

  const activeElementName = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? "",
  );
  expect(activeElementName).toContain("Ke Ruang Tumbuh DekatLokal");
});

for (const width of mobileWidths) {
  test(`pre-auth recall has no overflow or console errors at ${width}px`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/mulai?claim=demo-warung-rina", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Lihat Fokus Usaha Saya" }).click();
    await expect(page.getByRole("heading", { name: "Masih ingat tiga fokus usahamu?" })).toBeVisible();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(horizontalOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });
}

test("pre-auth supports large text and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.request.post("/api/dev/scenario", {
    data: { scenario: "large-text" },
  });
  expect(response.ok()).toBe(true);
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/mulai?claim=demo-warung-rina", { waitUntil: "domcontentloaded" });

  const bodyFontSize = await page
    .getByText(/Digital Checkup menemukan tiga fokus utama/)
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(bodyFontSize).toBeGreaterThanOrEqual(18);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
