"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Calculator, ClipboardList, Download, FlaskConical, LayoutDashboard, LogOut, Users } from "lucide-react";
import { api } from "@/components/digital-checkup/api";

const NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/checkup", label: "Data checkup", icon: ClipboardList },
  { href: "/admin/ahli", label: "Panel ahli", icon: Users },
  { href: "/admin/metode", label: "Cara hitung & verifikasi", icon: Calculator },
  { href: "/admin/validasi", label: "Validasi & uji", icon: FlaskConical },
  { href: "/admin/ekspor", label: "Ekspor", icon: Download },
];

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [leaving, setLeaving] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return <div className="adm-root">
    <aside className="adm-sidebar">
      <div className="adm-brand"><Link href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={136} height={42} priority /></Link><small>Ruang pengelola</small></div>
      <nav className="adm-nav" aria-label="Menu pengelola">
        {NAV.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={active(item.href, item.exact) ? "page" : undefined}><Icon aria-hidden="true" />{item.label}</Link>; })}
        <button type="button" disabled={leaving} onClick={async () => { setLeaving(true); try { await api("auth", "POST", { mode: "logout" }); } finally { window.location.assign("/admin"); } }}><LogOut aria-hidden="true" />{leaving ? "Keluar…" : "Keluar"}</button>
      </nav>
      <div className="adm-user"><strong>{name || "Pengelola"}</strong>Masuk sebagai admin</div>
    </aside>
    <main className="adm-main" id="konten">{children}</main>
  </div>;
}
