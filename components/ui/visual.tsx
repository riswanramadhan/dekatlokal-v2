import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";

type SurfaceTone =
  | "blue"
  | "purple"
  | "coral"
  | "pink"
  | "yellow"
  | "sky"
  | "white";

const toneClass: Record<SurfaceTone, string> = {
  blue: "from-brand-primary to-accent-purple text-white",
  purple: "from-surface-lavender to-white text-text-primary",
  coral: "from-surface-coral to-white text-text-primary",
  pink: "from-surface-pink to-white text-text-primary",
  yellow: "from-surface-yellow to-white text-text-primary",
  sky: "from-surface-sky to-white text-text-primary",
  white: "from-white to-surface-blue text-text-primary",
};

export function HeroBanner({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt = "",
  action,
  meta,
  tone = "blue",
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  action?: { href: string; label: string };
  meta?: ReactNode;
  tone?: SurfaceTone;
  className?: string;
}) {
  const isDark = tone === "blue";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br p-5 shadow-[var(--shadow-card)] md:p-7",
        toneClass[tone],
        className,
      )}
    >
      <div className="relative z-10 grid gap-5 md:grid-cols-[minmax(0,1fr)_230px] md:items-center">
        <div className="min-w-0">
          {eyebrow ? (
            <p
              className={cn(
                "text-sm font-extrabold uppercase tracking-[0.08em]",
                isDark ? "text-white/78" : "text-brand-primary",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.08] tracking-normal md:text-5xl">
            {title}
          </h1>
          <p
            className={cn(
              "mt-3 max-w-2xl text-base leading-7 md:text-lg",
              isDark ? "text-white/84" : "text-text-secondary",
            )}
          >
            {description}
          </p>
          {meta ? <div className="mt-4">{meta}</div> : null}
          {action ? (
            <ButtonLink
              className={cn("mt-5 w-full md:w-fit", isDark && "bg-white text-brand-primary hover:bg-white")}
              href={action.href}
            >
              {action.label}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </ButtonLink>
          ) : null}
        </div>
        {imageSrc ? (
          <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-[30px] bg-white/18 p-2">
            <Image
              alt={imageAlt}
              className="h-full w-full rounded-[24px] object-cover"
              height={420}
              priority
              src={imageSrc}
              width={420}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CategoryChip({
  children,
  active = false,
  icon: Icon,
}: {
  children: ReactNode;
  active?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-[var(--shadow-soft)]",
        active
          ? "bg-gradient-to-r from-brand-primary to-accent-pink text-white"
          : "bg-white/86 text-text-secondary",
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      {children}
    </span>
  );
}

export function CourseCard({
  title,
  description,
  href,
  imageSrc = "/illustrations/learning-action.png",
  status,
  meta,
  tone = "purple",
}: {
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
  status?: ReactNode;
  meta?: ReactNode;
  tone?: Exclude<SurfaceTone, "blue">;
}) {
  return (
    <Link
      className={cn(
        "group block min-w-[17rem] overflow-hidden rounded-[28px] bg-gradient-to-br p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)] md:min-w-0",
        toneClass[tone],
      )}
      href={href}
    >
      <div className="aspect-[1.55] overflow-hidden rounded-[23px] bg-white/55">
        <Image
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          height={320}
          src={imageSrc}
          width={500}
        />
      </div>
      <div className="space-y-2 px-1 pb-1 pt-4">
        <div className="flex items-center justify-between gap-3">
          {status ? <div>{status}</div> : null}
          {meta ? <div className="text-sm font-bold text-text-muted">{meta}</div> : null}
        </div>
        <h3 className="line-clamp-2 text-lg font-extrabold leading-tight text-text-primary">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function ProgressTile({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: SurfaceTone;
}) {
  const dark = tone === "blue";

  return (
    <article
      className={cn(
        "rounded-[28px] bg-gradient-to-br p-5 shadow-[var(--shadow-card)]",
        toneClass[tone],
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-[20px]",
          dark ? "bg-white/18 text-white" : "bg-white/80 text-brand-primary",
        )}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className={cn("mt-4 text-sm font-bold", dark ? "text-white/76" : "text-text-muted")}>
        {title}
      </p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      <p className={cn("mt-2 text-sm leading-6", dark ? "text-white/78" : "text-text-secondary")}>
        {description}
      </p>
    </article>
  );
}

export function LearningListItem({
  title,
  description,
  href,
  icon: Icon,
  state,
  locked = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  state?: ReactNode;
  locked?: boolean;
}) {
  return (
    <Link
      className="grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[26px] bg-white/86 p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
      href={href}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-[22px]",
          locked ? "bg-warning-soft text-warning" : "bg-brand-primary-soft text-brand-primary",
        )}
      >
        {locked ? (
          <LockKeyhole aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Icon aria-hidden="true" className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold leading-tight text-text-primary">{title}</h3>
          {state}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      <ArrowRight aria-hidden="true" className="h-5 w-5 text-text-muted" />
    </Link>
  );
}

export function RewardCard({
  title,
  description,
  href,
  eligible,
}: {
  title: string;
  description: string;
  href: string;
  eligible?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-surface-yellow via-white to-surface-pink p-5 shadow-[var(--shadow-card)] md:p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_150px] md:items-center">
        <div>
          <StatusPill tone={eligible ? "success" : "info"}>
            {eligible ? "Siap diklaim" : "Reward berikutnya"}
          </StatusPill>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-text-primary">
            {title}
          </h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">{description}</p>
          <ButtonLink className="mt-5 w-full md:w-fit" href={href} variant="secondary">
            Lihat reward
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </ButtonLink>
        </div>
        <Image
          alt=""
          className="mx-auto aspect-square w-36 rounded-[28px] object-cover"
          height={220}
          src="/illustrations/reward-hero.png"
          width={220}
        />
      </div>
    </section>
  );
}

export function StatusPill({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const toneClasses = {
    info: "bg-brand-primary-soft text-brand-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-surface-subtle text-text-secondary",
  };
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold",
        toneClasses[tone],
        className,
      )}
    >
      {tone === "success" ? <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

export function VisualPanel({
  children,
  tone = "white",
  className,
}: {
  children: ReactNode;
  tone?: SurfaceTone;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] bg-gradient-to-br p-5 shadow-[var(--shadow-card)] md:p-6",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ProfileSummary({
  name,
  business,
  detail,
  imageSrc = "/brand/dekat-lokal-icon.png",
}: {
  name: string;
  business: string;
  detail: string;
  imageSrc?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[26px] bg-white/86 p-3 shadow-[var(--shadow-soft)]">
      <Image
        alt=""
        className="h-12 w-12 rounded-[18px] object-cover"
        height={64}
        src={imageSrc}
        width={64}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text-muted">{name}</p>
        <p className="truncate font-extrabold text-text-primary">{business}</p>
        <p className="truncate text-sm text-text-secondary">{detail}</p>
      </div>
    </div>
  );
}

export function ProgressRingCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-[28px] bg-white/86 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-text-muted">{title}</p>
          <p className="mt-1 text-2xl font-extrabold text-text-primary">{value}%</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-accent-pink text-lg font-extrabold text-white shadow-[var(--shadow-blue)]">
          {value}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
      <ProgressBar className="mt-4" value={value} />
    </div>
  );
}
