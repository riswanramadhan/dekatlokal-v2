import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white shadow-[var(--shadow-blue)] hover:bg-brand-primary-hover active:bg-brand-primary-active",
  secondary:
    "border border-white/70 bg-white/86 text-text-primary shadow-[var(--shadow-soft)] hover:border-brand-primary/30 hover:bg-brand-primary-soft",
  ghost: "text-text-secondary hover:bg-white/76 hover:text-text-primary",
  danger:
    "bg-danger text-white shadow-[0_16px_34px_rgba(185,28,28,0.14)] hover:brightness-95",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] px-5 text-base font-bold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
};

export function ButtonLink({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] px-5 text-base font-bold transition duration-200",
        variants[variant],
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
