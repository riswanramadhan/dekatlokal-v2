// Font template website. Hanya diimpor oleh komponen template (galeri, /situs, builder), tidak di layout utama.
// preload: false → browser hanya mengunduh file font yang benar-benar dipakai template yang tampil.
// Opsi next/font wajib ditulis literal (tidak boleh spread), jadi sengaja diulang per font.
import { Archivo, Bricolage_Grotesque, Cormorant_Garamond, DM_Sans, Figtree, Fraunces, Instrument_Sans, Instrument_Serif, Karla, Lexend, Manrope } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display", axes: ["SOFT", "opsz"] });
const figtree = Figtree({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-body" });
const archivo = Archivo({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display", axes: ["wdth"] });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-body" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display", weight: "400", style: ["normal", "italic"] });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-body" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display", axes: ["opsz", "wdth"] });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-body" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display", style: ["normal", "italic"] });
const karla = Karla({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-body" });
const lexend = Lexend({ subsets: ["latin"], display: "swap", preload: false, variable: "--t-display" });

export const TEMPLATE_FONTS = {
  warung: `${fraunces.variable} ${figtree.variable}`,
  etalase: `${archivo.variable} ${manrope.variable}`,
  studio: `${instrumentSerif.variable} ${instrumentSans.variable}`,
  pasar: `${bricolage.variable} ${dmSans.variable}`,
  kriya: `${cormorant.variable} ${karla.variable}`,
  kelas: lexend.variable,
} as const;
