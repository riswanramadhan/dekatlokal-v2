# Demo Semhas Digital Checkup: Fuzzy AHP + TOPSIS

Dokumen ini adalah urutan demo yang aman, singkat, dan dapat direproduksi. Gunakan data UMKM yang benar-benar sudah mengirim Digital Checkup; jangan membuat hasil observasi atau penilaian ahli palsu.

## Persiapan sebelum demo

1. Pastikan migration Supabase terbaru sudah diterapkan di proyek produksi.
2. Pastikan ketiga ahli pada `/admin` berstatus **Final · Dipakai model**:
   - Ayu Anisela — CFO Rumah BUMN Makassar
   - Asluddin — Koordinator Rumah BUMN Makassar
   - Rizky Amelia — CMO Rumah BUMN Makassar
3. Pastikan sedikitnya satu UMKM berstatus **Hasil siap didemokan** pada tab **Data UMKM**.
4. Buka [notebook validasi](notebooks/validasi_fahp_topsis_colab.ipynb) di Google Colab.
5. Gunakan browser tanpa data pribadi lain yang terlihat saat layar dibagikan.

## Alur demo 10 langkah

1. Masuk ke `/admin`, buka tab **Data UMKM**, lalu pilih **U001**. Nama usaha ditampilkan jelas, sedangkan `U001` menjadi kode singkat selama presentasi.
2. Buka **Lihat 32 jawaban U001**. Jelaskan bahwa setiap dimensi terdiri dari empat pertanyaan bernilai 0–4.
3. Tunjukkan delapan skor kondisi `S`. Rumus setiap dimensi adalah `jumlah empat jawaban / 16 × 100`.
4. Tunjukkan tabel gap dan kebutuhan personal:
   - `g_j = 1 - S_j / 100`
   - `H = Σ(w_j × g_j)`
   - `q_j = (w_j × g_j) / H`
5. Tunjukkan tiga rekomendasi teratas. Nilai `C` yang lebih besar mendapat peringkat lebih tinggi; nilai setara memakai minimum rank.
6. Buka **Lihat cara hitung**. Tunjukkan `w`, `R`, `S`, `g`, `H`, `q`, `C`, dan `rank` dari run produksi yang sama.
7. Klik **Ekspor input U001 untuk Colab**. File `digital-checkup-colab.json` berisi input canonical dan trace hasil, tanpa email, WhatsApp, token, atau catatan bebas.
8. Unggah `notebooks/validasi_fahp_topsis_colab.ipynb` ke Colab, jalankan semua sel, lalu unggah JSON U001 ketika diminta.
9. Notebook menghitung ulang Fuzzy AHP dan TOPSIS secara independen, menampilkan CR masing-masing ahli, serta membandingkan `w`, `R`, `S`, `g`, `H`, `q`, `C`, dan `rank`.
10. Tunjukkan pesan **VALIDASI LULUS**. Batas penerimaan adalah galat relatif maksimum `1e-10`; urutan kode modul juga harus sama persis.

## Apa yang benar-benar dihitung

### Fuzzy AHP

- Model wajib memakai tepat tiga ahli final.
- Setiap ahli mengisi 28 perbandingan pasangan untuk delapan dimensi.
- Matriks bersifat resiprokal dan memakai skala Saaty 1–9.
- Konsistensi setiap ahli dihitung dengan `CR = CI / 1,41`; hanya `CR ≤ 0,10` yang diterima.
- Nilai crisp diubah menjadi triangular fuzzy number. Untuk skala `k`, digunakan `(max(1,k−1), k, min(9,k+1))`; nilai kebalikan memakai invers urutan komponennya.
- Penilaian tiga ahli digabung dengan geometric mean.
- Fuzzy geometric mean per baris, fuzzy weight, centroid, dan normalisasi menghasilkan bobot umum `w` yang positif dan berjumlah satu.
- Matriks relevansi modul–dimensi `R` adalah rata-rata nilai 0–4 dari tiga ahli, berukuran `7 × 8`.

### TOPSIS personal

- Delapan skor kondisi `S` diubah menjadi gap `g`.
- Bobot umum `w` disesuaikan dengan gap UMKM menjadi `q`; jumlah `q` harus satu.
- Matriks `R` dinormalisasi secara vektor menjadi `N`, lalu dibobotkan dengan `q` menjadi `V`.
- Solusi ideal positif dan negatif dihitung per dimensi.
- Jarak `D+`, `D−`, dan koefisien kedekatan `C = D− / (D+ + D−)` menghasilkan ranking modul.
- Kasus tanpa gap, dimensi yang tidak terwakili, atau semua alternatif identik tidak diberi pemenang palsu; status khusus ditampilkan.

## Kalimat penjelasan singkat

“Fuzzy AHP menangkap kesepakatan tiga ahli untuk mendapatkan bobot umum delapan dimensi. Setelah UMKM menjawab 32 pertanyaan, TOPSIS menyesuaikan bobot tadi dengan gap usaha tersebut. Karena itu rekomendasi modul bukan daftar yang sama untuk semua UMKM. File canonical yang sama dihitung ulang di notebook dan dibandingkan dengan hasil web sampai toleransi 1e-10.”

## Jika validasi belum lulus

- Pastikan JSON diekspor dari tombol pada kartu U001 yang sama, bukan dari run lama.
- Pastikan status run adalah `RANKED`.
- Jangan mengedit angka dalam JSON.
- Pastikan file memiliki `schemaVersion: DL-COLAB-1.0`, `canonicalInput`, dan `run.trace`.
- Jika model baru dibuat, ekspor ulang JSON agar versi model dan run cocok.

