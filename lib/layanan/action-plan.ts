// Rencana aksi 30 hari (deterministik) dari tiga modul teratas hasil Checkup.
// Isi tugas diambil dari kurikulum modul gratis, sehingga sejalan dengan materi yang dipelajari.
import { instrument } from "@/lib/decision-engine";
import { freeCourses } from "@/lib/digital-checkup/curriculum";
import { moduleVisualForCode } from "@/lib/digital-checkup/module-catalog";

export interface PlanTask { module: string; text: string }
export interface PlanWeek { week: 1 | 2 | 3 | 4; days: string; focus: string; tasks: PlanTask[]; done: string }

const lowerFirst = (value: string) => value ? value[0].toLowerCase() + value.slice(1) : value;
const trimDot = (value: string) => value.trim().replace(/[.\s]+$/, "");

function moduleParts(code: string) {
  const course = freeCourses.find((item) => item.code === code);
  const intervention = instrument.modules.find((item) => item.code === code);
  if (!course && !intervention) throw new Error(`Modul ${code} tidak dikenal.`);
  const title = course?.title ?? intervention!.name;
  const lesson = (index: number): PlanTask => {
    const item = course?.lessons[index];
    return { module: code, text: item ? `${item.title}: ${item.task}` : intervention?.scope ?? title };
  };
  return {
    code,
    title,
    category: moduleVisualForCode(code).category,
    start: { module: code, text: `Mulai: ${trimDot(intervention?.initialAction ?? course?.tagline ?? title)}.` } as PlanTask,
    lesson,
    outcome: trimDot(course?.outcome ?? intervention?.output ?? title),
  };
}

/** Urutkan sesuai peringkat lalu kode (sama seperti halaman hasil) dan ambil tiga teratas. */
export function topThree(ranking: { code: string; rank: number }[]) {
  const top = [...ranking].sort((a, b) => a.rank - b.rank || a.code.localeCompare(b.code)).slice(0, 3).map((item) => item.code);
  if (top.length < 3) throw new Error("Rencana aksi butuh minimal tiga modul berperingkat.");
  return top;
}

/**
 * Minggu 1: fondasi modul prioritas 1. Minggu 2: tuntaskan modul 1, mulai modul 2.
 * Minggu 3: jalankan modul 2, mulai modul 3. Minggu 4: modul 3 + evaluasi 30 hari.
 */
export function buildActionPlan(ranking: { code: string; rank: number }[], goal = ""): PlanWeek[] {
  const [first, second, third] = topThree(ranking).map(moduleParts);
  const target = trimDot(goal ?? "");
  return [
    { week: 1, days: "Hari 1–7", focus: `Fondasi: ${first.title}`, tasks: [first.start, first.lesson(0), first.lesson(1)], done: `Latihan 1–2 modul ${first.title} sudah ditulis dan dicoba.` },
    { week: 2, days: "Hari 8–14", focus: `Tuntaskan ${first.title}, mulai ${second.title}`, tasks: [first.lesson(2), second.start, second.lesson(0)], done: `Hasil praktik: ${lowerFirst(first.outcome)}.` },
    { week: 3, days: "Hari 15–21", focus: `Jalankan ${second.title}, mulai ${third.title}`, tasks: [second.lesson(1), second.lesson(2), third.start], done: `Hasil praktik: ${lowerFirst(second.outcome)}.` },
    {
      week: 4,
      days: "Hari 22–30",
      focus: `${third.title} dan evaluasi 30 hari`,
      tasks: [
        third.lesson(0), third.lesson(1), third.lesson(2),
        { module: "EVAL", text: `Evaluasi: bandingkan hasil empat minggu dengan target awal${target ? ` ("${target}")` : ""}, catat hambatan, lalu pilih satu penyesuaian untuk bulan berikutnya.` },
      ],
      done: `Hasil praktik: ${lowerFirst(third.outcome)}, plus catatan evaluasi yang siap dibahas saat konsultasi.`,
    },
  ];
}
