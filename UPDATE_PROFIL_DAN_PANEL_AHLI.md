# Pembaruan profil usaha dan panel ahli

## Panel yang ditetapkan

- Ayu Anisela — CFO Rumah BUMN Makassar.
- Asluddin — Koordinator Rumah BUMN Makassar.
- Rizky Amelia — CMO Rumah BUMN Makassar.

Direktori default ada di `lib/digital-checkup/expert-directory.ts`. Dua penugasan draf sebelumnya dipertahankan; penugasan Rizky Amelia ditambahkan ke proyek Supabase yang dikonfigurasi, tanpa akun email dan tanpa jawaban/nilai. Halaman `/ahli` menampilkan nama dan jabatan, kemudian membuka instrumen milik ahli terpilih. Nama, instansi, dan jabatan awal terisi sesuai direktori.

Jika `DC_EXPERT_ROSTER` kosong, direktori ini digunakan dalam mode pilih nama sesuai permintaan pemilik. Jika environment tersebut sudah diisi, isinya tetap mengesampingkan direktori; kosongkan untuk memakai panel di atas. Mode pilih nama tidak memverifikasi identitas orang yang membuka halaman. Untuk panel tertutup, gunakan konfigurasi kode akses pada panduan sebelumnya. ID penugasan pada direktori berlaku untuk proyek yang dikonfigurasi saat implementasi; proyek Supabase baru memerlukan penugasan dan roster sendiri.

Pengolahan panel masih memerlukan `DC_AUTO_MODEL_VERSION`, `DC_AUTO_MODEL_APPROVER`, scheduler, dan tiga penilaian final yang sah. Tidak ada nilai ahli atau bobot pengganti yang dibuat otomatis. Fuzzy AHP dan TOPSIS memakai instrumen versi tetap; akun sosial dan kontak tidak memengaruhi skor.

## Form profil versi 2

Nama bisnis, email, WhatsApp, jenis usaha, lokasi, umur usaha, jumlah orang, kanal penjualan, dan tujuan wajib diisi. Jenis usaha memakai kategori dropdown. Instagram, TikTok, dan Google Maps ada di bagian Pemakaian digital dan bersifat opsional, termasuk bagi usaha yang belum memiliki akun digital.

Nama pengguna Instagram/TikTok boleh diawali `@`; Google Maps menerima tautan HTTPS dari layanan Google. Input kontak tidak merupakan persetujuan pemasaran maupun bukti kepemilikan akun login. Detail disimpan dalam JSON profil sesi; hasil final lama tetap dapat dibaca tanpa diubah. Ekspor penelitian dan kasus ahli menggunakan whitelist dan tidak menyertakan kontak/nama bisnis.

Kolom bermasalah mendapat fokus, scroll menuju kolom, teks kesalahan, serta animasi singkat yang menghormati pengaturan reduced motion. Layar scanning mengikuti request penyimpanan sebenarnya, bukan persentase kemajuan rekaan.

## Login dan sinkronisasi

Login pengguna hanya Google atau OTP email. Tautan admin/ahli tidak ditampilkan di halaman masuk. Pengunjung yang belum punya akun diarahkan untuk memulai checkup.

Hasil sebelum login disimpan di Supabase sebagai sesi tamu. Setelah autentikasi berhasil, cookie sesi rahasia diklaim melalui `dc_claim_assessment`, menghubungkan bisnis dan seluruh sesi/hasilnya ke akun. Kepemilikan tidak ditentukan dari email yang diketik di profil. Klaim idempoten, menolak akun lain, dan diproses ulang dari dashboard bila koneksi terputus. Jangan hapus cookie atau berpindah perangkat sebelum hasil ditautkan. Draf lokal bukan bukti kepemilikan dan tidak boleh dipakai untuk melewati autentikasi.

Semua tautan bantuan/paket diarahkan ke admin WhatsApp `089516335023` dengan pesan pembuka yang sesuai. Pesan tidak dikirim otomatis; pengguna tetap menekan Kirim di WhatsApp.

Deployment aplikasi, aktivasi Google/SMTP, scheduler, dan persetujuan versi model tetap mengikuti `AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md`.

## Hasil pemeriksaan

- 80 tes unit/integrasi lulus, mencakup perhitungan Fuzzy AHP–TOPSIS, profil, akses, dan penyimpanan.
- Verifikasi ulang terakhir: 13 tes database/profil dan 2 tes dropdown lulus. Startup worker dropdown sempat timeout; pengulangan terpisah dengan thread berhasil.
- Lint pada berkas implementasi yang diubah dan build produksi Next.js lulus.
- Empat skenario browser lulus pada build produksi: form mobile dengan fokus validasi dan scanning, OTP mobile, akses ahli dengan profil otomatis, serta CTA/footer dan tautan WhatsApp. Screenshot desktop dan mobile sudah ditinjau.
- Tes browser checkup/OTP memakai API simulasi. Pengujian akses ahli hanya membuka penugasan, tidak mengirim nilai. Satu perubahan nyata di Supabase adalah penambahan penugasan Rizky Amelia yang diminta pemilik.
- Pemeriksaan produksi mengonfirmasi tiga penugasan dan tabel belajar/antrean tersedia. Google, scheduler, konfigurasi panel otomatis, dan model final dari penilaian nyata masih memerlukan aktivasi/penyelesaian. Deployment aplikasi belum dilakukan dalam pekerjaan ini.
