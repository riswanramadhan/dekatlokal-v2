import { expect, type Page, test } from "@playwright/test";

test.setTimeout(720_000);

async function completeCorrectRecall(page: Page) {
  await page.goto("/mulai?claim=demo-warung-rina", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "Hasil usahamu sudah siap!" })).toBeVisible();
  await page.getByRole("button", { name: "Lihat Fokus Usaha Saya" }).click();
  await page.waitForURL(/\/mulai$/);
  await expect(page.getByRole("heading", { name: "Masih ingat tiga fokus usahamu?" })).toBeVisible();

  await page.getByLabel("Digitalisasi UMKM").check();
  await page.getByLabel("Branding UMKM").check();
  await page.getByLabel("Konsistensi Promosi").check();
  await page.getByRole("button", { name: "Periksa Pilihan" }).click();
  await expect(
    page.getByRole("heading", { name: "Pas! Kamu mengingat ketiga fokus usahamu." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lihat Jalur Naik Kelas" }).click();
  await expect(page.getByRole("heading", { name: "Ini Jalur Naik Kelas usahamu" })).toBeVisible();
  await expect(page.getByText("Terbuka berurutan")).toHaveCount(2);
  await page.getByRole("button", { name: "Simpan Jalur Saya" }).click();
  await expect(page.getByRole("heading", { name: "Simpan perjalanan usahamu" })).toBeVisible();
}

test("value-first recall continues through signup, association, and exactly three dashboard focuses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await completeCorrectRecall(page);

  await page.getByRole("link", { name: "Daftar dengan WhatsApp" }).click();
  await page.getByLabel("Nama pemilik").fill("Bu Rina");
  await page.getByLabel("Nama usaha").fill("Warung Rina");
  await page.getByLabel("Nomor WhatsApp").fill("081234567890");
  await page.getByRole("button", { name: /Lanjut ke verifikasi/ }).click();
  await page.getByLabel("Kode verifikasi").fill("123456");
  await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();

  await page.waitForURL("**/app/beranda", { timeout: 180_000 });
  await expect(page.getByText("Fokus 1 dari 3")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Digitalisasi UMKM" }).first()).toBeVisible();
  await expect(page.getByText("Tiga fokus usahamu")).toBeVisible();
  await expect(page.getByText("Branding UMKM")).toBeVisible();

  const url = new URL(page.url());
  expect(url.searchParams.has("claim")).toBe(false);
  expect(url.searchParams.has("score")).toBe(false);
  expect(url.searchParams.has("moduleId")).toBe(false);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Fokus 1 dari 3")).toBeVisible();
});

test("partial recall persists, reveals help after two attempts, and supports existing-account login", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/mulai?claim=demo-warung-rina", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Lihat Fokus Usaha Saya" }).click();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByLabel("Digitalisasi UMKM").check();
    await page.getByLabel("Branding UMKM").check();
    await page.getByLabel("Produk dan Kemasan").check();
    await page.getByRole("button", { name: "Periksa Pilihan" }).click();
    await expect(page.getByRole("heading", { name: "Hampir tepat!" })).toBeVisible();
    if (attempt === 1) {
      await expect(
        page.getByRole("button", { name: "Tampilkan bantuan" }),
      ).toBeVisible();
    }
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("2 dari 3 pilihanmu sudah sesuai.")).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan bantuan" }).click();
  await expect(page.getByRole("heading", { name: "Ini tiga fokus utama usahamu." })).toBeVisible();
  await page.getByRole("button", { name: "Lihat Jalur Naik Kelas" }).click();
  await page.getByRole("button", { name: "Simpan Jalur Saya" }).click();
  await page.getByRole("link", { name: "Saya sudah punya akun" }).click();

  await page.getByLabel("Nomor WhatsApp").fill("081234567890");
  await page.getByRole("button", { name: "Kirim kode verifikasi" }).click();
  await page.getByLabel("Kode verifikasi").fill("123456");
  await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();
  await page.waitForURL("**/app/beranda", { timeout: 180_000 });
  await expect(page.getByText("Fokus 1 dari 3")).toBeVisible();
});

test("missing, invalid, expired, and already-claimed claim states cannot create a path", async ({
  page,
}) => {
  await page.goto("/mulai", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Buat jalur yang sesuai untuk usahamu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mulai Digital Checkup" })).toHaveAttribute(
    "href",
    /dekatlokal\.com\/digital-checkup/,
  );

  for (const [token, title] of [
    ["invalid", "Tautan hasil tidak dikenali"],
    ["expired", "Tautan hasil sudah kedaluwarsa"],
    ["already-claimed", "Hasil sudah pernah dihubungkan"],
  ] as const) {
    await page.goto(`/mulai?claim=${token}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Masih ingat tiga fokus usahamu?" })).toHaveCount(0);
  }
});

test("legacy claim-bearing auth URLs return to the value-first entry", async ({ page }) => {
  await page.goto("/daftar?claim=demo-warung-rina", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/mulai\?claim=demo-warung-rina/);
  await page.goto("/hubungkan-checkup?token=demo-warung-rina", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/mulai\?claim=demo-warung-rina/);
});

test("OTP invalid, expired, and resend states are visible", async ({ page }) => {
  await page.goto("/verifikasi", { waitUntil: "domcontentloaded" });

  await page.getByLabel("Kode verifikasi").fill("000000");
  await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();
  await expect(page.getByText(/Kode verifikasi tidak cocok/)).toBeVisible();

  await page.getByLabel("Kode verifikasi").fill("999999");
  await page.getByRole("button", { name: "Verifikasi dan lanjutkan" }).click();
  await expect(page.getByText(/Kode verifikasi sudah kedaluwarsa/)).toBeVisible();

  await page.getByRole("button", { name: "Kirim ulang kode" }).click();
  await page.waitForURL("**/verifikasi?status=resend");
  await expect(page.getByText(/Permintaan kode baru telah diterima/)).toBeVisible();
});
