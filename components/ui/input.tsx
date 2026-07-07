import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-[20px] border border-white/70 bg-white/88 px-4 text-base font-medium text-text-primary placeholder:text-text-muted shadow-[var(--shadow-soft)] transition focus:border-brand-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-12 w-full rounded-[20px] border border-white/70 bg-white/88 px-4 text-base font-medium text-text-primary shadow-[var(--shadow-soft)] transition focus:border-brand-primary",
        className,
      )}
      {...props}
    />
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label className="text-sm font-semibold text-text-primary" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
