"use client";

import Link from "next/link";
import { ArrowUpRight, Home, Map, TrendingUp, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAdaptiveNav } from "@/lib/hooks/use-adaptive-nav";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/app/beranda", label: "Beranda", icon: Home },
  { href: "/app/jalur", label: "Jalur", icon: Map },
  { href: "/app/progres", label: "Progres", icon: TrendingUp },
  { href: "/app/akun", label: "Akun", icon: User },
];

export function BottomNavigation({
  nextActionHref = "/app/beranda",
  nextActionLabel = "Lanjut",
}: {
  nextActionHref?: string;
  nextActionLabel?: string;
}) {
  const pathname = usePathname();
  const { collapsed } = useAdaptiveNav();
  const before = navItems.slice(0, 2);
  const after = navItems.slice(2);

  return (
    <nav
      aria-label="Navigasi utama"
      className="app-bottom-nav fixed inset-x-0 z-30 px-3 md:hidden"
      style={{ bottom: "calc(0.7rem + var(--safe-bottom))" }}
    >
      <div
        className={cn(
          "mx-auto grid max-w-[430px] grid-cols-[1fr_1fr_4.35rem_1fr_1fr] items-center gap-1 rounded-[24px] border border-white/80 bg-white/94 px-2 shadow-[0_18px_44px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-[height,transform]",
          collapsed ? "h-[3.55rem] translate-y-1" : "h-[4.55rem]",
        )}
      >
        {before.map((item) => (
          <NavLink
            active={pathname === item.href}
            collapsed={collapsed}
            href={item.href}
            icon={item.icon}
            key={item.href}
            label={item.label}
          />
        ))}
        <Link
          className={cn(
            "relative -mt-7 flex h-[4.55rem] w-[4.55rem] flex-col items-center justify-center rounded-full bg-brand-primary text-white shadow-[var(--shadow-blue)] transition",
            collapsed && "-mt-5 h-14 w-14",
          )}
          data-sound-event="ui-click"
          href={nextActionHref}
          title={nextActionLabel}
        >
          <ArrowUpRight aria-hidden="true" className="h-6 w-6" />
          <span
            className={cn(
              "mt-0.5 text-[0.68rem] font-extrabold leading-none transition",
              collapsed && "sr-only",
            )}
          >
            Lanjut
          </span>
        </Link>
        {after.map((item) => (
          <NavLink
            active={pathname === item.href}
            collapsed={collapsed}
            href={item.href}
            icon={item.icon}
            key={item.href}
            label={item.label}
          />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  active,
  collapsed,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  collapsed: boolean;
  href: string;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 text-[0.68rem] font-extrabold text-text-muted transition",
        active && "bg-brand-primary-soft text-brand-primary",
      )}
      href={href}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span className={cn("transition-opacity", collapsed && "sr-only")}>{label}</span>
    </Link>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="mt-8 grid gap-3">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            title={item.label}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-[20px] text-text-muted transition hover:bg-brand-primary-soft hover:text-brand-primary",
              active && "bg-[var(--brand-primary-900)] text-white shadow-[0_14px_30px_rgba(1,17,49,0.20)] hover:bg-[var(--brand-primary-900)]",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
