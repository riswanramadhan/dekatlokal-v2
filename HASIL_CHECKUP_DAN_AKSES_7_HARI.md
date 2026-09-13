# Hasil Digital Checkup dan akses belajar 7 hari

Pembaruan ini menuntaskan alur pengguna dari jawaban final sampai modul belajar:

1. Jawaban final menghasilkan nilai delapan bagian usaha.
2. Tiga penilaian ahli final dibangun ulang menjadi bobot Fuzzy AHP.
3. TOPSIS mencocokkan kebutuhan pengguna dengan tujuh modul dan menyusun ranking.
4. Halaman hasil menampilkan kekuatan utama, fokus perbaikan, tiga preview modul, serta status kesiapan menuju verifikasi program website.
5. Pengguna masuk dengan Google atau OTP email. Cookie checkup yang rahasia menautkan hasil ke akun.
6. Akses belajar gratis dimulai sekali saat akun dengan checkup final membuka dashboard, lalu aktif selama tujuh hari. Checkup atau login ulang tidak mengulang masa akses. Progres tetap disimpan setelah akses berakhir.

Hasil pengguna memakai bahasa sehari-hari. Unduhan pengguna berupa TXT, bukan JSON. JSON teknis, CSV, input canonical, bobot, dan jejak hitung hanya tersedia di /admin.

## Migration wajib

Setelah mencadangkan database dan memastikan proyek Supabase produksi yang benar, jalankan migration supabase/migrations/202609140001_results_and_learning_access.sql setelah migration tanggal 13 September.

Migration ini:

- menambahkan dc_learning_access beserta RLS;
- menambahkan fungsi service-only untuk memulai satu masa akses selama tujuh hari setelah checkup final;
- memperbaiki pembekuan model agar tiga penugasan ahli tanpa email tetap dihitung sebagai tiga ahli yang berbeda;
- tetap mewajibkan role admin atau researcher sebagai pencatatan persetujuan model.

Model dapat dibentuk otomatis saat tiga penugasan pada roster semuanya berstatus submitted. Jika DC_AUTO_MODEL_VERSION dan DC_AUTO_MODEL_APPROVER tersedia, keduanya dipakai. Jika kosong, server memilih versi belum beku terbaru dengan instrumen yang sama serta satu akun ber-role admin/researcher. Tidak ada nilai ahli yang dibuat atau diperbaiki otomatis; data yang tidak final, tidak lengkap, tidak konsisten, atau berbeda instrumen tetap ditolak.

## Login admin

Admin membuka https://digitalcheckup.dekatlokal.com/admin secara langsung dan masuk dengan email serta kata sandi akun Supabase yang sudah mempunyai role admin atau researcher pada dc_profiles. Form ini tidak membuat akun, tidak memberi role berdasarkan email, dan tidak ditampilkan di halaman masuk pengguna.

## Ekspor untuk Google Colab

Di /admin buka tab **Ekspor**:

- **JSON siap Colab**: satu record per checkup, jawaban 32 butir, nilai dimensi, ranking, top set, identitas build, model, dan penilaian ahli anonim;
- **Input canonical**: input satu run yang cocok untuk pembandingan dengan oracle Python;
- **JSON lengkap** dan **CSV**: dataset penelitian anonim.

Nama bisnis, email, WhatsApp, akun sosial, token sesi, dan catatan bebas tidak masuk ekspor. Gunakan file hanya sesuai tujuan penelitian dan batasi aksesnya.

## Aktivasi produksi

Kode dan migration perlu masuk ke release hosting, kemudian:

1. jalankan migration di proyek Supabase produksi;
2. pastikan ada minimal satu profil admin atau researcher;
3. pastikan ketiga penugasan roster berstatus submitted;
4. aktifkan scheduler worker dengan CRON_SECRET;
5. jalankan npm run check:production;
6. uji satu akun nyata dari checkup, hasil, OTP/Google, penautan akun, sampai pembukaan modul.

Pemeriksaan lokal atau read-only tidak membuktikan release terbaru sudah terdeploy.
