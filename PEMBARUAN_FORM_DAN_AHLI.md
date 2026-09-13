# Form nasional dan akses ahli tanpa email

## Perubahan 13 September 2026

Form memakai 38 provinsi dan 514 kota/kabupaten. Snapshot data wilayah berasal dari [Wilayah.id](https://wilayah.id/) (pembaruan 4 Juli 2025, sumber Kemendagri melalui cahyadsn/wilayah), disimpan di `lib/digital-checkup/regions.ts`. Tidak ada pengiriman lokasi pengunjung ke layanan pihak ketiga saat mencari wilayah.

Kolom lama `district` tetap dipertahankan untuk kompatibilitas hasil terdahulu. Form baru menyimpan nama kota/kabupaten dan provinsi di kolom itu, ditambah `provinceCode` dan `cityCode` di JSON profil. Jawaban final lama tidak diubah. Kesesuaian kode wilayah diperiksa server.

Label **berpotensi mendapat website gratis** mengikuti daftar pemilik program, bukan jaminan diterima: Makassar, Gowa, Bone, Takalar, Bulukumba, Sinjai, Maros, Barru, Wajo, Soppeng, Sidenreng Rappang (Sidrap), Pinrang, Enrekang, dan Palopo, semuanya di Sulawesi Selatan. “Palopi” ditafsirkan sebagai Kota Palopo. Memilih provinsi saja belum memunculkan label. Daerah lainnya tetap bisa checkup dan belajar gratis.

Tautan program: https://www.dekatlokal.com/digital-checkup. Aturan penerimaan/kuota perlu mengikuti informasi pemilik program di halaman tersebut.

Angka awal dikosongkan, contoh angka hanya placeholder. Angka 0 tetap valid untuk usaha yang belum berjalan satu bulan. Draf lokal juga dapat mempertahankan kolom angka yang belum diisi.

## Aktivasi /ahli tanpa login email

Halaman `https://digitalcheckup.dekatlokal.com/ahli` menampilkan pilihan tiga ahli. Tidak perlu login email untuk jalur ini. Akun email ahli yang lama tetap kompatibel.

Pasang migration `202609130001_email_free_experts.sql` setelah migration sebelumnya. Penugasan baru boleh tidak memiliki `expert_user_id`, sehingga **tidak perlu membuat akun Auth/email**. Penugasan lama tidak dihapus. RPC tetap hanya dapat dipanggil server; cookie ahli membatasi akses ke satu penugasan.

Untuk menambah ahli tanpa email, operator dapat menjalankan SQL berikut menggunakan ID instrumen yang benar, lalu memasukkan ID hasilnya ke roster. Jangan membuat jawaban contoh di produksi:

```sql
insert into public.dc_expert_assignments(instrument_id,code)
values ('UUID_INSTRUMEN_YANG_DISETUJUI','KODE_AHLI_UNIK')
returning id;
```

Audit penugasan tanpa Auth memakai entity ID ahli, bukan user Auth rekaan. Pengiriman final tetap immutable. Pada pemeriksaan read-only 13 September 2026 terdapat dua penugasan lama berstatus draf dan belum bernama; keduanya dipertahankan.

Tetapkan **nama asli dan tiga ID penugasan yang benar-benar ada** dalam `DC_EXPERT_ROSTER` pada environment server:

```json
[
  {"name":"NAMA_AHLI_1","assignmentId":"UUID_PENUGASAN_1","accessCode":"KODE_ACAK_UNIK_MIN_12_KARAKTER"},
  {"name":"NAMA_AHLI_2","assignmentId":"UUID_PENUGASAN_2","accessCode":"KODE_ACAK_UNIK_MIN_12_KARAKTER"},
  {"name":"NAMA_AHLI_3","assignmentId":"UUID_PENUGASAN_3","accessCode":"KODE_ACAK_UNIK_MIN_12_KARAKTER"}
]
```

Contoh di atas adalah placeholder konfigurasi, **bukan nama, UUID, atau penilaian rekaan**. Penugasan Supabase yang sudah ada dipakai ulang; ahli tidak perlu membuka email atau memasukkan kata sandi akun. Tiga ID dan nama harus berbeda. Jangan menaruh roster berisi kode akses di variabel NEXT_PUBLIC atau mengirimkannya ke browser.

Pilihan aman: pilih nama → masukkan kode akses yang diberikan peneliti → langsung mengisi. Pakai kode acak yang berbeda, minimal 12 karakter, bukan tanggal lahir atau kode urut. Terapkan pembatasan request pada hosting untuk endpoint `/api/digital-checkup/expert-access`.

Jika pemilik **secara sadar menghendaki pilih nama saja tanpa verifikasi**, hilangkan `accessCode` dan set `DC_EXPERT_ALLOW_PUBLIC_ENTRY=true`. Konsekuensinya: siapa pun yang membuka situs dapat memilih nama ahli dan mengirim atas namanya. Tanda tangan cookie melindungi integritas sesi, **bukan membuktikan identitas orang yang memilih nama**. Jangan gunakan mode terbuka untuk mengklaim bahwa identitas penilai sudah diverifikasi.

`DC_EXPERT_SESSION_SECRET` sebaiknya secret acak minimal 32 karakter. Bila kosong, server memakai service-role key dengan pemisahan konteks HMAC; secret tidak pernah dikirim ke browser. Sesi berlaku 8 jam, HttpOnly, SameSite=Lax, dan Secure pada produksi. Mengubah roster mencabut akses untuk ID yang dihapus. Akses dibatasi pada penugasan terpilih; jalur melihat hasil UMKM diblokir selama sesi ahli berlangsung untuk menjaga penilaian mandiri.

Nama ketiga ahli belum diberikan saat implementasi ini dibuat. Aplikasi tidak menampilkan tiga nama buatan dan tidak membuat akun penelitian palsu. Roster baru aktif setelah operator memasukkan penugasan sebenarnya.

## Pengolahan otomatis setelah tiga ahli selesai

- Nilai dan konsistensi masing-masing ahli tetap diperiksa ketika final dikirim.
- Set `DC_AUTO_MODEL_VERSION` ke UUID versi model yang disepakati.
- Set `DC_AUTO_MODEL_APPROVER` ke UUID admin/peneliti yang benar-benar menyetujui pemrosesan otomatis panel tersebut.
- Ketiga penugasan roster harus final dan memakai instrumen yang sama dengan versi model.
- Setelah lengkap, worker otomatis membekukan model dan menjalankan rekomendasi. Tidak membuat bobot pengganti atau mengisi penilaian kosong.
- Scheduler yang dijelaskan dalam [panduan produksi](AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md) tetap diperlukan untuk retry ketika request terputus.
- Respons worker `panelPending:true` berarti pemrosesan panel perlu ditinjau operator; antrean rekomendasi yang sudah ada tetap diproses.

Persetujuan otomatis ini spesifik pada versi yang dikonfigurasi. Model yang sudah dibekukan tetap immutable. Versi berikutnya memerlukan pengaturan baru, bukan menimpa hasil penelitian lama.

## Verifikasi implementasi

- 77 tes unit/integrasi lulus, termasuk akses ahli tanpa akun Auth, penolakan akses yang salah, snapshot final immutable, pemrosesan panel, dan validasi wilayah.
- Build produksi Next.js lulus.
- Tiga skenario browser lulus: form 32 pertanyaan pada 360px, OTP mobile, serta form desktop dan akses awal `/ahli`. Request checkup dan OTP pada pengujian browser disimulasikan; tidak mengirim email atau jawaban penelitian ke produksi.
- Screenshot mobile dan desktop ditinjau. Pemeriksaan padding pencarian dan overflow horizontal ditambahkan agar teks lokasi tidak bertumpuk dengan ikon.

Verifikasi kode ini bukan bukti deployment atau aktivasi layanan produksi. Migration, tiga nama/ID penugasan sebenarnya, konfigurasi panel, serta Google/SMTP/scheduler dalam panduan produksi tetap harus dipasang di lingkungan hosting.

Jalankan `npm run check:production` untuk pemeriksaan read-only konfigurasi, tiga penugasan ahli, tabel belajar, model final, dan provider login. Perintah tidak mencetak secret, mengirim email, atau membuat penilaian.

Pemeriksaan terakhir 13 September 2026: tabel instrumen, model, progres belajar, dan antrean rekomendasi sudah tersedia; provider email/signup aktif. Yang masih perlu aktivasi: roster tiga ahli, konfigurasi panel otomatis, secret scheduler, model ahli final, dan provider Google. Status SMTP/template OTP serta migration email-free tidak dapat dipastikan hanya dari pemeriksaan tabel ini.
