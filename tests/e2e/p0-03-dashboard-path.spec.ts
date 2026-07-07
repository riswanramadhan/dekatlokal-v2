import { expect, type Page, test } from "@playwright/test";

async function setScenario(page: Page, scenario: string) {
  const response = await page.request.post("/api/dev/scenario", { data: { scenario } });
  expect(response.ok()).toBe(true);
}

test("dashboard presents one personalized next action and P0.3 dashboard sections", async ({
  page,
}) => {
  await setScenario(page, "culinary-new-user");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/beranda", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      name: "Ruang Tumbuh Warung Rina",
    }),
  ).toBeVisible();
  await expect(page.getByText("Langkah Terbaik Hari Ini")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Digitalisasi UMKM" }).first(),
  ).toBeVisible();
  await expect(page.getByText("Tiga fokus usahamu")).toBeVisible();
  await expect(page.getByText("Insight checkup")).toBeVisible();
  await expect(page.getByText("Reward landing page")).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka bantuan Tekap" })).toBeVisible();
});

test("scenario dashboards produce different recommendations", async ({ page }) => {
  await setScenario(page, "fast-fashion");
  await page.goto("/app/beranda", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Branding UMKM" }).first(),
  ).toBeVisible();

  await setScenario(page, "returning-service");
  await page.goto("/app/beranda", { waitUntil: "domcontentloaded" });
  await expect(
    page
      .getByRole("heading", { name: "Operasional dan Keuangan Dasar" })
      .first(),
  ).toBeVisible();
});

test("checkup, path, module preview, and locked start route are guarded", async ({
  page,
}) => {
  await setScenario(page, "culinary-new-user");

  await page.goto("/app/hasil-checkup", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /Ringkasan kondisi Warung Rina/ }),
  ).toBeVisible();
  await expect(page.getByText("Kehadiran Digital", { exact: true })).toBeVisible();

  await page.goto("/app/jalur", { waitUntil: "domcontentloaded" });
  const detailLink = page.getByRole("link", { name: "Lihat detail jalur" });
  const detailHref = await detailLink.getAttribute("href");
  expect(detailHref).toBe("/app/jalur/plan-rina-basic");
  await page.goto(detailHref!, {
    timeout: 300_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/app\/jalur\/plan-rina-basic/);
  await expect(page.getByRole("heading", { name: "Jalur Naik Kelas Warung Rina" })).toBeVisible();
  await expect(page.getByText("Terkunci")).toHaveCount(2);
  await expect(page.getByText(/Selesaikan Digitalisasi UMKM/)).toBeVisible();

  const lockedPreview = page.locator('a[href="/app/modul/branding-umkm"]').first();
  const lockedPreviewHref = await lockedPreview.getAttribute("href");
  expect(lockedPreviewHref).toBe("/app/modul/branding-umkm");
  await page.goto(lockedPreviewHref!, {
    timeout: 300_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/app\/modul\/branding-umkm/);
  await expect(
    page.getByRole("heading", { name: "Branding UMKM" }),
  ).toBeVisible();
  await expect(page.getByText("Outcome")).toBeVisible();
  await expect(page.getByText("Terkunci")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Lihat prasyarat di Jalur" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Mulai|Lanjutkan/ })).toHaveCount(
    0,
  );
});
