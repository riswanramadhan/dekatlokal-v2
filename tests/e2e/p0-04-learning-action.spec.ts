import { expect, test } from "@playwright/test";

test.setTimeout(720_000);
const slowExpect = expect.configure({ timeout: 120_000 });

async function setScenario(page: import("@playwright/test").Page, scenario: string) {
  const response = await page.request.post("/api/dev/scenario", { data: { scenario } });
  expect(response.ok()).toBe(true);
}

test("lesson resumes after refresh at 390px with focused navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setScenario(page, "culinary-new-user");
  await page.goto("/app/belajar/digitalisasi-umkm-lesson-1", { waitUntil: "domcontentloaded" });

  await slowExpect(page.getByRole("heading", { name: "Cek Kesiapan Digital Usahamu" })).toBeVisible();
  await page.getByRole("button", { name: "Lanjut" }).click();
  await slowExpect(page.getByRole("heading", { name: "Buat versi yang bisa dipakai hari ini" })).toBeVisible();
  await page.reload();
  await slowExpect(page.getByRole("heading", { name: "Buat versi yang bisa dipakai hari ini" })).toBeVisible();
  await slowExpect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeHidden();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("failed assessment assigns correction and targeted retry passes", async ({ page }) => {
  await setScenario(page, "quiz-failure");
  await page.goto("/app/kuis/assessment-digitalisasi-umkm", { waitUntil: "domcontentloaded" });
  await slowExpect(page.getByRole("heading", { name: "Sedikit lagi, perkuat topik pilihan" })).toBeVisible();

  await page.getByRole("link", { name: /Penguatan: Pemilihan channel/ }).click();
  await page.getByRole("button", { name: "Selesaikan lesson" }).click();
  await slowExpect(page.getByRole("heading", { name: "Konsistensi nama usaha" })).toBeVisible();
  await page.getByRole("button", { name: "Selesaikan lesson" }).click();

  await slowExpect(page.getByText("Coba ulang topik pilihan")).toBeVisible();
  for (let index = 0; index < 2; index += 1) {
    await page.locator('input[type="radio"]').first().check();
    await page.getByRole("button", { name: "Periksa jawaban" }).click();
    await page.getByRole("button", {
      name: index === 1 ? "Lihat hasil" : "Pertanyaan berikutnya",
    }).click();
  }
  await slowExpect(page.getByRole("heading", { name: "Pemahaman sudah kuat" })).toBeVisible();
  await slowExpect(page.getByText(/Tidak ada pengurangan Poin Tumbuh/i)).toBeVisible();
});

test("task draft survives refresh, upload retries, and creates an asset", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await setScenario(page, "upload-failure");
  await page.goto("/app/tugas/task-operasional-dan-keuangan-dasar", { waitUntil: "domcontentloaded" });

  const text = "Foto sebelum dan sesudah menunjukkan lantai pelanggan sudah bersih.";
  await page.getByLabel("Teks hasil usaha").fill(text);
  await page.locator('input[type="file"]').setInputFiles({
    name: "bukti-layanan.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("mock-image"),
  });
  await slowExpect(page.getByText("Draft tersimpan")).toBeVisible();
  await page.reload();
  await slowExpect(page.getByLabel("Teks hasil usaha")).toHaveValue(text);
  await slowExpect(page.getByText("bukti-layanan.jpg")).toBeVisible();

  await page.getByRole("button", { name: "Kirim tugas usaha" }).click();
  await slowExpect(page.getByText(/Foto belum berhasil diunggah/)).toBeVisible();
  await slowExpect(page.getByRole("button", { name: "Coba kirim lagi" })).toBeEnabled();
  await page.getByRole("button", { name: "Coba kirim lagi" }).click();
  await slowExpect(page.getByText(/disetujui otomatis/)).toBeVisible();

  await page.goto("/app/hasil-modul/module-operasional-dan-keuangan-dasar");
  await slowExpect(page.getByText("Modul selesai")).toBeVisible();
  await page.getByRole("link", { name: "Lihat Aset Usaha" }).click();
  await slowExpect(page.getByRole("heading", { name: "SOP Order dan Cashbook" })).toBeVisible();
});
