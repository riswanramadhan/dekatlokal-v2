// Motif Nusantara sebagai tile SVG kecil — ciri khas website buatan DekatLokal.
// Dipakai sebagai mask CSS sehingga warnanya selalu mengikuti palet (var(--c-accent)).
// Bentuk disederhanakan (garis tipis, geometris) agar modern dan tidak ramai.

export const MOTIFS = {
  kawung: {
    label: "Kawung",
    origin: "Jawa",
    size: 44,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><g fill='none' stroke='#000' stroke-width='1.6'><ellipse cx='22' cy='11' rx='6' ry='9'/><ellipse cx='22' cy='33' rx='6' ry='9'/><ellipse cx='11' cy='22' rx='9' ry='6'/><ellipse cx='33' cy='22' rx='9' ry='6'/></g><circle cx='22' cy='22' r='1.8'/><circle cx='0' cy='0' r='1.8'/><circle cx='44' cy='0' r='1.8'/><circle cx='0' cy='44' r='1.8'/><circle cx='44' cy='44' r='1.8'/></svg>",
  },
  tumpal: {
    label: "Tumpal",
    origin: "Melayu & Jawa",
    size: 28,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><g fill='none' stroke='#000' stroke-width='1.5' stroke-linejoin='round'><path d='M1 27 L14 3 L27 27 Z'/><path d='M8 27 L14 15 L20 27'/></g><circle cx='14' cy='22' r='1.4'/></svg>",
  },
  parang: {
    label: "Parang",
    origin: "Jawa",
    size: 32,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><g fill='none' stroke='#000' stroke-width='1.5' stroke-linecap='round'><path d='M-4 20 C4 20 8 12 8 8 S12 -4 20 -4'/><path d='M12 36 C20 36 24 28 24 24 S28 12 36 12'/><path d='M4 36 C12 36 16 28 16 24 S20 12 28 12 S32 4 36 4'/></g></svg>",
  },
  truntum: {
    label: "Truntum",
    origin: "Surakarta",
    size: 36,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><g><circle cx='18' cy='18' r='2'/><circle cx='18' cy='11' r='1.3'/><circle cx='18' cy='25' r='1.3'/><circle cx='11' cy='18' r='1.3'/><circle cx='25' cy='18' r='1.3'/><circle cx='13' cy='13' r='1.1'/><circle cx='23' cy='13' r='1.1'/><circle cx='13' cy='23' r='1.1'/><circle cx='23' cy='23' r='1.1'/><circle cx='0' cy='0' r='1.2'/><circle cx='36' cy='0' r='1.2'/><circle cx='0' cy='36' r='1.2'/><circle cx='36' cy='36' r='1.2'/></g></svg>",
  },
  songket: {
    label: "Songket",
    origin: "Sumatra & Sulawesi",
    size: 26,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><path d='M13 1.5 L24.5 13 L13 24.5 L1.5 13 Z' fill='none' stroke='#000' stroke-width='1.3'/><path d='M13 8.5 L17.5 13 L13 17.5 L8.5 13 Z'/></svg>",
  },
  mendung: {
    label: "Mega Mendung",
    origin: "Cirebon",
    size: 48,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'><g fill='none' stroke='#000' stroke-width='1.5'><path d='M0 24 a12 12 0 0 1 24 0'/><path d='M5 24 a7 7 0 0 1 14 0'/><path d='M9.5 24 a2.5 2.5 0 0 1 5 0'/><path d='M24 24 a12 12 0 0 1 24 0'/><path d='M29 24 a7 7 0 0 1 14 0'/><path d='M33.5 24 a2.5 2.5 0 0 1 5 0'/></g></svg>",
  },
  lontara: {
    label: "Bola Soba",
    origin: "Bugis-Makassar",
    size: 30,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><g fill='none' stroke='#000' stroke-width='1.4'><path d='M15 3 L27 15 L15 27 L3 15 Z'/><path d='M15 9 L21 15 L15 21 L9 15 Z'/></g><path d='M0 15 H3 M27 15 H30 M15 0 V3 M15 27 V30' stroke='#000' stroke-width='1.4'/></svg>",
  },
  ceplok: {
    label: "Ceplok",
    origin: "Yogyakarta",
    size: 34,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'><g fill='none' stroke='#000' stroke-width='1.4'><circle cx='17' cy='17' r='4.5'/><path d='M17 3 C21 8 21 11 17 12.5 C13 11 13 8 17 3 Z'/><path d='M17 31 C21 26 21 23 17 21.5 C13 23 13 26 17 31 Z'/><path d='M3 17 C8 13 11 13 12.5 17 C11 21 8 21 3 17 Z'/><path d='M31 17 C26 13 23 13 21.5 17 C23 21 26 21 31 17 Z'/></g><circle cx='0' cy='0' r='1.6'/><circle cx='34' cy='0' r='1.6'/><circle cx='0' cy='34' r='1.6'/><circle cx='34' cy='34' r='1.6'/></svg>",
  },
} as const;

export type MotifId = keyof typeof MOTIFS;
export const MOTIF_IDS = Object.keys(MOTIFS) as MotifId[];

/** Nilai CSS url(...) untuk mask-image. */
export function motifUrl(id: MotifId) {
  return `url("data:image/svg+xml,${encodeURIComponent(MOTIFS[id].svg)}")`;
}

/** Variabel CSS untuk elemen bermotif. */
export function motifStyle(id: MotifId, scale = 1): Record<string, string> {
  const motif = MOTIFS[id];
  return { "--motif": motifUrl(id), "--motif-size": `${Math.round(motif.size * scale)}px` };
}
