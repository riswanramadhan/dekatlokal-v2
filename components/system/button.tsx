import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "soft" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";
const variantClass: Record<Variant, string> = { primary: "btn-primary", secondary: "btn-secondary", soft: "btn-soft", ghost: "btn-ghost", danger: "btn-danger", dark: "btn-dark" };
const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; block?: boolean };
export function Button({ className, variant = "primary", size = "md", block, type = "button", ...props }: ButtonProps) {
  return <button className={cn("btn", variantClass[variant], sizeClass[size], block && "btn-block", className)} type={type} {...props} />;
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; size?: Size; block?: boolean; children: ReactNode };
export function ButtonLink({ className, href, variant = "primary", size = "md", block, children, ...props }: ButtonLinkProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const cls = cn("btn", variantClass[variant], sizeClass[size], block && "btn-block", className);
  if (external) return <a className={cls} href={href} {...props}>{children}</a>;
  return <Link className={cls} href={href} {...props}>{children}</Link>;
}
