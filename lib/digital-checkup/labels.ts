// Kamus bahasa sehari-hari untuk setiap angka dalam perhitungan. Dipakai di seluruh
// halaman pengelola agar tabel bisa dibaca tanpa bahasa teknis.
export type QuantityKey = "S" | "g" | "w" | "H" | "q" | "R" | "N" | "V" | "idealPlus" | "idealMinus" | "Dplus" | "Dminus" | "C";

export const QUANTITY: Record<QuantityKey, { symbol: string; label: string; hint: string; formula: string }> = {
  S: { symbol: "S", label: "Nilai bagian", hint: "Nilai 0–100 untuk tiap bagian usaha, dihitung dari empat jawaban di bagian itu.", formula: "S = jumlah skor 4 jawaban ÷ 16 × 100" },
  g: { symbol: "g", label: "Yang masih kurang", hint: "Seberapa jauh bagian ini dari nilai penuh. 0 berarti sudah penuh, 1 berarti belum ada sama sekali.", formula: "g = 1 − S ÷ 100" },
  w: { symbol: "w", label: "Bobot dari ahli", hint: "Seberapa penting tiap bagian menurut tiga ahli. Delapan bobot ini berjumlah 1.", formula: "w = hasil Fuzzy AHP dari tiga ahli (lihat panel ahli)" },
  H: { symbol: "H", label: "Total kekurangan berbobot", hint: "Jumlah dari bobot ahli dikali yang masih kurang. Jika 0, tidak ada yang perlu diperbaiki.", formula: "H = Σ (w × g)" },
  q: { symbol: "q", label: "Bobot kebutuhan usaha ini", hint: "Bagian yang penting menurut ahli dan masih kurang di usaha ini mendapat bobot lebih besar. Berjumlah 1.", formula: "q = (w × g) ÷ H" },
  R: { symbol: "R", label: "Kecocokan modul dengan bagian", hint: "Rata-rata nilai 0–4 dari tiga ahli: seberapa cocok tiap modul belajar untuk memperbaiki tiap bagian.", formula: "R = rata-rata nilai relevansi tiga ahli" },
  N: { symbol: "N", label: "Dibuat sebanding", hint: "Nilai kecocokan dibagi akar jumlah kuadrat kolomnya supaya tiap bagian punya skala yang sama.", formula: "N = R ÷ √Σ(R²) per kolom" },
  V: { symbol: "V", label: "Dikalikan bobot kebutuhan", hint: "Nilai sebanding dikali bobot kebutuhan usaha ini.", formula: "V = N × q" },
  idealPlus: { symbol: "A⁺", label: "Titik terbaik", hint: "Nilai tertinggi di tiap kolom: modul khayalan yang paling cocok di semua bagian.", formula: "A⁺ = nilai V terbesar per kolom" },
  idealMinus: { symbol: "A⁻", label: "Titik terburuk", hint: "Nilai terendah di tiap kolom: modul khayalan yang paling tidak cocok.", formula: "A⁻ = nilai V terkecil per kolom" },
  Dplus: { symbol: "D⁺", label: "Jarak ke yang terbaik", hint: "Semakin kecil, semakin dekat modul ini ke titik terbaik.", formula: "D⁺ = √Σ(V − A⁺)²" },
  Dminus: { symbol: "D⁻", label: "Jarak ke yang terburuk", hint: "Semakin besar, semakin jauh modul ini dari titik terburuk.", formula: "D⁻ = √Σ(V − A⁻)²" },
  C: { symbol: "C", label: "Nilai kedekatan", hint: "Angka 0–1. Semakin besar, semakin cocok modul ini untuk usaha. Urutan modul diambil dari angka ini.", formula: "C = D⁻ ÷ (D⁺ + D⁻)" },
};

export type RunStatusKey = "RANKED" | "NO_IDENTIFIED_GAP" | "UNCOVERED_DIMENSION" | "ALTERNATIVES_NOT_DISTINGUISHABLE";

export const RUN_STATUS_TEXT: Record<RunStatusKey, { chip: string; tone: "mint" | "primary" | "amber" | "coral"; explanation: string }> = {
  RANKED: { chip: "Hasil siap", tone: "mint", explanation: "Tujuh modul berhasil diurutkan. Modul dengan nilai kedekatan tertinggi menjadi rekomendasi utama." },
  NO_IDENTIFIED_GAP: { chip: "Tidak ada kekurangan", tone: "primary", explanation: "Semua bagian sudah bernilai penuh, jadi tidak ada kebutuhan yang perlu diurutkan. Perhitungan berhenti di sini." },
  UNCOVERED_DIMENSION: { chip: "Ada bagian tanpa modul", tone: "amber", explanation: "Ada bagian yang masih kurang tetapi tidak ada modul yang cocok menurut ahli, sehingga urutan tidak bisa dibuat." },
  ALTERNATIVES_NOT_DISTINGUISHABLE: { chip: "Modul tidak bisa dibedakan", tone: "coral", explanation: "Semua modul berjarak sama ke titik terbaik dan terburuk, sehingga tidak ada urutan yang jujur untuk ditampilkan." },
};

export const SESSION_STATUS_TEXT: Record<string, { chip: string; tone: "mint" | "primary" | "amber" | "coral" | "neutral" }> = {
  submitted: { chip: "Final", tone: "mint" },
  draft: { chip: "Draf", tone: "amber" },
  superseded: { chip: "Digantikan", tone: "neutral" },
};

export const RUN_STEPS: { title: string; explanation: string }[] = [
  { title: "Nilai tiap bagian", explanation: "Empat jawaban di tiap bagian dijumlahkan, lalu diubah ke skala 0–100." },
  { title: "Yang masih kurang", explanation: "Jarak tiap bagian dari nilai penuh: 1 dikurangi nilai bagian dibagi 100." },
  { title: "Bobot dari ahli", explanation: "Delapan bobot dari tiga ahli (Fuzzy AHP) yang dipakai untuk semua usaha." },
  { title: "Bobot kebutuhan usaha ini", explanation: "Bobot ahli dikali yang masih kurang, lalu dibagi totalnya supaya berjumlah 1." },
  { title: "Kecocokan modul dengan bagian", explanation: "Rata-rata penilaian tiga ahli: seberapa cocok tiap modul untuk tiap bagian (0–4)." },
  { title: "Dibuat sebanding", explanation: "Tiap kolom dibagi akar jumlah kuadratnya supaya semua bagian berskala sama." },
  { title: "Dikalikan bobot kebutuhan", explanation: "Nilai sebanding dikali bobot kebutuhan usaha ini." },
  { title: "Titik terbaik dan terburuk", explanation: "Nilai tertinggi dan terendah tiap kolom menjadi patokan pembanding." },
  { title: "Jarak ke titik terbaik dan terburuk", explanation: "Jarak tiap modul ke kedua titik patokan." },
  { title: "Nilai kedekatan dan urutan", explanation: "Jarak ke yang terburuk dibagi jumlah kedua jarak. Modul dengan nilai tertinggi menjadi urutan pertama." },
];

export const MODEL_STEPS: { title: string; explanation: string }[] = [
  { title: "Perbandingan berpasangan tiap ahli", explanation: "Tiap ahli membandingkan 28 pasang bagian usaha: mana yang lebih penting dan seberapa kuat (1–9)." },
  { title: "Cek konsistensi", explanation: "Jawaban tiap ahli diuji supaya tidak saling bertentangan. Rasio konsistensi harus 0,10 atau kurang." },
  { title: "Ubah ke angka kabur", explanation: "Tiap angka 1–9 diubah menjadi tiga angka (rendah, tengah, tinggi) untuk menampung keraguan ahli." },
  { title: "Gabungkan tiga ahli", explanation: "Tiga pendapat digabung dengan rata-rata geometrik supaya tidak ada ahli yang mendominasi." },
  { title: "Rata-rata geometrik tiap baris", explanation: "Tiap bagian mendapat satu angka kabur dari delapan perbandingannya, lalu semuanya dijumlahkan." },
  { title: "Bobot kabur", explanation: "Angka tiap bagian dibagi jumlah keseluruhan sehingga menjadi bobot kabur." },
  { title: "Bobot akhir", explanation: "Tiga angka tiap bobot dirata-rata, lalu dibagi totalnya supaya delapan bobot berjumlah 1." },
  { title: "Kecocokan modul", explanation: "Nilai kecocokan modul dari tiap ahli dirata-rata menjadi satu tabel 7 × 8." },
];
