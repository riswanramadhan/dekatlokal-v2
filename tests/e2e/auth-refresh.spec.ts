import { expect, test, type Page } from "@playwright/test";

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

for (const viewport of [
  { width: 1600, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
]) {
  test(`auth layout is responsive and production-toned at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/masuk", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Masuk ke Ruang Tumbuh" })).toBeVisible();
    await expect(page.getByText("Lanjutkan hasil Checkup menjadi langkah nyata.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim kode verifikasi" })).toBeVisible();
    await expect(page.getByText("Koneksi internet terputus")).toBeHidden();
    await expect(page.locator("body")).not.toContainText(/\b(?:demo|mock)\b/i);
    const phoneHeight = await page.getByLabel("Nomor WhatsApp").evaluate((node) => node.getBoundingClientRect().height);
    expect(phoneHeight).toBeGreaterThanOrEqual(52);
    await expectNoOverflow(page);
  });
}

test("WhatsApp validation, pending destination, and verification states remain functional", async ({ page }) => {
  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Nomor WhatsApp").fill("12");
  await page.getByRole("button", { name: "Kirim kode verifikasi" }).click();
  await expect(page).toHaveURL(/status=invalid/);
  await expect(page.getByRole("alert")).toContainText("Nomor WhatsApp belum valid");

  await page.getByLabel("Nomor WhatsApp").fill("081234567890");
  await page.getByRole("button", { name: "Kirim kode verifikasi" }).click();
  await expect(page).toHaveURL(/\/verifikasi\?status=sent/);
  await page.getByLabel("Kode verifikasi").fill("000000");
  await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();
  await expect(page.getByRole("alert")).toContainText("tidak cocok");
});

test("Google and email alternatives retain their explicit states", async ({ page }) => {
  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Lanjut dengan Google" }).click();
  await expect(page).toHaveURL(/\/verifikasi\?status=google/);
  await expect(page.getByRole("status")).toContainText("Akun Google dipilih");

  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await page.getByText("Masuk dengan email").click();
  await page.getByLabel("Email").fill("tidak-valid");
  await page.getByRole("button", { name: "Lanjut dengan email" }).click();
  await expect(page).toHaveURL(/status=email-invalid/);
  await expect(page.getByRole("alert")).toContainText("Alamat email belum valid");
});

test("offline notice and legacy claim redirect are explicit", async ({ page, context }) => {
  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByRole("status")).toContainText("Koneksi internet terputus");
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));

  await page.goto("/masuk?claim=clm_7N4k9Q2vY8pR5tX1", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/mulai\?claim=clm_7N4k9Q2vY8pR5tX1/);
});

test("auth keyboard order starts with its skip link and reduced motion disables animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/masuk", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Lewati ke formulir" })).toBeFocused();
  const activeAnimations = await page.locator(".auth-shell").evaluate((root) => root.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length);
  expect(activeAnimations).toBe(0);
});

for (const route of ["/masuk", "/daftar", "/verifikasi"]) {
  test(`${route} exposes no customer-facing demo or mock wording`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText(/\b(?:demo|mock)\b/i);
  });
}
