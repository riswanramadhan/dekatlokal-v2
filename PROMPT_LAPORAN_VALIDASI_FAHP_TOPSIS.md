# Prompt untuk Menyusun Laporan Validasi Digital Checkup

Salin prompt di bawah ke AI bersama file `digital-checkup-colab.json` hasil ekspor admin dan hasil output notebook Colab. Jangan mengirim `.env`, service-role key, token sesi, email, atau nomor WhatsApp.

---

Anda bertindak sebagai asisten penulisan laporan penelitian. Susun bagian laporan tentang implementasi dan validasi sistem rekomendasi Digital Checkup berbasis Fuzzy AHP dan TOPSIS dalam Bahasa Indonesia akademik yang jelas. Gunakan **hanya** data di file `digital-checkup-colab.json` dan output notebook yang saya lampirkan. Jangan membuat jumlah responden, identitas, jawaban, nilai, hasil uji, kutipan, atau kesimpulan yang tidak tersedia.

Konteks panel ahli yang boleh disebut:

1. Ayu Anisela — CFO Rumah BUMN Makassar.
2. Asluddin — Koordinator Rumah BUMN Makassar.
3. Rizky Amelia — CMO Rumah BUMN Makassar.

Ketiga nama tersebut adalah identitas panel yang ditetapkan aplikasi. Nyatakan bahwa penilaian mereka dipakai model hanya jika data ekspor/status admin membuktikan model input telah terbentuk. Jangan menulis bahwa metode “akurat”, “efektif”, atau “berhasil meningkatkan usaha” hanya karena hasil komputasi cocok. Kecocokan web–notebook membuktikan reproduksibilitas implementasi, bukan validitas dampak lapangan.

Susun laporan dengan struktur berikut:

1. Tujuan implementasi sistem rekomendasi.
2. Deskripsi instrumen: 32 pertanyaan, 8 dimensi, skala jawaban 0–4, dan 7 alternatif modul.
3. Profil panel ahli berdasarkan tiga nama dan jabatan di atas, tanpa menambah riwayat atau kualifikasi yang tidak diberikan.
4. Tahapan Fuzzy AHP:
   - 28 perbandingan pasangan per ahli;
   - matriks resiprokal skala Saaty 1–9;
   - pemeriksaan `CR ≤ 0,10` dengan `RI(8) = 1,41`;
   - triangular fuzzy number;
   - agregasi geometric mean tiga ahli;
   - fuzzy geometric mean, fuzzy weight, centroid, dan normalisasi `w`;
   - matriks relevansi `R` berukuran 7 × 8 sebagai rata-rata tiga ahli.
5. Tahapan TOPSIS personal:
   - skor kondisi `S`;
   - gap `g = 1 − S/100`;
   - `H = Σ(w × g)`;
   - bobot kebutuhan `q = (w × g)/H`;
   - normalisasi `R`, matriks berbobot, solusi ideal, jarak, nilai `C`, dan ranking.
6. Tabel UMKM berdasarkan record yang benar-benar ada. Gunakan kode anonim U001, U002, dan seterusnya. Untuk tiap UMKM tampilkan metadata nonkontak, 32 jawaban atau ringkasannya, delapan nilai `S`, `g`, `q`, tiga rekomendasi, nilai `C`, serta status run. Jangan menebak nama usaha jika tidak ada di file.
7. Validasi reproduksibilitas web–notebook. Buat tabel galat maksimum untuk `w`, `R`, `S`, `g`, `H`, `q`, `C`, dan `rank`; ambang `1e-10`; serta kesamaan urutan ranking.
8. Penanganan kondisi khusus: `NO_IDENTIFIED_GAP`, `UNCOVERED_DIMENSION`, dan `ALTERNATIVES_NOT_DISTINGUISHABLE` bila muncul di data.
9. Batasan penelitian: panel hanya tiga ahli, relevansi tergantung instrumen dan versi model, kecocokan numerik bukan bukti dampak, serta data pribadi tidak diekspor.
10. Kesimpulan yang proporsional dan tidak berlebihan.

Aturan keluaran:

- Bedakan fakta dari data, rumus metode, dan interpretasi penulis.
- Cantumkan semua angka dengan presisi yang cukup; jangan membulatkan saat menguji toleransi.
- Gunakan nama modul dari data atau pemetaan A1–A7 yang terlampir, bukan nama buatan.
- Jika field yang dibutuhkan tidak tersedia, tulis “tidak tersedia pada data ekspor”; jangan mengisinya sendiri.
- Jangan tampilkan UUID, hash, token, email, WhatsApp, atau secret di badan laporan.
- Tutup dengan daftar data tambahan yang masih diperlukan, bila ada.

---

Sebelum memakai laporan, cocokkan kembali jumlah record, versi instrumen, versi model, tiga CR ahli, dan hasil validasi `1e-10` dengan output Colab.
