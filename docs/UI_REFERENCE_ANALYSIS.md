# UI REFERENCE ANALYSIS — DekatLokal Platform V3

## 1. Karakter visual yang harus diambil

Referensi menunjukkan produk belajar yang sangat sederhana dan terarah:

- Satu pertanyaan atau satu pesan utama per layar.
- Kolom konten sempit di tengah pada desktop.
- Banyak ruang kosong.
- Dekorasi background hanya sebagai aksen.
- Card pilihan relatif kecil, tidak memenuhi layar.
- Tombol lanjut konsisten pada area bawah.
- Progress bar sangat tipis di bagian atas.
- Mascot/helper tampil kecil di samping speech bubble.
- Typography sederhana dengan beberapa kata ditebalkan.
- State pilihan menggunakan tint lembut, border, dan check indicator.
- Dashboard mobile memakai container kecil, quick action grid, empty state, dan floating bottom navigation.

## 2. Arah adaptasi DekatLokal

Yang diadaptasi:

- ritme onboarding,
- ukuran dan density,
- pola speech bubble,
- fixed bottom action,
- progress indicator,
- compact option cards,
- floating mobile navigation,
- small icon-led dashboard blocks,
- clear screen-to-screen transitions.

Yang tidak disalin:

- logo,
- mascot,
- warna kuning/hijau,
- copy,
- ilustrasi eksklusif,
- aset visual proprietary.

Identitas final:

- primary blue `#0255F5`,
- putih,
- soft blue,
- blue-violet,
- mint/coral/yellow sebagai aksen terbatas,
- helper bernama Tekap,
- copy khusus UMKM,
- ilustrasi usaha lokal.

## 3. Ukuran UI

### Desktop onboarding

- Main column: 480–520px.
- Option card height: 64–76px.
- Gap: 12px.
- Speech bubble: maksimal 400px.
- Primary CTA: 56–60px.
- Fixed action container: 500–520px.
- Decorative background tidak boleh mengurangi keterbacaan.

### Mobile

- Horizontal padding: 16px.
- Compact card radius: 14–18px.
- Small cards: 56–72px.
- Main CTA height: 52–56px.
- Floating nav: 12px dari sisi, 12–18px di atas safe area.
- Page content harus memiliki bottom padding agar nav tidak menutup konten.

## 4. Mobile navigation behavior

Expanded state:

- icon dan label terlihat,
- height sekitar 66–72px,
- rounded 20–24px,
- soft shadow.

Collapsed-on-scroll state:

- saat scroll ke bawah lebih dari threshold, label menghilang,
- icon tetap terlihat,
- height turun menjadi 50–56px,
- nav bergeser sedikit lebih ke atas,
- label kembali saat scroll ke atas, kembali ke top, atau keyboard focus,
- transisi 180–240ms,
- tidak menyebabkan layout shift.

Menu:

- Beranda,
- Jalur,
- tombol tengah `Lanjut`,
- Progres,
- Akun.

Tombol tengah dibuat sedikit terangkat dan menjadi shortcut ke Next Best Action.

## 5. Sound character

Efek suara harus:

- singkat,
- ringan,
- menyenangkan,
- tidak mengagetkan,
- tidak menggantikan feedback visual.

Events:

- tap/click,
- option select,
- correct answer,
- incorrect answer,
- module unlock,
- lesson complete,
- reward/certificate.

Tidak ada autoplay sebelum interaksi pengguna. Sediakan sound toggle.
