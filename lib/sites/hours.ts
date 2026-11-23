// Membaca jam buka yang ditulis bebas oleh pemilik ("Senin–Sabtu", "07.00–20.00")
// lalu menghitung status "Buka sekarang / Tutup". Murni: dipakai client dan test.

export interface HoursRow {
  days: string;
  time: string;
}

type Interval = { open: number; close: number }; // menit sejak 00.00; close bisa > 1440 bila lewat tengah malam
type DayPlan = { allDay: boolean; intervals: Interval[] };

const DAY_NAMES = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"] as const; // indeks = Date#getDay()
const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
const ALIASES: Record<string, number> = { ahad: 0, "jum'at": 5, jumat: 5, jum: 5, sen: 1, sel: 2, rab: 3, kam: 4, sab: 6, min: 0 };

function dayIndex(word: string): number | null {
  const clean = word.trim().toLowerCase().replace(/[.]/g, "");
  if (!clean) return null;
  const full = DAY_NAMES.indexOf(clean as (typeof DAY_NAMES)[number]);
  if (full !== -1) return full;
  if (clean in ALIASES) return ALIASES[clean];
  const prefix = DAY_NAMES.findIndex((name) => clean.length >= 3 && name.startsWith(clean));
  return prefix === -1 ? null : prefix;
}

/** Hari yang dicakup teks, mis. "Senin–Jumat, Minggu". Set kosong bila tidak terbaca. */
export function parseDays(text: string): Set<number> {
  const value = text.toLowerCase().trim();
  const days = new Set<number>();
  if (/(setiap|tiap)\s+hari|buka terus|7 hari|senin\s*[-–—]\s*minggu|everyday|daily/.test(value)) return new Set([0, 1, 2, 3, 4, 5, 6]);
  for (const part of value.split(/,|&|\/(?!d)|\bdan\b/)) {
    const range = part.split(/\s*(?:[-–—]|s\.?\s*d\.?|s\/d|sampai|hingga)\s*/).filter(Boolean);
    if (range.length >= 2) {
      const start = dayIndex(range[0]), end = dayIndex(range[range.length - 1]);
      if (start === null || end === null) continue;
      for (let day = start; ; day = (day + 1) % 7) { days.add(day); if (day === end) break; }
    } else {
      const single = dayIndex(part);
      if (single !== null) days.add(single);
    }
  }
  return days;
}

const toMinutes = (h: string, m: string) => Number(h) * 60 + Number(m || 0);

/** Jam, mis. "07.00–20.00", "08:00-12:00 & 13:00-17:00", "24 jam", "Tutup". null bila tidak terbaca. */
export function parseTime(text: string): DayPlan | "closed" | null {
  const value = text.toLowerCase();
  if (/tutup|libur|closed/.test(value)) return "closed";
  if (/24\s*jam|24 hours/.test(value)) return { allDay: true, intervals: [] };
  const intervals: Interval[] = [];
  const pattern = /(\d{1,2})(?:[.:](\d{2}))?\s*(?:[-–—]|s\.?d\.?|sampai|hingga)\s*(\d{1,2})(?:[.:](\d{2}))?/g;
  for (const match of value.matchAll(pattern)) {
    const open = toMinutes(match[1], match[2] ?? "0");
    let close = toMinutes(match[3], match[4] ?? "0");
    if (open >= 1440 || close > 1440) continue;
    if (close <= open) close += 1440; // lewat tengah malam, mis. 18.00–02.00
    intervals.push({ open, close });
  }
  return intervals.length ? { allDay: false, intervals } : null;
}

const hhmm = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
};

export type OpenStatus =
  | { state: "open"; label: string }
  | { state: "closed"; label: string }
  | { state: "unknown" };

/** Status saat `now` (waktu lokal pengunjung). */
export function openStatus(rows: HoursRow[], now: Date): OpenStatus {
  const plans = new Map<number, DayPlan>();
  let readable = false;
  for (const row of rows) {
    const days = parseDays(row.days), time = parseTime(row.time);
    if (!days.size || time === null) continue;
    readable = true;
    for (const day of days) {
      if (time === "closed") { plans.set(day, { allDay: false, intervals: [] }); continue; }
      const current = plans.get(day) ?? { allDay: false, intervals: [] };
      plans.set(day, { allDay: current.allDay || time.allDay, intervals: [...current.intervals, ...time.intervals] });
    }
  }
  if (!readable) return { state: "unknown" };

  const today = now.getDay(), minute = now.getHours() * 60 + now.getMinutes();
  const todayPlan = plans.get(today);
  if (todayPlan?.allDay) return { state: "open", label: "Buka 24 jam" };
  const current = todayPlan?.intervals.find((item) => minute >= item.open && minute < item.close);
  if (current) return { state: "open", label: `Buka · tutup ${hhmm(current.close)}` };
  // Sisa jam buka kemarin yang melewati tengah malam.
  const yesterday = plans.get((today + 6) % 7)?.intervals.find((item) => item.close > 1440 && minute < item.close - 1440);
  if (yesterday) return { state: "open", label: `Buka · tutup ${hhmm(yesterday.close)}` };

  const laterToday = todayPlan?.intervals.filter((item) => item.open > minute).sort((a, b) => a.open - b.open)[0];
  if (laterToday) return { state: "closed", label: `Tutup · buka lagi ${hhmm(laterToday.open)}` };
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (today + offset) % 7, plan = plans.get(day);
    if (!plan) continue;
    if (plan.allDay) return { state: "closed", label: `Tutup · buka ${offset === 1 ? "besok" : DAY_LABELS[day]}` };
    const first = [...plan.intervals].sort((a, b) => a.open - b.open)[0];
    if (first) return { state: "closed", label: `Tutup · buka ${offset === 1 ? "besok" : DAY_LABELS[day]} ${hhmm(first.open)}` };
  }
  return { state: "closed", label: "Sedang tutup" };
}
