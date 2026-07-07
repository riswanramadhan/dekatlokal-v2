import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationButton({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notifikasi belum dibaca`
          : "Buka notifikasi"
      }
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/86 text-text-secondary shadow-[var(--shadow-soft)] transition hover:text-brand-primary"
      href="/app/beranda#notifikasi"
    >
      <Bell aria-hidden="true" className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-primary" />
      ) : null}
    </Link>
  );
}
