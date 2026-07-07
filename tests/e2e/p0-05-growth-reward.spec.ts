import { expect, test, type Page } from "@playwright/test";

async function setScenario(page: Page, scenario: string) {
  const response = await page.request.post("/api/dev/scenario", {
    data: { scenario },
  });
  expect(response.ok()).toBe(true);
}

test("final test is locked before 3/3 modules are complete", async ({ page }) => {
  await setScenario(page, "culinary-new-user");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/ujian-akhir", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Ujian akhir masih terkunci" }),
  ).toBeVisible();
  await expect(page.getByText("lesson, penguasaan post-test")).toBeVisible();
});

test("three-focus completion flow reaches certificate, reward claim, and premium preview", async ({
  page,
}) => {
  await setScenario(page, "reward-eligible");
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/app/progres", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "3 dari 3 fokus selesai" })).toBeVisible();
  await expect(page.getByText("Kesiapan ujian akhir")).toBeVisible();

  await page.goto("/app/ujian-akhir", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Ujian akhir lulus" })).toBeVisible();
  await page.getByRole("link", { name: "Lanjut ke Checkup ulang" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Perubahan BersihPro Makassar sudah terlihat",
    }),
  ).toBeVisible();
  await expect(page.getByText("Sebelum")).toBeVisible();
  await expect(page.getByText("Sesudah")).toBeVisible();
  const certificateHref = await page
    .getByRole("link", { name: "Lihat sertifikat penyelesaian" })
    .getAttribute("href");
  expect(certificateHref).toBe("/app/sertifikat/cert-bersihpro-makassar-basic");
  await page.goto(certificateHref!, { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Bukti penyelesaian Jalur Naik Kelas" }),
  ).toBeVisible();
  await expect(page.getByText("DL-BERSIHPRO-MAKASSAR-P051")).toBeVisible();

  await page.goto("/app/reward/landing-page", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Syarat utama sudah terpenuhi" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ajukan klaim landing page" }).click();
  await expect(page.getByText("Klaim reward sudah masuk")).toBeVisible();
  await expect(page.getByText("Data lengkap")).toBeVisible();

  await page.goto("/app/premium", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Langkah lanjutan yang relevan" }),
  ).toBeVisible();
  await expect(page.getByText("Preview tanpa pembayaran")).toHaveCount(3);
});
