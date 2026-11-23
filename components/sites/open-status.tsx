"use client";

import { useSyncExternalStore } from "react";
import { openStatus, type HoursRow } from "@/lib/sites/hours";
import s from "./parts.module.css";

// Jam dibaca dari perangkat pengunjung. Di server tidak dirender (null) agar tidak ada
// selisih hidrasi; setelah tampil, status diperbarui tiap menit.
const subscribe = (notify: () => void) => {
  const timer = window.setInterval(notify, 60_000);
  return () => window.clearInterval(timer);
};
const minuteNow = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => null;

/** Lencana "Buka · tutup 20.00" / "Tutup · buka besok 07.00". Tidak tampil bila jam buka tidak terbaca. */
export function OpenNow({ hours, className }: { hours: HoursRow[]; className?: string }) {
  const minute = useSyncExternalStore(subscribe, minuteNow, serverMinute);
  if (minute === null || !hours.length) return null;
  const status = openStatus(hours, new Date(minute * 60_000));
  if (status.state === "unknown") return null;
  return <span className={`${s.openNow} ${className ?? ""}`} data-state={status.state}>
    <span className={s.openDot} aria-hidden="true" />
    {status.label}
  </span>;
}
