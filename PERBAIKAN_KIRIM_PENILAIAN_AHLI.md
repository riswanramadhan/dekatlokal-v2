# Pengiriman final penilaian ahli

Pemeriksaan read-only menemukan draf Ayu Anisela berisi 32 telaah, 28 pasangan, dan 56 nilai relevansi. CR yang dihitung dengan kode aplikasi adalah **0,6605417081756403**, lebih tinggi dari batas metode **0,10**. Dua penugasan lainnya masih kosong saat pemeriksaan. Data produksi tidak diubah atau difinalkan dalam perbaikan ini.

Tombol sebelumnya dinonaktifkan ketika konfirmasi belum dicentang atau CR tidak konsisten. Kini tombol tetap dapat diklik (kecuali sedang mengirim atau penilaian sudah final), dengan pemeriksaan sebelum request, alasan yang terlihat, dan tombol untuk menuju bagian/pasangan yang perlu diperbaiki. Pengiriman gagal menampilkan pesan di bagian kirim dan dapat dicoba lagi; draf tidak dihapus.

Contoh pola pada draf yang diperiksa: C3 lebih penting daripada C6, C6 lebih penting daripada C8, tetapi C8 lebih penting daripada C3. Ahli perlu meninjau pertimbangan dan intensitasnya sendiri. UI menampilkan pola berputar dan pasangan dengan penyimpangan relatif terbesar, tanpa menyarankan angka pengganti.

Langkah ahli:

1. Buka `/ahli`, pilih nama, lalu **Tinjau & kirim**.
2. Gunakan **Tinjau bagian ini** atau tombol pasangan. Sesuaikan hanya berdasarkan pertimbangan ahli; draf disimpan otomatis.
3. Kembali ke tinjauan. Setelah data lengkap dan CR ≤ 0,10, centang konfirmasi dan klik **Kirim penilaian final**.

Batas konsistensi pada API, database, dan pembentukan model tidak dilonggarkan. Meloloskan CR 0,66054 akan mengubah ketentuan penelitian, bukan memperbaiki tombol. Rekomendasi panel tetap memerlukan tiga penilaian final yang sah dan konfigurasi pemrosesan otomatis/scheduler sesuai panduan produksi.

Verifikasi: lint berkas implementasi, build produksi (termasuk TypeScript), serta 35 tes UI pengiriman dan algoritma lulus. Deployment belum dilakukan dalam pekerjaan ini.
