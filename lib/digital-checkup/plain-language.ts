/**
 * Lapisan bahasa mudah untuk layar Digital Checkup.
 * Teks resmi instrumen (lib/decision-engine/instrument.json) TIDAK diubah;
 * yang ada di sini hanya judul singkat, penjelasan satu kalimat, dan contoh
 * agar pengguna awam cepat paham apa yang ditanyakan.
 */
import { instrument } from "@/lib/decision-engine";

export type PlainQuestion = { title: string; hint: string; example: string };
export type PlainDimension = { friendlyTitle: string; blurb: string; emoji: string; tone: "primary" | "mint" | "amber" | "coral" | "violet" | "sky" };

export const plainDimensions: Record<string, PlainDimension> = {
  C1: { friendlyTitle: "Kenal usaha sendiri", blurb: "Siapa pembelimu, apa yang kamu jual, dan mau ke mana usahamu.", emoji: "🧭", tone: "primary" },
  C2: { friendlyTitle: "Dokumen & administrasi", blurb: "Surat-surat usaha dan jadwal kewajiban yang perlu dipantau.", emoji: "🗂️", tone: "violet" },
  C3: { friendlyTitle: "Produk atau layanan", blurb: "Standar, kualitas, dan info produk untuk pembeli.", emoji: "📦", tone: "amber" },
  C4: { friendlyTitle: "Merek & tampilan", blurb: "Nama, logo, foto, dan pesan usahamu.", emoji: "🎨", tone: "coral" },
  C5: { friendlyTitle: "Pemakaian digital", blurb: "Akun online, pesanan lewat chat, dan keamanan akun.", emoji: "📱", tone: "sky" },
  C6: { friendlyTitle: "Konsisten jalanin rencana", blurb: "Seberapa rutin promosi, tindak lanjut, dan evaluasi 30 hari terakhir.", emoji: "📅", tone: "mint" },
  C7: { friendlyTitle: "Cara usaha berjalan", blurb: "Catatan uang, stok, dan pembagian kerja sehari-hari.", emoji: "⚙️", tone: "primary" },
  C8: { friendlyTitle: "Siap ikut pendampingan", blurb: "Waktu, orang, dan bukti yang siap kamu bawa ke pendampingan.", emoji: "🤝", tone: "mint" },
};

export const plainQuestions: Record<string, PlainQuestion> = {
  Q01: { title: "Siapa pembeli utamamu?", hint: "Seberapa jelas kamu tahu siapa yang paling cocok membeli produkmu.", example: "Contoh: ibu-ibu pekerja kantoran yang butuh sarapan cepat." },
  Q02: { title: "Info dasar usahamu sudah dicatat?", hint: "Nama, kontak, jenis usaha, lokasi, dan siapa yang bertanggung jawab.", example: "Contoh: dicatat di buku atau catatan HP yang gampang dicari." },
  Q03: { title: "Kenapa orang harus pilih produkmu?", hint: "Alasan pembeda dibanding pilihan lain, dan apakah sudah dipakai saat jualan.", example: "Contoh: “Keripik kami tanpa pengawet dan dikirim hari itu juga.”" },
  Q04: { title: "Target 30 hari ke depan?", hint: "Seberapa jelas target jangka pendek usahamu, termasuk angkanya.", example: "Contoh: dapat 20 pesanan lewat WhatsApp bulan ini." },
  Q05: { title: "Tahu dokumen apa yang dibutuhkan?", hint: "Daftar surat atau izin yang memang relevan untuk usahamu.", example: "Contoh: NIB, sertifikat halal, atau PIRT untuk makanan." },
  Q06: { title: "Dokumennya sudah sampai mana?", hint: "Proses mengurus dokumen yang tadi kamu sebutkan.", example: "Contoh: NIB sudah terbit, sertifikat halal masih diajukan." },
  Q07: { title: "Dokumen gampang ditemukan?", hint: "Cara kamu menyimpan dan mencadangkan dokumen usaha.", example: "Contoh: semua discan dan disimpan di satu folder Google Drive." },
  Q08: { title: "Jadwal kewajiban terpantau?", hint: "Pengingat untuk perpanjangan izin, pajak, atau laporan rutin.", example: "Contoh: alarm di HP setiap tanggal jatuh tempo." },
  Q09: { title: "Produkmu punya standar yang jelas?", hint: "Ukuran, bahan, langkah, atau hasil yang selalu sama.", example: "Contoh: resep tertulis dengan takaran yang sama setiap batch." },
  Q10: { title: "Bagaimana kualitas dicek?", hint: "Cara kamu memastikan produk atau layanan sesuai standar.", example: "Contoh: cek rasa dan kemasan sebelum dikirim, lalu dicatat." },
  Q11: { title: "Info produk sudah lengkap & sama di mana-mana?", hint: "Manfaat, harga, dan cara beli yang konsisten di semua tempat jualan.", example: "Contoh: harga di Instagram sama dengan harga di WhatsApp." },
  Q12: { title: "Masukan pelanggan dipakai?", hint: "Apakah saran atau keluhan pelanggan dicatat dan ditindaklanjuti.", example: "Contoh: pelanggan bilang terlalu manis, lalu resep disesuaikan." },
  Q13: { title: "Nama & tampilan merek konsisten?", hint: "Logo, warna, dan gaya yang sama di semua tempat jualan.", example: "Contoh: warna kemasan dan foto profil Instagram senada." },
  Q14: { title: "Pesan usahamu sudah jelas?", hint: "Satu kalimat yang bikin orang paham bedanya usahamu.", example: "Contoh: “Kopi Teko, kopi lokal yang diseduh saat dipesan.”" },
  Q15: { title: "Foto produk sudah meyakinkan?", hint: "Foto atau contoh hasil kerja yang jelas dan terbaru.", example: "Contoh: foto produk dengan latar bersih dan cahaya cukup." },
  Q16: { title: "Orang gampang menemukan kontakmu?", hint: "Nama, kontak, dan produk yang sama di semua kanal aktif.", example: "Contoh: nomor WhatsApp yang sama di Instagram dan Google Maps." },
  Q17: { title: "Akun digital siap bantu orang membeli?", hint: "Profil, daftar produk, dan kontak lengkap di akun online usahamu.", example: "Contoh: Instagram dengan katalog dan tombol chat WhatsApp." },
  Q18: { title: "Pesanan lewat chat sudah rapi alurnya?", hint: "Cara mencatat, mengonfirmasi, dan memantau pesanan online.", example: "Contoh: tiap pesanan dicatat di spreadsheet sampai terkirim." },
  Q19: { title: "Sudah mengukur hasil aktivitas online?", hint: "Apakah kamu tahu promosi online mendatangkan pesanan atau tidak.", example: "Contoh: mencatat berapa chat masuk setelah posting." },
  Q20: { title: "Akses akun & data aman?", hint: "Siapa yang pegang password dan apakah data penting ada cadangannya.", example: "Contoh: email pemulihan diatur dan katalog disimpan di cloud." },
  Q21: { title: "Jadwal promosi benar-benar jalan?", hint: "30 hari terakhir, apakah promosi mengikuti jadwal.", example: "Contoh: posting tiap Senin dan Kamis sesuai rencana." },
  Q22: { title: "Calon pembeli ditindaklanjuti?", hint: "30 hari terakhir, apakah orang yang bertanya dihubungi lagi.", example: "Contoh: follow-up chat yang belum jadi beli setelah 2 hari." },
  Q23: { title: "Pekerjaan selesai sesuai rencana?", hint: "30 hari terakhir, apakah rencana kerja tertulis dan dipantau.", example: "Contoh: daftar tugas mingguan dan dicentang saat selesai." },
  Q24: { title: "Ada waktu khusus untuk evaluasi?", hint: "30 hari terakhir, apakah kamu meluangkan waktu meninjau usaha.", example: "Contoh: tiap Minggu malam cek penjualan dan rencana minggu depan." },
  Q25: { title: "Uang masuk & keluar tercatat?", hint: "Pencatatan transaksi usaha dengan bukti sederhana.", example: "Contoh: catatan harian di aplikasi kasir atau buku." },
  Q26: { title: "Uang usaha terpisah dari uang pribadi?", hint: "Pemisahan rekening atau catatan antara usaha dan pribadi.", example: "Contoh: rekening khusus usaha dan gaji pribadi dicatat." },
  Q27: { title: "Stok atau kapasitas terpantau?", hint: "Catatan stok barang atau kemampuan melayani pesanan.", example: "Contoh: stok bahan dicek tiap pagi sebelum buka." },
  Q28: { title: "Tugas setiap orang sudah jelas?", hint: "Alur kerja dan siapa mengerjakan apa.", example: "Contoh: kakak urus produksi, adik urus pengiriman, tertulis." },
  Q29: { title: "Sudah siapkan waktu untuk pendampingan?", hint: "Jadwal khusus 30 hari ke depan untuk ikut pendampingan.", example: "Contoh: tiap Rabu sore 1 jam, sudah disepakati dengan tim." },
  Q30: { title: "Ada orang yang siap menjalankan tugasnya?", hint: "Penanggung jawab yang bersedia mengerjakan tugas pendampingan.", example: "Contoh: kamu sendiri atau pengelola yang sudah menyatakan siap." },
  Q31: { title: "Siap menunjukkan catatan atau contoh?", hint: "Bukti sederhana seperti catatan penjualan atau foto produk.", example: "Contoh: catatan penjualan minggu lalu dan foto kemasan." },
  Q32: { title: "Siap coba satu perbaikan yang bisa dicek?", hint: "Satu tindakan kecil dengan target yang bisa diukur.", example: "Contoh: posting 3 kali seminggu dan hitung chat yang masuk." },
};

export const levelLabels = ["Belum mulai", "Baru mulai", "Sudah ada", "Rutin dilakukan", "Sudah mantap"] as const;

export function plainQuestion(code: string): PlainQuestion {
  const question = instrument.questions.find((q) => q.code === code);
  return plainQuestions[code] ?? { title: question?.text ?? code, hint: "", example: "" };
}

export function plainDimension(code: string): PlainDimension {
  const dimension = instrument.dimensions.find((d) => d.code === code);
  return plainDimensions[code] ?? { friendlyTitle: dimension?.title ?? code, blurb: dimension?.definition ?? "", emoji: "✨", tone: "primary" };
}
