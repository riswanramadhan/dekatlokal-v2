

Anda bekerja langsung pada source code **Digital Checkup DekatLokal**, aplikasi Next.js dengan MEMBANGUNKANNYA Supabase. Tugas Anda adalah mengimplementasikan produk penelitian skripsi berikut secara lengkap, teruji, aman, dan dapat direproduksi:

> Sistem Pendukung Keputusan Penentuan Intervensi dan Rekomendasi Modul Pendampingan UMKM Menggunakan Pendekatan Integrasi Fuzzy AHP dan TOPSIS pada Platform DekatLokal.

Metode final wajib menggunakan **Fuzzy AHP dengan geometric mean** untuk bobot umum dari tiga ahli dan **TOPSIS dengan bobot kebutuhan personal** untuk rekomendasi setiap UMKM. Jangan mengganti metode, rumus, delapan dimensi, tujuh alternatif, kode, atau skala tanpa mencatatnya sebagai isu dan meminta keputusan pemilik repository.

### Prinsip kerja

1. Baca seluruh repository lebih dahulu: `package.json`, lockfile, versi Next.js, struktur App Router atau Pages Router, TypeScript config, komponen UI, autentikasi, Supabase client, migration, test framework, lint, dan pola penamaan. Jangan mengasumsikan versi Next.js atau library UI.
2. Pertahankan package manager, arsitektur, komponen, pola akses data, dan gaya visual yang sudah dipakai. Gunakan TypeScript strict. Tambahkan dependency hanya jika dibutuhkan dan jelaskan alasannya.
3. Cari `AGENTS.md`, README, migration, dan petunjuk proyek. Jalankan baseline test/build sebelum mengubah kode. Setelah implementasi, jalankan lint, typecheck, unit test, integration test, dan build yang tersedia.
4. Buat perubahan yang benar-benar bekerja. Jangan berhenti pada mockup, TODO, pseudo-code, atau data hard-coded.
5. Semua jawaban ahli dan UMKM pada production harus berasal dari pengguna. 
6. Gunakan migration Supabase yang dapat ditinjau dan diulang. Terapkan Row Level Security pada semua tabel yang terekspos. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server dan tidak boleh masuk bundle browser, log, atau response.
7. Perhitungan keputusan wajib berjalan di server atau database transaction yang terpercaya. Client hanya mengirim input, menampilkan validasi, dan membaca output yang diizinkan. Jangan menerima bobot atau hasil hitung yang dikirim client sebagai sumber kebenaran.
8. Simpan jawaban mentah, versi instrumen, versi model, jejak matriks, dan hasil. Jangan menimpa run lama ketika bobot, instrumen, atau jawaban berubah; buat run baru dengan hubungan ke snapshot input.
9. Bahasa antarmuka ramah, ringan, dan awam. Hindari istilah akademik pada alur UMKM. Istilah teknis hanya muncul pada panel “Lihat cara hitung” dan dashboard peneliti.
10. Jika repository berbeda dari asumsi prompt ini, sesuaikan lokasi file dan integrasinya tanpa mengubah perilaku yang diwajibkan. Tulis keputusan adaptasi pada dokumentasi implementasi.

## Peran pengguna dan alur

Implementasikan atau cocokkan dengan role yang sudah ada:

- `admin` atau `researcher`: mengelola versi instrumen, membuat undangan ahli, memantau kelengkapan, membekukan data, menjalankan model, melihat jejak hitung, mengunduh data, dan membuka tahap validasi kasus.
- `expert`: mengisi profil profesional, persetujuan, telaah 32 butir, 28 perbandingan dimensi, 56 relevansi modul, dan pada tahap kedua mengurutkan tujuh modul untuk kasus UMKM tanpa melihat rekomendasi sistem.
- `umkm`: mengisi persetujuan, profil usaha, 32 pertanyaan, meninjau jawaban, mengirim, lalu melihat profil dan rekomendasi jika model sudah siap.

Gunakan Supabase Auth yang sudah ada. Untuk expert, utamakan undangan atau magic link dan kaitkan user hanya ke assignment miliknya. Jika alur UMKM saat ini tanpa login, buat session server-side dengan token acak berumur terbatas dan simpan **hash token**, jangan izinkan insert/update tabel penelitian langsung dari anon key. Jika UMKM sudah login, gunakan `auth.uid()` dan RLS.

### Tahap ahli pertama

Urutannya:

1. Persetujuan serta profil: nama, instansi, jabatan, lama pengalaman mendampingi UMKM dalam tahun, bidang keahlian, tanggal aktual.
2. Baca definisi delapan dimensi dan tujuh modul.
3. Telaah setiap pertanyaan beserta lima pilihannya. Nilai `relevansi` dan `kejelasan` masing-masing 1–4. Nilai 1 atau 2 wajib memiliki usulan perbaikan.
4. Keputusan `layak_uji_coba` atau `perlu_revisi` beserta catatan umum.
5. Isi 28 pasangan dimensi. UI menanyakan “yang lebih penting” dan intensitas 1–9; jangan meminta ahli mengisi pecahan resiprokal.
6. Isi matriks relevansi tujuh modul × delapan dimensi pada skala 0–4.
7. Ahli dapat menyimpan draft. Final submit hanya tersedia jika data lengkap, persetujuan `Ya`, keputusan instrumen sesuai alur penelitian, dan CR individual ≤ 0,10. Jika CR tinggi, tampilkan pasangan yang perlu ditinjau sebagai bantuan, tetapi jangan mengubah nilainya otomatis.

### Tahap ahli kedua yang dibutakan

Setelah data UMKM terkumpul, researcher membuka assignment validasi kasus. Expert melihat:

- kode UMKM;
- metadata non-identitas yang diizinkan;
- 32 jawaban dan delapan skor kondisi;
- definisi tujuh modul.

Expert **tidak boleh melihat** `w`, `R`, `q`, `C`, ranking TOPSIS, atau rekomendasi sistem sebelum penilaian kasus difinalkan. Untuk setiap kasus, expert memilih:

- `Dinilai`: memberi peringkat unik 1–7 untuk semua modul dan alasan pilihan pertama;
- `Tidak dapat menilai`: wajib menulis alasan, tanpa dipaksa membuat peringkat.

Setelah final submit, jawaban menjadi read-only bagi expert. Hanya researcher yang melihat perbandingan sistem dengan ahli.

### Alur UMKM pada digital checkup mulai

1. Halaman pembuka menjelaskan tujuan, data yang dipakai, dan bahwa hasil merupakan dukungan keputusan pendampingan, bukan penentu kredit/bantuan atau jaminan keberhasilan.
2. Persetujuan harus `Ya` agar lanjut.
3. Ambil metadata minimum: kode dibuat sistem, tanggal, sektor, kecamatan, lama usaha dalam bulan, jumlah orang termasuk pemilik, peran pengisi `Pemilik/Pengelola`, kanal penjualan, tujuan 30 hari, dan catatan opsional. Jangan wajibkan NIK, rekening, omzet, atau dokumen sensitif untuk menjalankan model.
4. Tampilkan delapan langkah, masing-masing empat pertanyaan. Ada progress `1 dari 8`, autosave draft, tombol kembali/lanjut, dan ringkasan sebelum kirim.
5. Setiap pertanyaan wajib satu pilihan 0–4. Nilai 0 adalah jawaban sah. `null` berarti belum dijawab dan tidak boleh diubah menjadi 0.
6. Setelah submit, kunci snapshot jawaban. Perubahan dilakukan melalui revision baru dan menghasilkan model run baru.
7. Jika model belum siap karena tiga ahli belum lengkap atau instrumen belum dibekukan, simpan asesmen dan tampilkan status “Jawabanmu sudah tersimpan. Rekomendasi sedang disiapkan.”
8. Jika model siap, hitung di server dan tampilkan hasil.

## Instrumen versi DC-INSTRUMEN-1.1

Simpan konten sebagai seed/versioned data, bukan string yang tersebar di component. Gunakan kode dan urutan persis. Copy antarmuka boleh memakai “kamu” atau “usaha kamu”; jangan mengubah arti pilihan.

Cara memilih: pilih kondisi tertinggi yang **semua bagiannya sudah dilakukan**. Bila pengguna ragu, berikan bantuan singkat atau pilihan “Tanya pendamping” yang tidak dihitung sebagai skor dan membuat jawaban tetap belum lengkap.

### C1 Kenal usaha sendiri

Definisi internal: kejelasan pelanggan, informasi usaha, nilai penawaran, dan sasaran yang sudah digunakan.

**Q01 — Kamu sudah tahu siapa yang paling cocok jadi pembeli?**

- 0: Belum kepikiran siapa pembeli utamanya.
- 1: Baru punya gambaran umum, misalnya “semua orang”.
- 2: Sudah memilih kelompok pembeli dan menulis kebutuhan mereka.
- 3: Sudah ngobrol dengan beberapa pembeli untuk memastikan kebutuhannya.
- 4: Hasil obrolan itu sudah dipakai untuk menentukan produk atau penawaran.

**Q02 — Info dasar usahamu sudah tercatat selengkap apa?**

- 0: Belum dicatat.
- 1: Baru nama usaha dan kontak.
- 2: Nama, kontak, jenis usaha, dan lokasi sudah tercatat.
- 3: Sudah ditambah orang yang bertanggung jawab dan tempat jualan.
- 4: Semua info rutin diperbarui dan mudah ditemukan saat dibutuhkan.

**Q03 — Kamu bisa menjelaskan alasan orang perlu pilih produkmu?**

- 0: Belum bisa menjelaskannya.
- 1: Baru bisa menyebut jenis produknya.
- 2: Manfaat dan bedanya dari pilihan lain sudah ditulis.
- 3: Sudah mengecek pembeda itu lewat tanggapan pelanggan.
- 4: Pembeda itu dipakai konsisten saat menawarkan produk dan rutin ditinjau.

**Q04 — Target usahamu untuk 30 hari ke depan sudah sejelas apa?**

- 0: Belum punya target.
- 1: Targetnya masih umum, misalnya “ingin lebih maju”.
- 2: Sudah ada satu target 30 hari yang ditulis.
- 3: Target punya angka atau tanda selesai dan ada penanggung jawab.
- 4: Perkembangannya rutin dicek dan rencananya diperbarui.

### C2 Legalitas dan administrasi

Definisi internal: kesiapan memetakan, menindaklanjuti, mengarsipkan, dan memantau administrasi yang relevan. Ini bukan pemeriksaan hukum.

**Q05 — Kamu sudah tahu dokumen usaha apa saja yang memang dibutuhkan?**

- 0: Belum tahu.
- 1: Baru tahu sebagian dari cerita orang.
- 2: Sudah membuat daftar sesuai kegiatan usaha.
- 3: Daftarnya sudah dikonfirmasi ke pendamping atau kanal resmi.
- 4: Daftar sudah dikonfirmasi dan setiap dokumen punya rencana tindak lanjut.

**Q06 — Dokumen yang dibutuhkan tadi sudah sampai tahap mana?**

- 0: Belum mulai diurus.
- 1: Baru mulai mengumpulkan berkas dasar.
- 2: Pengajuan yang memang dibutuhkan sudah mulai diproses.
- 3: Dokumen utama yang dibutuhkan sudah tersedia dan datanya sesuai.
- 4: Semua kebutuhan yang ditemukan sudah ditindaklanjuti dan statusnya dipantau.

**Q07 — Dokumen usahamu gampang ditemukan saat dibutuhkan?**

- 0: Belum punya tempat penyimpanan.
- 1: Dokumennya masih tersebar.
- 2: Semua dokumen sudah dikumpulkan di satu tempat.
- 3: Sudah ada salinan cadangan dan orang yang menjaganya.
- 4: Arsip lengkap, salinannya aman, dan jadwal cek pembaruan tercatat.

**Q08 — Jadwal kewajiban administrasi usahamu sudah terpantau?**

- 0: Belum tahu apa yang perlu dipantau.
- 1: Baru ingat sebagian kewajiban.
- 2: Sudah ada daftar kewajiban dan tanggal penting.
- 3: Sudah ada pengingat dan orang yang bertanggung jawab.
- 4: Tindak lanjut dan bukti penyelesaiannya diperiksa rutin.

### C3 Produk atau layanan

Definisi internal: standar, pemeriksaan kualitas, informasi penawaran, dan pemakaian masukan pelanggan.

**Q09 — Produk atau layananmu sudah punya standar yang jelas?**

- 0: Belum ada standar.
- 1: Standarnya masih diingat oleh pemilik saja.
- 2: Ukuran, bahan, langkah, atau hasil yang diharapkan sudah ditulis.
- 3: Standar itu dipakai dalam pekerjaan sehari-hari.
- 4: Standar rutin dicek dan diperbaiki dari masalah yang ditemukan.

**Q10 — Kualitas produk atau layananmu dicek dengan cara apa?**

- 0: Belum pernah dicek.
- 1: Baru dicek kalau ada komplain.
- 2: Sudah punya daftar pengecekan sederhana.
- 3: Pengecekan dilakukan rutin dan hasilnya dicatat.
- 4: Catatan masalah dipakai untuk mencegah masalah yang sama terulang.

**Q11 — Pembeli sudah mendapat info produk yang lengkap dan sama di semua tempat?**

- 0: Belum ada info yang jelas.
- 1: Info masih disampaikan lisan dan sering berbeda.
- 2: Manfaat, harga, dan cara membeli sudah tersedia.
- 3: Info yang sama dipakai di semua tempat jualan yang aktif.
- 4: Info rutin dicek kejelasannya dan diperbarui saat produk berubah.

**Q12 — Masukan pelanggan sudah dipakai untuk memperbaiki produk?**

- 0: Belum pernah dikumpulkan.
- 1: Baru ditanggapi saat ada keluhan.
- 2: Masukan pelanggan sudah dicatat.
- 3: Sudah ada perbaikan yang dibuat dari catatan itu.
- 4: Hasil perbaikannya dicek lagi ke pelanggan.

### C4 Merek dan tampilan

Definisi internal: identitas, pesan, materi visual, dan konsistensi merek pada kanal usaha.

**Q13 — Nama dan tampilan merekmu sudah dipakai dengan konsisten?**

- 0: Belum punya identitas merek.
- 1: Sudah ada nama, tetapi warna atau tampilannya sering berubah.
- 2: Nama, warna, logo atau tampilan utama sudah tersedia.
- 3: Identitas itu dipakai konsisten di tempat jualan yang aktif.
- 4: Sudah ada panduan singkat dan penerapannya rutin dicek.

**Q14 — Pesan usahamu sudah bikin orang paham apa bedanya?**

- 0: Belum punya pesan utama.
- 1: Pesannya masih umum dan mirip usaha lain.
- 2: Satu pesan utama dan manfaat produk sudah ditulis.
- 3: Pesan itu dipakai konsisten di materi promosi.
- 4: Pesan sudah diuji ke pelanggan dan diperbaiki dari tanggapan mereka.

**Q15 — Foto produk atau contoh hasil kerjamu sudah meyakinkan?**

- 0: Belum punya foto atau contoh hasil.
- 1: Sudah ada, tetapi kurang jelas.
- 2: Foto atau contoh cukup jelas dan sesuai dengan yang dijual.
- 3: Tampilannya seragam, terbaru, dan mewakili produk.
- 4: Sudah ada cara kerja untuk membuat dan mengecek kualitas materi.

**Q16 — Orang bisa menemukan nama, kontak, dan produkmu dengan mudah?**

- 0: Nama atau kontak usaha belum jelas.
- 1: Nama dan kontak baru ada di satu tempat.
- 2: Nama dan kontak sudah sama di kanal utama.
- 3: Identitas, kontak, dan produk sudah selaras di semua kanal aktif.
- 4: Semua kanal rutin dicek dan info yang berbeda langsung diperbaiki.

### C5 Pemakaian digital

Definisi internal: kanal digital, alur pesanan, pengukuran hasil, serta pengelolaan akses dan informasi.

**Q17 — Akun digital usahamu sudah siap membantu orang membeli?**

- 0: Belum punya akun digital usaha.
- 1: Sudah punya akun, tetapi infonya belum lengkap.
- 2: Profil, daftar produk, dan kontak sudah tersedia.
- 3: Akun aktif, rutin diperbarui, dan mudah dipakai untuk bertanya.
- 4: Kunjungan atau pertanyaan masuk dicatat untuk memperbaiki akun.

**Q18 — Pesanan dari chat atau internet sudah punya alur yang rapi?**

- 0: Belum menerima pesanan digital.
- 1: Pesanan ditangani tanpa alur yang jelas.
- 2: Sudah ada cara mencatat dan mengonfirmasi pesanan.
- 3: Status setiap pesanan bisa dicek sampai selesai.
- 4: Waktu balas dan pesanan bermasalah rutin dievaluasi.

**Q19 — Kamu sudah mengukur apakah aktivitas online benar-benar membantu jualan?**

- 0: Belum mengukur apa pun.
- 1: Baru melihat jumlah pengikut.
- 2: Sudah mencatat jangkauan atau pertanyaan masuk.
- 3: Sudah menghubungkan aktivitas online dengan pesanan.
- 4: Datanya dipakai memilih perbaikan dan hasil perbaikannya dicek lagi.

**Q20 — Akses akun dan data penting usahamu sudah aman serta bisa dipulihkan?**

- 0: Akses akun belum terkontrol.
- 1: Hanya satu orang yang tahu aksesnya.
- 2: Pemilik akun dan cara memulihkan akses sudah jelas.
- 3: Akses dikelola dan data penting punya salinan cadangan.
- 4: Akses, cadangan, dan cara pemulihan rutin diperiksa.

### C6 Konsisten menjalankan rencana

Definisi internal: keteraturan pemasaran, tindak lanjut, pekerjaan, dan evaluasi selama 30 hari terakhir.

**Q21 — Selama 30 hari terakhir, jadwal promosi benar-benar dijalankan?**

- 0: Belum ada kegiatan yang direncanakan.
- 1: Promosi masih dilakukan saat sempat.
- 2: Sudah ada jadwal, tetapi sering tidak jalan.
- 3: Sebagian besar jadwal dijalankan dan dicatat.
- 4: Jadwal dijalankan, lalu hasilnya dipakai menyusun jadwal berikutnya.

**Q22 — Selama 30 hari terakhir, calon pembeli rutin ditindaklanjuti?**

- 0: Belum ada tindak lanjut.
- 1: Baru dilakukan kalau teringat.
- 2: Sudah ada daftar orang yang perlu dihubungi lagi.
- 3: Daftar dikerjakan rutin dan hasilnya dicatat.
- 4: Catatan hasil dipakai memperbaiki cara tindak lanjut.

**Q23 — Selama 30 hari terakhir, pekerjaan usaha selesai sesuai rencana?**

- 0: Belum ada rencana kerja.
- 1: Rencana masih lisan dan tidak dipantau.
- 2: Sudah ada rencana tertulis, tetapi penyelesaiannya belum stabil.
- 3: Sebagian besar pekerjaan selesai dan keterlambatan dicatat.
- 4: Penyebab keterlambatan dicari dan cara kerjanya diperbaiki.

**Q24 — Selama 30 hari terakhir, usahamu punya waktu khusus untuk evaluasi?**

- 0: Belum pernah evaluasi.
- 1: Evaluasi baru dilakukan saat ada masalah besar.
- 2: Waktu evaluasi sudah dijadwalkan.
- 3: Evaluasi dilakukan dan tindakan berikutnya dicatat.
- 4: Tindakan itu dicek lagi pada evaluasi berikutnya.

### C7 Cara usaha berjalan

Definisi internal: pencatatan transaksi, pemisahan uang, stok atau kapasitas, dan pembagian kerja.

**Q25 — Uang masuk dan keluar usaha sudah tercatat dengan rapi?**

- 0: Belum dicatat.
- 1: Baru sebagian transaksi yang dicatat.
- 2: Semua transaksi dicatat dengan bukti sederhana.
- 3: Catatan rutin dicocokkan dengan uang yang ada.
- 4: Catatan dipakai untuk mengambil keputusan soal arus kas.

**Q26 — Uang usaha sudah dipisahkan dari uang pribadi?**

- 0: Masih bercampur dan tidak ada catatan pemisahan.
- 1: Baru sebagian transaksi usaha yang ditandai.
- 2: Sudah ada catatan terpisah untuk uang usaha dan pribadi.
- 3: Pemisahan dilakukan rutin dan pengambilan pribadi ikut dicatat.
- 4: Catatan pemisahan diperiksa rutin dan selisihnya ditindaklanjuti.

**Q27 — Stok barang atau kemampuan melayani pesanan sudah terpantau?**

- 0: Belum dipantau.
- 1: Baru diperkirakan tanpa catatan.
- 2: Stok atau kapasitas layanan sudah dicatat.
- 3: Catatan dipakai untuk merencanakan pesanan.
- 4: Kekurangan, kelebihan, atau keterlambatan dianalisis dan diperbaiki.

**Q28 — Cara kerja dan tugas setiap orang sudah jelas?**

- 0: Belum ada alur kerja.
- 1: Cara kerja hanya diingat oleh satu orang.
- 2: Langkah kerja dan penanggung jawab sudah ditulis.
- 3: Cara kerja dipakai dan masalah yang muncul dicatat.
- 4: Cara kerja diperbaiki dari catatan masalah dan penerapannya dicek.

### C8 Siap ikut pendampingan

Definisi internal: kesiapan waktu, penanggung jawab, bukti, dan tindakan perbaikan selama 30 hari mendatang.

**Q29 — Kamu sudah menyiapkan waktu untuk pendampingan 30 hari ke depan?**

- 0: Belum bersedia menyiapkan waktu.
- 1: Bersedia, tetapi belum punya jadwal.
- 2: Waktu khusus sudah dipilih.
- 3: Jadwal sudah disepakati dengan orang yang terlibat.
- 4: Jadwal, pengingat, dan waktu pengganti sudah disiapkan.

**Q30 — Sudah ada orang yang siap menjalankan tugas dari pendampingan?**

- 0: Belum ada penanggung jawab.
- 1: Baru ada nama, tetapi orangnya belum menyatakan siap.
- 2: Penanggung jawab sudah menyatakan bersedia.
- 3: Peran dan tugasnya sudah disepakati.
- 4: Peran, tugas, dan cara melaporkan hasil sudah disepakati.

**Q31 — Kamu siap menunjukkan catatan atau contoh yang dibutuhkan saat pendampingan?**

- 0: Belum bersedia.
- 1: Bersedia secara umum, tetapi belum tahu apa yang aman dibagikan.
- 2: Jenis bukti yang aman dibagikan sudah disepakati.
- 3: Bukti awal yang dibutuhkan sudah disiapkan.
- 4: Bukti awal dan jadwal pembaruannya sudah siap.

**Q32 — Kamu siap mencoba satu perbaikan yang hasilnya bisa dicek?**

- 0: Belum bersedia mencoba.
- 1: Bersedia, tetapi belum memilih tindakan.
- 2: Satu tindakan dan target sudah dipilih.
- 3: Tindakan, target, dan kebutuhan pelaksanaannya sudah disiapkan.
- 4: Cara menjalankan dan mengevaluasi tindakan sudah disepakati.

Untuk usaha jasa, tampilkan bantuan bahwa “produk” dapat dibaca sebagai layanan dan “stok” sebagai kapasitas melayani. Untuk usaha yang belum berjalan 30 hari, izinkan catatan konteks dan tandai keterbatasan C6 bagi researcher; jangan mengarang jawaban. ubah semua pertanyaan dan jawaban jadi lebih ala gen z bahasanya lebih anak muda dan pendekatan yang lebih dekat tidak kaku saat bertanya dan menjawab

## Delapan dimensi dan tujuh alternatif

Gunakan urutan tetap:

| Kode | Dimensi |
|---|---|
| C1 | Profil usaha |
| C2 | Legalitas |
| C3 | Produk |
| C4 | Branding |
| C5 | Digitalisasi |
| C6 | Konsistensi |
| C7 | Operasional |
| C8 | Komitmen |

Gunakan alternatif tetap:

| Kode | Modul | Batas isi |
|---|---|---|
| A1 | Website | Profil, katalog, kontak, dan alur pertanyaan atau pesanan. |
| A2 | Branding | Identitas merek, pesan pembeda, dan panduan materi visual. |
| A3 | Legalitas usaha | Pemetaan kebutuhan, arsip, dan tindak lanjut administrasi yang sesuai. Bukan jaminan izin terbit. |
| A4 | Digital marketing | Konten, kampanye, tindak lanjut calon pelanggan, dan pengukuran kanal. |
| A5 | Marketplace onboarding | Akun toko, katalog, serta alur penerimaan dan pemenuhan pesanan. |
| A6 | Pelatihan keuangan | Catatan transaksi, pemisahan uang, biaya, dan ringkasan keuangan. |
| A7 | Mentoring bisnis | Sasaran, penawaran, penanggung jawab, rutinitas eksekusi, dan evaluasi. |

Jumlah alternatif memengaruhi TOPSIS. Jangan menambah atau menghapus alternatif pada model run yang sama. Perubahan membutuhkan versi model baru dan penghitungan ulang.

## Rumus wajib dan urutan hitung

Implementasikan fungsi murni pada modul domain, misalnya `lib/decision-engine`. Gunakan `number` dengan pemeriksaan `Number.isFinite`. Jangan membulatkan nilai antara. Bulatkan hanya saat menampilkan UI. Simpan nilai penuh pada JSON/JSONB. Gunakan toleransi perbandingan `EPSILON = 1e-12`.

### 1 Matriks pasangan ahli

Untuk delapan dimensi ada 28 pasangan unik. Input ahli terdiri dari:

- `preferred_dimension`: kode kiri, kode kanan, atau `equal`;
- `intensity`: bilangan bulat 1–9.

Aturan:

- `equal` wajib intensity 1;
- pilihan salah satu dimensi wajib intensity 2–9;
- diagonal `a[i][i] = 1`;
- bila dimensi kiri dipilih, `a[i][j] = intensity`;
- bila dimensi kanan dipilih, `a[i][j] = 1 / intensity`;
- `a[j][i] = 1 / a[i][j]`.

### 2 Pemeriksaan konsistensi crisp AHP

Untuk setiap ahli hitung eigenvalue terbesar `lambdaMax` dari matriks crisp 8 × 8. Implementasikan power iteration deterministik dengan batas iterasi dan toleransi ketat atau gunakan library numerik yang dapat ditinjau. Lalu:

```text
CI = (lambdaMax - 8) / 7
RI untuk n = 8 adalah 1.41
CR = CI / 1.41
```

Gunakan `max(0, CI)` hanya untuk meredam noise floating point negatif yang sangat kecil. Status konsisten jika `CR <= 0.10 + EPSILON`. Simpan `lambdaMax`, `CI`, `CR`, metode eigen, tolerance, dan jumlah iterasi.

### 3 Konversi ke triangular fuzzy number

Untuk nilai integer `k`:

```text
k = 1  -> (1, 1, 1)
k = 2..9 -> (max(1, k-1), k, min(9, k+1))
```

Untuk nilai resiprokal `1/k`, jika TFN `k = (l,m,u)`, gunakan:

```text
TFN(1/k) = (1/u, 1/m, 1/l)
```

Jangan menebak TFN dari floating point selain nilai 1 atau resiprokal integer 2–9.

### 4 Agregasi tiga ahli dan bobot Fuzzy AHP geometric mean

Run produksi memerlukan tepat tiga expert submission lengkap dan final untuk versi instrumen yang sama. Ketiganya memiliki bobot panel yang sama.

Untuk setiap sel dan setiap komponen TFN, agregasikan tiga ahli dengan geometric mean:

```text
A_group[i][j] = ( product_e A_e[i][j] )^(1/3)
```

Hitung fuzzy geometric mean setiap baris untuk `n = 8`:

```text
GM_i = ( product_j A_group[i][j] )^(1/8)
```

Jika `GM_i = (l_i,m_i,u_i)` dan jumlah seluruh baris adalah:

```text
SUM_GM = (sum_i l_i, sum_i m_i, sum_i u_i)
```

fuzzy division:

```text
FW_i = (l_i / sum_u, m_i / sum_m, u_i / sum_l)
centroid_i = (FW_i.l + FW_i.m + FW_i.u) / 3
w_i = centroid_i / sum_k centroid_k
```

Validasi `w_i > 0` dan `sum(w) ≈ 1`. Simpan TFN individual, TFN kelompok, GM baris, FW, centroid, dan `w` pada trace.

### 5 Matriks relevansi modul

Setiap ahli memberi `R_e[i][j]` untuk tujuh alternatif × delapan dimensi, bilangan bulat 0–4:

```text
0 tidak relevan
1 lemah atau tidak langsung
2 cukup
3 kuat
4 sangat kuat atau langsung
```

Agregat interval operasional:

```text
R[i][j] = arithmeticMean_e(R_e[i][j])
```

Simpan nilai individual dan agregat. Nilai 0 sah; null tidak sah untuk final submit.

### 6 Skor kondisi, gap, dan bobot kebutuhan personal

Empat jawaban pada setiap dimensi, masing-masing 0–4:

```text
S_j = sum(empat jawaban dimensi j) / 16 * 100
g_j = 1 - S_j / 100
H = sum_j(w_j * g_j)
```

Jika `H <= EPSILON`, status run adalah `NO_IDENTIFIED_GAP`. Jangan membuat ranking atau memaksa rekomendasi.

Jika `H > EPSILON`:

```text
q_j = w_j * g_j / H
```

Validasi `q_j >= 0` dan `sum(q) ≈ 1`.

**Jangan gunakan formula `X = R * g` lalu menormalisasi kolom X.** Untuk gap positif, faktor gap akan hilang karena dibagi kembali pada normalisasi kolom. Personalisasi penelitian ini wajib masuk melalui `q`.

### 7 TOPSIS personal

`R` menilai kemampuan modul membantu kekurangan. Karena itu semua delapan kolom diperlakukan sebagai benefit.

Untuk setiap dimensi:

```text
denom_j = sqrt(sum_i R[i][j]^2)
```

Jika `denom_j = 0` dan `g_j > EPSILON`, status `UNCOVERED_DIMENSION`; simpan kode dimensi dan jangan menerbitkan ranking. Jika `denom_j = 0` dan `g_j = 0`, set kolom `N` menjadi 0.

```text
N[i][j] = R[i][j] / denom_j
V[i][j] = N[i][j] * q_j
idealPlus_j = max_i V[i][j]
idealMinus_j = min_i V[i][j]
Dplus_i = sqrt(sum_j (V[i][j] - idealPlus_j)^2)
Dminus_i = sqrt(sum_j (V[i][j] - idealMinus_j)^2)
C_i = Dminus_i / (Dplus_i + Dminus_i)
```

Jika semua `Dplus_i + Dminus_i <= EPSILON`, status `ALTERNATIVES_NOT_DISTINGUISHABLE`. Jangan membuat pemenang palsu.

Urutkan `C` menurun. Nilai yang sama dalam toleransi `1e-12` mendapat rank yang sama dengan metode minimum rank. Simpan `topSet`, karena top 1 dapat berisi lebih dari satu modul. Gunakan kode A1–A7 hanya untuk urutan tampilan yang stabil; jangan anggap kode lebih kecil lebih baik.

Nilai `C` adalah kedekatan relatif, **bukan persentase keberhasilan**. `H` adalah besar gap tertimbang, **bukan kategori kematangan yang sudah tervalidasi**.

## Struktur data Supabase

Adaptasikan nama ke konvensi repository, tetapi pertahankan pemisahan data dan snapshot. Buat migration SQL dengan primary key UUID, foreign key, `created_at`, `updated_at` jika diperlukan, check constraint, unique constraint, index, dan RLS. Struktur logis minimum:

1. `profiles`: `user_id`, role, display name; role tidak boleh diubah dari browser.
2. `instrument_versions`: kode, status `draft/review/frozen/retired`, isi metadata, tanggal freeze, pembuat.
3. `dimensions`: version, code C1–C8, order, title internal, title UMKM, definition.
4. `questions`: version, code Q01–Q32, dimension, order, text.
5. `question_options`: question, score 0–4, label, order. Unique `(question_id, score)`.
6. `intervention_modules`: model version, code A1–A7, order, name, scope, initial action, 30-day output.
7. `expert_assignments`: expert user, version, status, invited_at, stage1_submitted_at, stage2_submitted_at.
8. `expert_profiles`: assignment, confirmed name, institution, job title, experience years, expertise, consent, assessment date.
9. `expert_item_reviews`: assignment, question, relevance 1–4, clarity 1–4, suggestion.
10. `expert_pairwise_judgments`: assignment, left dimension, right dimension, preferred, intensity 1–9, note; unique assignment+pair.
11. `expert_relevance_judgments`: assignment, module, dimension, score 0–4; unique assignment+module+dimension.
12. `umkm_profiles`: owner/session relation, coded ID, sector, district, business age months, people count, respondent role, sales channel, 30-day goal, consent, optional note. Pisahkan data kontak yang sudah ada dari ekspor penelitian.
13. `assessment_sessions`: UMKM, instrument version, status `draft/submitted/superseded`, started/submitted timestamp, revision number.
14. `assessment_answers`: session, question, score 0–4, optional safe note; unique session+question.
15. `expert_case_assignments`: expert assignment, submitted UMKM assessment, status.
16. `expert_case_rankings`: case assignment, module, rank 1–7 atau abstention pada parent, rationale; enforce tujuh rank unik saat final melalui transaction/server validation.
17. `decision_model_versions`: kode, instrument version, algorithm identifier `FAHP_GM_PERSONAL_TOPSIS`, epsilon, RI, TFN map, frozen timestamp.
18. `decision_model_inputs`: model version, tiga expert submission IDs, hash canonical input, snapshot JSON.
19. `decision_runs`: assessment snapshot, model input, status, H, created_at, code commit/build identifier, input hash, trace JSONB.
20. `dimension_results`: run, dimension, S, g, w, q.
21. `intervention_results`: run, module, Dplus, Dminus, C, rank, `is_top_tie`.
22. `usability_tests`: UMKM code, actual test date, task statuses, total minutes, ease 1–5, note. Jangan isi dari asesmen Word saja.
23. `audit_events`: actor, action, entity type/id, timestamp, non-sensitive metadata. Jangan log jawaban sensitif atau token.

Jika schema existing sudah punya tabel sejenis, buat migration adaptif dan pemetaan, bukan tabel duplikat yang membingungkan. Masukkan konten instrumen dan modul secara idempotent. Setelah `frozen`, cegah update/delete konten versi melalui trigger atau server policy; revisi harus membuat version baru.

### RLS dan keamanan

- Aktifkan RLS untuk seluruh tabel pada schema yang terekspos.
- UMKM hanya membaca/mengubah draft miliknya dan tidak dapat mengubah submitted snapshot atau model trace.
- Expert hanya membaca assignment miliknya dan hanya mengubah draft miliknya. Expert tidak dapat query submission ahli lain.
- Pada tahap validasi buta, expert tidak dapat membaca tabel/kolom hasil sistem untuk case assignment tersebut sampai ranking final. Jangan mengandalkan menyembunyikan komponen React; batasi query/server response.
- Researcher/admin dapat membaca data penelitian sesuai role yang ditetapkan server-side.
- Jangan berikan service role key ke client.
- Validasi authorization pada setiap Server Action atau Route Handler. RLS adalah lapisan wajib, bukan pengganti pemeriksaan server.
- Lindungi endpoint submit dan compute dengan idempotency key atau unique constraint agar klik ganda tidak membuat run ganda.
- Gunakan transaction/RPC bila submit memerlukan pengecekan jumlah baris, mengunci snapshot, dan membuat run secara atomik.
- Validasi semua input di server dengan schema validator yang sudah dipakai repository. Escape/sanitize free text saat ditampilkan. Terapkan batas panjang catatan.

## Halaman dan komponen

Gunakan UI system repository. Buat atau sesuaikan route berikut secara konvensional:

- UMKM: pembuka/persetujuan, profil singkat, wizard delapan dimensi, review, status, hasil.
- Expert: undangan/login, profil, definisi, telaah instrumen, pairwise wizard, relevansi grid, ringkasan CR, submit tahap 1, daftar validasi kasus, ranking kasus, submit tahap 2.
- Researcher: dashboard kelengkapan, versi instrumen, expert progress, review issues, CR, bobot, matriks relevansi, assessment list, decision runs, validasi ahli, sensitivitas, uji aplikasi, export.

UX minimum:

- responsif untuk ponsel 360 px;
- label terhubung dengan input, navigasi keyboard, focus state, error per field, dan kontras yang layak;
- jangan mengandalkan warna saja untuk status;
- autosave dengan indikator `Menyimpan/Tersimpan/Gagal disimpan`;
- konfirmasi sebelum final submit;
- session yang sudah final read-only;
- jangan menampilkan ranking ketika data tidak lengkap atau status khusus terjadi.

### Halaman hasil UMKM

Tampilkan:

1. Ringkasan: “Ini gambaran kondisi usahamu dari jawaban yang kamu isi.”
2. Delapan skor kondisi 0–100 dengan label dimensi dan penjelasan singkat. Gunakan bar chart sebagai tampilan utama; radar chart boleh tambahan.
3. `H` sebagai “besar kebutuhan yang teridentifikasi” hanya di bagian rincian, tanpa kategori tinggi/sedang/rendah yang belum divalidasi.
4. Tiga modul teratas dan akses urutan lengkap. Jika top rank seri, tampilkan semua anggota seri secara jujur.
5. Alasan yang dapat ditelusuri: sebutkan dimensi dengan `q` relatif besar dan hubungan `R` modul yang kuat. Jangan mengklaim kontribusi aditif palsu atau membuat alasan dengan AI generatif yang berbeda dari data.
6. Langkah awal dan luaran 30 hari dari definisi modul, dengan kalimat bahwa pendamping dan UMKM perlu menyepakati pelaksanaan.
7. Panel “Lihat cara hitung” berisi S, g, w, q, R/N/V, ideal, D+, D−, C, versi instrumen, versi model, dan waktu run. Panel ini bisa dibatasi untuk researcher bila terlalu teknis bagi UMKM.
8. Tombol unduh ringkasan yang tidak memuat identitas sensitif.

Pesan status:

- `NO_IDENTIFIED_GAP`: “Dari jawaban saat ini, belum ada gap yang teridentifikasi. Cek kembali jawaban bersama pendamping bila diperlukan.”
- `UNCOVERED_DIMENSION`: “Ada kebutuhan yang belum tercakup oleh daftar modul. Pendamping perlu meninjaunya.”
- `ALTERNATIVES_NOT_DISTINGUISHABLE`: “Data saat ini belum cukup untuk membedakan prioritas modul.”
- data/model belum siap: “Jawabanmu sudah tersimpan. Rekomendasi sedang disiapkan.”

## Dashboard penelitian dan ekspor

Sediakan ekspor CSV/JSON dengan filter version dan run:

- data mentah tiga ahli;
- 28 pasangan dan matriks crisp individual;
- CR individual dan kelompok;
- TFN, geometric mean, fuzzy weight, centroid, w;
- matriks relevansi individual dan R agregat;
- jawaban UMKM, S, g, H, q;
- N, V, ideal, D+, D−, C, rank, top set;
- hasil sensitivitas;
- hasil validasi kasus ahli;
- data uji aplikasi;
- metadata model, instrument, input hash, timestamp, dan build/commit ID.

Ekspor penelitian memakai kode ahli dan kode UMKM. Jangan ikutkan email, token, atau identitas yang tidak dibutuhkan.

Implementasikan **sensitivitas** dengan 32 skenario per assessment: untuk setiap delapan bobot, ubah satu bobot pada `-20%`, `-10%`, `+10%`, dan `+20%`, lalu normalkan kembali semua bobot dan hitung ulang. Simpan kesamaan `topSet`, overlap top 3, dan korelasi peringkat Spearman. Untuk 10 kasus normal, dashboard menunjukkan 320 skenario. Jelaskan bahwa ini hanya stabilitas pada skenario tersebut.

Implementasikan **validasi ahli** hanya dari ranking tahap kedua yang sah:

- apakah pilihan pertama ahli termasuk `topSet` sistem;
- overlap tiga modul teratas;
- Spearman untuk urutan tujuh modul;
- jumlah pasangan penilaian sah;
- jumlah UMKM unik dan jumlah ahli unik.

Jangan menyebut 3 ahli × 10 kasus sebagai 30 UMKM. Tampilkan “10 UMKM, 3 ahli, maksimal 30 pasangan penilaian”. Jika ahli abstain, keluarkan dari metrik dan tampilkan jumlah serta alasannya.

## Kesetaraan dengan notebook

Web adalah produk penelitian. Notebook/IPYNB adalah **oracle independen dan bukti reproduksibilitas**. Sediakan endpoint/export researcher untuk mengambil canonical JSON input satu run. Gunakan urutan C1–C8 dan A1–A7, angka penuh, serta nama field stabil.

Buat script test atau test fixture yang:

1. mengambil fixture;
2. menjalankan engine TypeScript;
3. membandingkan seluruh jejak dengan output referensi Python/notebook: `w`, `R`, `S`, `g`, `H`, `q`, `N`, `V`, ideal, `Dplus`, `Dminus`, `C`, rank dan status;
4. memakai toleransi absolut/relatif maksimal `1e-10` untuk floating point, sementara kode/status/rank harus sama persis;
5. gagal bila `NaN`, `Infinity`, nilai luar rentang, urutan kode berubah, atau pembulatan antara dilakukan.

Jangan menjalankan Python pada setiap request production. Python digunakan untuk cross-check pengembangan dan dokumentasi penelitian; TypeScript engine menjadi implementasi web setelah kesetaraan terbukti.

## Pengujian wajib

Buat unit test yang bermakna untuk:

1. tepat 28 pasangan dari delapan dimensi;
2. diagonal 1 dan resiprokal;
3. konversi TFN 1, 2, 9, 1/2, 1/9;
4. agregasi geometric mean tiga ahli;
5. matriks semua-sama menghasilkan delapan bobot 0,125;
6. bobot positif dan jumlah satu;
7. CR konsisten dan CR > 0,10;
8. 56 relevansi per expert lengkap; nilai 0 diterima dan null ditolak;
9. 32 jawaban lengkap; 0 diterima, null tidak dianggap 0;
10. skor delapan dimensi pada rentang 0–100;
11. `sum(q)=1` ketika H > 0;
12. semua skor 100 menghasilkan `NO_IDENTIFIED_GAP`;
13. kolom R nol dengan gap positif menghasilkan `UNCOVERED_DIMENSION`;
14. alternatif identik menghasilkan `ALTERNATIVES_NOT_DISTINGUISHABLE`;
15. perubahan pola gap dapat mengubah prioritas;
16. gap proporsional dapat menghasilkan C sama tetapi H berbeda;
17. permutasi urutan penyimpanan tidak memutus pasangan ID dengan nilai;
18. seri mendapat rank yang sama;
19. sensitivitas menghasilkan 32 skenario per kasus;
20. endpoint tidak mengembalikan trace sistem kepada expert sebelum validasi final;
21. RLS: UMKM/expert tidak bisa membaca atau mengubah data pengguna lain;
22. submit ganda idempotent;
23. snapshot submitted tidak dapat diubah;
24. hasil TypeScript sama dengan golden output notebook pada toleransi `1e-10`.

Tambahkan integration/E2E test untuk satu perjalanan UMKM, satu expert draft/final, tiga expert lengkap hingga model tersedia, blinded case validation, researcher export, dan kondisi error utama. Jangan memakai nama calon ahli sebagai fixture.

## Kriteria penerimaan

Pekerjaan selesai hanya jika:

- migration Supabase tersedia dan dapat dijalankan pada lingkungan pengembangan;
- seed instrumen memuat tepat C1–C8, Q01–Q32 dengan lima opsi 0–4, serta A1–A7;
- form UMKM dan form ahli dapat disimpan sebagai draft dan difinalkan;
- RLS dan authorization sudah diterapkan serta diuji;
- perhitungan tidak memakai bobot atau hasil hard-coded;
- run dapat ditelusuri dari jawaban sampai C dan rank;
- kasus khusus tidak memaksa ranking;
- hasil TypeScript lulus golden comparison dengan notebook;
- dashboard dan ekspor penelitian tersedia;
- UI ponsel dapat dipakai, memiliki validasi dan aksesibilitas dasar;
- lint, typecheck, tests, dan production build lulus;
- tidak ada data ahli atau UMKM rekaan yang tampil sebagai hasil penelitian.

## Hasil yang harus Anda berikan

Setelah mengerjakan repository, laporkan:

1. ringkasan arsitektur existing yang ditemukan;
2. daftar file yang ditambah atau diubah;
3. migration dan kebijakan RLS;
4. penjelasan letak engine serta rumus yang diterapkan;
5. bukti hasil lint, typecheck, test, build, dan golden comparison;
6. cara menjalankan migration, seed, development server, tests, dan ekspor;
7. akun/fixture pengembangan berlabel simulasi;
8. risiko atau keputusan yang masih perlu dikonfirmasi;
9. screenshot halaman utama jika tooling repository mendukungnya.

Kerjakan implementasi sampai dapat ditinjau. Jangan hanya memberikan tutorial. Jangan deploy atau mengubah production data tanpa instruksi eksplisit.

WAJIB BUATKAN HALAMAN ADMIN DASHBOARD UNTUK AKSES DATA UMKM YG MASUK. BUATKAN HALAMAN ADMIN YG SESUAI PERMINTAAN DIATAS. IMPROVE. UNTUK LOGINNYA GUNAKAN USERNAMA admin@dekatlokal.com dan password ***DIHAPUS*** langsung masuk ke seed supabase.

IMPROVE SISTEM DIGITAL CHECKUP INI AGAR SESUAI FLOW DAN TUJUAN AWAL KITA

## Akhir prompt

