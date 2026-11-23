// Teks berjalan di header Digital Checkup: kabar milik Digital Checkup sendiri
// (bukan konten situs utama), ditampilkan dengan gaya yang sama dengan dekatlokal.com.

export interface TickerItem {
  id: string;
  text: string;
  href: string;
}

export const CHECKUP_TICKER: TickerItem[] = [
  { id: "dc-checkup", text: "Digital Checkup gratis · 32 pertanyaan · hasil langsung", href: "/mulai" },
  { id: "dc-belajar", text: "Kelas belajar 7 hari gratis setelah Checkup", href: "/mulai" },
  { id: "dc-template", text: "Baru: website UMKM gratis 14 hari dari template siap pakai", href: "/templates" },
  { id: "dc-ai", text: "Coba AI Admin untuk websitemu, gratis 7 hari", href: "/templates" },
  { id: "dc-pro", text: "Layanan Pro: laporan lengkap + konsultasi 30 menit", href: "/layanan-pro" },
];
